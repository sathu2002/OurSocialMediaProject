import apiClient from './axiosConfig';

/**
 * Feedback API Service
 * Role-based: Admin/Manager (view all), Client (create/view own)
 */
export const feedbackApi = {
  /**
   * Get all feedback (Admin/Manager)
   * @returns {Promise} - Array of feedback with sentiment analysis
   */
  getFeedback: () => apiClient.get('/feedback'),
  
  /**
   * Get my feedback (Client only)
   * @returns {Promise} - Array of client's feedback
   */
  getMyFeedback: () => apiClient.get('/feedback/my'),
  
  /**
   * Create new feedback (Client only)
   * @param {Object} feedbackData - { campaignName, rating, comment }
   * @returns {Promise} - Created feedback with AI sentiment
   */
  createFeedback: (feedbackData) => apiClient.post('/feedback', feedbackData),
  
  /**
   * Update feedback (Client only, own feedback)
   * @param {string} id - Feedback ID
   * @param {Object} feedbackData - Updated fields
   * @returns {Promise} - Updated feedback
   */
  updateFeedback: (id, feedbackData) => apiClient.put(`/feedback/${id}`, feedbackData),
  
  /**
   * Delete feedback (Admin or owner)
   * @param {string} id - Feedback ID
   * @returns {Promise} - Success message
   */
  deleteFeedback: (id) => apiClient.delete(`/feedback/${id}`),
};

export default feedbackApi;
