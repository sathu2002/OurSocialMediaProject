import apiClient from './axiosConfig';

/**
 * User Management API Service
 * Admin only access for most operations
 */
export const userApi = {
  /**
   * Get all users (Admin only)
   * @returns {Promise} - Array of users
   */
  getUsers: () => apiClient.get('/users'),
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} - User object
   */
  getUserById: (id) => apiClient.get(`/users/${id}`),
  
  /**
   * Create new user (Admin only)
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise} - Created user
   */
  createUser: (userData) => apiClient.post('/users', userData),
  
  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - Updated fields
   * @returns {Promise} - Updated user
   */
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  
  /**
   * Delete user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise} - Success message
   */
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};

export default userApi;
