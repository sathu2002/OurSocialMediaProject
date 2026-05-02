import apiClient from './axiosConfig';
import { getCombinedSentiment, validateSentimentResult } from '../utils/sentimentAnalysis';

const successResponse = (data) => ({ success: true, data });

/**
 * Feedback API Service
 * Role-based: Admin/Manager/Staff (manage all), Client (manage own) with proper error handling
 */
export const feedbackApi = {
  /**
   * Get all feedback available to the current user
   * @returns {Promise} - Array of feedback with sentiment analysis
   */
  getFeedback: async () => {
    try {
      const response = await apiClient.get('/feedback');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch feedback';
      throw new Error(message);
    }
  },
  
  /**
   * Get my feedback (Client only)
   * @returns {Promise} - Array of client's feedback
   */
  getMyFeedback: async () => {
    try {
      const response = await apiClient.get('/feedback/my');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch my feedback';
      throw new Error(message);
    }
  },
  
  /**
   * Create new feedback
   * @param {Object} feedbackData - { campaignName, rating, comment, clientId? }
   * @returns {Promise} - Created feedback with AI sentiment
   */
  createFeedback: async (feedbackData) => {
    try {
      // Validate input
      const requiredFields = ['campaignName', 'rating'];
      const missingFields = requiredFields.filter(field => !feedbackData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate rating
      const rating = parseInt(feedbackData.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
      }

      // Validate comment length
      if (feedbackData.comment && feedbackData.comment.length < 10) {
        throw new Error('Comment must be at least 10 characters long');
      }

      if (feedbackData.comment && feedbackData.comment.length > 1000) {
        throw new Error('Comment must be less than 1000 characters');
      }

      // Perform automatic sentiment analysis
      const sentimentAnalysis = getCombinedSentiment(
        feedbackData.comment || '',
        rating || 3
      );

      // Validate sentiment analysis result
      if (!validateSentimentResult(sentimentAnalysis)) {
        console.warn('Invalid sentiment analysis result, using default neutral');
        sentimentAnalysis.sentiment = 'neutral';
        sentimentAnalysis.confidence = 0.5;
      }

      // Add sentiment to feedback data
      const enrichedFeedbackData = {
        clientId: feedbackData.clientId,
        campaignName: feedbackData.campaignName?.trim(),
        comment: feedbackData.comment?.trim() || '',
        rating: rating,
        sentiment: sentimentAnalysis.sentiment,
        aiSuggestion: feedbackData.aiSuggestion,
      };

      console.log('Creating feedback with automatic sentiment:', {
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        comment: feedbackData.comment?.substring(0, 50) + '...',
        rating: rating
      });

      const response = await apiClient.post('/feedback', enrichedFeedbackData);
      return successResponse(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create feedback';
      throw new Error(message);
    }
  },
  
  /**
   * Update feedback
   * @param {string} id - Feedback ID
   * @param {Object} feedbackData - Updated fields
   * @returns {Promise} - Updated feedback
   */
  updateFeedback: async (id, feedbackData) => {
    try {
      if (!id) {
        throw new Error('Feedback ID is required');
      }
      
      if (!feedbackData || Object.keys(feedbackData).length === 0) {
        throw new Error('Update data is required');
      }

      // Validate rating if provided
      if (feedbackData.rating !== undefined) {
        const rating = parseInt(feedbackData.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
        feedbackData.rating = rating;
      }

      // Validate comment if provided
      if (feedbackData.comment !== undefined) {
        if (feedbackData.comment.length < 10) {
          throw new Error('Comment must be at least 10 characters long');
        }
        if (feedbackData.comment.length > 1000) {
          throw new Error('Comment must be less than 1000 characters');
        }
      }

      // Perform automatic sentiment analysis if comment or rating changed
      let sentimentAnalysis = null;
      
      if (feedbackData.comment !== undefined || feedbackData.rating !== undefined) {
        sentimentAnalysis = getCombinedSentiment(
          feedbackData.comment || '',
          feedbackData.rating || 3
        );

        // Validate sentiment analysis result
        if (!validateSentimentResult(sentimentAnalysis)) {
          console.warn('Invalid sentiment analysis result, using default neutral');
          sentimentAnalysis.sentiment = 'neutral';
          sentimentAnalysis.confidence = 0.5;
        }
      }

      // Add sentiment to feedback data if analysis was performed
      const enrichedFeedbackData = sentimentAnalysis ? {
        clientId: feedbackData.clientId,
        campaignName: feedbackData.campaignName?.trim(),
        comment: feedbackData.comment?.trim() || '',
        rating: feedbackData.rating,
        sentiment: sentimentAnalysis.sentiment,
      } : {
        ...feedbackData,
        clientId: feedbackData.clientId,
        campaignName: feedbackData.campaignName?.trim(),
        comment: feedbackData.comment?.trim(),
      };

      if (sentimentAnalysis) {
        console.log('Updating feedback with automatic sentiment:', {
          id,
          sentiment: sentimentAnalysis.sentiment,
          confidence: sentimentAnalysis.confidence,
          comment: feedbackData.comment?.substring(0, 50) + '...',
          rating: feedbackData.rating
        });
      }

      const response = await apiClient.put(`/feedback/${id}`, enrichedFeedbackData);
      return successResponse(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update feedback';
      throw new Error(message);
    }
  },
  
  /**
   * Delete feedback (Admin or owner)
   * @param {string} id - Feedback ID
   * @returns {Promise} - Success message
   */
  deleteFeedback: async (id) => {
    try {
      if (!id) {
        throw new Error('Feedback ID is required');
      }
      
      const response = await apiClient.delete(`/feedback/${id}`);
      return successResponse(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete feedback';
      throw new Error(message);
    }
  },

  /**
   * Batch sentiment analysis for existing feedback (utility function)
   * @param {Array} feedbackList - Array of feedback objects
   * @returns {Array} - Feedback with sentiment analysis added
   */
  analyzeExistingFeedback: async (feedbackList) => {
    try {
      const analyzedFeedback = feedbackList.map(feedback => {
        const sentimentAnalysis = getCombinedSentiment(
          feedback.comment || '',
          feedback.rating || 3
        );

        return {
          ...feedback,
          sentiment: sentimentAnalysis.sentiment,
          sentimentConfidence: sentimentAnalysis.confidence,
          sentimentAnalysis: {
            textSentiment: sentimentAnalysis.textSentiment,
            ratingSentiment: sentimentAnalysis.ratingSentiment,
            combinedScores: sentimentAnalysis.combinedScores,
            processedAt: new Date().toISOString()
          }
        };
      });

      return analyzedFeedback;
    } catch (error) {
      console.error('Batch sentiment analysis error:', error);
      throw error;
    }
  },
};

export default feedbackApi;
