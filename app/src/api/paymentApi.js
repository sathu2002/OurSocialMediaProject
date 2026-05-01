import apiClient from './axiosConfig';

/**
 * Payment Management API Service
 * Admin/Manager access for management with proper error handling
 */
export const paymentApi = {
  /**
   * Get all payments (Admin/Manager)
   * @returns {Promise} - Array of payments
   */
  getPayments: async () => {
    try {
      const response = await apiClient.get('/payments');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch payments';
      throw new Error(message);
    }
  },
  
  /**
   * Get payment statistics
   * @returns {Promise} - { totalRevenue, paidCount, pendingCount, overdueCount }
   */
  getPaymentStats: async () => {
    try {
      const response = await apiClient.get('/payments/stats');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch payment statistics';
      throw new Error(message);
    }
  },
  
  /**
   * Get payments for specific client
   * @param {string} clientId - Client ID
   * @returns {Promise} - Array of client payments
   */
  getClientPayments: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }
      
      const response = await apiClient.get(`/payments/client/${clientId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch client payments';
      throw new Error(message);
    }
  },
  
  /**
   * Create new payment (Admin/Manager)
   * @param {Object} paymentData - { clientId, amount, package, method, status, invoiceNumber }
   * @returns {Promise} - Created payment
   */
  createPayment: async (paymentData) => {
    try {
      // Validate input
      const requiredFields = ['clientId', 'amount', 'package', 'method', 'status'];
      const missingFields = requiredFields.filter(field => !paymentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate amount
      if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      const validMethods = ['Cash', 'Card', 'Bank Transfer', 'Check', 'Online'];
      if (!validMethods.includes(paymentData.method)) {
        throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
      }

      const validStatuses = ['Paid', 'Pending', 'Overdue', 'Cancelled'];
      if (!validStatuses.includes(paymentData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const validPackages = ['Silver', 'Gold', 'Platinum', 'Diamond'];
      if (!validPackages.includes(paymentData.package)) {
        throw new Error(`Invalid package. Must be one of: ${validPackages.join(', ')}`);
      }

      const response = await apiClient.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create payment';
      throw new Error(message);
    }
  },
  
  /**
   * Update payment
   * @param {string} id - Payment ID
   * @param {Object} paymentData - Updated fields
   * @returns {Promise} - Updated payment
   */
  updatePayment: async (id, paymentData) => {
    try {
      if (!id) {
        throw new Error('Payment ID is required');
      }
      
      if (!paymentData || Object.keys(paymentData).length === 0) {
        throw new Error('Update data is required');
      }

      // Validate amount if provided
      if (paymentData.amount !== undefined) {
        if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
          throw new Error('Amount must be a positive number');
        }
      }

      // Validate method if provided
      if (paymentData.method) {
        const validMethods = ['Cash', 'Card', 'Bank Transfer', 'Check', 'Online'];
        if (!validMethods.includes(paymentData.method)) {
          throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
        }
      }

      // Validate status if provided
      if (paymentData.status) {
        const validStatuses = ['Paid', 'Pending', 'Overdue', 'Cancelled'];
        if (!validStatuses.includes(paymentData.status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
      }

      // Validate package if provided
      if (paymentData.package) {
        const validPackages = ['Silver', 'Gold', 'Platinum', 'Diamond'];
        if (!validPackages.includes(paymentData.package)) {
          throw new Error(`Invalid package. Must be one of: ${validPackages.join(', ')}`);
        }
      }

      const response = await apiClient.put(`/payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update payment';
      throw new Error(message);
    }
  },
  
  /**
   * Delete payment (Admin only)
   * @param {string} id - Payment ID
   * @returns {Promise} - Success message
   */
  deletePayment: async (id) => {
    try {
      if (!id) {
        throw new Error('Payment ID is required');
      }
      
      const response = await apiClient.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete payment';
      throw new Error(message);
    }
  },
};

export default paymentApi;
