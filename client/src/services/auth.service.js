import api from './api';

/**
 * Authentication service for Tailorly
 * Handles user registration, login, profile management
 */
export default {
  /**
   * Register a new tailor account
   * @param {Object} data - Registration data
   * @returns {Promise} - API response
   */
  register(data) {
    return api.post('/auth/register', data);
  },

  /**
   * Login a tailor
   * @param {Object} credentials - Email and password
   * @returns {Promise} - API response with user data and token
   */
  async login(credentials) {
    try {
      console.log('Auth service: Attempting login with:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      // Store token and user data in localStorage if successful
      if (response.data && response.data.success && response.data.data) {
        console.log('Auth service: Login successful, storing token and user data');
        localStorage.setItem('tailorly_token', response.data.data.token);
        localStorage.setItem('tailorly_user', JSON.stringify(response.data.data.tailor));
        
        // Set the token in the API headers for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      } else {
        console.warn('Auth service: Login response missing expected data structure');
      }
      
      return response;
    } catch (error) {
      console.error('Auth service: Login error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} - API response
   */
  async logout() {
    const response = await api.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('tailorly_token');
    localStorage.removeItem('tailorly_user');
    
    return response;
  },

  /**
   * Get current user profile
   * @returns {Promise} - API response with user data
   */
  getCurrentUser() {
    return api.get('/auth/me');
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data to update
   * @returns {Promise} - API response
   */
  updateProfile(data) {
    return api.put('/auth/profile', data);
  },

  /**
   * Request password reset
   * @param {Object} data - Email address
   * @returns {Promise} - API response
   */
  forgotPassword(data) {
    return api.post('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   * @param {Object} data - Token and new password
   * @returns {Promise} - API response
   */
  resetPassword(data) {
    return api.post('/auth/reset-password', data);
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('tailorly_token');
  },

  /**
   * Get the current user from localStorage
   * @returns {Object|null} - User object or null
   */
  getUser() {
    const user = localStorage.getItem('tailorly_user');
    return user ? JSON.parse(user) : null;
  }
};
