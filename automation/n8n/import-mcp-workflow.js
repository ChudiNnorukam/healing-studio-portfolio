const fs = require('fs');
const axios = require('axios');

async function importWorkflow() {
  try {
    // Read the workflow file
    const workflowData = fs.readFileSync('n8n-mcp-workflow.json', 'utf8');
    const workflow = JSON.parse(workflowData);
    
    // Import workflow to n8n
    const response = await axios.post('http://localhost:5678/rest/workflows', workflow, {
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': process.env.N8N_API_KEY || 'your-api-key-here'
      }
    });
    
    console.log('✅ MCP Workflow imported successfully!');
    console.log('Workflow ID:', response.data.id);
    console.log('Webhook URL: http://localhost:5678/webhook/mcp');
    
    return response.data;
  } catch (error) {
    console.error('❌ Error importing workflow:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the import
importWorkflow(); 