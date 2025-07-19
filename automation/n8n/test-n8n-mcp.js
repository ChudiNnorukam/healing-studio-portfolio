#!/usr/bin/env node

const { spawn } = require('child_process');

async function testN8nMCP() {
  console.log('🧪 Testing n8n MCP Server...\n');
  
  // Test the MCP server
  const mcpProcess = spawn('node', ['n8n-mcp-server.js'], { 
    stdio: ['pipe', 'pipe', 'pipe'] 
  });
  
  // Test tools/list request
  const listRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  console.log('📋 Testing tools/list...');
  mcpProcess.stdin.write(JSON.stringify(listRequest) + '\n');
  
  mcpProcess.stdout.on('data', (data) => {
    console.log('✅ MCP Server Response:');
    console.log(data.toString());
  });
  
  mcpProcess.stderr.on('data', (data) => {
    console.log('📝 MCP Server Log:', data.toString());
  });
  
  mcpProcess.on('close', (code) => {
    console.log(`MCP Server exited with code ${code}`);
  });
  
  // Test list_workflows tool
  setTimeout(() => {
    const listWorkflowsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_workflows',
        arguments: {}
      }
    };
    
    console.log('\n📋 Testing list_workflows tool...');
    mcpProcess.stdin.write(JSON.stringify(listWorkflowsRequest) + '\n');
  }, 1000);
  
  // Clean up after 5 seconds
  setTimeout(() => {
    mcpProcess.kill();
    console.log('\n✅ n8n MCP Server test completed');
  }, 5000);
}

testN8nMCP().catch(console.error); 