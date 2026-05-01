import apiClient from './axiosConfig';

/**
 * User Management API Service
 * Admin only access for most operations with proper error handling
 */
export const userApi = {
  /**
   * Get all users (Admin only)
   * @returns {Promise} - Array of users
   */
  getUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch users';
      throw new Error(message);
    }
  },
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} - User object
   */
  getUserById: async (id) => {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch user';
      throw new Error(message);
    }
  },
  
  /**
   * Create new user (Admin only)
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise} - Created user
   */
  createUser: async (userData) => {
    try {
      // Validate input
      const requiredFields = ['name', 'email', 'password', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const validRoles = ['Admin', 'Manager', 'Staff', 'Client'];
      if (!validRoles.includes(userData.role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create user';
      throw new Error(message);
    }
  },
  
  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - Updated fields
   * @returns {Promise} - Updated user
   */
  updateUser: async (id, userData) => {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      
      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('Update data is required');
      }

      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update user';
      throw new Error(message);
    }
  },
  
  /**
   * Delete user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise} - Success message
   */
  deleteUser: async (id) => {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete user';
      throw new Error(message);
    }
  },
};

export default userApi;
