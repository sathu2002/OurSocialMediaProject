import apiClient from './axiosConfig';

/**
 * Authentication API Service
 * Handles login and registration with proper error handling
 */
export const authApi = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - { user, token }
   */
  login: async (credentials) => {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Enhanced error handling
      const message = error.response?.data?.message || 
                    error.message || 
                    'Login failed. Please try again.';
      throw new Error(message);
    }
  },
  
  /**
   * Register new user
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise} - { user, token }
   */
  register: async (userData) => {
    try {
      // Validate input
      const requiredFields = ['name', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Enhanced error handling
      const message = error.response?.data?.message || 
                    error.message || 
                    'Registration failed. Please try again.';
      throw new Error(message);
    }
  },
};

export default authApi;
