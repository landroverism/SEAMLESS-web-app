import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  preferredCurrency?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: localStorage.getItem('tailorly_token') || null,
    isAuthenticated: !!localStorage.getItem('tailorly_token'),
    loading: false,
    error: null
  }),
  
  getters: {
    isAdmin: (state) => state.user?.isAdmin || false,
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },
  
  actions: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/api/auth/login', credentials);
        
        if (response.data && response.data.data) {
          const { token, user } = response.data.data;
          
          // Store token in localStorage
          localStorage.setItem('tailorly_token', token);
          
          // Set Authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Update state
          this.token = token;
          this.user = user;
          this.isAuthenticated = true;
          
          return { success: true, user };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Login error:', error);
        this.error = error.response?.data?.message || error.message || 'Login failed';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async logout(): Promise<void> {
      try {
        // Call logout endpoint if available
        await axios.post('/api/auth/logout');
      } catch (error) {
        console.warn('Logout API error:', error);
        // Continue with local logout even if API call fails
      }
      
      // Clear local storage
      localStorage.removeItem('tailorly_token');
      
      // Clear Authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Reset state
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
    },
    
    async fetchUserProfile(): Promise<void> {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const response = await axios.get('/api/auth/profile');
        if (response.data && response.data.data) {
          this.user = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        
        // If unauthorized, logout
        if (error.response?.status === 401) {
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },
    
    setUser(user: User): void {
      this.user = user;
    },
    
    setCurrency(currency: string): void {
      if (this.user) {
        this.user.preferredCurrency = currency;
      }
      // Store currency preference in localStorage
      localStorage.setItem('tailorly_currency', currency);
    }
  }
});
