import apiClient from './axiosConfig';

/**
 * Payment Management API Service
 * Admin/Manager access for management
 */
export const paymentApi = {
  /**
   * Get all payments (Admin/Manager)
   * @returns {Promise} - Array of payments
   */
  getPayments: () => apiClient.get('/payments'),
  
  /**
   * Get payment statistics
   * @returns {Promise} - { totalRevenue, paidCount, pendingCount, overdueCount }
   */
  getPaymentStats: () => apiClient.get('/payments/stats'),
  
  /**
   * Get payments for specific client
   * @param {string} clientId - Client ID
   * @returns {Promise} - Array of client payments
   */
  getClientPayments: (clientId) => apiClient.get(`/payments/client/${clientId}`),
  
  /**
   * Create new payment (Admin/Manager)
   * @param {Object} paymentData - { clientId, amount, package, method, status, invoiceNumber }
   * @returns {Promise} - Created payment
   */
  createPayment: (paymentData) => apiClient.post('/payments', paymentData),
  
  /**
   * Update payment
   * @param {string} id - Payment ID
   * @param {Object} paymentData - Updated fields
   * @returns {Promise} - Updated payment
   */
  updatePayment: (id, paymentData) => apiClient.put(`/payments/${id}`, paymentData),
  
  /**
   * Delete payment (Admin only)
   * @param {string} id - Payment ID
   * @returns {Promise} - Success message
   */
  deletePayment: (id) => apiClient.delete(`/payments/${id}`),
};

export default paymentApi;
