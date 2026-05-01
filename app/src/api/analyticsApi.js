import apiClient from './axiosConfig';

/**
 * Analytics API Service
 * Admin/Manager access for campaign analytics with proper error handling
 */
export const analyticsApi = {
  /**
   * Get all analytics records (Admin/Manager)
   * @returns {Promise} - Array of analytics records
   */
  getAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch analytics';
      throw new Error(message);
    }
  },
  
  /**
   * Get analytics summary dashboard data
   * @returns {Promise} - { totalClients, totalTasks, pendingTasks, totalPayments, pendingPayments }
   */
  getAnalyticsSummary: async () => {
    try {
      const response = await apiClient.get('/analytics/summary');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch analytics summary';
      throw new Error(message);
    }
  },
  
  /**
   * Get analytics for specific client
   * @param {string} clientId - Client ID
   * @returns {Promise} - Array of client analytics
   */
  getClientAnalytics: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }
      
      const response = await apiClient.get(`/analytics/client/${clientId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch client analytics';
      throw new Error(message);
    }
  },
  
  /**
   * Get monthly analytics
   * @param {string} month - Format: 'YYYY-MM'
   * @returns {Promise} - Monthly analytics data
   */
  getMonthlyAnalytics: async (month) => {
    try {
      if (!month) {
        throw new Error('Month is required (format: YYYY-MM)');
      }
      
      // Basic month format validation
      if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw new Error('Invalid month format. Use YYYY-MM');
      }
      
      const response = await apiClient.get(`/analytics/monthly/${month}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch monthly analytics';
      throw new Error(message);
    }
  },
  
  /**
   * Create analytics record (Admin/Manager)
   * @param {Object} data - { clientId, campaignName, reach, impressions, clicks, conversions, spend, month }
   * @returns {Promise} - Created analytics record
   */
  createAnalytics: async (data) => {
    try {
      // Validate input
      const requiredFields = ['clientId', 'campaignName', 'month'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate month format
      if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(data.month)) {
        throw new Error('Invalid month format. Use YYYY-MM');
      }

      // Validate numeric fields if provided
      const numericFields = ['reach', 'impressions', 'clicks', 'conversions', 'spend'];
      for (const field of numericFields) {
        if (data[field] !== undefined) {
          const value = parseFloat(data[field]);
          if (isNaN(value) || value < 0) {
            throw new Error(`${field} must be a positive number`);
          }
          data[field] = value;
        }
      }

      const response = await apiClient.post('/analytics', data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create analytics record';
      throw new Error(message);
    }
  },
  
  /**
   * Update analytics record
   * @param {string} id - Analytics ID
   * @param {Object} data - Updated fields
   * @returns {Promise} - Updated analytics record
   */
  updateAnalytics: async (id, data) => {
    try {
      if (!id) {
        throw new Error('Analytics ID is required');
      }
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Update data is required');
      }

      // Validate month if provided
      if (data.month) {
        if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(data.month)) {
          throw new Error('Invalid month format. Use YYYY-MM');
        }
      }

      // Validate numeric fields if provided
      const numericFields = ['reach', 'impressions', 'clicks', 'conversions', 'spend'];
      for (const field of numericFields) {
        if (data[field] !== undefined) {
          const value = parseFloat(data[field]);
          if (isNaN(value) || value < 0) {
            throw new Error(`${field} must be a positive number`);
          }
          data[field] = value;
        }
      }

      const response = await apiClient.put(`/analytics/${id}`, data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update analytics record';
      throw new Error(message);
    }
  },
  
  /**
   * Delete analytics record (Admin/Manager)
   * @param {string} id - Analytics ID
   * @returns {Promise} - Success message
   */
  deleteAnalytics: async (id) => {
    try {
      if (!id) {
        throw new Error('Analytics ID is required');
      }
      
      const response = await apiClient.delete(`/analytics/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete analytics record';
      throw new Error(message);
    }
  },

  /**
   * Get all campaigns (Admin/Manager)
   * @returns {Promise} - Array of campaigns
   */
  getCampaigns: async () => {
    try {
      const response = await apiClient.get('/campaigns');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch campaigns';
      throw new Error(message);
    }
  },

  /**
   * Create campaign (Admin/Manager)
   * @param {Object} campaignData - Campaign data
   * @returns {Promise} - Created campaign
   */
  createCampaign: async (campaignData) => {
    try {
      if (!campaignData) {
        throw new Error('Campaign data is required');
      }

      const response = await apiClient.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create campaign';
      throw new Error(message);
    }
  },

  /**
   * Update campaign (Admin/Manager)
   * @param {string} id - Campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise} - Updated campaign
   */
  updateCampaign: async (id, campaignData) => {
    try {
      if (!id) {
        throw new Error('Campaign ID is required');
      }
      
      if (!campaignData) {
        throw new Error('Campaign data is required');
      }

      const response = await apiClient.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update campaign';
      throw new Error(message);
    }
  },

  /**
   * Delete campaign (Admin/Manager)
   * @param {string} id - Campaign ID
   * @returns {Promise} - Success message
   */
  deleteCampaign: async (id) => {
    try {
      if (!id) {
        throw new Error('Campaign ID is required');
      }
      
      const response = await apiClient.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete campaign';
      throw new Error(message);
    }
  },
};

export default analyticsApi;
