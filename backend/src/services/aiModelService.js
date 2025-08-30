const axios = require('axios');
const config = require('../config/database');

class AIModelService {
    constructor() {
        this.baseURL = process.env.AI_MODEL_API_URL || 'http://localhost:5001';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request/response interceptors for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`[AI Model API] Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('[AI Model API] Request error:', error.message);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log(`[AI Model API] Response: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                console.error('[AI Model API] Response error:', error.response?.status, error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Check if AI Model API is healthy
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Load a specific model
     */
    async loadModel(modelPath, scalerPath = null) {
        try {
            const response = await this.client.post('/model/load', {
                model_path: modelPath,
                scaler_path: scalerPath
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Make a general prediction
     */
    async predict(features) {
        try {
            const response = await this.client.post('/predict', {
                features: features
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Predict medicine demand
     */
    async predictMedicineDemand(medicineData) {
        try {
            const response = await this.client.post('/predict/medicine-demand', medicineData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Predict optimal inventory levels for multiple medicines
     */
    async predictInventoryOptimization(medicines) {
        try {
            const response = await this.client.post('/predict/inventory-optimization', {
                medicines: medicines
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Get demand prediction for a specific medicine
     */
    async getMedicineDemandPrediction(medicineId, historicalData) {
        try {
            // Prepare features for the model
            const features = {
                historical_sales: historicalData.avgMonthlySales || 0,
                current_stock: historicalData.currentStock || 0,
                season_factor: this.getSeasonFactor(),
                trend_factor: historicalData.trendFactor || 1.0,
                price: historicalData.price || 0,
                days_since_last_order: historicalData.daysSinceLastOrder || 0
            };

            return await this.predictMedicineDemand(features);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get inventory optimization recommendations
     */
    async getInventoryRecommendations(medicines) {
        try {
            // Format medicines data for the AI model
            const formattedMedicines = medicines.map(medicine => ({
                id: medicine._id,
                name: medicine.name,
                current_stock: medicine.stock || 0,
                avg_daily_sales: medicine.avgDailySales || 0,
                lead_time_days: medicine.leadTimeDays || 7,
                safety_stock_factor: medicine.safetyStockFactor || 1.5,
                cost_per_unit: medicine.price || 0
            }));

            return await this.predictInventoryOptimization(formattedMedicines);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get seasonal factor based on current month
     */
    getSeasonFactor() {
        const month = new Date().getMonth() + 1; // 1-12

        // Simple seasonal factors (can be customized based on your domain knowledge)
        const seasonalFactors = {
            1: 1.2,  // January - winter season, higher demand
            2: 1.1,  // February
            3: 1.0,  // March
            4: 0.9,  // April
            5: 0.8,  // May
            6: 0.9,  // June
            7: 1.0,  // July
            8: 1.0,  // August
            9: 1.1,  // September
            10: 1.2, // October
            11: 1.3, // November - flu season
            12: 1.4  // December - winter season, holidays
        };

        return seasonalFactors[month] || 1.0;
    }

    /**
     * Batch prediction for multiple medicines
     */
    async batchPredict(medicinesData) {
        try {
            const predictions = [];

            for (const medicine of medicinesData) {
                const prediction = await this.getMedicineDemandPrediction(
                    medicine.id,
                    medicine.historicalData
                );

                if (prediction.success) {
                    predictions.push({
                        medicineId: medicine.id,
                        medicineName: medicine.name,
                        prediction: prediction.data
                    });
                }
            }

            return {
                success: true,
                predictions: predictions
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get smart reorder suggestions
     */
    async getReorderSuggestions(medicines) {
        try {
            const inventoryPredictions = await this.getInventoryRecommendations(medicines);

            if (!inventoryPredictions.success) {
                return inventoryPredictions;
            }

            const suggestions = inventoryPredictions.data.result.predictions
                .filter(pred => pred.reorder_needed)
                .map(pred => ({
                    medicineId: pred.medicine_id,
                    medicineName: pred.medicine_name,
                    currentStock: pred.current_stock,
                    recommendedStock: Math.ceil(pred.predicted_optimal_stock),
                    quantityToOrder: Math.ceil(pred.predicted_optimal_stock - pred.current_stock),
                    confidence: pred.confidence,
                    priority: this.calculatePriority(pred)
                }))
                .sort((a, b) => b.priority - a.priority);

            return {
                success: true,
                suggestions: suggestions,
                totalSuggestions: suggestions.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Calculate priority for reorder suggestions
     */
    calculatePriority(prediction) {
        const stockRatio = prediction.current_stock / prediction.predicted_optimal_stock;
        const confidenceWeight = prediction.confidence;

        // Lower stock ratio and higher confidence = higher priority
        return (1 - stockRatio) * confidenceWeight * 100;
    }

    /**
     * Predict fraud detection for procurement orders
     */
    async predictFraudDetection(orderData) {
        try {
            const response = await this.client.post('/predict/fraud-detection', orderData);

            return {
                success: true,
                data: response.data.result,
                timestamp: response.data.timestamp
            };

        } catch (error) {
            console.error('Fraud detection prediction failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                data: {
                    is_fraud: false,
                    risk_level: 'LOW',
                    confidence_score: 50,
                    reasons: ['AI model unavailable - using fallback']
                }
            };
        }
    }

    /**
     * Analyze order for fraud patterns
     */
    async analyzeOrderForFraud(orderData) {
        try {
            // Prepare features for fraud detection model
            const features = {
                ordered_quantity: orderData.quantity || 0,
                current_stock: orderData.currentStock || 0,
                min_required: orderData.minRequired || 0,
                max_capacity: orderData.maxCapacity || 1000,
                unit_cost: orderData.pricePerUnit || 0,
                avg_usage_per_day: orderData.avgUsagePerDay || 10,
                restock_lead_time: orderData.restockLeadTime || 7,
                medicine_name: orderData.medicineName || '',
                avg_market_price: orderData.avgMarketPrice || orderData.pricePerUnit || 0
            };

            return await this.predictFraudDetection(features);

        } catch (error) {
            console.error('Order fraud analysis failed:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    is_fraud: false,
                    risk_level: 'LOW',
                    confidence_score: 50,
                    reasons: ['Analysis failed - using safe default']
                }
            };
        }
    }
}

module.exports = new AIModelService();
