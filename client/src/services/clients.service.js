import api from './api';

/**
 * Clients service for Tailorly
 * Handles client management operations
 */
export default {
  /**
   * Get all clients with optional filtering
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with clients data
   */
  getAllClients(params = {}) {
    return api.get('/clients', { params });
  },

  /**
   * Get a client by ID
   * @param {String} id - Client ID
   * @returns {Promise} - API response with client data
   */
  getClientById(id) {
    return api.get(`/clients/${id}`);
  },

  /**
   * Create a new client
   * @param {Object} data - Client data
   * @returns {Promise} - API response
   */
  createClient(data) {
    return api.post('/clients', data);
  },

  /**
   * Update a client
   * @param {String} id - Client ID
   * @param {Object} data - Client data to update
   * @returns {Promise} - API response
   */
  updateClient(id, data) {
    return api.put(`/clients/${id}`, data);
  },

  /**
   * Delete a client
   * @param {String} id - Client ID
   * @returns {Promise} - API response
   */
  deleteClient(id) {
    return api.delete(`/clients/${id}`);
  },

  /**
   * Update client preferences
   * @param {String} id - Client ID
   * @param {Object} preferences - Client preferences
   * @returns {Promise} - API response
   */
  updateClientPreferences(id, preferences) {
    return api.put(`/clients/${id}/preferences`, { preferences });
  },

  /**
   * Update client measurements
   * @param {String} id - Client ID
   * @param {Object} measurements - Client measurements
   * @returns {Promise} - API response
   */
  updateClientMeasurements(id, measurements) {
    return api.put(`/clients/${id}/measurements`, { measurements });
  },

  /**
   * Get all orders for a client
   * @param {String} id - Client ID
   * @returns {Promise} - API response with orders data
   */
  getClientOrders(id) {
    return api.get(`/clients/${id}/orders`);
  }
};
