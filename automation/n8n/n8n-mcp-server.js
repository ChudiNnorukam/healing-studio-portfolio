const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');

class N8nMCPServer {
  constructor() {
    this.baseUrl = 'http://localhost:5678';
    this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI';
    
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
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
            name: 'trigger_workflow',
            description: 'Trigger an n8n workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                workflow_id: {
                  type: 'string',
                  description: 'The ID of the workflow to trigger'
                },
                data: {
                  type: 'object',
                  description: 'Data to pass to the workflow'
                }
              },
              required: ['workflow_id']
            }
          },
          {
            name: 'get_workflow_status',
            description: 'Get workflow execution status',
            inputSchema: {
              type: 'object',
              properties: {
                execution_id: {
                  type: 'string',
                  description: 'The execution ID to check'
                }
              },
              required: ['execution_id']
            }
          },
          {
            name: 'list_workflows',
            description: 'List all available workflows',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'create_workflow',
            description: 'Create a new workflow',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the workflow'
                },
                nodes: {
                  type: 'array',
                  description: 'Array of workflow nodes'
                },
                connections: {
                  type: 'object',
                  description: 'Node connections'
                }
              },
              required: ['name']
            }
          },
          {
            name: 'activate_workflow',
            description: 'Activate a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                workflow_id: {
                  type: 'string',
                  description: 'The ID of the workflow to activate'
                }
              },
              required: ['workflow_id']
            }
          },
          {
            name: 'test_webhook',
            description: 'Test a webhook endpoint',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Webhook path to test (e.g., /webhook/mcp)'
                },
                method: {
                  type: 'string',
                  description: 'HTTP method (GET, POST)',
                  default: 'GET'
                },
                data: {
                  type: 'object',
                  description: 'Data to send with POST request'
                }
              },
              required: ['path']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'trigger_workflow':
            return await this.triggerWorkflow(args);
          case 'get_workflow_status':
            return await this.getWorkflowStatus(args);
          case 'list_workflows':
            return await this.listWorkflows();
          case 'create_workflow':
            return await this.createWorkflow(args);
          case 'activate_workflow':
            return await this.activateWorkflow(args);
          case 'test_webhook':
            return await this.testWebhook(args);
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

  async makeRequest(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      url: `${this.baseUrl}/rest${endpoint}`,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }

  async triggerWorkflow(args) {
    const { workflow_id, data } = args;
    const result = await this.makeRequest(`/workflows/${workflow_id}/trigger`, 'POST', data);
    
    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${workflow_id} triggered successfully. Execution ID: ${result.executionId || 'N/A'}`
        }
      ]
    };
  }

  async getWorkflowStatus(args) {
    const { execution_id } = args;
    const result = await this.makeRequest(`/executions/${execution_id}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Execution ${execution_id} status: ${result.status || 'Unknown'}`
        }
      ]
    };
  }

  async listWorkflows() {
    const workflows = await this.makeRequest('/workflows');
    
    const workflowList = workflows.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      createdAt: wf.createdAt
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${workflows.length} workflows:\n\n${workflowList.map(wf => 
            `- ${wf.name} (ID: ${wf.id}, Active: ${wf.active})`
          ).join('\n')}`
        }
      ]
    };
  }

  async createWorkflow(args) {
    const { name, nodes = [], connections = {} } = args;
    
    const workflow = {
      name,
      nodes,
      connections,
      active: false
    };

    const result = await this.makeRequest('/workflows', 'POST', workflow);
    
    return {
      content: [
        {
          type: 'text',
          text: `Workflow "${name}" created successfully with ID: ${result.id}`
        }
      ]
    };
  }

  async activateWorkflow(args) {
    const { workflow_id } = args;
    const result = await this.makeRequest(`/workflows/${workflow_id}/activate`, 'POST');
    
    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${workflow_id} activated successfully`
        }
      ]
    };
  }

  async testWebhook(args) {
    const { path, method = 'GET', data } = args;
    
    const config = {
      method,
      url: `${this.baseUrl}${path}`,
      timeout: 10000
    };

    if (data && method === 'POST') {
      config.headers = { 'Content-Type': 'application/json' };
      config.data = data;
    }

    try {
      const response = await axios(config);
      return {
        content: [
          {
            type: 'text',
            text: `Webhook test successful!\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Webhook test failed: ${error.message}\nStatus: ${error.response?.status || 'Unknown'}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n MCP Server started with API key authentication');
  }
}

const server = new N8nMCPServer();
server.run().catch(console.error); 