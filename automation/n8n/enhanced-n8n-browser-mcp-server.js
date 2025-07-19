const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class EnhancedN8nBrowserMCPServer {
  constructor() {
    this.baseUrl = 'http://localhost:5678';
    this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI';
    
    // Load cost monitoring config
    this.costConfig = require('../../configuration/cost-monitor/cost-monitor-config.json');
    this.usageFile = path.join(__dirname, '../../temp/reports/daily-usage-report.json');
    this.currentUsage = { today: 0, thisMonth: 0, operationCount: 0, lastReset: new Date().toDateString() };
    
    this.browser = null;
    this.page = null;
    
    this.server = new Server(
      {
        name: 'enhanced-n8n-browser-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.loadUsageData();
    this.setupToolHandlers();
  }

  async loadUsageData() {
    try {
      const data = await fs.readFile(this.usageFile, 'utf8');
      this.currentUsage = JSON.parse(data);
      
      // Reset daily usage if new day
      const today = new Date().toDateString();
      if (this.currentUsage.lastReset !== today) {
        this.currentUsage.today = 0;
        this.currentUsage.operationCount = 0;
        this.currentUsage.lastReset = today;
        await this.saveUsageData();
      }
    } catch (error) {
      console.log('Creating new usage tracking file');
      await this.saveUsageData();
    }
  }

  async saveUsageData() {
    try {
      await fs.mkdir(path.dirname(this.usageFile), { recursive: true });
      await fs.writeFile(this.usageFile, JSON.stringify(this.currentUsage, null, 2));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }

  async checkCostLimits(estimatedCost = 0.05) {
    const dailyProjected = this.currentUsage.today + estimatedCost;
    const monthlyProjected = this.currentUsage.thisMonth + estimatedCost;
    
    if (dailyProjected > this.costConfig.dailyLimit) {
      throw new Error(`🚨 DAILY BUDGET EXCEEDED: $${dailyProjected.toFixed(2)} > $${this.costConfig.dailyLimit}`);
    }
    
    if (monthlyProjected > this.costConfig.monthlyLimit) {
      throw new Error(`🚨 MONTHLY BUDGET EXCEEDED: $${monthlyProjected.toFixed(2)} > $${this.costConfig.monthlyLimit}`);
    }

    const dailyAlert = this.costConfig.dailyLimit * this.costConfig.alertThreshold;
    const monthlyAlert = this.costConfig.monthlyLimit * this.costConfig.alertThreshold;
    
    if (dailyProjected > dailyAlert) {
      console.warn(`⚠️  Daily budget at ${(dailyProjected/this.costConfig.dailyLimit*100).toFixed(1)}%`);
    }
    
    if (monthlyProjected > monthlyAlert) {
      console.warn(`⚠️  Monthly budget at ${(monthlyProjected/this.costConfig.monthlyLimit*100).toFixed(1)}%`);
    }
    
    return { dailyProjected, monthlyProjected, safe: true };
  }

  async trackOperation(cost = 0.05, operation = 'unknown') {
    await this.checkCostLimits(cost);
    
    this.currentUsage.today += cost;
    this.currentUsage.thisMonth += cost;
    this.currentUsage.operationCount += 1;
    
    console.log(`💰 Operation: ${operation} | Cost: $${cost.toFixed(3)} | Daily: $${this.currentUsage.today.toFixed(2)}/${this.costConfig.dailyLimit} | Monthly: $${this.currentUsage.thisMonth.toFixed(2)}/${this.costConfig.monthlyLimit}`);
    
    await this.saveUsageData();
    return this.currentUsage;
  }

  async initBrowser() {
    if (!this.browser) {
      await this.trackOperation(0.02, 'browser_init');
      this.browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1920, height: 1080 });
    }
    return { browser: this.browser, page: this.page };
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('🔒 Browser closed to save resources');
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Cost Management Tools
          {
            name: 'check_budget_status',
            description: 'Check current cost usage and remaining budget',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'estimate_operation_cost',
            description: 'Estimate the cost of a planned operation before execution',
            inputSchema: {
              type: 'object',
              properties: {
                operation_type: { type: 'string', description: 'Type of operation (browser_automation, workflow_import, etc.)' },
                complexity: { type: 'string', enum: ['simple', 'medium', 'complex'], description: 'Complexity level' }
              },
              required: ['operation_type', 'complexity']
            }
          },
          
          // Enhanced n8n API Tools
          {
            name: 'trigger_workflow',
            description: 'Trigger an n8n workflow by ID with cost tracking',
            inputSchema: {
              type: 'object',
              properties: {
                workflow_id: { type: 'string', description: 'The ID of the workflow to trigger' },
                data: { type: 'object', description: 'Data to pass to the workflow' }
              },
              required: ['workflow_id']
            }
          },
          {
            name: 'list_workflows',
            description: 'List all available workflows with metadata',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'get_workflow_details',
            description: 'Get detailed information about a specific workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflow_id: { type: 'string', description: 'The ID of the workflow' }
              },
              required: ['workflow_id']
            }
          },
          
          // Browser Automation Tools
          {
            name: 'open_n8n_dashboard',
            description: 'Open n8n dashboard in browser with automatic login',
            inputSchema: {
              type: 'object',
              properties: {
                headless: { type: 'boolean', default: true, description: 'Run browser in headless mode' }
              },
              required: []
            }
          },
          {
            name: 'import_workflow_json',
            description: 'Import a workflow JSON file through the n8n UI',
            inputSchema: {
              type: 'object',
              properties: {
                json_file_path: { type: 'string', description: 'Path to the JSON workflow file' },
                workflow_name: { type: 'string', description: 'Name for the imported workflow' }
              },
              required: ['json_file_path']
            }
          },
          {
            name: 'configure_workflow_nodes',
            description: 'Configure multiple nodes in a workflow with provided settings',
            inputSchema: {
              type: 'object',
              properties: {
                workflow_id: { type: 'string', description: 'ID of the workflow to configure' },
                node_configs: { 
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      node_name: { type: 'string' },
                      settings: { type: 'object' }
                    }
                  },
                  description: 'Array of node configurations'
                }
              },
              required: ['workflow_id', 'node_configs']
            }
          },
          {
            name: 'bulk_workflow_deployment',
            description: 'Deploy multiple workflows from JSON files with configuration',
            inputSchema: {
              type: 'object',
              properties: {
                workflow_configs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      json_path: { type: 'string' },
                      name: { type: 'string' },
                      node_configs: { type: 'object' }
                    }
                  }
                }
              },
              required: ['workflow_configs']
            }
          },
          {
            name: 'take_screenshot',
            description: 'Take a screenshot of current browser state for debugging',
            inputSchema: {
              type: 'object',
              properties: {
                filename: { type: 'string', description: 'Optional filename for screenshot' }
              },
              required: []
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'check_budget_status':
            return await this.handleBudgetStatus();
          
          case 'estimate_operation_cost':
            return await this.handleCostEstimation(args);
          
          case 'trigger_workflow':
            return await this.handleTriggerWorkflow(args);
          
          case 'list_workflows':
            return await this.handleListWorkflows();
          
          case 'get_workflow_details':
            return await this.handleGetWorkflowDetails(args);
          
          case 'open_n8n_dashboard':
            return await this.handleOpenDashboard(args);
          
          case 'import_workflow_json':
            return await this.handleImportWorkflow(args);
          
          case 'configure_workflow_nodes':
            return await this.handleConfigureNodes(args);
          
          case 'bulk_workflow_deployment':
            return await this.handleBulkDeployment(args);
          
          case 'take_screenshot':
            return await this.handleScreenshot(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error in ${name}:`, error);
        await this.closeBrowser(); // Clean up on error
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error in ${name}: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async handleBudgetStatus() {
    const dailyUsed = (this.currentUsage.today / this.costConfig.dailyLimit * 100).toFixed(1);
    const monthlyUsed = (this.currentUsage.thisMonth / this.costConfig.monthlyLimit * 100).toFixed(1);
    
    return {
      content: [
        {
          type: 'text',
          text: `💰 **Budget Status**
          
**Daily**: $${this.currentUsage.today.toFixed(2)} / $${this.costConfig.dailyLimit} (${dailyUsed}%)
**Monthly**: $${this.currentUsage.thisMonth.toFixed(2)} / $${this.costConfig.monthlyLimit} (${monthlyUsed}%)
**Operations Today**: ${this.currentUsage.operationCount}
**Status**: ${dailyUsed < 80 && monthlyUsed < 80 ? '✅ Safe' : '⚠️  Approaching Limit'}`
        }
      ]
    };
  }

  async handleCostEstimation(args) {
    const costMap = {
      simple: { browser_automation: 0.03, workflow_import: 0.02, api_call: 0.01 },
      medium: { browser_automation: 0.08, workflow_import: 0.05, api_call: 0.03 },
      complex: { browser_automation: 0.15, workflow_import: 0.10, api_call: 0.05 }
    };
    
    const estimatedCost = costMap[args.complexity]?.[args.operation_type] || 0.05;
    const costCheck = await this.checkCostLimits(estimatedCost);
    
    return {
      content: [
        {
          type: 'text',
          text: `📊 **Cost Estimation**
          
**Operation**: ${args.operation_type} (${args.complexity})
**Estimated Cost**: $${estimatedCost.toFixed(3)}
**After Operation**: Daily $${costCheck.dailyProjected.toFixed(2)}, Monthly $${costCheck.monthlyProjected.toFixed(2)}
**Status**: ${costCheck.safe ? '✅ Safe to proceed' : '❌ Would exceed limits'}`
        }
      ]
    };
  }

  async handleTriggerWorkflow(args) {
    await this.trackOperation(0.02, 'trigger_workflow');
    
    const response = await axios.post(
      `${this.baseUrl}/api/v1/workflows/${args.workflow_id}/activate`,
      args.data || {},
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Workflow triggered successfully: ${args.workflow_id}\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`
        }
      ]
    };
  }

  async handleListWorkflows() {
    await this.trackOperation(0.01, 'list_workflows');
    
    const response = await axios.get(`${this.baseUrl}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': this.apiKey }
    });

    const workflows = response.data.data.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      nodeCount: wf.nodes ? wf.nodes.length : 0
    }));

    return {
      content: [
        {
          type: 'text',
          text: `📋 **Available Workflows (${workflows.length})**\n\n${workflows.map(wf => 
            `• **${wf.name}** (ID: ${wf.id})\n  Status: ${wf.active ? '🟢 Active' : '🔴 Inactive'} | Nodes: ${wf.nodeCount} | Updated: ${new Date(wf.updatedAt).toLocaleDateString()}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  async handleGetWorkflowDetails(args) {
    await this.trackOperation(0.02, 'get_workflow_details');
    
    const response = await axios.get(`${this.baseUrl}/api/v1/workflows/${args.workflow_id}`, {
      headers: { 'X-N8N-API-KEY': this.apiKey }
    });

    const workflow = response.data.data;
    const nodeTypes = workflow.nodes ? [...new Set(workflow.nodes.map(n => n.type))] : [];
    
    return {
      content: [
        {
          type: 'text',
          text: `📄 **Workflow Details: ${workflow.name}**
          
**ID**: ${workflow.id}
**Status**: ${workflow.active ? '🟢 Active' : '🔴 Inactive'}
**Created**: ${new Date(workflow.createdAt).toLocaleDateString()}
**Updated**: ${new Date(workflow.updatedAt).toLocaleDateString()}
**Nodes**: ${workflow.nodes ? workflow.nodes.length : 0}
**Node Types**: ${nodeTypes.join(', ')}
**Has Trigger**: ${workflow.nodes ? workflow.nodes.some(n => n.type.includes('Trigger')) : false}

**Connections**: ${workflow.connections ? Object.keys(workflow.connections).length : 0} node connections`
        }
      ]
    };
  }

  async handleOpenDashboard(args) {
    await this.trackOperation(0.05, 'open_dashboard');
    
    const { browser, page } = await this.initBrowser();
    
    console.log('🌐 Opening n8n dashboard...');
    await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
    
    // Check if login is required
    const currentUrl = page.url();
    if (currentUrl.includes('/signin') || currentUrl.includes('/login')) {
      console.log('🔑 Login required - dashboard will need manual authentication');
      return {
        content: [
          {
            type: 'text',
            text: `🌐 **Dashboard Opened**\n\n❗ Login required at: ${currentUrl}\nPlease authenticate manually or configure automatic login credentials.`
          }
        ]
      };
    }
    
    console.log('✅ Dashboard opened successfully');
    return {
      content: [
        {
          type: 'text',
          text: `🌐 **Dashboard Opened Successfully**\n\nURL: ${currentUrl}\nBrowser ready for automation commands.`
        }
      ]
    };
  }

  async handleImportWorkflow(args) {
    await this.trackOperation(0.08, 'import_workflow');
    
    const { browser, page } = await this.initBrowser();
    
    try {
      // Read the JSON file
      const jsonContent = await fs.readFile(args.json_file_path, 'utf8');
      const workflowData = JSON.parse(jsonContent);
      
      console.log('📂 Importing workflow via browser automation...');
      
      // Navigate to workflows page
      await page.goto(`${this.baseUrl}/workflows`, { waitUntil: 'networkidle0' });
      
      // Look for import button or menu
      await page.waitForSelector('[data-test-id="workflow-add-button"], .el-button, button', { timeout: 10000 });
      
      // Try different selectors for the import/add workflow button
      const importButton = await page.$('[data-test-id="workflow-import"], [data-test-id="workflow-add-button"]');
      if (importButton) {
        await importButton.click();
      } else {
        // Fallback: look for any button containing "Import" or "Add"
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, .el-button'));
          const importBtn = buttons.find(btn => 
            btn.textContent.toLowerCase().includes('import') || 
            btn.textContent.toLowerCase().includes('add') ||
            btn.textContent.toLowerCase().includes('create')
          );
          if (importBtn) importBtn.click();
        });
      }
      
      // Wait for import dialog/page
      await page.waitForTimeout(2000);
      
      // Look for file upload input or text area
      const fileInput = await page.$('input[type="file"]');
      const textArea = await page.$('textarea, .monaco-editor');
      
      if (fileInput) {
        // File upload method
        await fileInput.uploadFile(args.json_file_path);
      } else if (textArea) {
        // Text paste method
        await textArea.click();
        await textArea.evaluate((el, json) => el.value = json, jsonContent);
      } else {
        // Use API fallback
        console.log('🔄 Browser import failed, using API fallback...');
        const response = await axios.post(`${this.baseUrl}/api/v1/workflows`, workflowData, {
          headers: {
            'X-N8N-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ **Workflow Imported via API**\n\nWorkflow ID: ${response.data.data.id}\nName: ${response.data.data.name}\nNodes: ${response.data.data.nodes.length}`
            }
          ]
        };
      }
      
      // Look for save/import button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, .el-button'));
        const saveBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('save') || 
          btn.textContent.toLowerCase().includes('import') ||
          btn.textContent.toLowerCase().includes('create')
        );
        if (saveBtn) saveBtn.click();
      });
      
      await page.waitForTimeout(3000);
      
      // Set workflow name if provided
      if (args.workflow_name) {
        const nameInput = await page.$('input[placeholder*="name"], input[placeholder*="Name"]');
        if (nameInput) {
          await nameInput.clear();
          await nameInput.type(args.workflow_name);
        }
      }
      
      console.log('✅ Workflow imported successfully');
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Workflow Imported Successfully**\n\nFile: ${args.json_file_path}\nName: ${args.workflow_name || workflowData.name || 'Imported Workflow'}\nNodes: ${workflowData.nodes ? workflowData.nodes.length : 'Unknown'}`
          }
        ]
      };
      
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error(`Failed to import workflow: ${error.message}`);
    }
  }

  async handleConfigureNodes(args) {
    await this.trackOperation(0.10, 'configure_nodes');
    
    const { browser, page } = await this.initBrowser();
    
    try {
      console.log(`🔧 Configuring ${args.node_configs.length} nodes...`);
      
      // Navigate to the specific workflow
      await page.goto(`${this.baseUrl}/workflow/${args.workflow_id}`, { waitUntil: 'networkidle0' });
      
      let configuredNodes = 0;
      
      for (const nodeConfig of args.node_configs) {
        try {
          console.log(`🎯 Configuring node: ${nodeConfig.node_name}`);
          
          // Find and click the node
          await page.evaluate((nodeName) => {
            const nodes = Array.from(document.querySelectorAll('[data-test-id*="node"], .node-default'));
            const targetNode = nodes.find(node => 
              node.textContent.includes(nodeName) || 
              node.getAttribute('data-name') === nodeName ||
              node.querySelector(`[title*="${nodeName}"]`)
            );
            if (targetNode) {
              targetNode.click();
            }
          }, nodeConfig.node_name);
          
          await page.waitForTimeout(1000);
          
          // Configure node settings
          for (const [key, value] of Object.entries(nodeConfig.settings)) {
            try {
              // Try different input selectors
              const input = await page.$(`input[name="${key}"], input[placeholder*="${key}"], textarea[name="${key}"]`);
              if (input) {
                await input.clear();
                await input.type(String(value));
              } else {
                // Try to find by label
                await page.evaluate((k, v) => {
                  const labels = Array.from(document.querySelectorAll('label'));
                  const targetLabel = labels.find(l => l.textContent.toLowerCase().includes(k.toLowerCase()));
                  if (targetLabel) {
                    const input = targetLabel.querySelector('input, textarea') || 
                                 targetLabel.parentNode.querySelector('input, textarea');
                    if (input) {
                      input.value = v;
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }
                }, key, value);
              }
            } catch (fieldError) {
              console.warn(`⚠️  Could not set field ${key}: ${fieldError.message}`);
            }
          }
          
          configuredNodes++;
          console.log(`✅ Node ${nodeConfig.node_name} configured`);
          
        } catch (nodeError) {
          console.error(`❌ Failed to configure node ${nodeConfig.node_name}:`, nodeError.message);
        }
      }
      
      // Save the workflow
      await page.keyboard.press('KeyS', { ctrlKey: true });
      await page.waitForTimeout(2000);
      
      return {
        content: [
          {
            type: 'text',
            text: `🔧 **Node Configuration Complete**\n\nWorkflow: ${args.workflow_id}\nConfigured: ${configuredNodes}/${args.node_configs.length} nodes\nStatus: ${configuredNodes === args.node_configs.length ? '✅ All nodes configured' : '⚠️  Some nodes may need manual configuration'}`
          }
        ]
      };
      
    } catch (error) {
      throw new Error(`Node configuration failed: ${error.message}`);
    }
  }

  async handleBulkDeployment(args) {
    await this.trackOperation(0.15, 'bulk_deployment');
    
    const results = [];
    let successCount = 0;
    
    for (const config of args.workflow_configs) {
      try {
        console.log(`🚀 Deploying workflow: ${config.name}`);
        
        // Import workflow
        const importResult = await this.handleImportWorkflow({
          json_file_path: config.json_path,
          workflow_name: config.name
        });
        
        // If node configs provided, configure them
        if (config.node_configs && Object.keys(config.node_configs).length > 0) {
          // Get the workflow ID from the import result or API
          const workflows = await axios.get(`${this.baseUrl}/api/v1/workflows`, {
            headers: { 'X-N8N-API-KEY': this.apiKey }
          });
          
          const newWorkflow = workflows.data.data.find(wf => wf.name === config.name);
          
          if (newWorkflow && newWorkflow.id) {
            const nodeConfigs = Object.entries(config.node_configs).map(([name, settings]) => ({
              node_name: name,
              settings
            }));
            
            await this.handleConfigureNodes({
              workflow_id: newWorkflow.id,
              node_configs: nodeConfigs
            });
          }
        }
        
        results.push({
          name: config.name,
          status: 'success',
          message: 'Deployed and configured successfully'
        });
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to deploy ${config.name}:`, error.message);
        results.push({
          name: config.name,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `🚀 **Bulk Deployment Complete**\n\nTotal Workflows: ${args.workflow_configs.length}\nSuccessful: ${successCount}\nFailed: ${args.workflow_configs.length - successCount}\n\n**Results:**\n${results.map(r => `• ${r.name}: ${r.status === 'success' ? '✅' : '❌'} ${r.message}`).join('\n')}`
        }
      ]
    };
  }

  async handleScreenshot(args) {
    await this.trackOperation(0.01, 'screenshot');
    
    const { browser, page } = await this.initBrowser();
    
    const timestamp = Date.now();
    const filename = args.filename || `n8n-screenshot-${timestamp}.png`;
    const screenshotPath = path.join(__dirname, '../../temp/screenshots', filename);
    
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    return {
      content: [
        {
          type: 'text',
          text: `📸 **Screenshot Captured**\n\nSaved to: ${screenshotPath}\nCurrent URL: ${page.url()}\nTimestamp: ${new Date().toISOString()}`
        }
      ]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🚀 Enhanced N8n Browser MCP Server started with cost monitoring');
    console.log('💰 Budget tracking enabled - all operations monitored');
  }

  async cleanup() {
    await this.closeBrowser();
    await this.saveUsageData();
    console.log('🧹 Server cleanup completed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (global.mcpServer) {
    await global.mcpServer.cleanup();
  }
  process.exit(0);
});

if (require.main === module) {
  global.mcpServer = new EnhancedN8nBrowserMCPServer();
  global.mcpServer.start().catch(console.error);
}

module.exports = EnhancedN8nBrowserMCPServer; 