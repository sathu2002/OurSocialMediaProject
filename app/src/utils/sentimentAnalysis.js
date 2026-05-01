// Simple sentiment analysis utility for automatic feedback classification

// Sentiment word lists for classification
const POSITIVE_WORDS = [
  'excellent', 'great', 'amazing', 'awesome', 'fantastic', 'wonderful', 'perfect',
  'love', 'loved', 'like', 'liked', 'good', 'best', 'better', 'happy', 'pleased',
  'satisfied', 'satisfaction', 'delighted', 'thrilled', 'impressed', 'outstanding',
  'superb', 'brilliant', 'magnificent', 'marvelous', 'terrific', 'phenomenal',
  'exceptional', 'remarkable', 'stellar', 'spectacular', 'incredible', 'fabulous',
  'positive', 'beneficial', 'helpful', 'useful', 'effective', 'efficient', 'smooth',
  'easy', 'quick', 'fast', 'reliable', 'consistent', 'professional', 'quality',
  'recommend', 'highly recommend', 'thank you', 'thanks', 'appreciate', 'grateful',
  'well', 'nice', 'beautiful', 'clean', 'organized', 'friendly', 'courteous',
  'polite', 'responsive', 'attentive', 'caring', 'supportive', 'understanding',
  'patient', 'knowledgeable', 'skilled', 'expert', 'master', 'pro', 'top',
  'first-class', 'premium', 'luxury', 'comfortable', 'convenient', 'accessible',
  'flexible', 'adaptable', 'innovative', 'creative', 'modern', 'up-to-date',
  'solved', 'resolved', 'fixed', 'completed', 'successful', 'achieved', 'accomplished'
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'disappointing', 'poor',
  'worst', 'hate', 'hated', 'dislike', 'disliked', 'unhappy', 'sad', 'angry',
  'frustrated', 'annoyed', 'irritated', 'upset', 'dissatisfied', 'unsatisfied',
  'displeased', 'disappointed', 'let down', 'failed', 'failure', 'broken', 'damaged',
  'useless', 'worthless', 'waste', 'wasted', 'ripoff', 'scam', 'fake', 'cheap',
  'expensive', 'overpriced', 'slow', 'late', 'delayed', 'cancelled', 'wrong',
  'error', 'mistake', 'problem', 'issue', 'trouble', 'difficult', 'hard', 'complicated',
  'confusing', 'unclear', 'messy', 'dirty', 'unorganized', 'disorganized', 'chaotic',
  'rude', 'impolite', 'unprofessional', 'unhelpful', 'unresponsive', 'inattentive',
  'careless', 'negligent', 'incompetent', 'unskilled', 'amateur', 'novice',
  'unreliable', 'inconsistent', 'unstable', 'buggy', 'glitchy', 'slow', 'laggy',
  'never', 'no', 'not', 'none', 'nothing', 'nobody', 'nowhere', 'neither',
  'cannot', "can't", "won't", "don't", "didn't", "doesn't", "isn't", "aren't",
  "wasn't", "weren't", "shouldn't", "couldn't", "wouldn't", "mustn't",
  'negative', 'unfortunate', 'regret', 'regrettable', 'unacceptable', 'inadequate',
  'insufficient', 'lacking', 'missing', 'absent', 'removed', 'deleted', 'lost'
];

const NEUTRAL_WORDS = [
  'okay', 'ok', 'fine', 'average', 'normal', 'standard', 'regular', 'typical',
  'usual', 'common', 'ordinary', 'moderate', 'fair', 'reasonable', 'acceptable',
  'adequate', 'sufficient', 'decent', 'so-so', 'alright', 'good enough', 'works',
  'functional', 'operational', 'as expected', 'normal', 'neutral', 'balanced',
  'mixed', 'some', 'sometimes', 'occasionally', 'occasional', 'rarely', 'seldom',
  'maybe', 'perhaps', 'possibly', 'probably', 'might', 'could', 'would', 'should',
  'neither', 'either', 'both', 'all', 'none', 'partially', 'somewhat', 'relatively',
  'generally', 'usually', 'typically', 'often', 'frequently', 'sometimes', 'rarely',
  'information', 'details', 'facts', 'data', 'report', 'update', 'status', 'progress',
  'note', 'comment', 'feedback', 'opinion', 'thought', 'idea', 'suggestion',
  'question', 'inquiry', 'request', 'response', 'reply', 'answer', 'solution'
];

// Intensifiers that modify sentiment strength
const INTENSIFIERS = {
  'very': 1.5,
  'extremely': 2.0,
  'really': 1.3,
  'quite': 1.2,
  'too': 1.4,
  'so': 1.3,
  'absolutely': 2.0,
  'completely': 1.8,
  'totally': 1.8,
  'utterly': 2.0,
  'highly': 1.6,
  'incredibly': 1.9,
  'amazingly': 1.9,
  'surprisingly': 1.4,
  'unusually': 1.4,
  'exceptionally': 1.9,
  'particularly': 1.3,
  'especially': 1.3,
  'remarkably': 1.7,
  'notably': 1.3,
  'significantly': 1.5,
  'considerably': 1.4,
  'substantially': 1.5,
  'dramatically': 1.6,
  'radically': 1.6,
  'moderately': 0.7,
  'slightly': 0.6,
  'somewhat': 0.7,
  'a bit': 0.5,
  'a little': 0.5,
  'kind of': 0.6,
  'sort of': 0.6
};

// Negation words that flip sentiment
const NEGATION_WORDS = [
  'not', 'no', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nor',
  'cannot', "can't", "won't", "don't", "didn't", "doesn't", "isn't", "aren't",
  "wasn't", "weren't", "shouldn't", "couldn't", "wouldn't", "mustn't",
  'hardly', 'scarcely', 'barely', 'rarely', 'seldom', 'without', 'lack', 'lacking',
  'missing', 'absent', 'free from', 'devoid of', 'empty of', 'clear of'
];

/**
 * Analyzes text sentiment and returns classification with confidence score
 * @param {string} text - Text to analyze
 * @returns {Object} - Sentiment analysis result
 */
export const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      sentiment: 'neutral',
      confidence: 0,
      positiveScore: 0,
      negativeScore: 0,
      neutralScore: 0
    };
  }

  // Preprocess text
  const processedText = preprocessText(text);
  const words = processedText.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      positiveScore: 0,
      negativeScore: 0,
      neutralScore: 0
    };
  }

  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  let negationActive = false;
  let intensifierMultiplier = 1.0;

  // Analyze each word
  words.forEach((word, index) => {
    const lowerWord = word.toLowerCase();
    
    // Check for negation
    if (NEGATION_WORDS.includes(lowerWord)) {
      negationActive = true;
      return;
    }
    
    // Check for intensifiers
    if (INTENSIFIERS[lowerWord]) {
      intensifierMultiplier = INTENSIFIERS[lowerWord];
      return;
    }
    
    // Calculate word scores
    let wordScore = 0;
    
    if (POSITIVE_WORDS.includes(lowerWord)) {
      wordScore = 1;
    } else if (NEGATIVE_WORDS.includes(lowerWord)) {
      wordScore = -1;
    } else if (NEUTRAL_WORDS.includes(lowerWord)) {
      wordScore = 0;
      neutralScore += 1;
    }
    
    // Apply intensifier
    wordScore *= intensifierMultiplier;
    
    // Apply negation (flip sentiment)
    if (negationActive && wordScore !== 0) {
      wordScore *= -1;
      negationActive = false; // Reset negation after applying
    }
    
    // Add to appropriate score
    if (wordScore > 0) {
      positiveScore += wordScore;
    } else if (wordScore < 0) {
      negativeScore += Math.abs(wordScore);
    }
    
    // Reset intensifier after use
    intensifierMultiplier = 1.0;
  });

  // Normalize scores
  const totalWords = words.length;
  const totalScore = positiveScore + negativeScore + neutralScore;
  
  if (totalScore === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      positiveScore: 0,
      negativeScore: 0,
      neutralScore: 0
    };
  }

  // Calculate final sentiment
  let sentiment = 'neutral';
  let confidence = 0;

  if (positiveScore > negativeScore && positiveScore > neutralScore) {
    sentiment = 'positive';
    confidence = Math.min(0.9, positiveScore / totalScore);
  } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
    sentiment = 'negative';
    confidence = Math.min(0.9, negativeScore / totalScore);
  } else {
    sentiment = 'neutral';
    confidence = Math.min(0.9, neutralScore / totalScore);
  }

  // Ensure minimum confidence
  confidence = Math.max(0.1, confidence);

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    positiveScore: Math.round(positiveScore * 100) / 100,
    negativeScore: Math.round(negativeScore * 100) / 100,
    neutralScore: Math.round(neutralScore * 100) / 100
  };
};

/**
 * Preprocesses text for sentiment analysis
 * @param {string} text - Text to preprocess
 * @returns {string} - Preprocessed text
 */
const preprocessText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Simple sentiment analysis based on rating
 * @param {number} rating - Rating from 1-5
 * @returns {string} - Sentiment classification
 */
export const getSentimentFromRating = (rating) => {
  if (rating >= 4) return 'positive';
  if (rating >= 3) return 'neutral';
  return 'negative';
};

/**
 * Combines text sentiment with rating sentiment for more accurate classification
 * @param {string} text - Comment text
 * @param {number} rating - Rating from 1-5
 * @returns {Object} - Combined sentiment analysis
 */
export const getCombinedSentiment = (text, rating) => {
  const textSentiment = analyzeSentiment(text);
  const ratingSentiment = getSentimentFromRating(rating);
  
  // Weight rating more heavily as it's more reliable
  const textWeight = 0.3;
  const ratingWeight = 0.7;
  
  const sentimentScores = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  // Add text sentiment scores
  sentimentScores[textSentiment.sentiment] += textWeight * textSentiment.confidence;
  
  // Add rating sentiment scores
  sentimentScores[ratingSentiment] += ratingWeight;
  
  // Determine final sentiment
  let finalSentiment = 'neutral';
  let maxScore = 0;
  
  Object.entries(sentimentScores).forEach(([sentiment, score]) => {
    if (score > maxScore) {
      maxScore = score;
      finalSentiment = sentiment;
    }
  });
  
  return {
    sentiment: finalSentiment,
    confidence: Math.round(maxScore * 100) / 100,
    textSentiment,
    ratingSentiment,
    combinedScores: sentimentScores
  };
};

/**
 * Validates sentiment analysis result
 * @param {Object} result - Sentiment analysis result
 * @returns {boolean} - Whether result is valid
 */
export const validateSentimentResult = (result) => {
  return result && 
         typeof result.sentiment === 'string' &&
         ['positive', 'neutral', 'negative'].includes(result.sentiment) &&
         typeof result.confidence === 'number' &&
         result.confidence >= 0 && 
         result.confidence <= 1;
};

export default {
  analyzeSentiment,
  getSentimentFromRating,
  getCombinedSentiment,
  validateSentimentResult
};
