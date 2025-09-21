/**
 * Blockchain routes for SmartMediChain
 * Handles fraud detection and blockchain logging endpoints
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { auth, authorize } = require('../middleware/auth');

// Specific rate limiter for blockchain status endpoint
const blockchainStatusLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 5, // Limit each IP to 5 requests per 10 seconds for status
    message: {
        success: false,
        message: 'Too many blockchain status requests. Please wait before trying again.',
        retryAfter: 10
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
        // Skip in development mode for testing
        return process.env.NODE_ENV === 'development';
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderRequest:
 *       type: object
 *       required:
 *         - medicineId
 *         - quantity
 *         - supplierId
 *       properties:
 *         medicineId:
 *           type: string
 *           example: "64a1b2c3d4e5f6789012345"
 *         quantity:
 *           type: number
 *           example: 100
 *         supplierId:
 *           type: string
 *           example: "64a1b2c3d4e5f6789012346"
 *         urgency:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "medium"
 *         notes:
 *           type: string
 *           example: "Urgent delivery required"
 *     BlockchainOrder:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             blockchainOrderId:
 *               type: string
 *               example: "0x1234567890abcdef"
 *             orderId:
 *               type: string
 *               example: "64a1b2c3d4e5f6789012347"
 *             fraudScore:
 *               type: number
 *               example: 0.15
 *             riskLevel:
 *               type: string
 *               enum: [low, medium, high]
 *               example: "low"
 *             transactionHash:
 *               type: string
 *               example: "0xabcdef1234567890"
 *     ManagerApproval:
 *       type: object
 *       required:
 *         - orderId
 *         - approved
 *       properties:
 *         orderId:
 *           type: string
 *           example: "64a1b2c3d4e5f6789012347"
 *         approved:
 *           type: boolean
 *           example: true
 *         comments:
 *           type: string
 *           example: "Approved after review"
 *     BlockchainStatus:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             connected:
 *               type: boolean
 *               example: true
 *             network:
 *               type: string
 *               example: "sepolia"
 *             blockNumber:
 *               type: number
 *               example: 4567890
 *             contractAddress:
 *               type: string
 *               example: "0x1234567890abcdef1234567890abcdef12345678"
 */

// Initialize blockchain service when routes are loaded
blockchainController.initializeService();

/**
 * @swagger
 * /api/blockchain/place-order:
 *   post:
 *     summary: Place order with AI fraud detection
 *     description: Create a new order with AI-powered fraud detection and blockchain logging
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       201:
 *         description: Order placed successfully with blockchain logging
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockchainOrder'
 *       400:
 *         description: Bad request - Invalid order data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - High fraud risk detected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/place-order', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), blockchainController.placeOrderWithFraudDetection);

/**
 * @swagger
 * /api/blockchain/manager-approval:
 *   post:
 *     summary: Submit manager approval
 *     description: Submit manager approval for an order with blockchain logging
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManagerApproval'
 *     responses:
 *       200:
 *         description: Manager approval submitted successfully
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
 *                     transactionHash:
 *                       type: string
 *                       example: "0xabcdef1234567890"
 *                     approvalId:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789012348"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/manager-approval', auth, authorize('operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'), blockchainController.submitManagerApproval);

/**
 * @swagger
 * /api/blockchain/order/{blockchainOrderId}:
 *   get:
 *     summary: Get order from blockchain
 *     description: Retrieve order details from the blockchain using blockchain order ID
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockchainOrderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain order ID
 *         example: "0x1234567890abcdef"
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *                     blockchainOrderId:
 *                       type: string
 *                       example: "0x1234567890abcdef"
 *                     orderId:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789012347"
 *                     status:
 *                       type: string
 *                       example: "confirmed"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       404:
 *         description: Order not found on blockchain
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/order/:blockchainOrderId', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), blockchainController.getOrderFromBlockchain);

/**
 * @swagger
 * /api/blockchain/status:
 *   get:
 *     summary: Get blockchain service status
 *     description: Check the current status and health of the blockchain service
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blockchain status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockchainStatus'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: Service unavailable - Blockchain service is down
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', blockchainStatusLimiter, auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), blockchainController.getBlockchainStatus);

module.exports = router;
