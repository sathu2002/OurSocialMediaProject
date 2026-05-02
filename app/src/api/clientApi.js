import apiClient from './axiosConfig';

const successResponse = (data) => ({ success: true, data });

/**
 * Client Management API Service
 * Admin/Manager access for management, public registration available with proper error handling
 */
export const clientApi = {
  /**
   * Get all clients (Admin/Manager)
   * @returns {Promise} - Array of clients
   */
  getClients: async () => {
    try {
      const response = await apiClient.get('/clients');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch clients';
      throw new Error(message);
    }
  },
  
  /**
   * Get client by ID
   * @param {string} id - Client ID
   * @returns {Promise} - Client object
   */
  getClientById: async (id) => {
    try {
      if (!id) {
        throw new Error('Client ID is required');
      }
      
      const response = await apiClient.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch client';
      throw new Error(message);
    }
  },
  
  /**
   * Create new client (Admin/Manager)
   * @param {Object} clientData - { name, email, phone, company, package, status }
   * @returns {Promise} - Created client
   */
  createClient: async (clientData) => {
    try {
      // Validate input
      const requiredFields = ['name', 'email', 'phone', 'company'];
      const missingFields = requiredFields.filter(field => !clientData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const validPackages = ['Silver', 'Gold', 'Platinum', 'Diamond'];
      if (clientData.package && !validPackages.includes(clientData.package)) {
        throw new Error(`Invalid package. Must be one of: ${validPackages.join(', ')}`);
      }

      const validStatuses = ['active', 'inactive'];
      if (clientData.status && !validStatuses.includes(clientData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const response = await apiClient.post('/clients', clientData);
      return successResponse(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to create client';
      throw new Error(message);
    }
  },
  
  /**
   * Public client registration (no auth required)
   * @param {Object} clientData - { name, email, phone, company }
   * @returns {Promise} - Registered client
   */
  registerClient: async (clientData) => {
    try {
      // Validate input
      const requiredFields = ['name', 'email', 'phone', 'company'];
      const missingFields = requiredFields.filter(field => !clientData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await apiClient.post('/clients/register', clientData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to register client';
      throw new Error(message);
    }
  },
  
  /**
   * Update client
   * @param {string} id - Client ID
   * @param {Object} clientData - Updated fields
   * @returns {Promise} - Updated client
   */
  updateClient: async (id, clientData) => {
    try {
      if (!id) {
        throw new Error('Client ID is required');
      }
      
      if (!clientData || Object.keys(clientData).length === 0) {
        throw new Error('Update data is required');
      }

      // Validate package if provided
      if (clientData.package) {
        const validPackages = ['Silver', 'Gold', 'Platinum', 'Diamond'];
        if (!validPackages.includes(clientData.package)) {
          throw new Error(`Invalid package. Must be one of: ${validPackages.join(', ')}`);
        }
      }

      // Validate status if provided
      if (clientData.status) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(clientData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

      const response = await apiClient.put(`/clients/${id}`, clientData);
      return successResponse(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update client';
      throw new Error(message);
    }
  },
  
  /**
   * Delete client (Admin only)
   * @param {string} id - Client ID
   * @returns {Promise} - Success message
   */
  deleteClient: async (id) => {
    try {
      if (!id) {
        throw new Error('Client ID is required');
      }
      
      const response = await apiClient.delete(`/clients/${id}`);
      return successResponse(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to delete client';
      throw new Error(message);
    }
  },
};

export default clientApi;
