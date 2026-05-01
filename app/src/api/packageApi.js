import apiClient from './axiosConfig';

/**
 * Package Management API Service
 * Uses client endpoints for package assignments with proper error handling
 * Available packages: Silver, Gold, Platinum, Diamond
 */
export const packageApi = {
  /**
   * Get all clients with their packages
   * @returns {Promise} - Array of clients with package info
   */
  getClientsWithPackages: async () => {
    try {
      const response = await apiClient.get('/clients');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to fetch clients with packages';
      throw new Error(message);
    }
  },
  
  /**
   * Update client package assignment
   * @param {string} clientId - Client ID
   * @param {Object} packageData - { package: 'Silver|Gold|Platinum|Diamond', packageAssignedAt: Date }
   * @returns {Promise} - Updated client
   */
  updateClientPackage: async (clientId, packageData) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }
      
      if (!packageData || !packageData.package) {
        throw new Error('Package data is required');
      }

      const validPackages = ['Silver', 'Gold', 'Platinum', 'Diamond'];
      if (!validPackages.includes(packageData.package)) {
        throw new Error(`Invalid package. Must be one of: ${validPackages.join(', ')}`);
      }

      // Add package assigned date if not provided
      if (!packageData.packageAssignedAt) {
        packageData.packageAssignedAt = new Date().toISOString();
      }

      const response = await apiClient.put(`/clients/${clientId}`, packageData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.message || 
                    'Failed to update client package';
      throw new Error(message);
    }
  },
  
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

  /**
   * Get package details (pricing, features, etc.)
   * @param {string} packageName - Package name
   * @returns {Object} - Package details
   */
  getPackageDetails: (packageName) => {
    const packages = {
      'Silver': {
        name: 'Silver',
        price: 299,
        duration: 'month',
        features: [
          'Basic campaign management',
          'Up to 50 clients',
          'Email support',
          'Basic analytics'
        ],
        color: '#C0C0C0'
      },
      'Gold': {
        name: 'Gold',
        price: 599,
        duration: 'month',
        features: [
          'Advanced campaign management',
          'Up to 200 clients',
          'Priority support',
          'Advanced analytics',
          'AI insights'
        ],
        color: '#FFD700'
      },
      'Platinum': {
        name: 'Platinum',
        price: 999,
        duration: 'month',
        features: [
          'Full campaign management',
          'Unlimited clients',
          '24/7 phone support',
          'Real-time analytics',
          'Advanced AI insights',
          'Custom integrations'
        ],
        color: '#E5E4E2'
      },
      'Diamond': {
        name: 'Diamond',
        price: 1999,
        duration: 'month',
        features: [
          'Enterprise campaign management',
          'Unlimited clients',
          'Dedicated account manager',
          'Real-time analytics',
          'Advanced AI insights',
          'Custom integrations',
          'White-label options',
          'API access'
        ],
        color: '#B9F2FF'
      }
    };
    
    return packages[packageName] || packages.Silver;
  },

  /**
   * Validate package data
   * @param {Object} packageData - Package data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validatePackageData: (packageData) => {
    const errors = [];
    
    if (!packageData) {
      errors.push('Package data is required');
      return { isValid: false, errors };
    }
    
    const validPackages = ['Silver', 'Gold', 'Platinum', 'Diamond'];
    if (!packageData.package || !validPackages.includes(packageData.package)) {
      errors.push(`Invalid package. Must be one of: ${validPackages.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default packageApi;
