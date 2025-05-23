/**
 * Currency service for Tailorly
 * Handles currency conversion, formatting, and preferences
 */

// Exchange rates (as of May 2025)
// These would ideally come from an API in a production environment
const EXCHANGE_RATES = {
  KES: 1, // Base currency
  USD: 0.0078, // 1 KES = 0.0078 USD
  EUR: 0.0072, // 1 KES = 0.0072 EUR
};

// Currency symbols and formatting options
const CURRENCY_CONFIG = {
  KES: {
    symbol: 'KSh',
    code: 'KES',
    name: 'Kenyan Shilling',
    decimalPlaces: 0,
    position: 'prefix',
  },
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    decimalPlaces: 2,
    position: 'prefix',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    decimalPlaces: 2,
    position: 'prefix',
  },
};

// Default currency
const DEFAULT_CURRENCY = 'KES';

export default {
  /**
   * Get the user's preferred currency
   * @returns {string} Currency code (KES, USD, EUR)
   */
  getPreferredCurrency() {
    return localStorage.getItem('tailorly_currency') || DEFAULT_CURRENCY;
  },

  /**
   * Set the user's preferred currency
   * @param {string} currencyCode - Currency code (KES, USD, EUR)
   */
  setPreferredCurrency(currencyCode) {
    if (CURRENCY_CONFIG[currencyCode]) {
      localStorage.setItem('tailorly_currency', currencyCode);
    }
  },

  /**
   * Get all available currencies
   * @returns {Array} Array of currency objects
   */
  getAvailableCurrencies() {
    return Object.keys(CURRENCY_CONFIG).map(code => ({
      code,
      ...CURRENCY_CONFIG[code],
    }));
  },

  /**
   * Convert an amount from KES to the target currency
   * @param {number} amount - Amount in KES
   * @param {string} targetCurrency - Target currency code
   * @returns {number} Converted amount
   */
  convert(amount, targetCurrency = this.getPreferredCurrency()) {
    if (!amount) return 0;
    
    // If target currency is KES, no conversion needed
    if (targetCurrency === 'KES') {
      return amount;
    }
    
    // Convert from KES to target currency
    return amount * EXCHANGE_RATES[targetCurrency];
  },

  /**
   * Format an amount in the specified currency
   * @param {number} amount - Amount in KES
   * @param {string} currencyCode - Currency code
   * @returns {string} Formatted amount with currency symbol
   */
  format(amount, currencyCode = this.getPreferredCurrency()) {
    if (amount === null || amount === undefined) return '';
    
    const currency = CURRENCY_CONFIG[currencyCode];
    if (!currency) return `${amount}`;
    
    // Convert amount to target currency
    const convertedAmount = this.convert(amount, currencyCode);
    
    // Format the number with proper decimal places
    const formattedAmount = convertedAmount.toFixed(currency.decimalPlaces);
    
    // Add thousand separators
    const parts = formattedAmount.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const numberWithSeparators = parts.join('.');
    
    // Add currency symbol in the correct position
    if (currency.position === 'prefix') {
      return `${currency.symbol} ${numberWithSeparators}`;
    } else {
      return `${numberWithSeparators} ${currency.symbol}`;
    }
  },

  /**
   * Get currency configuration
   * @param {string} currencyCode - Currency code
   * @returns {Object} Currency configuration
   */
  getCurrencyConfig(currencyCode = this.getPreferredCurrency()) {
    return CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG[DEFAULT_CURRENCY];
  }
};
