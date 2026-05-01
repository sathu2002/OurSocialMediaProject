import apiClient from './axiosConfig';

/**
 * Authentication API Service
 * Handles login and registration
 */
export const authApi = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - { user, token }
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  /**
   * Register new user
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise} - { user, token }
   */
  register: (userData) => apiClient.post('/auth/register', userData),
};

export default authApi;
