const { spawn } = require('child_process');

// Test the MCP server
async function testMCPServer() {
  console.log('🧪 Testing MCP Server...');
  
  const mcpProcess = spawn('node', ['n8n-mcp-server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send a simple test request
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  mcpProcess.stdin.write(JSON.stringify(testRequest) + '\n');

  mcpProcess.stdout.on('data', (data) => {
    console.log('✅ MCP Server Response:', data.toString());
  });

  mcpProcess.stderr.on('data', (data) => {
    console.log('📝 MCP Server Log:', data.toString());
  });

  mcpProcess.on('close', (code) => {
    console.log(`MCP Server exited with code ${code}`);
  });

  // Kill the process after 5 seconds
  setTimeout(() => {
    mcpProcess.kill();
    console.log('✅ MCP Server test completed');
  }, 5000);
}

testMCPServer().catch(console.error); 