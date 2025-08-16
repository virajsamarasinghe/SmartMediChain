import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../config';

// Get token from localStorage
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Set up API with auth header
const getAuthHeader = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
});

const userService = {
  // Get all users (admin)
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      let queryParams = new URLSearchParams();
      
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      // Add filters if they exist
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      
      const response = await axios.get(
        `${API_URL}/users?${queryParams.toString()}`, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Get user by ID (admin)
  getUserById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/users/${id}`, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Create user (admin)
  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${API_URL}/users`, 
        userData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Update user (admin)
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${id}`, 
        userData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Delete user (admin)
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/users/${id}`, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  },

  // Reset user password (admin)
  resetUserPassword: async (id, password) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${id}/reset-password`, 
        { password },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { success: false, message: 'Network error' };
    }
  }
};

export { userService };
