#!/usr/bin/env node

/**
 * Simple test script to verify auth endpoints are working
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAuthEndpoints() {
    try {
        console.log('🔍 Testing auth endpoints...');

        // Test login endpoint
        console.log('\n1. Testing login endpoint...');
        console.log(`URL: ${API_BASE_URL}/api/auth/login`);

        try {
            const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: 'admin@smartmedichain.com',
                password: 'admin123'
            });

            console.log('✅ Login successful!');
            console.log('Response:', {
                success: loginResponse.data.success,
                user: loginResponse.data.data?.user?.name,
                hasToken: !!loginResponse.data.data?.token
            });

            const token = loginResponse.data.data?.token;

            if (token) {
                // Test authenticated endpoint
                console.log('\n2. Testing authenticated endpoint...');
                try {
                    const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('✅ Authenticated request successful!');
                    console.log('User:', meResponse.data.data?.name);
                } catch (authError) {
                    console.error('❌ Authenticated request failed:', authError.response?.data || authError.message);
                }

                // Test logout
                console.log('\n3. Testing logout endpoint...');
                try {
                    const logoutResponse = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('✅ Logout successful!');
                } catch (logoutError) {
                    console.error('❌ Logout failed:', logoutError.response?.data || logoutError.message);
                }
            }

        } catch (loginError) {
            console.error('❌ Login failed:', loginError.response?.data || loginError.message);
        }

        // Test health endpoint
        console.log('\n4. Testing health endpoint...');
        try {
            const healthResponse = await axios.get(`${API_BASE_URL}/health`);
            console.log('✅ Health check response:', healthResponse.data);
        } catch (healthError) {
            console.error('❌ Health check failed:', healthError.response?.data || healthError.message);
        }

    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

// Run the test
testAuthEndpoints();