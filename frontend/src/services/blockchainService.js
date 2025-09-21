/**
 * Blockchain Service for SmartMediChain Frontend
 * Handles blockchain-related API calls
 */

import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

class BlockchainService {
    constructor() {
        // Add client-side caching for status
        this.statusCache = {
            data: null,
            lastFetched: null,
            cacheTimeout: 10000 // 10 seconds
        };
    }
    /**
     * Place order with fraud detection and blockchain logging
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} API response
     */
    async placeOrderWithFraudDetection(orderData) {
        try {
            const token = authService.getToken();

            const response = await fetch(`${API_BASE_URL}/api/blockchain/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to place order with fraud detection');
            }

            return data;
        } catch (error) {
            console.error('Error placing order with fraud detection:', error);
            throw error;
        }
    }

    /**
     * Submit manager approval with blockchain logging
     * @param {Object} approvalData - Approval data
     * @returns {Promise<Object>} API response
     */
    async submitManagerApproval(approvalData) {
        try {
            const token = authService.getToken();

            const response = await fetch(`${API_BASE_URL}/api/blockchain/manager-approval`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(approvalData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit manager approval');
            }

            return data;
        } catch (error) {
            console.error('Error submitting manager approval:', error);
            throw error;
        }
    }

    /**
     * Get order details from blockchain
     * @param {string} blockchainOrderId - Blockchain order ID
     * @returns {Promise<Object>} API response
     */
    async getOrderFromBlockchain(blockchainOrderId) {
        try {
            const token = authService.getToken();

            const response = await fetch(`${API_BASE_URL}/api/blockchain/order/${blockchainOrderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get order from blockchain');
            }

            return data;
        } catch (error) {
            console.error('Error getting order from blockchain:', error);
            throw error;
        }
    }

    /**
     * Get blockchain service status with caching
     * @returns {Promise<Object>} API response
     */
    async getBlockchainStatus() {
        try {
            const now = Date.now();
            
            // Check if we have cached data that's still valid
            if (this.statusCache.data && 
                this.statusCache.lastFetched && 
                (now - this.statusCache.lastFetched) < this.statusCache.cacheTimeout) {
                
                console.log('🔄 Using cached blockchain status');
                return this.statusCache.data;
            }

            const token = authService.getToken();

            const response = await fetch(`${API_BASE_URL}/api/blockchain/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'max-age=10' // Request 10 second caching
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get blockchain status');
            }

            // Cache the response
            this.statusCache.data = data;
            this.statusCache.lastFetched = now;
            
            console.log('📡 Fetched fresh blockchain status');
            return data;
        } catch (error) {
            console.error('Error getting blockchain status:', error);
            throw error;
        }
    }

    /**
     * Mock AI fraud detection (for frontend simulation)
     * @param {Object} orderData - Order data
     * @returns {Object} Fraud detection result
     */
    simulateFraudDetection(orderData) {
        const { quantity, pricePerUnit } = orderData;

        const fraudReasons = [];
        let riskLevel = 'LOW';
        let isFraud = false;

        // Mock fraud detection logic
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
    }

    /**
     * Format blockchain transaction hash for display
     * @param {string} hash - Transaction hash
     * @returns {string} Formatted hash
     */
    formatTransactionHash(hash) {
        if (!hash) return 'N/A';
        return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    }

    /**
     * Generate blockchain explorer URL (for local testing)
     * @param {string} hash - Transaction hash
     * @returns {string} Explorer URL
     */
    getExplorerUrl(hash) {
        // For local blockchain, return a placeholder
        return `#tx-${hash}`;
    }

    /**
     * Clear blockchain status cache
     */
    clearStatusCache() {
        this.statusCache.data = null;
        this.statusCache.lastFetched = null;
        console.log('🗑️ Blockchain status cache cleared');
    }

    /**
     * Check if status cache is valid
     * @returns {boolean} Cache validity
     */
    isStatusCacheValid() {
        if (!this.statusCache.data || !this.statusCache.lastFetched) {
            return false;
        }
        const now = Date.now();
        return (now - this.statusCache.lastFetched) < this.statusCache.cacheTimeout;
    }

    /**
     * Check if blockchain is available
     * @returns {Promise<boolean>} Availability status
     */
    async isBlockchainAvailable() {
        try {
            const status = await this.getBlockchainStatus();
            console.log('🔍 Checking blockchain availability:', status);
            
            // Handle both object and boolean isConnected formats
            const isConnected = status.success && (
                status.data.isConnected === true || 
                (typeof status.data.isConnected === 'object' && status.data.isConnected !== null)
            );
            
            console.log('✅ Blockchain available:', isConnected);
            return isConnected;
        } catch (error) {
            console.log('❌ Blockchain availability check failed:', error);
            return false;
        }
    }
}

export const blockchainService = new BlockchainService();
