const axios = require('axios');

async function createBasicWorkflow() {
    const n8nUrl = 'http://localhost:5678';
    
    const basicWorkflow = {
        name: "Basic Agent Monitor",
        active: true,
        nodes: [
            {
                id: "webhook-trigger",
                name: "Agent Events",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                webhookId: "agent-events",
                parameters: {
                    httpMethod: "POST",
                    path: "agent-events",
                    responseMode: "responseNode",
                    options: {}
                }
            },
            {
                id: "log-event",
                name: "Log Event",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300],
                parameters: {
                    jsCode: `
// Log the incoming event
const event = $input.first().json;

console.log('🤖 Agent Event Received:');
console.log('Event Type:', event.eventType);
console.log('Timestamp:', event.timestamp);
console.log('Data:', JSON.stringify(event, null, 2));

// Create a response
const response = {
    status: 'processed',
    eventType: event.eventType,
    receivedAt: new Date().toISOString(),
    message: 'Event logged successfully'
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
            "Agent Events": {
                main: [
                    [
                        {
                            node: "Log Event",
                            type: "main",
                            index: 0
                        }
                    ]
                ]
            },
            "Log Event": {
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
        console.log('📦 Creating basic workflow...');
        
        // Try without authentication first
        const response = await axios.post(`${n8nUrl}/rest/workflows`, basicWorkflow, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Basic workflow created successfully!');
        console.log('Workflow ID:', response.data.id);
        console.log('Webhook URL:', `${n8nUrl}/webhook/agent-events`);
        
        return response.data;
    } catch (error) {
        console.error('❌ Failed to create workflow:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

async function testBasicWorkflow() {
    const n8nUrl = 'http://localhost:5678';
    
    try {
        console.log('🧪 Testing basic workflow...');
        
        const testEvent = {
            eventType: 'audit_completed',
            agentId: 'portfolio_auditor_1752888632025',
            result: {
                score: 85,
                type: 'portfolio_health',
                duration: 2500
            },
            timestamp: new Date().toISOString()
        };
        
        const response = await axios.post(`${n8nUrl}/webhook/agent-events`, testEvent, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Basic workflow test successful!');
        console.log('Response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Basic workflow test failed:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Creating Basic Agent Workflow...\n');
        
        // Create basic workflow
        const workflow = await createBasicWorkflow();
        
        // Test the workflow
        await testBasicWorkflow();
        
        console.log('\n🎉 Basic workflow setup completed!');
        console.log('\n📋 Workflow Details:');
        console.log(`   • Name: ${workflow.name}`);
        console.log(`   • ID: ${workflow.id}`);
        console.log(`   • Webhook: ${n8nUrl}/webhook/agent-events`);
        console.log(`   • n8n Dashboard: ${n8nUrl}`);
        
        console.log('\n🔗 Integration with Custom Agent:');
        console.log('   Your custom agent system can now send events to this workflow!');
        console.log('   The workflow will log all events and respond with confirmation.');
        
        console.log('\n📊 Next Steps:');
        console.log('   1. Open n8n dashboard: http://localhost:5678');
        console.log('   2. View your workflow: "Basic Agent Monitor"');
        console.log('   3. Check execution logs for incoming events');
        console.log('   4. Enhance the workflow with more sophisticated processing');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { createBasicWorkflow, testBasicWorkflow }; 