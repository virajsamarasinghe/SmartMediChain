import axios from 'axios';
import { API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY } from '../config';

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
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token first
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, { 
            refreshToken 
          });
          
          if (refreshResponse.data.success) {
            const newToken = refreshResponse.data.data.token;
            const newRefreshToken = refreshResponse.data.data.refreshToken;
            
            localStorage.setItem(TOKEN_KEY, newToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            
            // Update default authorization header
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            console.log('✅ Token refreshed successfully');
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('❌ Token refresh failed:', refreshError.response?.data || refreshError.message);
      }
      
      // If refresh fails or no refresh token, clear auth and redirect
      console.log('🔄 Clearing auth data and redirecting to login');
      clearAuthData();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    console.error('Auth Service Error:', error.response?.data || error.message);
    throw error.response?.data || { message: error.message };
  }
);

// Helper function to clear all auth data
const clearAuthData = () => {
  console.log('🧹 Clearing all authentication data');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
  
  // Clear axios default headers
  delete apiClient.defaults.headers.common['Authorization'];
};

// Helper function to set auth data
const setAuthData = (token, refreshToken, user) => {
  console.log('💾 Setting authentication data');
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Set axios default header
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Helper function to validate token format
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3; // JWT should have 3 parts
};

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && isValidToken(token)) {
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
   * Login user with comprehensive error handling and retry logic
   */
  async login(email, password) {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Attempting login for: ${email} (attempt ${attempt}/${maxRetries})`);
        console.log('📡 API Base URL:', API_BASE_URL);
        
        // Clear any existing auth data before login (only on first attempt)
        if (attempt === 1) {
          clearAuthData();
        }
        
        // Validate input
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        
        const response = await apiClient.post('/auth/login', {
          email: email.trim(),
          password
        });

        console.log('📥 Login response received:', {
          success: response.success,
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });

        if (response.success && response.data) {
          const { token, refreshToken, user } = response.data;
          
          // Validate token format
          if (!isValidToken(token)) {
            throw new Error('Invalid token format received');
          }
          
          // Store auth data
          setAuthData(token, refreshToken, user);
          
          console.log('✅ Login successful - tokens stored');
          return response;
        } else {
          console.error('❌ Invalid login response format:', response);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        const isRateLimit = error.response?.status === 429;
        const isLastAttempt = attempt === maxRetries;
        
        console.error(`❌ Login attempt ${attempt} failed:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          isRateLimit
        });
        
        // If it's a rate limit error and not the last attempt, wait and retry
        if (isRateLimit && !isLastAttempt) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Rate limit hit, waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For non-rate-limit errors or last attempt, clear auth data and throw
        clearAuthData();
        
        throw {
          message: isRateLimit ? 'Too many login attempts. Please try again later.' : error.message || 'Login failed',
          status: error.response?.status,
          data: error.response?.data
        };
      }
    }
  },

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);

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
   * Logout user with proper cleanup
   */
  async logout() {
    try {
      console.log('🚪 Logging out user');
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        console.log('📤 Sending logout request to backend');
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      console.log('🧹 Clearing auth data');
      clearAuthData();
    }
  },

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || !isValidToken(token)) {
        console.log('❌ No valid token found');
        return false;
      }
      
      console.log('🔍 Validating session with backend');
      const response = await apiClient.get('/auth/validate');
      return response.success;
    } catch (error) {
      console.error('❌ Session validation failed:', error);
      clearAuthData();
      return false;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem('user');
    return !!(token && isValidToken(token) && user);
  },

  /**
   * Get stored user data
   */
  getCurrentUserData() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
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
      const response = await apiClient.put('/auth/change-password', {
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

      const response = await apiClient.post('/auth/refresh', { refreshToken });

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
    
    if (!token || !user) {
      console.log('Missing token or user data');
      return false;
    }
    
    try {
      // Basic token validation (decode without verification)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('Invalid token format');
        this.clearAuthData();
        return false;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        console.log('Token expired:', new Date(payload.exp * 1000));
        this.clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuthData();
      return false;
    }
  },

  /**
   * Clear authentication data
   */
  clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('user');
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
  },

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }
      
      const response = await apiClient.get('/auth/me');
      return response.success;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearAuthData();
      return false;
    }
  }
};

export default authService;