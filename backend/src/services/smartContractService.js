/**
 * Smart Contract Service for SmartMediChain
 * Handles blockchain integration for fraud detection and approval logging
 */

const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

class SmartContractService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAddress = process.env.CONTRACT_ADDRESS || null;
        this.privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || null;
        this.rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
        this.isInitialized = false;
    }

    /**
     * Initialize the blockchain connection and contract
     */
    async initialize() {
        const maxRetries = 10;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                console.log(`Attempting to connect to blockchain (attempt ${retryCount + 1}/${maxRetries})...`);

                // Connect to blockchain
                this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

                // Test the connection
                await this.provider.getNetwork();
                console.log('Successfully connected to blockchain network');

                if (this.privateKey) {
                    this.signer = new ethers.Wallet(this.privateKey, this.provider);
                } else {
                    // Use the first account from provider for development
                    const accounts = await this.provider.listAccounts();
                    if (accounts.length > 0) {
                        this.signer = await this.provider.getSigner(0);
                    } else {
                        throw new Error('No accounts available');
                    }
                }

                // Load contract ABI and bytecode
                const contractArtifact = this.loadContractArtifact();

                if (this.contractAddress) {
                    // Connect to existing contract
                    this.contract = new ethers.Contract(
                        this.contractAddress,
                        contractArtifact.abi,
                        this.signer
                    );
                } else {
                    // Deploy new contract
                    await this.deployContract(contractArtifact);
                }

                this.isInitialized = true;
                console.log('Smart contract service initialized successfully');
                console.log('Contract address:', await this.contract.getAddress());
                return;

            } catch (error) {
                retryCount++;
                console.error(`Failed to initialize smart contract service (attempt ${retryCount}):`, error.message);

                if (retryCount >= maxRetries) {
                    console.error('Max retries reached. Smart contract service will not be available.');
                    return; // Don't throw error, just log and continue
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    /**
     * Load contract artifact (ABI and bytecode)
     */
    loadContractArtifact() {
        try {
            // Try multiple possible paths for the contract artifact
            const possiblePaths = [
                // Path when running in Docker with shared volume
                path.join(__dirname, '../../smart-contract/artifacts/contracts/SmartMediChainFraudDetection.sol/SmartMediChainFraudDetection.json'),
                // Path when artifact is copied to backend
                path.join(__dirname, '../contracts/SmartMediChainFraudDetection.json'),
                // Fallback path
                path.join(__dirname, '../config/SmartMediChainFraudDetection.json')
            ];

            let artifactPath = null;
            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    artifactPath = testPath;
                    break;
                }
            }

            if (!artifactPath) {
                // If no artifact found, create a minimal one for development
                console.warn('Contract artifact not found. Creating minimal artifact for development...');
                return this.createMinimalArtifact();
            }

            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            return artifact;
        } catch (error) {
            console.error('Failed to load contract artifact:', error);
            // Fallback to minimal artifact
            return this.createMinimalArtifact();
        }
    }

    /**
     * Create a minimal contract artifact for development when the full artifact is not available
     */
    createMinimalArtifact() {
        console.log('Using minimal contract artifact for development');
        return {
            abi: [
                {
                    "inputs": [
                        { "internalType": "string", "name": "medicineId", "type": "string" },
                        { "internalType": "string", "name": "medicineName", "type": "string" },
                        { "internalType": "uint256", "name": "quantity", "type": "uint256" },
                        { "internalType": "uint256", "name": "pricePerUnit", "type": "uint256" }
                    ],
                    "name": "placeOrder",
                    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        { "internalType": "uint256", "name": "orderId", "type": "uint256" },
                        { "internalType": "bool", "name": "isFraud", "type": "bool" },
                        { "internalType": "uint8", "name": "riskLevel", "type": "uint8" },
                        { "internalType": "uint256", "name": "confidenceScore", "type": "uint256" },
                        { "internalType": "string[]", "name": "reasons", "type": "string[]" }
                    ],
                    "name": "submitFraudDetection",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        { "internalType": "uint256", "name": "orderId", "type": "uint256" },
                        { "internalType": "bool", "name": "approved", "type": "bool" },
                        { "internalType": "string", "name": "managerName", "type": "string" },
                        { "internalType": "string", "name": "role", "type": "string" },
                        { "internalType": "string", "name": "comments", "type": "string" }
                    ],
                    "name": "submitManagerApproval",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [{ "internalType": "uint256", "name": "orderId", "type": "uint256" }],
                    "name": "getOrder",
                    "outputs": [
                        {
                            "components": [
                                { "internalType": "uint256", "name": "orderId", "type": "uint256" },
                                { "internalType": "string", "name": "medicineId", "type": "string" },
                                { "internalType": "string", "name": "medicineName", "type": "string" },
                                { "internalType": "uint256", "name": "quantity", "type": "uint256" },
                                { "internalType": "uint256", "name": "pricePerUnit", "type": "uint256" },
                                { "internalType": "uint256", "name": "totalPrice", "type": "uint256" },
                                { "internalType": "address", "name": "placedBy", "type": "address" },
                                { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                                { "internalType": "uint8", "name": "status", "type": "uint8" },
                                { "internalType": "bool", "name": "isActive", "type": "bool" }
                            ],
                            "internalType": "struct SmartMediChainFraudDetection.Order",
                            "name": "",
                            "type": "tuple"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ],
            bytecode: "0x" // Empty bytecode since we're connecting to existing contract
        };
    }

    /**
     * Deploy the smart contract
     */
    async deployContract(artifact) {
        try {
            console.log('Deploying smart contract...');

            const contractFactory = new ethers.ContractFactory(
                artifact.abi,
                artifact.bytecode,
                this.signer
            );

            this.contract = await contractFactory.deploy();
            await this.contract.waitForDeployment();

            this.contractAddress = await this.contract.getAddress();
            console.log('Contract deployed at:', this.contractAddress);

            // Save contract address for future use
            const deploymentInfo = {
                contractAddress: this.contractAddress,
                deployedAt: new Date().toISOString(),
                network: 'localhost'
            };

            fs.writeFileSync(
                path.join(__dirname, '../config/contract-deployment.json'),
                JSON.stringify(deploymentInfo, null, 2)
            );

        } catch (error) {
            console.error('Failed to deploy contract:', error);
            throw error;
        }
    }

    /**
     * Place an order on the blockchain
     * @param {Object} orderData - Order details
     * @returns {Promise<Object>} Transaction result with order ID
     */
    async placeOrder(orderData) {
        this.ensureInitialized();

        try {
            const { medicineId, medicineName, quantity, pricePerUnit } = orderData;

            // Convert price to wei (assuming price is in ETH)
            const priceInWei = ethers.parseEther(pricePerUnit.toString());

            const tx = await this.contract.placeOrder(
                medicineId,
                medicineName,
                quantity,
                priceInWei
            );

            const receipt = await tx.wait();

            // Extract order ID from the event
            const orderPlacedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'OrderPlaced'
            );

            const orderId = orderPlacedEvent ? orderPlacedEvent.args[0] : null;

            return {
                success: true,
                orderId: orderId ? orderId.toString() : null,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error('Failed to place order on blockchain:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Submit fraud detection result to blockchain
     * @param {string|number} orderId - Order ID
     * @param {Object} fraudResult - Fraud detection result
     * @returns {Promise<Object>} Transaction result
     */
    async submitFraudDetection(orderId, fraudResult) {
        this.ensureInitialized();

        try {
            const { isFraud, riskLevel, confidenceScore, reasons } = fraudResult;

            // Map risk level string to enum value
            const riskLevelEnum = this.mapRiskLevel(riskLevel);

            const tx = await this.contract.submitFraudDetection(
                orderId,
                isFraud,
                riskLevelEnum,
                confidenceScore,
                reasons || []
            );

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error('Failed to submit fraud detection to blockchain:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Submit manager approval to blockchain
     * @param {string|number} orderId - Order ID
     * @param {Object} approvalData - Manager approval data
     * @returns {Promise<Object>} Transaction result
     */
    async submitManagerApproval(orderId, approvalData) {
        this.ensureInitialized();

        try {
            const { approved, managerName, role, comments } = approvalData;

            const tx = await this.contract.submitManagerApproval(
                orderId,
                approved,
                managerName,
                role,
                comments || ''
            );

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error('Failed to submit manager approval to blockchain:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get order details from blockchain
     * @param {string|number} orderId - Order ID
     * @returns {Promise<Object>} Order details
     */
    async getOrder(orderId) {
        this.ensureInitialized();

        try {
            const order = await this.contract.getOrder(orderId);

            return {
                success: true,
                order: {
                    orderId: order.orderId.toString(),
                    medicineId: order.medicineId,
                    medicineName: order.medicineName,
                    quantity: order.quantity.toString(),
                    pricePerUnit: ethers.formatEther(order.pricePerUnit),
                    totalPrice: ethers.formatEther(order.totalPrice),
                    placedBy: order.placedBy,
                    timestamp: new Date(Number(order.timestamp) * 1000).toISOString(),
                    status: this.mapOrderStatus(order.status),
                    isActive: order.isActive
                }
            };

        } catch (error) {
            console.error('Failed to get order from blockchain:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get fraud detection result from blockchain
     * @param {string|number} orderId - Order ID
     * @returns {Promise<Object>} Fraud detection result
     */
    async getFraudDetectionResult(orderId) {
        this.ensureInitialized();

        try {
            // Check if the method exists on the contract
            if (typeof this.contract.getFraudDetectionResult === 'function') {
                const result = await this.contract.getFraudDetectionResult(orderId);

                return {
                    success: true,
                    fraudDetection: {
                        isFraud: result.isFraud,
                        riskLevel: this.mapRiskLevelFromEnum(result.riskLevel),
                        confidenceScore: result.confidenceScore.toString(),
                        reasons: result.reasons,
                        timestamp: new Date(Number(result.timestamp) * 1000).toISOString(),
                        aiOracle: result.aiOracle
                    }
                };
            } else {
                // Return mock data if method doesn't exist
                return {
                    success: true,
                    fraudDetection: {
                        isFraud: false,
                        riskLevel: 'LOW',
                        confidenceScore: '95',
                        reasons: [],
                        timestamp: new Date().toISOString(),
                        aiOracle: 'Mock AI Oracle'
                    }
                };
            }

        } catch (error) {
            console.error('Failed to get fraud detection result from blockchain:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get manager approvals from blockchain
     * @param {string|number} orderId - Order ID
     * @returns {Promise<Object>} Manager approvals
     */
    async getManagerApprovals(orderId) {
        this.ensureInitialized();

        try {
            // Check if the method exists on the contract
            if (typeof this.contract.getManagerApprovals === 'function') {
                const approvals = await this.contract.getManagerApprovals(orderId);

                const formattedApprovals = approvals.map(approval => ({
                    manager: approval.manager,
                    managerName: approval.managerName,
                    role: approval.role,
                    approved: approval.approved,
                    comments: approval.comments,
                    timestamp: new Date(Number(approval.timestamp) * 1000).toISOString()
                }));

                return {
                    success: true,
                    approvals: formattedApprovals
                };
            } else {
                // Return mock data if method doesn't exist
                return {
                    success: true,
                    approvals: []
                };
            }

        } catch (error) {
            console.error('Failed to get manager approvals from blockchain:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Map risk level string to enum value
     * @param {string} riskLevel - Risk level string
     * @returns {number} Enum value
     */
    mapRiskLevel(riskLevel) {
        const riskLevelMap = {
            'LOW': 0,
            'MEDIUM': 1,
            'HIGH': 2,
            'CRITICAL': 3
        };
        return riskLevelMap[riskLevel.toUpperCase()] || 0;
    }

    /**
     * Map risk level enum value to string
     * @param {number} enumValue - Enum value
     * @returns {string} Risk level string
     */
    mapRiskLevelFromEnum(enumValue) {
        const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        return riskLevels[enumValue] || 'LOW';
    }

    /**
     * Map order status enum value to string
     * @param {number} enumValue - Enum value
     * @returns {string} Order status string
     */
    mapOrderStatus(enumValue) {
        const statuses = [
            'PENDING',
            'APPROVED',
            'REJECTED',
            'FLAGGED_FOR_REVIEW',
            'FRAUD_DETECTED'
        ];
        return statuses[enumValue] || 'PENDING';
    }

    /**
     * Ensure the service is initialized
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('Smart contract service not initialized. Call initialize() first.');
        }
    }

    /**
     * Check if the service is connected to blockchain
     * @returns {boolean} Connection status
     */
    isConnected() {
        return this.isInitialized && this.provider && this.contract;
    }

    /**
     * Get current block number
     * @returns {Promise<number>} Current block number
     */
    async getCurrentBlockNumber() {
        this.ensureInitialized();
        return await this.provider.getBlockNumber();
    }

    /**
     * Get contract address
     * @returns {string} Contract address
     */
    getContractAddress() {
        return this.contractAddress;
    }
}

module.exports = SmartContractService;
