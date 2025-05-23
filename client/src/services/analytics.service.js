import api from './api';

/**
 * Analytics service for Tailorly
 * Handles business insights and analytics operations
 */
export default {
  /**
   * Get dashboard analytics data
   * @returns {Promise} - API response with dashboard analytics
   */
  getDashboardAnalytics() {
    return api.get('/analytics/dashboard');
  },

  /**
   * Get revenue analytics
   * @param {Object} params - Query parameters (e.g., period, year)
   * @returns {Promise} - API response with revenue data
   */
  getRevenueAnalytics(params = {}) {
    return api.get('/analytics/revenue', { params });
  },

  /**
   * Get service popularity analytics
   * @returns {Promise} - API response with service data
   */
  getServiceAnalytics() {
    return api.get('/analytics/services');
  },

  /**
   * Get client analytics
   * @returns {Promise} - API response with client analytics
   */
  getClientAnalytics() {
    return api.get('/analytics/clients');
  },

  /**
   * Get tailor performance analytics
   * @returns {Promise} - API response with performance data
   */
  getPerformanceAnalytics() {
    return api.get('/analytics/performance');
  }
};
