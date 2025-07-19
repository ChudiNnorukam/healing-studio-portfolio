#!/usr/bin/env node

// Test script for the Enhanced Carousel Workflow
const https = require('https');

// Replace with your actual n8n webhook URL
const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';

const testPayload = {
  topic: 'inner child healing',
  audience: 'trauma survivors',
  platforms: ['pinterest'],
  contentTypes: ['quote', 'infographic', 'exercise'],
  monthlyBudget: 50
};

function testWorkflow() {
  console.log('🧪 Testing Enhanced Carousel Workflow...');
  console.log('Payload:', JSON.stringify(testPayload, null, 2));
  
  const postData = JSON.stringify(testPayload);
  
  const options = {
    hostname: new URL(WEBHOOK_URL).hostname,
    port: new URL(WEBHOOK_URL).port || 443,
    path: new URL(WEBHOOK_URL).pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      try {
        const result = JSON.parse(data);
        console.log('\n✅ Workflow executed successfully!');
        console.log('Generated slides:', result.slides?.length || 0);
        console.log('Cost:', result.costAnalysis?.estimatedCost || 'N/A');
      } catch (error) {
        console.log('\n⚠️ Response parsing failed:', error.message);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testWorkflow();
