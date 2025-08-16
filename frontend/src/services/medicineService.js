import axios from 'axios';

// When running in a browser, we need to use the publicly accessible URL
// Docker service names like 'backend' won't work in browser context
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Fix for Docker environment - replace container names with localhost
const BROWSER_FRIENDLY_URL = API_BASE_URL.replace('http://backend:', 'http://localhost:');

console.log('API Base URL (original):', API_BASE_URL);
console.log('API Base URL (browser-friendly):', BROWSER_FRIENDLY_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BROWSER_FRIENDLY_URL, // Use the browser-friendly URL
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
    // For DELETE requests that return 204 No Content
    if (response.status === 204) {
      return { success: true, message: 'Operation completed successfully' };
    }
    return response.data;
  },
  (error) => {
    console.error('Medicine Service Error:', error.response?.data || error.message);
    // Log additional details for debugging
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      
      // Specific error handling for different status codes
      if (error.response.status === 401) {
        console.error('Authentication error: User not authenticated or token expired');
        // Redirect to login if token expired
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject({ message: 'Your session has expired. Please login again.' });
        }
      } 
      else if (error.response.status === 403) {
        console.error('Authorization error: User does not have permission');
      }
      else if (error.response.status === 404) {
        console.error('Resource not found');
      }
    }
    throw error.response?.data || { message: error.message };
  }
);

export const medicineService = {
  /**
   * Get all medicines
   */
  async getMedicines(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `/medicines${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      throw error;
    }
  },

  /**
   * Get single medicine by ID
   */
  async getMedicine(id) {
    try {
      const response = await apiClient.get(`/medicines/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new medicine
   */
  async createMedicine(medicineData) {
    try {
      const response = await apiClient.post('/medicines', medicineData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update medicine
   */
  async updateMedicine(id, medicineData) {
    try {
      const response = await apiClient.put(`/medicines/${id}`, medicineData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete medicine
   */
  async deleteMedicine(id) {
    try {
      // Validate ID before sending to backend
      if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error(`Invalid medicine ID format: ${id}`);
      }
      
      // Add a timeout to the request to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await apiClient.delete(`/medicines/${id}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (requestError) {
        clearTimeout(timeoutId);
        if (requestError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw requestError;
      }
    } catch (error) {
      console.error('Delete medicine error:', error);
      throw error;
    }
  },

  /**
   * Get medicine categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/medicines/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search medicine by batch number
   */
  async getMedicineByBatch(batchNumber) {
    try {
      const response = await apiClient.get(`/medicines/batch/${batchNumber}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get low stock medicines
   */
  async getLowStockMedicines(threshold = 50) {
    try {
      const response = await this.getMedicines({ lowStock: threshold });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get expiring medicines
   */
  async getExpiringMedicines(days = 180) {
    try {
      const response = await this.getMedicines({ expiringIn: days });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update medicine stock
   */
  async updateStock(id, quantity, operation = 'set') {
    try {
      const response = await apiClient.patch(`/medicines/${id}/stock`, {
        quantity,
        operation // 'set', 'add', 'subtract'
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default medicineService;