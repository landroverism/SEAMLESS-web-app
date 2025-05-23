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
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
