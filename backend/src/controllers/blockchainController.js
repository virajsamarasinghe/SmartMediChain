/**
 * Blockchain Controller for SmartMediChain
 * Handles blockchain-related API endpoints
 */

const SmartContractService = require('../services/smartContractService');

class BlockchainController {
    constructor() {
        this.smartContractService = new SmartContractService();
        this.isInitialized = false;
    }

    /**
     * Initialize blockchain service
     */
    async initializeService() {
        if (!this.isInitialized) {
            try {
                await this.smartContractService.initialize();
                this.isInitialized = true;
                console.log('Blockchain service initialized successfully');
            } catch (error) {
                console.error('Failed to initialize blockchain service:', error);
                // Continue without blockchain functionality
            }
        }
    }

    /**
     * Place order with fraud detection and blockchain logging
     */
    placeOrderWithFraudDetection = async (req, res) => {
        try {
            const { medicineId, medicineName, quantity, pricePerUnit, userId } = req.body;

            // Validate input
            if (!medicineId || !medicineName || !quantity || !pricePerUnit) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // 1. First, call AI model for fraud detection
            const aiResult = await this.callAIFraudDetection({
                medicineId,
                medicineName,
                quantity,
                pricePerUnit
            });

            let blockchainResult = null;
            let blockchainOrderId = null;

            // 2. Log order to blockchain if service is available
            if (this.isInitialized) {
                try {
                    // Place order on blockchain
                    const orderResult = await this.smartContractService.placeOrder({
                        medicineId,
                        medicineName,
                        quantity,
                        pricePerUnit
                    });

                    if (orderResult.success) {
                        blockchainOrderId = orderResult.orderId;
                        
                        // Submit fraud detection result to blockchain
                        const fraudResult = await this.smartContractService.submitFraudDetection(
                            blockchainOrderId,
                            {
                                isFraud: aiResult.isFraud,
                                riskLevel: aiResult.riskLevel,
                                confidenceScore: aiResult.confidenceScore || 95,
                                reasons: aiResult.reasons || []
                            }
                        );

                        blockchainResult = {
                            orderLogged: orderResult.success,
                            fraudDetectionLogged: fraudResult.success,
                            blockchainOrderId: blockchainOrderId,
                            transactionHashes: {
                                orderTx: orderResult.transactionHash,
                                fraudDetectionTx: fraudResult.transactionHash
                            }
                        };
                    }
                } catch (blockchainError) {
                    console.error('Blockchain logging failed:', blockchainError);
                    blockchainResult = {
                        orderLogged: false,
                        error: blockchainError.message
                    };
                }
            }

            // 3. Determine order status based on AI result
            let orderStatus = 'PENDING_APPROVAL';
            if (aiResult.isFraud || aiResult.riskLevel === 'HIGH' || aiResult.riskLevel === 'CRITICAL') {
                orderStatus = 'FLAGGED_FOR_REVIEW';
            } else if (aiResult.riskLevel === 'MEDIUM') {
                orderStatus = 'FLAGGED_FOR_REVIEW';
            } else {
                orderStatus = 'APPROVED';
            }

            // 4. Save to traditional database (mock for now)
            const orderData = {
                id: Date.now().toString(),
                medicineId,
                medicineName,
                quantity,
                pricePerUnit,
                totalPrice: quantity * pricePerUnit,
                userId,
                status: orderStatus,
                aiDetection: aiResult,
                blockchainData: blockchainResult,
                blockchainOrderId,
                createdAt: new Date().toISOString()
            };

            res.json({
                success: true,
                message: 'Order placed successfully with fraud detection',
                data: {
                    order: orderData,
                    fraudDetection: aiResult,
                    blockchain: blockchainResult,
                    requiresApproval: orderStatus === 'FLAGGED_FOR_REVIEW'
                }
            });

        } catch (error) {
            console.error('Error placing order with fraud detection:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to place order',
                error: error.message
            });
        }
    };

    /**
     * Submit manager approval with blockchain logging
     */
    submitManagerApproval = async (req, res) => {
        try {
            const { orderId, blockchainOrderId, approved, managerName, role, comments } = req.body;

            // Validate input
            if (!orderId || approved === undefined || !managerName || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            let blockchainResult = null;

            // Log approval to blockchain if service is available and blockchainOrderId exists
            if (this.isInitialized && blockchainOrderId) {
                try {
                    const approvalResult = await this.smartContractService.submitManagerApproval(
                        blockchainOrderId,
                        {
                            approved,
                            managerName,
                            role,
                            comments: comments || ''
                        }
                    );

                    blockchainResult = {
                        approvalLogged: approvalResult.success,
                        transactionHash: approvalResult.transactionHash,
                        blockNumber: approvalResult.blockNumber
                    };

                } catch (blockchainError) {
                    console.error('Blockchain approval logging failed:', blockchainError);
                    blockchainResult = {
                        approvalLogged: false,
                        error: blockchainError.message
                    };
                }
            }

            // Update traditional database (mock for now)
            const approvalData = {
                orderId,
                blockchainOrderId,
                approved,
                managerName,
                role,
                comments,
                blockchain: blockchainResult,
                timestamp: new Date().toISOString()
            };

            res.json({
                success: true,
                message: 'Manager approval submitted successfully',
                data: {
                    approval: approvalData,
                    blockchain: blockchainResult
                }
            });

        } catch (error) {
            console.error('Error submitting manager approval:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit approval',
                error: error.message
            });
        }
    };

    /**
     * Get order details from blockchain
     */
    getOrderFromBlockchain = async (req, res) => {
        try {
            const { blockchainOrderId } = req.params;

            if (!this.isInitialized) {
                return res.status(503).json({
                    success: false,
                    message: 'Blockchain service not available'
                });
            }

            const orderResult = await this.smartContractService.getOrder(blockchainOrderId);
            
            if (!orderResult.success) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found on blockchain',
                    error: orderResult.error
                });
            }

            // Also get fraud detection result and approvals
            const fraudResult = await this.smartContractService.getFraudDetectionResult(blockchainOrderId);
            const approvalsResult = await this.smartContractService.getManagerApprovals(blockchainOrderId);

            res.json({
                success: true,
                data: {
                    order: orderResult.order,
                    fraudDetection: fraudResult.success ? fraudResult.fraudDetection : null,
                    approvals: approvalsResult.success ? approvalsResult.approvals : []
                }
            });

        } catch (error) {
            console.error('Error getting order from blockchain:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order from blockchain',
                error: error.message
            });
        }
    };

    /**
     * Get blockchain service status
     */
    getBlockchainStatus = async (req, res) => {
        try {
            const status = {
                isConnected: this.smartContractService.isConnected(),
                contractAddress: this.smartContractService.getContractAddress(),
                currentBlock: null
            };

            if (status.isConnected) {
                try {
                    status.currentBlock = await this.smartContractService.getCurrentBlockNumber();
                } catch (error) {
                    console.error('Failed to get current block number:', error);
                }
            }

            res.json({
                success: true,
                data: status
            });

        } catch (error) {
            console.error('Error getting blockchain status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get blockchain status',
                error: error.message
            });
        }
    };

    /**
     * Call AI model for fraud detection
     * @param {Object} orderData - Order data for fraud detection
     * @returns {Object} Fraud detection result
     */
    async callAIFraudDetection(orderData) {
        try {
            // This should call your existing AI model API
            // For now, I'll implement a mock fraud detection
            const { quantity, pricePerUnit } = orderData;
            
            const fraudReasons = [];
            let riskLevel = 'LOW';
            let isFraud = false;
            
            // Mock fraud detection logic (replace with actual AI API call)
            const normalPrice = 10; // Mock normal price per unit
            const pricePerUnitNum = parseFloat(pricePerUnit);
            
            if (pricePerUnitNum > normalPrice * 1.5) {
                fraudReasons.push('Overpricing detected - Price is significantly higher than market rate');
                riskLevel = 'HIGH';
                isFraud = true;
            }
            
            if (quantity > 1000) {
                fraudReasons.push('Unusual large quantity order detected');
                riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
                isFraud = true;
            }
            
            if (pricePerUnitNum < normalPrice * 0.3) {
                fraudReasons.push('Suspiciously low pricing detected');
                riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
                isFraud = true;
            }

            return {
                isFraud,
                riskLevel,
                reasons: fraudReasons,
                confidenceScore: isFraud ? 85 : 95,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('AI fraud detection failed:', error);
            // Return safe default
            return {
                isFraud: false,
                riskLevel: 'LOW',
                reasons: [],
                confidenceScore: 50,
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
}

module.exports = new BlockchainController();
