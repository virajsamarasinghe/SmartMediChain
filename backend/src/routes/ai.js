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
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: Check AI model health
 *     description: Check the health status of AI prediction models
 *     tags: [AI & Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI model health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     models:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "demand_prediction"
 *                           status:
 *                             type: string
 *                             example: "active"
 *
 * /api/ai/medicine/{medicineId}/demand:
 *   get:
 *     summary: Get medicine demand prediction
 *     description: Get AI-powered demand prediction for a specific medicine
 *     tags: [AI & Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Number of days to predict
 *     responses:
 *       200:
 *         description: Demand prediction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     prediction:
 *                       type: object
 *                       properties:
 *                         expectedDemand:
 *                           type: number
 *                           example: 150
 *                         confidence:
 *                           type: number
 *                           example: 0.85
 *                         trend:
 *                           type: string
 *                           example: "increasing"
 *
 * /api/ai/inventory/optimization:
 *   get:
 *     summary: Get inventory optimization recommendations
 *     description: Get AI-powered inventory optimization suggestions
 *     tags: [AI & Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Optimization recommendations retrieved successfully
 *
 * /api/ai/reorder-suggestions:
 *   get:
 *     summary: Get reorder suggestions
 *     description: Get AI-powered reorder suggestions based on current inventory and demand
 *     tags: [AI & Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reorder suggestions retrieved successfully
 *
 * /api/ai/insights:
 *   get:
 *     summary: Get AI insights
 *     description: Get comprehensive AI insights and analytics
 *     tags: [AI & Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI insights retrieved successfully
 */

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
