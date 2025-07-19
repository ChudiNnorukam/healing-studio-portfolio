#!/usr/bin/env node

const axios = require('axios');

class SimpleWorkflowCreator {
  constructor() {
    this.baseUrl = 'http://localhost:5678';
    this.apiKey = null;
  }

  async getApiKey() {
    try {
      // Try to get the API key from n8n settings
      const response = await axios.get(`${this.baseUrl}/rest/settings`);
      console.log('✅ Connected to n8n API');
      return true;
    } catch (error) {
      console.log('⚠️  API requires authentication. Let me try a different approach...');
      return false;
    }
  }

  async createMCPWorkflow() {
    console.log('📋 Creating MCP Server Workflow...');
    
    const workflow = {
      name: 'MCP Server Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook-node',
          name: 'MCP Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            httpMethod: 'GET',
            path: 'mcp',
            responseMode: 'responseNode',
            options: {}
          }
        },
        {
          id: 'respond-node',
          name: 'MCP Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [460, 300],
          parameters: {
            respondWith: 'json',
            responseBody: JSON.stringify({
              status: 'success',
              message: 'MCP Server is running',
              timestamp: '{{ $now }}',
              tools: [
                {
                  name: 'trigger_workflow',
                  description: 'Trigger an n8n workflow'
                },
                {
                  name: 'get_workflow_status',
                  description: 'Get workflow execution status'
                },
                {
                  name: 'list_workflows',
                  description: 'List all workflows'
                }
              ]
            })
          }
        }
      ],
      connections: {
        'MCP Webhook': {
          main: [
            [
              {
                node: 'MCP Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}/rest/workflows`, workflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ MCP Server Workflow created successfully!');
      console.log(`   ID: ${response.data.id}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error creating MCP workflow:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      return null;
    }
  }

  async createCarouselWorkflow() {
    console.log('🎠 Creating Carousel Automation Workflow...');
    
    const workflow = {
      name: 'Carousel Automation Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook-node',
          name: 'Carousel Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'carousel',
            responseMode: 'responseNode',
            options: {}
          }
        },
        {
          id: 'code-node',
          name: 'Carousel Generator',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [460, 300],
          parameters: {
            jsCode: `
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
            `
          }
        },
        {
          id: 'respond-node',
          name: 'Carousel Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [680, 300],
          parameters: {
            respondWith: 'json',
            responseBody: '{{ $json }}'
          }
        }
      ],
      connections: {
        'Carousel Webhook': {
          main: [
            [
              {
                node: 'Carousel Generator',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Carousel Generator': {
          main: [
            [
              {
                node: 'Carousel Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}/rest/workflows`, workflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Carousel Automation Workflow created successfully!');
      console.log(`   ID: ${response.data.id}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error creating Carousel workflow:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      return null;
    }
  }

  async createMonitorWorkflow() {
    console.log('📊 Creating Portfolio Monitor Workflow...');
    
    const workflow = {
      name: 'Portfolio Monitor Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook-node',
          name: 'Monitor Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            httpMethod: 'GET',
            path: 'monitor',
            responseMode: 'responseNode',
            options: {}
          }
        },
        {
          id: 'http-request-node',
          name: 'Check Portfolio',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [460, 300],
          parameters: {
            method: 'GET',
            url: 'https://chudinnorukam.github.io',
            options: {}
          }
        },
        {
          id: 'respond-node',
          name: 'Monitor Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [680, 300],
          parameters: {
            respondWith: 'json',
            responseBody: JSON.stringify({
              status: '{{ $json.status }}',
              url: 'https://chudinnorukam.github.io',
              timestamp: '{{ $now }}'
            })
          }
        }
      ],
      connections: {
        'Monitor Webhook': {
          main: [
            [
              {
                node: 'Check Portfolio',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Check Portfolio': {
          main: [
            [
              {
                node: 'Monitor Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}/rest/workflows`, workflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Portfolio Monitor Workflow created successfully!');
      console.log(`   ID: ${response.data.id}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error creating Monitor workflow:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      return null;
    }
  }

  async createAllWorkflows() {
    console.log('🎯 Creating workflows via REST API...\n');
    
    const apiAvailable = await this.getApiKey();
    
    if (!apiAvailable) {
      console.log('❌ Cannot access n8n API without authentication');
      console.log('📝 Please create workflows manually in the n8n interface:');
      console.log('   1. Open http://localhost:5678 in your browser');
      console.log('   2. Follow the guide in setup-n8n-workflows.md');
      return;
    }
    
    const results = [];
    
    results.push(await this.createMCPWorkflow());
    results.push(await this.createCarouselWorkflow());
    results.push(await this.createMonitorWorkflow());
    
    const successful = results.filter(r => r !== null).length;
    console.log(`\n🎉 Created ${successful} out of 3 workflows successfully!`);
    
    if (successful > 0) {
      console.log('\n🔗 Test the workflows:');
      console.log('   curl http://localhost:5678/webhook/mcp');
      console.log('   curl -X POST http://localhost:5678/webhook/carousel -H "Content-Type: application/json" -d \'{"topic": "healing"}\'');
      console.log('   curl http://localhost:5678/webhook/monitor');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new SimpleWorkflowCreator();
  creator.createAllWorkflows();
}

module.exports = SimpleWorkflowCreator; 