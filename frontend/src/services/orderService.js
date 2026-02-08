import axios from 'axios';

// When running in a browser, we need to use the publicly accessible URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://135.235.193.242:3001/api';

console.log('Order Service API Base URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
    console.error('Order Service Error:', error.response?.data || error.message);

    if (error.response) {
      if (error.response.status === 401) {
        console.error('Authentication error: User not authenticated or token expired');
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject({ message: 'Your session has expired. Please login again.' });
        }
      }
      else if (error.response.status === 403) {
        console.error('Authorization error: User does not have permission');
      }
    }
    throw error.response?.data || { message: error.message };
  }
);

export const orderService = {
  /**
   * Get all orders
   */
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `/orders${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },

  /**
   * Get single order by ID
   */
  async getOrder(id) {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id, statusData) {
    try {
      const response = await apiClient.put(`/orders/${id}/status`, statusData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(id, reason) {
    try {
      const response = await apiClient.put(`/orders/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete order (admin only)
   */
  async deleteOrder(id) {
    try {
      const response = await apiClient.delete(`/orders/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Place order with blockchain and fraud detection
   */
  async placeOrderWithBlockchain(orderData) {
    try {
      const response = await apiClient.post('/blockchain/place-order', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;