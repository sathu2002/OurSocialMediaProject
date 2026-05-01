import apiClient from './axiosConfig';

/**
 * Package Management API Service
 * Uses client endpoints for package assignments
 * Available packages: Silver, Gold, Platinum, Diamond
 */
export const packageApi = {
  /**
   * Get all clients with their packages
   * @returns {Promise} - Array of clients with package info
   */
  getClientsWithPackages: () => apiClient.get('/clients'),
  
  /**
   * Update client package assignment
   * @param {string} clientId - Client ID
   * @param {Object} packageData - { package: 'Silver|Gold|Platinum|Diamond', packageAssignedAt: Date }
   * @returns {Promise} - Updated client
   */
  updateClientPackage: (clientId, packageData) => 
    apiClient.put(`/clients/${clientId}`, packageData),
  
  /**
   * Get available package types
   * @returns {Array} - List of available packages
   */
  getAvailablePackages: () => {
    return ['Silver', 'Gold', 'Platinum', 'Diamond'];
  },
  
  /**
   * Get package color for UI
   * @param {string} packageName - Package name
   * @returns {string} - Color hex code
   */
  getPackageColor: (packageName) => {
    const colors = {
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2',
      'Diamond': '#B9F2FF',
    };
    return colors[packageName] || '#C0C0C0';
  },
};

export default packageApi;
