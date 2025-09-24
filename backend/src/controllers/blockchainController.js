/**
 * Blockchain Controller for SmartMediChain
 * Handles blockchain-related API endp                    const orderResult = await this.smartContractService.createOrder(
                        medicineId,
                        medicineName,
                        numQuantity,
                        numPricePerUnit
                    ); */

const SmartContractService = require('../services/smartContractService');
const AIModelService = require('../services/aiModelService');
const Order = require('../models/Order');

class BlockchainController {
    constructor() {
        this.smartContractService = new SmartContractService();
        this.isInitialized = false;
        // Add caching for blockchain status
        this.statusCache = {
            data: null,
            lastUpdated: null,
            cacheTimeout: 10000 // 10 seconds cache
        };
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

            // Convert to proper types
            const numQuantity = parseInt(quantity);
            const numPricePerUnit = parseFloat(pricePerUnit);

            // Validate converted values
            if (isNaN(numQuantity) || numQuantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid quantity value'
                });
            }

            if (isNaN(numPricePerUnit) || numPricePerUnit <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid price per unit value'
                });
            }

            // 1. First, call AI model for fraud detection
            const aiResult = await this.callAIFraudDetection({
                medicineId,
                medicineName,
                quantity: numQuantity,
                pricePerUnit: numPricePerUnit,
                userId
            });

            let blockchainResult = null;
            let blockchainOrderId = null;

            // 2. Log order to blockchain if service is available
            if (this.isInitialized) {
                try {
                    // Place order on blockchain
                    const orderResult = await this.smartContractService.createOrder(
                        medicineId,
                        medicineName,
                        numQuantity,
                        numPricePerUnit
                    );

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

            // 4. Save to traditional database
            const orderNumber = `BC-${Date.now()}`;
            
            const databaseOrder = new Order({
                orderNumber,
                orderType: 'purchase',
                customer: userId,
                supplier: userId, // For now, using same user as both customer and supplier
                items: [{
                    medicine: medicineId,
                    quantity: numQuantity,
                    unitPrice: numPricePerUnit,
                    totalPrice: numQuantity * numPricePerUnit
                }],
                pricing: {
                    subtotal: numQuantity * numPricePerUnit,
                    tax: 0,
                    total: numQuantity * numPricePerUnit
                },
                status: (orderStatus === 'FLAGGED_FOR_REVIEW' ? 'pending' : 'approved'),
                priority: aiResult.riskLevel === 'HIGH' || aiResult.riskLevel === 'CRITICAL' ? 'urgent' : 'medium',
                notes: aiResult.isFraud ? 'FRAUD DETECTED by AI model' : 'AI fraud check passed',
                metadata: {
                    aiDetection: aiResult,
                    blockchainData: blockchainResult,
                    blockchainOrderId
                },
                createdBy: userId
            });

            let savedOrder;
            try {
                savedOrder = await databaseOrder.save();
                console.log('✅ Order saved to database with ID:', savedOrder._id);
                
                // Verify the order was actually saved by querying it back
                const verifyOrder = await Order.findById(savedOrder._id);
                if (!verifyOrder) {
                    console.error('❌ Order verification failed - not found in database after save');
                    throw new Error('Order was not properly saved to database');
                } else {
                    console.log('✅ Order verification successful:', verifyOrder._id);
                }
                
                // Add a small delay to ensure database consistency
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (dbError) {
                console.error('❌ Failed to save order to database:', dbError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save order to database',
                    error: dbError.message
                });
            }

            const orderData = {
                _id: savedOrder._id,
                id: Date.now().toString(),
                orderNumber: savedOrder.orderNumber,
                medicineId,
                medicineName,
                quantity: numQuantity,
                pricePerUnit: numPricePerUnit,
                totalPrice: numQuantity * numPricePerUnit,
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
            console.log('🔍 Getting order from blockchain with ID:', blockchainOrderId);

            if (!this.isInitialized) {
                console.log('❌ Blockchain service not initialized');
                return res.status(503).json({
                    success: false,
                    message: 'Blockchain service not available'
                });
            }

            console.log('📡 Calling smartContractService.getOrder...');
            const orderResult = await this.smartContractService.getOrder(blockchainOrderId);
            console.log('📊 Order result:', orderResult);

            if (!orderResult.success) {
                console.log('⚠️ Order not found on blockchain');
                return res.status(404).json({
                    success: false,
                    message: 'Order not found on blockchain',
                    error: orderResult.error
                });
            }

            // Also get fraud detection result and approvals
            console.log('🔍 Getting fraud detection and approvals...');
            const fraudResult = await this.smartContractService.getFraudDetectionResult(blockchainOrderId);
            const approvalsResult = await this.smartContractService.getManagerApprovals(blockchainOrderId);

            console.log('✅ Successfully retrieved blockchain order data');
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
            const now = Date.now();
            const clientIp = req.ip || req.connection.remoteAddress;
            
            // Check if we have cached data that's still valid
            if (this.statusCache.data && 
                this.statusCache.lastUpdated && 
                (now - this.statusCache.lastUpdated) < this.statusCache.cacheTimeout) {
                
                // Set cache headers for client-side caching
                res.set({
                    'Cache-Control': 'public, max-age=10',
                    'ETag': `"${this.statusCache.lastUpdated}"`,
                    'Last-Modified': new Date(this.statusCache.lastUpdated).toUTCString()
                });
                
                console.log(`🔄 [${clientIp}] Served cached blockchain status`);
                return res.json({
                    success: true,
                    data: this.statusCache.data,
                    cached: true
                });
            }

            console.log(`📡 [${clientIp}] Fetching fresh blockchain status`);
            const status = {
                isConnected: this.smartContractService.isConnected(),
                contractAddress: this.smartContractService.getContractAddress(),
                currentBlock: null,
                timestamp: now
            };

            if (status.isConnected) {
                try {
                    status.currentBlock = await this.smartContractService.getCurrentBlockNumber();
                } catch (error) {
                    console.error('Failed to get current block number:', error);
                }
            }

            // Cache the status
            this.statusCache.data = status;
            this.statusCache.lastUpdated = now;

            // Set cache headers
            res.set({
                'Cache-Control': 'public, max-age=10',
                'ETag': `"${now}"`,
                'Last-Modified': new Date(now).toUTCString()
            });

            console.log(`✅ [${clientIp}] Fresh blockchain status served`);
            res.json({
                success: true,
                data: status,
                cached: false
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
     * Call AI model for fraud detection using the logistic regression model
     * @param {Object} orderData - Order data for fraud detection
     * @returns {Object} Fraud detection result
     */
    async callAIFraudDetection(orderData) {
        try {
            // Use the real AI model service for fraud detection
            const aiResult = await AIModelService.analyzeOrderForFraud(orderData);

            console.log('AI fraud detection raw result:', JSON.stringify(aiResult, null, 2));

            if (aiResult.success) {
                const mappedResult = {
                    isFraud: aiResult.data.is_fraud,
                    riskLevel: aiResult.data.risk_level,
                    reasons: aiResult.data.reasons,
                    confidenceScore: aiResult.data.confidence_score,
                    timestamp: new Date().toISOString()
                };

                console.log('Mapped AI result:', JSON.stringify(mappedResult, null, 2));
                return mappedResult;
            } else {
                // Fallback to basic rule-based detection if AI model fails
                console.warn('AI fraud detection failed, using fallback logic:', aiResult.error);
                return this.fallbackFraudDetection(orderData);
            }

        } catch (error) {
            console.error('AI fraud detection failed:', error);
            // Return fallback detection
            return this.fallbackFraudDetection(orderData);
        }
    }

    /**
     * Fallback fraud detection using basic rules
     * @param {Object} orderData - Order data for fraud detection
     * @returns {Object} Fraud detection result
     */
    fallbackFraudDetection(orderData) {
        try {
            const { quantity, pricePerUnit, maxCapacity = 1000, avgUsagePerDay = 10 } = orderData;

            const fraudReasons = [];
            let riskLevel = 'LOW';
            let isFraud = false;

            // Basic rule-based fraud detection
            const normalPrice = 10; // Mock normal price per unit
            const pricePerUnitNum = parseFloat(pricePerUnit);

            if (pricePerUnitNum > normalPrice * 1.5) {
                fraudReasons.push('Overpricing detected - Price is significantly higher than market rate');
                riskLevel = 'HIGH';
                isFraud = true;
            }

            if (quantity > maxCapacity) {
                fraudReasons.push('Order quantity exceeds maximum storage capacity');
                riskLevel = 'HIGH';
                isFraud = true;
            }

            // Check if order is much higher than typical usage (30 days worth)
            const estimatedNeed = avgUsagePerDay * 30;
            if (quantity > estimatedNeed * 2) {
                fraudReasons.push('Order quantity significantly exceeds estimated monthly need');
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
                confidenceScore: isFraud ? 75 : 85,
                timestamp: new Date().toISOString(),
                fallback: true
            };

        } catch (error) {
            console.error('Fallback fraud detection failed:', error);
            // Return safe default
            return {
                isFraud: false,
                riskLevel: 'LOW',
                reasons: ['Fraud detection system unavailable'],
                confidenceScore: 50,
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
}

module.exports = new BlockchainController();
