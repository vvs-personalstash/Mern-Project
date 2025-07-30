// Test script to demonstrate rate limiting
const fetch = require('node-fetch'); // You'll need to install this: npm install node-fetch

const API_URL = 'http://localhost:3000';

// Sample code for testing
const testCode = `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}
`;

// Test compilation endpoint rate limiting
async function testRateLimit() {
    console.log('🧪 Testing Rate Limiting...\n');
    
    // Test health endpoint first
    console.log('📋 Checking API health...');
    try {
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
        console.log('⏱️  Uptime:', Math.floor(healthData.uptime), 'seconds\n');
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        console.log('Make sure the API server is running on port 3000\n');
        return;
    }
    
    // Check rate limit status
    console.log('📊 Checking rate limit status...');
    try {
        const statusResponse = await fetch(`${API_URL}/rate-limit-status`);
        const statusData = await statusResponse.json();
        console.log('📋 Rate Limits:');
        console.log('   - Compilation:', statusData.rateLimits.compilation.maxRequests, 'requests per', statusData.rateLimits.compilation.window);
        console.log('   - General:', statusData.rateLimits.general.maxRequests, 'requests per', statusData.rateLimits.general.window);
        console.log('🌐 Your IP:', statusData.clientIP, '\n');
    } catch (error) {
        console.log('❌ Rate limit status check failed:', error.message, '\n');
    }
    
    // Test compilation requests
    console.log('🚀 Testing compilation requests...');
    console.log('Sending 12 compilation requests (limit is 10 per minute)...\n');
    
    for (let i = 1; i <= 12; i++) {
        try {
            const startTime = Date.now();
            const response = await fetch(`${API_URL}/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: testCode,
                    language: 'cpp',
                    input: ''
                })
            });
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            if (response.status === 200) {
                console.log(`✅ Request ${i}: Success (${duration}ms) - ${data.executionTime}`);
                console.log(`   Remaining: ${response.headers.get('RateLimit-Remaining')} requests`);
            } else if (response.status === 429) {
                console.log(`🚨 Request ${i}: Rate limited! (${duration}ms)`);
                console.log(`   Error: ${data.error}`);
                console.log(`   Retry after: ${data.retryAfter}`);
                console.log(`   Limit: ${data.limit} requests per ${data.window}`);
                
                // Show when rate limit resets
                const resetTime = response.headers.get('RateLimit-Reset');
                if (resetTime) {
                    const resetDate = new Date(parseInt(resetTime) * 1000);
                    console.log(`   Reset time: ${resetDate.toLocaleTimeString()}`);
                }
            } else {
                console.log(`❌ Request ${i}: Error ${response.status} (${duration}ms) - ${data.error}`);
            }
            
            // Add small delay between requests
            if (i < 12) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.log(`❌ Request ${i}: Network error -`, error.message);
        }
    }
    
    console.log('\n📈 Test completed!');
    console.log('💡 Try again in 1 minute to see rate limits reset.');
    console.log('📋 Check logs with: GET /logs/rate-limit');
}

// Run the test
if (require.main === module) {
    testRateLimit().catch(console.error);
}

module.exports = { testRateLimit };
