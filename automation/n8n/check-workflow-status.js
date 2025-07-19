#!/usr/bin/env node

const axios = require('axios');

async function checkWorkflowStatus() {
  console.log('🔍 Checking n8n Workflow Status...\n');
  
  const workflows = [
    { name: 'MCP Server', path: '/webhook/mcp' },
    { name: 'Content Generation', path: '/webhook/content' },
    { name: 'Carousel Automation', path: '/webhook/carousel' },
    { name: 'Portfolio Monitor', path: '/webhook/monitor' }
  ];
  
  console.log('📋 Workflow Status Check:\n');
  
  for (const workflow of workflows) {
    try {
      const response = await axios.get(`http://localhost:5678${workflow.path}`, {
        timeout: 5000
      });
      
      console.log(`✅ ${workflow.name}: ACTIVE`);
      console.log(`   URL: http://localhost:5678${workflow.path}`);
      console.log(`   Status: ${response.status}`);
      console.log('');
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`❌ ${workflow.name}: NOT SET UP`);
        console.log(`   URL: http://localhost:5678${workflow.path}`);
        console.log(`   Error: Workflow not registered`);
        console.log('');
      } else {
        console.log(`⚠️  ${workflow.name}: ERROR`);
        console.log(`   URL: http://localhost:5678${workflow.path}`);
        console.log(`   Error: ${error.message}`);
        console.log('');
      }
    }
  }
  
  console.log('📝 Summary:');
  console.log('   - n8n is running on http://localhost:5678');
  console.log('   - Workflows need to be manually created in the n8n interface');
  console.log('   - Follow the guide in setup-n8n-workflows.md');
  console.log('');
  console.log('🔗 Next Steps:');
  console.log('   1. Open http://localhost:5678 in your browser');
  console.log('   2. Create workflows following the setup guide');
  console.log('   3. Activate each workflow');
  console.log('   4. Test the webhook URLs');
}

checkWorkflowStatus().catch(console.error); 