const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getModelHealth,
    getMedicineDemandPrediction,
    getInventoryOptimization,
    getReorderSuggestions,
    getBatchPredictions,
    getAIInsights
} = require('../controllers/aiController');

/**
 * @route   GET /api/ai/health
 * @desc    Check AI model health status
 * @access  Private
 */
router.get('/health', auth, getModelHealth);

/**
 * @route   GET /api/ai/medicine/:medicineId/demand
 * @desc    Get demand prediction for a specific medicine
 * @access  Private
 */
router.get('/medicine/:medicineId/demand', auth, getMedicineDemandPrediction);

/**
 * @route   GET /api/ai/inventory/optimization
 * @desc    Get inventory optimization recommendations
 * @access  Private
 * @query   category - Filter by medicine category
 * @query   lowStock - Filter low stock medicines (true/false)
 */
router.get('/inventory/optimization', auth, getInventoryOptimization);

/**
 * @route   GET /api/ai/reorder/suggestions
 * @desc    Get smart reorder suggestions
 * @access  Private
 * @query   threshold - Stock threshold for reorder suggestions (default: 20)
 */
router.get('/reorder/suggestions', auth, getReorderSuggestions);

/**
 * @route   POST /api/ai/predictions/batch
 * @desc    Get batch predictions for multiple medicines
 * @access  Private
 * @body    { medicineIds: [id1, id2, ...] }
 */
router.post('/predictions/batch', auth, getBatchPredictions);

/**
 * @route   GET /api/ai/insights
 * @desc    Get AI-powered analytics insights
 * @access  Private
 * @query   timeRange - Time range for analysis (default: 30d)
 */
router.get('/insights', auth, getAIInsights);

module.exports = router;
