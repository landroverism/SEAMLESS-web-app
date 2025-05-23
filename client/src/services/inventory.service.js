import api from './api';

/**
 * Inventory service for Tailorly
 * Handles inventory management operations
 */
export default {
  /**
   * Get all inventory items with optional filtering
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with inventory data
   */
  getAllInventoryItems(params = {}) {
    return api.get('/inventory', { params });
  },

  /**
   * Get an inventory item by ID
   * @param {String} id - Inventory item ID
   * @returns {Promise} - API response with item data
   */
  getInventoryItemById(id) {
    return api.get(`/inventory/${id}`);
  },

  /**
   * Create a new inventory item
   * @param {Object} data - Inventory item data
   * @returns {Promise} - API response
   */
  createInventoryItem(data) {
    return api.post('/inventory', data);
  },

  /**
   * Update an inventory item
   * @param {String} id - Inventory item ID
   * @param {Object} data - Item data to update
   * @returns {Promise} - API response
   */
  updateInventoryItem(id, data) {
    return api.put(`/inventory/${id}`, data);
  },

  /**
   * Update inventory item quantity
   * @param {String} id - Inventory item ID
   * @param {Number} quantity - Quantity to add, subtract, or set
   * @param {String} operation - Operation type: 'add', 'subtract', or 'set'
   * @returns {Promise} - API response
   */
  updateInventoryQuantity(id, quantity, operation = 'set') {
    return api.put(`/inventory/${id}/quantity`, { quantity, operation });
  },

  /**
   * Delete an inventory item
   * @param {String} id - Inventory item ID
   * @returns {Promise} - API response
   */
  deleteInventoryItem(id) {
    return api.delete(`/inventory/${id}`);
  },

  /**
   * Get low stock inventory items
   * @returns {Promise} - API response with low stock items
   */
  getLowStockItems() {
    return api.get('/inventory/stats/low-stock');
  },

  /**
   * Get inventory items grouped by category
   * @returns {Promise} - API response with category data
   */
  getItemsByCategory() {
    return api.get('/inventory/stats/by-category');
  },

  /**
   * Get total inventory value
   * @returns {Promise} - API response with inventory value data
   */
  getTotalInventoryValue() {
    return api.get('/inventory/stats/value');
  }
};
