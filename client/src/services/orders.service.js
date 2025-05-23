import api from './api';

/**
 * Orders service for Tailorly
 * Handles order management operations
 */
export default {
  /**
   * Get all orders with optional filtering
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with orders data
   */
  getAllOrders(params = {}) {
    return api.get('/orders', { params });
  },

  /**
   * Get an order by ID
   * @param {String} id - Order ID
   * @returns {Promise} - API response with order data
   */
  getOrderById(id) {
    return api.get(`/orders/${id}`);
  },

  /**
   * Create a new order
   * @param {Object} data - Order data
   * @returns {Promise} - API response
   */
  createOrder(data) {
    return api.post('/orders', data);
  },

  /**
   * Update an order
   * @param {String} id - Order ID
   * @param {Object} data - Order data to update
   * @returns {Promise} - API response
   */
  updateOrder(id, data) {
    return api.put(`/orders/${id}`, data);
  },

  /**
   * Update order status
   * @param {String} id - Order ID
   * @param {String} status - New status
   * @returns {Promise} - API response
   */
  updateOrderStatus(id, status) {
    return api.put(`/orders/${id}/status`, { status });
  },

  /**
   * Delete an order
   * @param {String} id - Order ID
   * @returns {Promise} - API response
   */
  deleteOrder(id) {
    return api.delete(`/orders/${id}`);
  },

  /**
   * Get order statistics summary
   * @returns {Promise} - API response with order stats
   */
  getOrderStatsSummary() {
    return api.get('/orders/stats/summary');
  },

  /**
   * Get orders grouped by status
   * @returns {Promise} - API response with status data
   */
  getOrdersByStatus() {
    return api.get('/orders/stats/by-status');
  },

  /**
   * Get orders grouped by month
   * @param {Object} params - Query parameters (e.g., year)
   * @returns {Promise} - API response with monthly data
   */
  getOrdersByMonth(params = {}) {
    return api.get('/orders/stats/by-month', { params });
  }
};
