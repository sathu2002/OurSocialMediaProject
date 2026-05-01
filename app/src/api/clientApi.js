import apiClient from './axiosConfig';

/**
 * Client Management API Service
 * Admin/Manager access for management, public registration available
 */
export const clientApi = {
  /**
   * Get all clients (Admin/Manager)
   * @returns {Promise} - Array of clients
   */
  getClients: () => apiClient.get('/clients'),
  
  /**
   * Get client by ID
   * @param {string} id - Client ID
   * @returns {Promise} - Client object
   */
  getClientById: (id) => apiClient.get(`/clients/${id}`),
  
  /**
   * Create new client (Admin/Manager)
   * @param {Object} clientData - { name, email, phone, company, package, status }
   * @returns {Promise} - Created client
   */
  createClient: (clientData) => apiClient.post('/clients', clientData),
  
  /**
   * Public client registration (no auth required)
   * @param {Object} clientData - { name, email, phone, company }
   * @returns {Promise} - Registered client
   */
  registerClient: (clientData) => apiClient.post('/clients/register', clientData),
  
  /**
   * Update client
   * @param {string} id - Client ID
   * @param {Object} clientData - Updated fields
   * @returns {Promise} - Updated client
   */
  updateClient: (id, clientData) => apiClient.put(`/clients/${id}`, clientData),
  
  /**
   * Delete client (Admin only)
   * @param {string} id - Client ID
   * @returns {Promise} - Success message
   */
  deleteClient: (id) => apiClient.delete(`/clients/${id}`),
};

export default clientApi;
