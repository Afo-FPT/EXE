#!/usr/bin/env node

/**
 * Script để test API Password Reset
 * Chạy: node test-password-reset.mjs
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';

console.log('🧪 Testing Password Reset API...\n');

// Test 1: Health check
async function testHealthCheck() {
  console.log('1️⃣ Testing health check...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Health check passed');
      console.log('📋 Available endpoints:', data.endpoints);
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
  console.log('');
}

// Test 2: Forgot password
async function testForgotPassword() {
  console.log('2️⃣ Testing forgot password...');
  try {
    const response = await fetch(`${BASE_URL}/api/password-reset/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Forgot password API working');
      console.log('📧 Response:', data.message);
      return data.data?.email;
    } else {
      console.log('❌ Forgot password failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Forgot password error:', error.message);
  }
  console.log('');
}

// Test 3: Invalid email format
async function testInvalidEmail() {
  console.log('3️⃣ Testing invalid email format...');
  try {
    const response = await fetch(`${BASE_URL}/api/password-reset/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok && !data.success) {
      console.log('✅ Invalid email validation working:', data.message);
    } else {
      console.log('❌ Invalid email validation failed');
    }
  } catch (error) {
    console.log('❌ Invalid email test error:', error.message);
  }
  console.log('');
}

// Test 4: Missing email
async function testMissingEmail() {
  console.log('4️⃣ Testing missing email...');
  try {
    const response = await fetch(`${BASE_URL}/api/password-reset/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (!response.ok && !data.success) {
      console.log('✅ Missing email validation working:', data.message);
    } else {
      console.log('❌ Missing email validation failed');
    }
  } catch (error) {
    console.log('❌ Missing email test error:', error.message);
  }
  console.log('');
}

// Test 5: Debug tokens endpoint
async function testDebugTokens() {
  console.log('5️⃣ Testing debug tokens endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/password-reset/debug/tokens`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Debug tokens endpoint working');
      console.log('🔑 Active tokens:', data.data.length);
    } else {
      console.log('❌ Debug tokens endpoint failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Debug tokens test error:', error.message);
  }
  console.log('');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Password Reset API Tests\n');
  console.log('='.repeat(50));
  
  await testHealthCheck();
  await testInvalidEmail();
  await testMissingEmail();
  await testForgotPassword();
  await testDebugTokens();
  
  console.log('='.repeat(50));
  console.log('✨ Tests completed!');
  console.log('\n📝 Notes:');
  console.log('- Make sure backend server is running on port 5000');
  console.log('- Check EMAIL_USER and EMAIL_PASS in .env file');
  console.log('- Email sending requires valid Gmail credentials');
}

// Run tests
runTests().catch(console.error);
