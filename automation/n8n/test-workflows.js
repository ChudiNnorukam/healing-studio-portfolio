#!/usr/bin/env node

const axios = require('axios');

async function testWorkflows() {
  console.log('🧪 Testing n8n Workflows...\n');
  
  const tests = [
    {
      name: 'MCP Server Workflow',
      method: 'GET',
      url: 'http://localhost:5678/webhook/mcp',
      data: null
    },
    {
      name: 'Carousel Automation Workflow',
      method: 'POST',
      url: 'http://localhost:5678/webhook/carousel',
      data: {
        topic: 'trauma healing',
        style: 'healing'
      }
    },
    {
      name: 'Portfolio Monitor Workflow',
      method: 'GET',
      url: 'http://localhost:5678/webhook/monitor',
      data: null
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      
      const config = {
        method: test.method,
        url: test.url,
        timeout: 10000
      };
      
      if (test.data) {
        config.headers = { 'Content-Type': 'application/json' };
        config.data = test.data;
      }
      
      const response = await axios(config);
      
      console.log(`✅ ${test.name}: SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
      console.log('');
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`❌ ${test.name}: NOT CREATED`);
        console.log(`   Error: Workflow not found`);
        console.log(`   Action: Create this workflow in n8n interface`);
        console.log('');
      } else {
        console.log(`⚠️  ${test.name}: ERROR`);
        console.log(`   Error: ${error.message}`);
        console.log('');
      }
    }
  }
  
  console.log('📝 Summary:');
  console.log('   - If you see "NOT CREATED" errors, follow the quick-workflow-setup.md guide');
  console.log('   - If you see "SUCCESS", your workflows are working!');
  console.log('   - You can now use the MCP tools in Cursor');
}

testWorkflows().catch(console.error); 