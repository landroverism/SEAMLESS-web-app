import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tailorly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Log successful responses for debugging
    console.log(`API Response [${response.config.method.toUpperCase()}] ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    // Check for network connectivity issues
    if (!error.response) {
      console.error('Network Error: No response from server', error.message);
      
      // Create a more user-friendly error
      const networkError = new Error('Network connectivity issue');
      networkError.isNetworkError = true;
      networkError.originalError = error;
      
      // Add user-friendly message based on error type
      if (error.code === 'ECONNABORTED') {
        networkError.userMessage = 'Request timed out. Please try again later.';
      } else if (error.message.includes('Network Error')) {
        networkError.userMessage = 'Cannot connect to the server. Please check your internet connection.';
      } else {
        networkError.userMessage = 'Connection issue. Please try again later.';
      }
      
      return Promise.reject(networkError);
    }
    
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      console.warn('Authentication token expired or invalid, redirecting to login');
      localStorage.removeItem('tailorly_token');
      localStorage.removeItem('tailorly_user');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 503 Service Unavailable (likely network or server issues)
    if (error.response && error.response.status === 503) {
      console.warn('Service unavailable, likely network or server issues');
      
      // Add user-friendly message
      error.userMessage = error.response.data?.message || 
                         'Service temporarily unavailable. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default api;
