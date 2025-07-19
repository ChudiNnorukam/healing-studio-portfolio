const axios = require('axios');

async function testN8nConnection() {
    const n8nUrl = 'http://localhost:5678';
    
    try {
        console.log('🔍 Testing n8n connection...');
        
        // Test basic connection
        const response = await axios.get(`${n8nUrl}/healthz`, { timeout: 5000 });
        console.log('✅ n8n is running!');
        console.log('Status:', response.status);
        
        // Test API
        const apiResponse = await axios.get(`${n8nUrl}/rest/workflows`, {
            headers: {
                'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI'
            },
            timeout: 5000
        });
        
        console.log('✅ n8n API is accessible!');
        console.log('Workflows found:', apiResponse.data.length);
        
        return true;
    } catch (error) {
        console.error('❌ n8n connection failed:', error.message);
        return false;
    }
}

async function createSimpleWorkflow() {
    const n8nUrl = 'http://localhost:5678';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI';
    
    const simpleWorkflow = {
        name: "Simple Agent Test Workflow",
        active: true,
        nodes: [
            {
                id: "webhook-trigger",
                name: "Agent Test Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                webhookId: "agent-test",
                parameters: {
                    httpMethod: "POST",
                    path: "agent-test",
                    responseMode: "responseNode",
                    options: {}
                }
            },
            {
                id: "code-processor",
                name: "Process Event",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300],
                parameters: {
                    jsCode: `
// Process the incoming event
const event = $input.first().json;

console.log('Received event:', JSON.stringify(event, null, 2));

// Create a simple response
const response = {
    received: true,
    eventType: event.eventType || 'unknown',
    timestamp: new Date().toISOString(),
    message: 'Event processed successfully'
};

return [{
    json: response
}];
                    `
                }
            },
            {
                id: "webhook-response",
                name: "Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300],
                parameters: {
                    options: {}
                }
            }
        ],
        connections: {
            "Agent Test Webhook": {
                main: [
                    [
                        {
                            node: "Process Event",
                            type: "main",
                            index: 0
                        }
                    ]
                ]
            },
            "Process Event": {
                main: [
                    [
                        {
                            node: "Response",
                            type: "main",
                            index: 0
                        }
                    ]
                ]
            }
        }
    };
    
    try {
        console.log('📦 Creating simple test workflow...');
        
        const response = await axios.post(`${n8nUrl}/rest/workflows`, simpleWorkflow, {
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Simple workflow created successfully!');
        console.log('Workflow ID:', response.data.id);
        console.log('Webhook URL:', `${n8nUrl}/webhook/agent-test`);
        
        return response.data;
    } catch (error) {
        console.error('❌ Failed to create workflow:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

async function testWorkflow(workflowId) {
    const n8nUrl = 'http://localhost:5678';
    
    try {
        console.log('🧪 Testing workflow...');
        
        const testEvent = {
            eventType: 'test',
            message: 'Hello from custom agent system!',
            timestamp: new Date().toISOString()
        };
        
        const response = await axios.post(`${n8nUrl}/webhook/agent-test`, testEvent, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Workflow test successful!');
        console.log('Response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Workflow test failed:', error.message);
        throw error;
    }
}

async function main() {
    try {
        // Test n8n connection
        const isConnected = await testN8nConnection();
        if (!isConnected) {
            console.log('❌ Cannot proceed without n8n connection');
            return;
        }
        
        // Create simple workflow
        const workflow = await createSimpleWorkflow();
        
        // Test the workflow
        await testWorkflow(workflow.id);
        
        console.log('\n🎉 Simple workflow test completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. Open n8n dashboard: http://localhost:5678');
        console.log('2. View your workflow: "Simple Agent Test Workflow"');
        console.log('3. Check the execution logs');
        console.log('4. Proceed with the full autonomous workflow');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { testN8nConnection, createSimpleWorkflow, testWorkflow }; 