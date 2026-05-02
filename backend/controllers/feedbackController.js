const Feedback = require('../models/Feedback');
const Client = require('../models/Client');
const { callClaude } = require('../utils/aiHelper');

const FEEDBACK_POPULATE = { path: 'clientId', select: 'name company email' };

const analyzeFeedback = async (comment, fallbackSentiment = 'neutral') => {
  let sentiment = fallbackSentiment;
  let aiSuggestion = '';

  if (!comment) {
    return { sentiment, aiSuggestion };
  }

  try {
    const prompt = `Analyze this feedback: "${comment}". Return exactly one word for sentiment: "positive", "neutral", or "negative", followed by "|" and a brief improvement suggestion.`;
    const aiResponse = await callClaude(prompt);
    const [sentimentResult, suggestion] = aiResponse.split('|').map((part) => part.trim());
    const cleanSentiment = sentimentResult.toLowerCase().replace(/[^a-z]/g, '');

    if (['positive', 'neutral', 'negative'].includes(cleanSentiment)) {
      sentiment = cleanSentiment;
    }

    if (suggestion) {
      aiSuggestion = suggestion;
    }
  } catch (error) {
    console.error('AI feedback analysis failed', error);
  }

  return { sentiment, aiSuggestion };
};

const resolveTargetClient = async (req, requestedClientId) => {
  if (req.user.role === 'Client') {
    const ownClient = await Client.findOne({ userId: req.user.id });

    if (!ownClient) {
      return { error: 'Client profile not found', status: 404 };
    }

    if (requestedClientId && requestedClientId !== ownClient._id.toString()) {
      return { error: 'Clients can only manage their own feedback', status: 403 };
    }

    return { client: ownClient };
  }

  if (!requestedClientId) {
    return { error: 'Client selection is required', status: 400 };
  }

  const selectedClient = await Client.findById(requestedClientId);
  if (!selectedClient) {
    return { error: 'Client not found', status: 404 };
  }

  return { client: selectedClient };
};

// @desc    Get all feedback or own feedback for clients
// @route   GET /api/feedback
// @access  Private/Admin/Manager/Staff/Client
const getFeedback = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Client') {
      const ownClient = await Client.findOne({ userId: req.user.id });
      if (!ownClient) {
        return res.status(404).json({ message: 'Client profile not found' });
      }

      query.clientId = ownClient._id;
    }

    const feedbacks = await Feedback.find(query)
      .populate(FEEDBACK_POPULATE)
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in client's feedback
// @route   GET /api/feedback/my
// @access  Private/Client
const getMyFeedback = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const feedbacks = await Feedback.find({ clientId: client._id })
      .populate(FEEDBACK_POPULATE)
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private/Admin/Manager/Staff/Client
const createFeedback = async (req, res) => {
  try {
    const { campaignName, rating, comment, clientId } = req.body;

    if (!campaignName || !rating) {
      return res.status(400).json({ message: 'Campaign name and rating are required' });
    }

    const resolvedClient = await resolveTargetClient(req, clientId);
    if (resolvedClient.error) {
      return res.status(resolvedClient.status).json({ message: resolvedClient.error });
    }

    const { sentiment, aiSuggestion } = await analyzeFeedback(comment, req.body.sentiment || 'neutral');

    const feedback = await Feedback.create({
      clientId: resolvedClient.client._id,
      campaignName: campaignName.trim(),
      rating,
      comment: comment?.trim() || '',
      sentiment,
      aiSuggestion,
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate(FEEDBACK_POPULATE);
    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private/Admin/Manager/Staff/Client
const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const resolvedClient = await resolveTargetClient(req, req.body.clientId || feedback.clientId.toString());
    if (resolvedClient.error) {
      return res.status(resolvedClient.status).json({ message: resolvedClient.error });
    }

    feedback.clientId = resolvedClient.client._id;
    feedback.campaignName = req.body.campaignName?.trim() || feedback.campaignName;
    feedback.rating = req.body.rating || feedback.rating;
    feedback.comment = req.body.comment?.trim() ?? feedback.comment;

    const { sentiment, aiSuggestion } = await analyzeFeedback(
      feedback.comment,
      req.body.sentiment || feedback.sentiment || 'neutral'
    );

    feedback.sentiment = sentiment;
    feedback.aiSuggestion = aiSuggestion || feedback.aiSuggestion;
    feedback.updatedAt = new Date();

    const updatedFeedback = await feedback.save();
    const populatedFeedback = await Feedback.findById(updatedFeedback._id).populate(FEEDBACK_POPULATE);
    res.json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin/Manager/Staff/Client
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (req.user.role === 'Client') {
      const ownClient = await Client.findOne({ userId: req.user.id });
      if (!ownClient || feedback.clientId.toString() !== ownClient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this feedback' });
      }
    }

    await Feedback.deleteOne({ _id: req.params.id });
    res.json({ message: 'Feedback removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFeedback,
  getMyFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
