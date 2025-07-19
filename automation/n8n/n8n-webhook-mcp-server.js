const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');

class N8nWebhookMCPServer {
  constructor() {
    this.baseUrl = 'http://localhost:5678';
    
    this.server = new Server(
      {
        name: 'n8n-webhook-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'test_mcp_webhook',
            description: 'Test the MCP webhook endpoint',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'test_carousel_webhook',
            description: 'Test the carousel webhook with topic and style',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  description: 'Topic for carousel (e.g., trauma healing)',
                  default: 'healing'
                },
                style: {
                  type: 'string',
                  description: 'Style for carousel (e.g., healing)',
                  default: 'healing'
                }
              }
            }
          },
          {
            name: 'test_monitor_webhook',
            description: 'Test the portfolio monitor webhook',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'create_mcp_workflow',
            description: 'Create the MCP Server workflow via webhook',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'create_carousel_workflow',
            description: 'Create the Carousel Automation workflow via webhook',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'create_monitor_workflow',
            description: 'Create the Portfolio Monitor workflow via webhook',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'list_webhook_status',
            description: 'Check status of all webhook endpoints',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'test_mcp_webhook':
            return await this.testMCPWebhook();
          case 'test_carousel_webhook':
            return await this.testCarouselWebhook(args);
          case 'test_monitor_webhook':
            return await this.testMonitorWebhook();
          case 'create_mcp_workflow':
            return await this.createMCPWorkflow();
          case 'create_carousel_workflow':
            return await this.createCarouselWorkflow();
          case 'create_monitor_workflow':
            return await this.createMonitorWorkflow();
          case 'list_webhook_status':
            return await this.listWebhookStatus();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async testMCPWebhook() {
    try {
      const response = await axios.get(`${this.baseUrl}/webhook/mcp`, { timeout: 5000 });
      return {
        content: [
          {
            type: 'text',
            text: `✅ MCP Webhook Test Successful!\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ MCP Webhook Test Failed: ${error.message}\nStatus: ${error.response?.status || 'Unknown'}\nHint: Create the MCP Server workflow in n8n interface`
          }
        ]
      };
    }
  }

  async testCarouselWebhook(args) {
    const { topic = 'healing', style = 'healing' } = args;
    
    try {
      const response = await axios.post(`${this.baseUrl}/webhook/carousel`, {
        topic,
        style
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Carousel Webhook Test Successful!\nTopic: ${topic}\nStyle: ${style}\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Carousel Webhook Test Failed: ${error.message}\nStatus: ${error.response?.status || 'Unknown'}\nHint: Create the Carousel Automation workflow in n8n interface`
          }
        ]
      };
    }
  }

  async testMonitorWebhook() {
    try {
      const response = await axios.get(`${this.baseUrl}/webhook/monitor`, { timeout: 5000 });
      return {
        content: [
          {
            type: 'text',
            text: `✅ Monitor Webhook Test Successful!\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Monitor Webhook Test Failed: ${error.message}\nStatus: ${error.response?.status || 'Unknown'}\nHint: Create the Portfolio Monitor workflow in n8n interface`
          }
        ]
      };
    }
  }

  async createMCPWorkflow() {
    return {
      content: [
        {
          type: 'text',
          text: `📋 To create the MCP Server workflow:

1. Open http://localhost:5678 in your browser
2. Click "Add Workflow"
3. Add a Webhook node:
   - HTTP Method: GET
   - Path: mcp
   - Check "Respond with all data"
4. Add a Respond to Webhook node:
   - Response Mode: JSON
   - Response Body: Copy this exactly:
   {
     "status": "success",
     "message": "MCP Server is running",
     "timestamp": "{{ $now }}",
     "tools": [
       {
         "name": "trigger_workflow",
         "description": "Trigger an n8n workflow"
       },
       {
         "name": "get_workflow_status",
         "description": "Get workflow execution status"
       },
       {
         "name": "list_workflows",
         "description": "List all workflows"
       }
     ]
   }
5. Connect the nodes
6. Save as "MCP Server Workflow"
7. Activate the workflow

Then test with: test_mcp_webhook`
        }
      ]
    };
  }

  async createCarouselWorkflow() {
    return {
      content: [
        {
          type: 'text',
          text: `🎠 To create the Carousel Automation workflow:

1. Open http://localhost:5678 in your browser
2. Click "Add Workflow"
3. Add a Webhook node:
   - HTTP Method: POST
   - Path: carousel
   - Check "Respond with all data"
4. Add a Code node:
   - Paste this JavaScript:
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
5. Add a Respond to Webhook node:
   - Response Mode: JSON
   - Response Body: {{ $json }}
6. Connect: Webhook → Code → Respond
7. Save as "Carousel Automation Workflow"
8. Activate the workflow

Then test with: test_carousel_webhook`
        }
      ]
    };
  }

  async createMonitorWorkflow() {
    return {
      content: [
        {
          type: 'text',
          text: `📊 To create the Portfolio Monitor workflow:

1. Open http://localhost:5678 in your browser
2. Click "Add Workflow"
3. Add a Webhook node:
   - HTTP Method: GET
   - Path: monitor
   - Check "Respond with all data"
4. Add an HTTP Request node:
   - Method: GET
   - URL: https://chudinnorukam.github.io
5. Add a Respond to Webhook node:
   - Response Mode: JSON
   - Response Body:
   {
     "status": "{{ $json.status }}",
     "url": "https://chudinnorukam.github.io",
     "timestamp": "{{ $now }}"
   }
6. Connect: Webhook → HTTP Request → Respond
7. Save as "Portfolio Monitor Workflow"
8. Activate the workflow

Then test with: test_monitor_webhook`
        }
      ]
    };
  }

  async listWebhookStatus() {
    const webhooks = [
      { name: 'MCP Server', path: '/webhook/mcp', method: 'GET' },
      { name: 'Carousel Automation', path: '/webhook/carousel', method: 'POST' },
      { name: 'Portfolio Monitor', path: '/webhook/monitor', method: 'GET' }
    ];

    let statusReport = '📋 Webhook Status Report:\n\n';

    for (const webhook of webhooks) {
      try {
        const config = {
          method: webhook.method,
          url: `${this.baseUrl}${webhook.path}`,
          timeout: 3000
        };

        if (webhook.method === 'POST') {
          config.headers = { 'Content-Type': 'application/json' };
          config.data = { topic: 'test', style: 'test' };
        }

        const response = await axios(config);
        statusReport += `✅ ${webhook.name}: ACTIVE (${response.status})\n`;
      } catch (error) {
        if (error.response?.status === 404) {
          statusReport += `❌ ${webhook.name}: NOT CREATED\n`;
        } else {
          statusReport += `⚠️  ${webhook.name}: ERROR (${error.message})\n`;
        }
      }
    }

    statusReport += '\n💡 Use the create_*_workflow tools to set up missing workflows.';

    return {
      content: [
        {
          type: 'text',
          text: statusReport
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n Webhook MCP Server started');
  }
}

const server = new N8nWebhookMCPServer();
server.run().catch(console.error); 