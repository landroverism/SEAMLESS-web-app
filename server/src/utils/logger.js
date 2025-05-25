/**
 * Simple logger utility for Tailorly API
 * Provides consistent logging format across the application
 */

const logger = {
  /**
   * Log an info message
   * @param {string} message - Message to log
   * @param {Object} data - Optional data to include
   */
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data ? data : '');
  },

  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @param {Object} data - Optional data to include
   */
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data ? data : '');
  },

  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {Object|Error} error - Optional error to include
   */
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error ? error : '');
  },

  /**
   * Log a debug message (only in development)
   * @param {string} message - Message to log
   * @param {Object} data - Optional data to include
   */
  debug: (message, data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, data ? data : '');
    }
  }
};

module.exports = logger;
