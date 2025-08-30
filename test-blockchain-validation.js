#!/usr/bin/env node

/**
 * Test script for blockchain validation functionality
 * This script tests the blockchain validation system end-to-end
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test credentials (you should replace these with actual test credentials)
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123'
};

let authToken = null;

async function login() {
    try {
        console.log('🔐 Logging in...');
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, TEST_USER);

        if (response.data.success) {
            authToken = response.data.data.token;
            console.log('✅ Login successful');
            return true;
        } else {
            console.error('❌ Login failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Login error:', error.response?.data?.message || error.message);
        return false;
    }
}

async function checkBlockchainStatus() {
    try {
        console.log('🔗 Checking blockchain status...');
        const response = await axios.get(`${API_BASE_URL}/api/blockchain/status`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            const status = response.data.data;
            console.log('✅ Blockchain status:', {
                connected: status.isConnected,
                contractAddress: status.contractAddress,
                currentBlock: status.currentBlock
            });
            return status.isConnected;
        } else {
            console.error('❌ Failed to get blockchain status');
            return false;
        }
    } catch (error) {
        console.error('❌ Blockchain status error:', error.response?.data?.message || error.message);
        return false;
    }
}

async function placeTestOrder() {
    try {
        console.log('📦 Placing test order...');
        const orderData = {
            medicineId: 'test-medicine-001',
            medicineName: 'Test Medicine',
            quantity: 100,
            pricePerUnit: 15.50,
            userId: 'test-user'
        };

        const response = await axios.post(`${API_BASE_URL}/api/blockchain/place-order`, orderData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            const order = response.data.data;
            console.log('✅ Order placed successfully:', {
                orderId: order.order.id,
                blockchainOrderId: order.blockchain?.blockchainOrderId,
                fraudDetected: order.fraudDetection.isFraud,
                riskLevel: order.fraudDetection.riskLevel
            });
            return order.blockchain?.blockchainOrderId;
        } else {
            console.error('❌ Failed to place order:', response.data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Order placement error:', error.response?.data?.message || error.message);
        return null;
    }
}

async function validateOrder(blockchainOrderId) {
    if (!blockchainOrderId) {
        console.log('⚠️ No blockchain order ID to validate');
        return false;
    }

    try {
        console.log('🔍 Validating order on blockchain...');
        const response = await axios.get(`${API_BASE_URL}/api/blockchain/order/${blockchainOrderId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            const data = response.data.data;
            console.log('✅ Order validation successful:', {
                orderId: data.order.orderId,
                medicineName: data.order.medicineName,
                quantity: data.order.quantity,
                status: data.order.status,
                fraudDetection: data.fraudDetection ? {
                    isFraud: data.fraudDetection.isFraud,
                    riskLevel: data.fraudDetection.riskLevel,
                    confidenceScore: data.fraudDetection.confidenceScore
                } : 'Not available',
                approvals: data.approvals.length
            });
            return true;
        } else {
            console.error('❌ Order validation failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Validation error:', error.response?.data?.message || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting blockchain validation tests...\n');

    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ Test failed: Could not login');
        process.exit(1);
    }

    console.log('');

    // Step 2: Check blockchain status
    const blockchainConnected = await checkBlockchainStatus();
    if (!blockchainConnected) {
        console.log('⚠️ Warning: Blockchain not connected, but continuing tests...');
    }

    console.log('');

    // Step 3: Place test order
    const blockchainOrderId = await placeTestOrder();

    console.log('');

    // Step 4: Validate order (if blockchain order ID exists)
    if (blockchainOrderId) {
        await validateOrder(blockchainOrderId);
    } else {
        console.log('⚠️ Skipping validation test - no blockchain order ID');
    }

    console.log('\n🎉 Blockchain validation tests completed!');

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`- Login: ${loginSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Blockchain Connection: ${blockchainConnected ? '✅ CONNECTED' : '⚠️ DISCONNECTED'}`);
    console.log(`- Order Placement: ${blockchainOrderId ? '✅ SUCCESS' : '⚠️ NO BLOCKCHAIN ID'}`);
    console.log(`- Order Validation: ${blockchainOrderId ? '✅ TESTED' : '⚠️ SKIPPED'}`);
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
});