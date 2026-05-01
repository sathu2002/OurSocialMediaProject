import apiClient from './axiosConfig';

/**
 * AI API Service
 * Provides AI-powered features for the application
 */
export const aiApi = {
  /**
   * AI Chat - General conversational AI
   * @param {string} message - User message
   * @returns {Promise} - AI response
   */
  chat: (message) => apiClient.post('/ai/chat', { message }),
  
  /**
   * Sentiment Analysis - Analyze text sentiment
   * @param {string} text - Text to analyze
   * @returns {Promise} - { sentiment: 'positive'|'neutral'|'negative', score: number }
   */
  sentiment: (text) => apiClient.post('/ai/sentiment', { text }),
  
  /**
   * Analytics Insight - Get insights from analytics data
   * @param {Object} data - Analytics data
   * @returns {Promise} - AI-generated insights
   */
  analyticsInsight: (data) => apiClient.post('/ai/analytics-insight', data),
  
  /**
   * Role Recommendation - Get role suggestions for user (Admin only)
   * @param {Object} userData - User information
   * @returns {Promise} - Recommended role
   */
  roleRecommend: (userData) => apiClient.post('/ai/role-recommend', userData),
  
  /**
   * Permission Explanation - Explain role permissions (Admin only)
   * @param {string} role - Role name
   * @returns {Promise} - Permission explanation
   */
  permissionExplain: (role) => apiClient.post('/ai/permission-explain', { role }),
  
  /**
   * Trends Analysis - Get business trends (Admin/Manager)
   * @returns {Promise} - Trend analysis
   */
  trends: () => apiClient.post('/ai/trends'),
  
  /**
   * Suggestions - Get AI suggestions (Admin/Manager)
   * @param {Object} data - Context data
   * @returns {Promise} - AI suggestions
   */
  suggestions: (data) => apiClient.post('/ai/suggestions', data),
  
  /**
   * Monthly Summary - Get monthly business summary (Admin/Manager)
   * @param {string} month - Format: 'YYYY-MM'
   * @returns {Promise} - Monthly summary
   */
  monthlySummary: (month) => apiClient.post('/ai/monthly-summary', { month }),
};

export default aiApi;
