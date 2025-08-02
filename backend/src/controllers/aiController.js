const aiModelService = require('../services/aiModelService');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

/**
 * Get AI model health status
 */
const getModelHealth = async (req, res) => {
    try {
        const healthCheck = await aiModelService.healthCheck();
        
        if (healthCheck.success) {
            res.status(200).json({
                success: true,
                message: 'AI Model API is healthy',
                data: healthCheck.data
            });
        } else {
            res.status(503).json({
                success: false,
                message: 'AI Model API is not available',
                error: healthCheck.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking AI model health',
            error: error.message
        });
    }
};

/**
 * Get demand prediction for a specific medicine
 */
const getMedicineDemandPrediction = async (req, res) => {
    try {
        const { medicineId } = req.params;
        const medicine = await Medicine.findById(medicineId);
        
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        // Get historical data for the medicine
        const historicalData = await getHistoricalData(medicineId);
        
        // Get prediction from AI model
        const prediction = await aiModelService.getMedicineDemandPrediction(
            medicineId,
            historicalData
        );

        if (prediction.success) {
            res.status(200).json({
                success: true,
                message: 'Demand prediction retrieved successfully',
                data: {
                    medicine: {
                        id: medicine._id,
                        name: medicine.name,
                        currentStock: medicine.stock
                    },
                    prediction: prediction.data,
                    historicalData: historicalData
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get demand prediction',
                error: prediction.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting demand prediction',
            error: error.message
        });
    }
};

/**
 * Get inventory optimization recommendations
 */
const getInventoryOptimization = async (req, res) => {
    try {
        // Get all medicines or filter by query parameters
        const { category, lowStock } = req.query;
        let query = {};
        
        if (category) {
            query.category = category;
        }
        
        if (lowStock === 'true') {
            query.stock = { $lt: 50 }; // Consider medicines with less than 50 units as low stock
        }

        const medicines = await Medicine.find(query);
        
        if (medicines.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No medicines found'
            });
        }

        // Get historical data for each medicine
        const medicinesWithHistory = await Promise.all(
            medicines.map(async (medicine) => {
                const historicalData = await getHistoricalData(medicine._id);
                return {
                    ...medicine.toObject(),
                    avgDailySales: historicalData.avgDailySales,
                    leadTimeDays: historicalData.leadTimeDays,
                    safetyStockFactor: historicalData.safetyStockFactor
                };
            })
        );

        // Get predictions from AI model
        const optimization = await aiModelService.getInventoryRecommendations(medicinesWithHistory);

        if (optimization.success) {
            res.status(200).json({
                success: true,
                message: 'Inventory optimization retrieved successfully',
                data: optimization.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get inventory optimization',
                error: optimization.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting inventory optimization',
            error: error.message
        });
    }
};

/**
 * Get smart reorder suggestions
 */
const getReorderSuggestions = async (req, res) => {
    try {
        // Get medicines that might need reordering (low stock or custom criteria)
        const { threshold = 20 } = req.query;
        
        const medicines = await Medicine.find({
            $or: [
                { stock: { $lt: Number(threshold) } },
                { stock: { $lt: { $multiply: ['$minStock', 1.5] } } }
            ]
        });

        if (medicines.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No medicines need reordering at this time',
                data: { suggestions: [], totalSuggestions: 0 }
            });
        }

        // Get historical data for each medicine
        const medicinesWithHistory = await Promise.all(
            medicines.map(async (medicine) => {
                const historicalData = await getHistoricalData(medicine._id);
                return {
                    ...medicine.toObject(),
                    avgDailySales: historicalData.avgDailySales,
                    leadTimeDays: historicalData.leadTimeDays,
                    safetyStockFactor: historicalData.safetyStockFactor
                };
            })
        );

        // Get reorder suggestions from AI model
        const suggestions = await aiModelService.getReorderSuggestions(medicinesWithHistory);

        if (suggestions.success) {
            res.status(200).json({
                success: true,
                message: 'Reorder suggestions retrieved successfully',
                data: suggestions
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get reorder suggestions',
                error: suggestions.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting reorder suggestions',
            error: error.message
        });
    }
};

/**
 * Get batch predictions for multiple medicines
 */
const getBatchPredictions = async (req, res) => {
    try {
        const { medicineIds } = req.body;
        
        if (!medicineIds || !Array.isArray(medicineIds)) {
            return res.status(400).json({
                success: false,
                message: 'medicineIds array is required'
            });
        }

        const medicines = await Medicine.find({ _id: { $in: medicineIds } });
        
        if (medicines.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No medicines found'
            });
        }

        // Prepare data for batch prediction
        const medicinesData = await Promise.all(
            medicines.map(async (medicine) => {
                const historicalData = await getHistoricalData(medicine._id);
                return {
                    id: medicine._id,
                    name: medicine.name,
                    historicalData: historicalData
                };
            })
        );

        // Get batch predictions from AI model
        const predictions = await aiModelService.batchPredict(medicinesData);

        if (predictions.success) {
            res.status(200).json({
                success: true,
                message: 'Batch predictions retrieved successfully',
                data: predictions
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get batch predictions',
                error: predictions.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting batch predictions',
            error: error.message
        });
    }
};

/**
 * Get analytics insights using AI
 */
const getAIInsights = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        
        // Get medicines data
        const medicines = await Medicine.find({});
        
        // Get historical insights
        const insights = await generateInsights(medicines, timeRange);
        
        res.status(200).json({
            success: true,
            message: 'AI insights retrieved successfully',
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting AI insights',
            error: error.message
        });
    }
};

// Helper function to get historical data for a medicine
async function getHistoricalData(medicineId) {
    try {
        // Get orders data for the medicine
        const orders = await Order.find({
            'items.medicine': medicineId,
            createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
        }).sort({ createdAt: -1 });

        // Calculate metrics
        let totalSales = 0;
        let salesDays = 0;
        const salesData = [];

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.medicine.toString() === medicineId.toString()) {
                    totalSales += item.quantity;
                    salesData.push({
                        date: order.createdAt,
                        quantity: item.quantity
                    });
                }
            });
        });

        // Calculate average daily sales
        const daysInPeriod = Math.min(90, Math.max(1, salesData.length));
        const avgDailySales = totalSales / daysInPeriod;

        // Calculate trend factor (simplified)
        const recentSales = salesData.slice(0, 15).reduce((sum, sale) => sum + sale.quantity, 0);
        const olderSales = salesData.slice(15, 30).reduce((sum, sale) => sum + sale.quantity, 0);
        const trendFactor = olderSales > 0 ? recentSales / olderSales : 1.0;

        // Get last order date
        const lastOrder = orders[0];
        const daysSinceLastOrder = lastOrder 
            ? Math.floor((Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : 30;

        return {
            avgMonthlySales: totalSales,
            avgDailySales: avgDailySales,
            trendFactor: Math.max(0.5, Math.min(2.0, trendFactor)),
            daysSinceLastOrder: daysSinceLastOrder,
            leadTimeDays: 7, // Default lead time
            safetyStockFactor: 1.5, // Default safety stock factor
            currentStock: 0, // Will be set from medicine data
            price: 0 // Will be set from medicine data
        };
    } catch (error) {
        console.error('Error getting historical data:', error);
        return {
            avgMonthlySales: 0,
            avgDailySales: 0,
            trendFactor: 1.0,
            daysSinceLastOrder: 30,
            leadTimeDays: 7,
            safetyStockFactor: 1.5,
            currentStock: 0,
            price: 0
        };
    }
}

// Helper function to generate AI insights
async function generateInsights(medicines, timeRange) {
    try {
        const insights = {
            summary: {
                totalMedicines: medicines.length,
                lowStockCount: medicines.filter(m => m.stock < 20).length,
                outOfStockCount: medicines.filter(m => m.stock === 0).length,
                timeRange: timeRange
            },
            recommendations: [],
            trends: [],
            alerts: []
        };

        // Generate recommendations based on stock levels
        const lowStockMedicines = medicines.filter(m => m.stock < 20);
        insights.recommendations = lowStockMedicines.map(medicine => ({
            type: 'reorder',
            medicineId: medicine._id,
            medicineName: medicine.name,
            currentStock: medicine.stock,
            recommendedAction: `Reorder ${medicine.name} - current stock is low (${medicine.stock} units)`
        }));

        // Generate trend insights
        insights.trends.push({
            type: 'stock_trend',
            description: 'Stock levels trending analysis',
            data: medicines.map(m => ({
                name: m.name,
                stock: m.stock,
                status: m.stock < 20 ? 'low' : m.stock > 100 ? 'high' : 'normal'
            }))
        });

        // Generate alerts
        const criticalMedicines = medicines.filter(m => m.stock < 5);
        insights.alerts = criticalMedicines.map(medicine => ({
            type: 'critical_stock',
            severity: 'high',
            message: `${medicine.name} is critically low (${medicine.stock} units remaining)`,
            medicineId: medicine._id
        }));

        return insights;
    } catch (error) {
        console.error('Error generating insights:', error);
        return {
            summary: { totalMedicines: 0, lowStockCount: 0, outOfStockCount: 0 },
            recommendations: [],
            trends: [],
            alerts: []
        };
    }
}

module.exports = {
    getModelHealth,
    getMedicineDemandPrediction,
    getInventoryOptimization,
    getReorderSuggestions,
    getBatchPredictions,
    getAIInsights
};
