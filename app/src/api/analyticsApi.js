import apiClient from './axiosConfig';

/**
 * Analytics API Service
 * Admin/Manager access for campaign analytics
 */
export const analyticsApi = {
  /**
   * Get all analytics records (Admin/Manager)
   * @returns {Promise} - Array of analytics records
   */
  getAnalytics: () => apiClient.get('/analytics'),
  
  /**
   * Get analytics summary dashboard data
   * @returns {Promise} - { totalClients, totalTasks, pendingTasks, totalPayments, pendingPayments }
   */
  getAnalyticsSummary: () => apiClient.get('/analytics/summary'),
  
  /**
   * Get analytics for specific client
   * @param {string} clientId - Client ID
   * @returns {Promise} - Array of client analytics
   */
  getClientAnalytics: (clientId) => apiClient.get(`/analytics/client/${clientId}`),
  
  /**
   * Get monthly analytics
   * @param {string} month - Format: 'YYYY-MM'
   * @returns {Promise} - Monthly analytics data
   */
  getMonthlyAnalytics: (month) => apiClient.get(`/analytics/monthly/${month}`),
  
  /**
   * Create analytics record (Admin/Manager)
   * @param {Object} data - { clientId, campaignName, reach, impressions, clicks, conversions, spend, month }
   * @returns {Promise} - Created analytics record
   */
  createAnalytics: (data) => apiClient.post('/analytics', data),
  
  /**
   * Update analytics record
   * @param {string} id - Analytics ID
   * @param {Object} data - Updated fields
   * @returns {Promise} - Updated analytics record
   */
  updateAnalytics: (id, data) => apiClient.put(`/analytics/${id}`, data),
  
  /**
   * Delete analytics record (Admin/Manager)
   * @param {string} id - Analytics ID
   * @returns {Promise} - Success message
   */
  deleteAnalytics: (id) => apiClient.delete(`/analytics/${id}`),
};

export default analyticsApi;
