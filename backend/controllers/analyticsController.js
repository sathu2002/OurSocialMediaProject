const Analytics = require('../models/Analytics');

// @desc    Get all analytics records
// @route   GET /api/analytics
// @access  Private/Admin/Manager
const getAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find().populate('clientId', 'name company');
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get summary totals across all campaigns
// @route   GET /api/analytics/summary
// @access  Private/Admin/Manager
const getAnalyticsSummary = async (req, res) => {
  try {
    const records = await Analytics.find();

    let totalReach = 0;
    let totalImpressions = 0;
    let totalEngagement = 0;

    records.forEach(rec => {
        totalReach += rec.reach || 0;
        totalImpressions += rec.impressions || 0;
        totalEngagement += rec.engagement || 0;
    });

    res.json({ totalReach, totalImpressions, totalEngagement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for one client
// @route   GET /api/analytics/client/:clientId
// @access  Private (Admin/Manager, or the exact Client)
const getClientAnalytics = async (req, res) => {
  try {
    if (req.user.role === 'Client') {
        const client = await require('../models/Client').findOne({ userId: req.user.id });
        if (!client || client._id.toString() !== req.params.clientId) {
            return res.status(403).json({ message: 'Not authorized to view these analytics' });
        }
    }

    const analytics = await Analytics.find({ clientId: req.params.clientId });
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly report
// @route   GET /api/analytics/monthly/:month
// @access  Private/Admin/Manager
const getMonthlyAnalytics = async (req, res) => {
  try {
    // month format YYYY-MM
    const analytics = await Analytics.find({ reportMonth: req.params.month }).populate('clientId', 'name');
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new analytics record
// @route   POST /api/analytics
// @access  Private/Admin/Manager
const createAnalytics = async (req, res) => {
  try {
    const { clientId, campaignName, platform, reach, impressions, engagement, clicks, conversions, reportMonth, startDate, endDate } = req.body;

    if (!clientId || !campaignName || !reportMonth) {
      return res.status(400).json({ message: 'Client, campaign name, and report month are required' });
    }

    const analytics = await Analytics.create({
      clientId,
      campaignName,
      platform,
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      reportMonth,
      startDate,
      endDate
    });

    res.status(201).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update analytics record
// @route   PUT /api/analytics/:id
// @access  Private/Admin/Manager
const updateAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);

    if (!analytics) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    analytics.campaignName = req.body.campaignName || analytics.campaignName;
    analytics.platform = req.body.platform || analytics.platform;
    analytics.reach = req.body.reach !== undefined ? req.body.reach : analytics.reach;
    analytics.impressions = req.body.impressions !== undefined ? req.body.impressions : analytics.impressions;
    analytics.engagement = req.body.engagement !== undefined ? req.body.engagement : analytics.engagement;
    analytics.clicks = req.body.clicks !== undefined ? req.body.clicks : analytics.clicks;
    analytics.conversions = req.body.conversions !== undefined ? req.body.conversions : analytics.conversions;
    analytics.reportMonth = req.body.reportMonth || analytics.reportMonth;

    const updatedAnalytics = await analytics.save();
    res.json(updatedAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete analytics record
// @route   DELETE /api/analytics/:id
// @access  Private/Admin/Manager
const deleteAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);

    if (!analytics) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    await Analytics.deleteOne({ _id: req.params.id });
    res.json({ message: 'Analytics record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getAnalyticsSummary,
  getClientAnalytics,
  getMonthlyAnalytics,
  createAnalytics,
  updateAnalytics,
  deleteAnalytics,
};
