import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Approval Service Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error.response?.data || { message: error.message };
  }
);

// Get all approvals with optional filters
export const getAllApprovals = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.entityType) queryParams.append('entityType', filters.entityType);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await apiClient.get(`/approvals?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get approval by ID
export const getApprovalById = async (id) => {
  try {
    const response = await apiClient.get(`/approvals/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create a new approval request
export const createApproval = async (data) => {
  try {
    const response = await apiClient.post('/approvals', data);
    return response;
  } catch (error) {
    throw error;
  }
};

// Approve a request
export const approveRequest = async (id, comments = '') => {
  try {
    const response = await apiClient.put(`/approvals/${id}/approve`, { comments });
    return response;
  } catch (error) {
    throw error;
  }
};

// Reject a request
export const rejectRequest = async (id, comments) => {
  try {
    const response = await apiClient.put(`/approvals/${id}/reject`, { comments });
    return response;
  } catch (error) {
    throw error;
  }
};

// Cancel a request
export const cancelRequest = async (id) => {
  try {
    const response = await apiClient.put(`/approvals/${id}/cancel`, {});
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllApprovals,
  getApprovalById,
  createApproval,
  approveRequest,
  rejectRequest,
  cancelRequest
};
