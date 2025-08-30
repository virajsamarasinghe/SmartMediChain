import axios from 'axios';
import { API_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../config';

const API_BASE_URL = API_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.error('Auth Service Error:', error.response?.data || error.message);
    throw error.response?.data || { message: error.message };
  }
);

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to get auth headers
export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authService = {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response);

      if (response.success && response.data) {
        console.log('Setting localStorage items with token:', response.data.token);
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
      } else {
        console.error('Login response missing success or data:', response);
      }

      return response;
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);

      if (response.success && response.data) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      await apiClient.post('/api/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/api/auth/refresh', { refreshToken });

      if (response.success && response.data) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      }

      return response;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;