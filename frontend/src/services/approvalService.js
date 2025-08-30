import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeader } from './authService';

// Get all approvals with optional filters
export const getAllApprovals = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.entityType) queryParams.append('entityType', filters.entityType);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await axios.get(
      `${API_URL}/approvals?${queryParams.toString()}`, 
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get approval by ID
export const getApprovalById = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/approvals/${id}`, 
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new approval request
export const createApproval = async (data) => {
  try {
    const response = await axios.post(
      `${API_URL}/approvals`, 
      data,
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Approve a request
export const approveRequest = async (id, comments = '') => {
  try {
    const response = await axios.put(
      `${API_URL}/approvals/${id}/approve`, 
      { comments },
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject a request
export const rejectRequest = async (id, comments) => {
  try {
    const response = await axios.put(
      `${API_URL}/approvals/${id}/reject`, 
      { comments },
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel a request
export const cancelRequest = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/approvals/${id}/cancel`, 
      {},
      { headers: getAuthHeader() }
    );
    
    return response.data;
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
