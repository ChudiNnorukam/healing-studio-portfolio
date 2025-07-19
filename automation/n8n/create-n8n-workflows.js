#!/usr/bin/env node

const puppeteer = require('puppeteer');

class N8nWorkflowCreator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5678';
  }

  async init() {
    console.log('🚀 Starting n8n workflow creation...');
    this.browser = await puppeteer.launch({ 
      headless: false, // Set to true if you want it to run in background
      defaultViewport: null,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
  }

  async createMCPWorkflow() {
    console.log('📋 Creating MCP Server Workflow...');
    
    try {
      // Navigate to n8n
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('.workflow-list', { timeout: 10000 });
      
      // Click "Add Workflow"
      await this.page.click('button[data-test-id="workflow-new"]');
      await this.page.waitForSelector('.workflow-canvas', { timeout: 10000 });
      
      // Add Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Webhook Node
      await this.page.waitForSelector('.webhook-node-config');
      await this.page.select('select[name="httpMethod"]', 'GET');
      await this.page.type('input[name="path"]', 'mcp');
      await this.page.click('input[name="respondWithAllData"]');
      
      // Add Respond to Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'respond to webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Respond Node
      await this.page.waitForSelector('.respond-node-config');
      await this.page.select('select[name="responseMode"]', 'json');
      
      const responseBody = JSON.stringify({
        status: "success",
        message: "MCP Server is running",
        timestamp: "{{ $now }}",
        tools: [
          {
            name: "trigger_workflow",
            description: "Trigger an n8n workflow"
          },
          {
            name: "get_workflow_status",
            description: "Get workflow execution status"
          },
          {
            name: "list_workflows",
            description: "List all workflows"
          }
        ]
      }, null, 2);
      
      await this.page.type('textarea[name="responseBody"]', responseBody);
      
      // Connect nodes
      await this.page.dragAndDrop('.webhook-node', '.respond-node');
      
      // Save workflow
      await this.page.click('button[data-test-id="workflow-save"]');
      await this.page.type('input[name="workflowName"]', 'MCP Server Workflow');
      await this.page.click('button[data-test-id="workflow-save-confirm"]');
      
      // Activate workflow
      await this.page.click('button[data-test-id="workflow-activate"]');
      
      console.log('✅ MCP Server Workflow created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating MCP workflow:', error.message);
    }
  }

  async createContentWorkflow() {
    console.log('📝 Creating Content Generation Workflow...');
    
    try {
      // Navigate to new workflow
      await this.page.click('button[data-test-id="workflow-new"]');
      await this.page.waitForSelector('.workflow-canvas', { timeout: 10000 });
      
      // Add Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Webhook Node
      await this.page.waitForSelector('.webhook-node-config');
      await this.page.select('select[name="httpMethod"]', 'POST');
      await this.page.type('input[name="path"]', 'content');
      await this.page.click('input[name="respondWithAllData"]');
      
      // Add HTTP Request Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'http request');
      await this.page.click('.node-creator-item');
      
      // Configure HTTP Request Node
      await this.page.waitForSelector('.http-request-node-config');
      await this.page.select('select[name="method"]', 'POST');
      await this.page.type('input[name="url"]', 'https://api.openai.com/v1/chat/completions');
      
      // Add headers
      await this.page.click('button[data-test-id="add-header"]');
      await this.page.type('input[name="headerName"]', 'Authorization');
      await this.page.type('input[name="headerValue"]', 'Bearer YOUR_OPENAI_KEY');
      
      // Add body
      const requestBody = JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: "{{ $json.prompt }}"
          }
        ]
      }, null, 2);
      
      await this.page.type('textarea[name="body"]', requestBody);
      
      // Add Respond to Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'respond to webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Respond Node
      await this.page.waitForSelector('.respond-node-config');
      await this.page.select('select[name="responseMode"]', 'json');
      await this.page.type('textarea[name="responseBody"]', '{{ $json.choices[0].message.content }}');
      
      // Connect nodes
      await this.page.dragAndDrop('.webhook-node', '.http-request-node');
      await this.page.dragAndDrop('.http-request-node', '.respond-node');
      
      // Save workflow
      await this.page.click('button[data-test-id="workflow-save"]');
      await this.page.type('input[name="workflowName"]', 'Content Generation Workflow');
      await this.page.click('button[data-test-id="workflow-save-confirm"]');
      
      // Activate workflow
      await this.page.click('button[data-test-id="workflow-activate"]');
      
      console.log('✅ Content Generation Workflow created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating Content workflow:', error.message);
    }
  }

  async createCarouselWorkflow() {
    console.log('🎠 Creating Carousel Automation Workflow...');
    
    try {
      // Navigate to new workflow
      await this.page.click('button[data-test-id="workflow-new"]');
      await this.page.waitForSelector('.workflow-canvas', { timeout: 10000 });
      
      // Add Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Webhook Node
      await this.page.waitForSelector('.webhook-node-config');
      await this.page.select('select[name="httpMethod"]', 'POST');
      await this.page.type('input[name="path"]', 'carousel');
      await this.page.click('input[name="respondWithAllData"]');
      
      // Add Code Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'code');
      await this.page.click('.node-creator-item');
      
      // Configure Code Node
      await this.page.waitForSelector('.code-node-config');
      const carouselCode = `
        const topic = $input.first().json.topic || 'healing';
        const style = $input.first().json.style || 'healing';
        
        const carousel = {
          topic: topic,
          style: style,
          slides: [
            { title: \`Slide 1: \${topic}\`, content: 'Introduction' },
            { title: \`Slide 2: \${topic}\`, content: 'Key Points' },
            { title: \`Slide 3: \${topic}\`, content: 'Conclusion' }
          ],
          timestamp: new Date().toISOString()
        };
        
        return [{ json: carousel }];
      `;
      
      await this.page.type('textarea[name="code"]', carouselCode);
      
      // Add Respond to Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'respond to webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Respond Node
      await this.page.waitForSelector('.respond-node-config');
      await this.page.select('select[name="responseMode"]', 'json');
      await this.page.type('textarea[name="responseBody"]', '{{ $json }}');
      
      // Connect nodes
      await this.page.dragAndDrop('.webhook-node', '.code-node');
      await this.page.dragAndDrop('.code-node', '.respond-node');
      
      // Save workflow
      await this.page.click('button[data-test-id="workflow-save"]');
      await this.page.type('input[name="workflowName"]', 'Carousel Automation Workflow');
      await this.page.click('button[data-test-id="workflow-save-confirm"]');
      
      // Activate workflow
      await this.page.click('button[data-test-id="workflow-activate"]');
      
      console.log('✅ Carousel Automation Workflow created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating Carousel workflow:', error.message);
    }
  }

  async createMonitorWorkflow() {
    console.log('📊 Creating Portfolio Monitor Workflow...');
    
    try {
      // Navigate to new workflow
      await this.page.click('button[data-test-id="workflow-new"]');
      await this.page.waitForSelector('.workflow-canvas', { timeout: 10000 });
      
      // Add Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Webhook Node
      await this.page.waitForSelector('.webhook-node-config');
      await this.page.select('select[name="httpMethod"]', 'GET');
      await this.page.type('input[name="path"]', 'monitor');
      await this.page.click('input[name="respondWithAllData"]');
      
      // Add HTTP Request Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'http request');
      await this.page.click('.node-creator-item');
      
      // Configure HTTP Request Node
      await this.page.waitForSelector('.http-request-node-config');
      await this.page.select('select[name="method"]', 'GET');
      await this.page.type('input[name="url"]', 'https://chudinnorukam.github.io');
      
      // Add Respond to Webhook Node
      await this.page.click('.node-creator');
      await this.page.type('.node-creator input', 'respond to webhook');
      await this.page.click('.node-creator-item');
      
      // Configure Respond Node
      await this.page.waitForSelector('.respond-node-config');
      await this.page.select('select[name="responseMode"]', 'json');
      const monitorResponse = JSON.stringify({
        status: "{{ $json.status }}",
        url: "https://chudinnorukam.github.io",
        timestamp: "{{ $now }}"
      }, null, 2);
      
      await this.page.type('textarea[name="responseBody"]', monitorResponse);
      
      // Connect nodes
      await this.page.dragAndDrop('.webhook-node', '.http-request-node');
      await this.page.dragAndDrop('.http-request-node', '.respond-node');
      
      // Save workflow
      await this.page.click('button[data-test-id="workflow-save"]');
      await this.page.type('input[name="workflowName"]', 'Portfolio Monitor Workflow');
      await this.page.click('button[data-test-id="workflow-save-confirm"]');
      
      // Activate workflow
      await this.page.click('button[data-test-id="workflow-activate"]');
      
      console.log('✅ Portfolio Monitor Workflow created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating Monitor workflow:', error.message);
    }
  }

  async createAllWorkflows() {
    try {
      await this.init();
      
      console.log('🎯 Creating all workflows...\n');
      
      await this.createMCPWorkflow();
      await this.page.waitForTimeout(2000);
      
      await this.createContentWorkflow();
      await this.page.waitForTimeout(2000);
      
      await this.createCarouselWorkflow();
      await this.page.waitForTimeout(2000);
      
      await this.createMonitorWorkflow();
      await this.page.waitForTimeout(2000);
      
      console.log('\n🎉 All workflows created successfully!');
      console.log('🔗 Test the workflows:');
      console.log('   curl http://localhost:5678/webhook/mcp');
      console.log('   curl -X POST http://localhost:5678/webhook/content -H "Content-Type: application/json" -d \'{"prompt": "test"}\'');
      console.log('   curl -X POST http://localhost:5678/webhook/carousel -H "Content-Type: application/json" -d \'{"topic": "healing"}\'');
      console.log('   curl http://localhost:5678/webhook/monitor');
      
    } catch (error) {
      console.error('❌ Error creating workflows:', error.message);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new N8nWorkflowCreator();
  creator.createAllWorkflows();
}

module.exports = N8nWorkflowCreator; 