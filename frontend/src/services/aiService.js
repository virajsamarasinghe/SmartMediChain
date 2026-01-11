import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  (response) => response.data,
  (error) => {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw error.response?.data || { message: error.message };
  }
);

export const aiService = {
  /**
   * Check AI model health status
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/ai/health');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get demand prediction for a specific medicine
   */
  async getMedicineDemandPrediction(medicineId) {
    try {
      const response = await apiClient.get(`/ai/medicine/${medicineId}/demand`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inventory optimization recommendations
   */
  async getInventoryOptimization(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `/ai/inventory/optimization${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get smart reorder suggestions
   */
  async getReorderSuggestions(threshold = 20) {
    try {
      const response = await apiClient.get(`/ai/reorder/suggestions?threshold=${threshold}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get batch predictions for multiple medicines
   */
  async getBatchPredictions(medicineIds) {
    try {
      const response = await apiClient.post('/ai/predictions/batch', {
        medicineIds: medicineIds
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get AI-powered insights
   */
  async getAIInsights(timeRange = '30d') {
    try {
      const response = await apiClient.get(`/ai/insights?timeRange=${timeRange}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get demand forecast for dashboard
   */
  async getDemandForecast(medicineIds = []) {
    try {
      if (medicineIds.length === 0) {
        // Get insights instead if no specific medicines
        return await this.getAIInsights();
      }
      return await this.getBatchPredictions(medicineIds);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inventory alerts
   */
  async getInventoryAlerts() {
    try {
      const response = await this.getReorderSuggestions();

      // Transform suggestions into alerts format
      if (response.success && response.data.suggestions) {
        const alerts = response.data.suggestions.map(suggestion => ({
          id: suggestion.medicineId,
          type: 'reorder',
          severity: suggestion.priority > 70 ? 'high' : suggestion.priority > 40 ? 'medium' : 'low',
          title: `Reorder ${suggestion.medicineName}`,
          message: `Current stock: ${suggestion.currentStock}, Recommended: ${suggestion.recommendedStock}`,
          medicineId: suggestion.medicineId,
          medicineName: suggestion.medicineName,
          currentStock: suggestion.currentStock,
          recommendedStock: suggestion.recommendedStock,
          quantityToOrder: suggestion.quantityToOrder,
          confidence: suggestion.confidence,
          priority: suggestion.priority
        }));

        return {
          success: true,
          data: { alerts },
          message: 'Inventory alerts retrieved successfully'
        };
      }

      return {
        success: true,
        data: { alerts: [] },
        message: 'No inventory alerts at this time'
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get smart dashboard data combining multiple AI endpoints
   */
  async getDashboardData() {
    try {
      const [health, insights, reorderSuggestions] = await Promise.allSettled([
        this.checkHealth(),
        this.getAIInsights(),
        this.getReorderSuggestions()
      ]);

      return {
        success: true,
        data: {
          health: health.status === 'fulfilled' ? health.value : null,
          insights: insights.status === 'fulfilled' ? insights.value : null,
          reorderSuggestions: reorderSuggestions.status === 'fulfilled' ? reorderSuggestions.value : null,
          errors: [
            health.status === 'rejected' ? { service: 'health', error: health.reason } : null,
            insights.status === 'rejected' ? { service: 'insights', error: insights.reason } : null,
            reorderSuggestions.status === 'rejected' ? { service: 'reorderSuggestions', error: reorderSuggestions.reason } : null
          ].filter(Boolean)
        }
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get optimization recommendations for specific category
   */
  async getCategoryOptimization(category) {
    try {
      const response = await this.getInventoryOptimization({ category });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get low stock predictions
   */
  async getLowStockPredictions() {
    try {
      const response = await this.getInventoryOptimization({ lowStock: 'true' });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default aiService;
