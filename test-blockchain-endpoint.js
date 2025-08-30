#!/usr/bin/env node

/**
 * Simple test script to verify blockchain endpoint is working
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testBlockchainStatus() {
    try {
        console.log('🔍 Testing blockchain status endpoint...');
        console.log(`URL: ${API_BASE_URL}/api/blockchain/status`);

        // First test without authentication
        try {
            const response = await axios.get(`${API_BASE_URL}/api/blockchain/status`);
            console.log('✅ Response received:', response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️ Authentication required (expected)');
                console.log('Response:', error.response.data);
            } else {
                console.error('❌ Unexpected error:', error.response?.data || error.message);
            }
        }

        // Test health endpoint (should work without auth)
        try {
            console.log('\n🔍 Testing health endpoint...');
            const healthResponse = await axios.get(`${API_BASE_URL}/health`);
            console.log('✅ Health check response:', healthResponse.data);
        } catch (error) {
            console.error('❌ Health check failed:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

// Run the test
testBlockchainStatus();