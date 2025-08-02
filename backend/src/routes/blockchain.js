/**
 * Blockchain routes for SmartMediChain
 * Handles fraud detection and blockchain logging endpoints
 */

const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const auth = require('../middleware/auth');

// Initialize blockchain service when routes are loaded
blockchainController.initializeService();

/**
 * @route POST /api/blockchain/place-order
 * @desc Place order with AI fraud detection and blockchain logging
 * @access Private
 */
router.post('/place-order', auth, blockchainController.placeOrderWithFraudDetection);

/**
 * @route POST /api/blockchain/manager-approval
 * @desc Submit manager approval with blockchain logging
 * @access Private (Manager role required)
 */
router.post('/manager-approval', auth, blockchainController.submitManagerApproval);

/**
 * @route GET /api/blockchain/order/:blockchainOrderId
 * @desc Get order details from blockchain
 * @access Private
 */
router.get('/order/:blockchainOrderId', auth, blockchainController.getOrderFromBlockchain);

/**
 * @route GET /api/blockchain/status
 * @desc Get blockchain service status
 * @access Private
 */
router.get('/status', auth, blockchainController.getBlockchainStatus);

module.exports = router;
