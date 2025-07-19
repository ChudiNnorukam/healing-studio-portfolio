#!/usr/bin/env node

const axios = require('axios');

async function createQuickWorkflow() {
    console.log('🚀 Creating Quick Agent Workflow...\n');

    const n8nUrl = 'http://localhost:5678';
    
    // Try different approaches to create the workflow
    const approaches = [
        {
            name: 'Direct API (no auth)',
            method: 'POST',
            url: `${n8nUrl}/rest/workflows`,
            headers: { 'Content-Type': 'application/json' }
        },
        {
            name: 'Direct API (with auth)',
            method: 'POST',
            url: `${n8nUrl}/rest/workflows`,
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI'
            }
        }
    ];

    const simpleWorkflow = {
        name: "Quick Agent Monitor",
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

// Create a simple response
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

    for (const approach of approaches) {
        try {
            console.log(`📦 Trying ${approach.name}...`);
            
            const response = await axios({
                method: approach.method,
                url: approach.url,
                headers: approach.headers,
                data: simpleWorkflow,
                timeout: 10000
            });
            
            console.log('✅ Workflow created successfully!');
            console.log('Workflow ID:', response.data.id);
            console.log('Webhook URL:', `${n8nUrl}/webhook/agent-events`);
            
            return response.data;
        } catch (error) {
            console.log(`❌ ${approach.name} failed:`, error.message);
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', error.response.data);
            }
        }
    }

    // If all approaches fail, provide manual instructions
    console.log('\n🔧 All automated approaches failed. Please create the workflow manually:');
    console.log('\n📋 Manual Steps:');
    console.log('1. Open n8n dashboard: http://localhost:5678');
    console.log('2. Click "New Workflow"');
    console.log('3. Name it: "Quick Agent Monitor"');
    console.log('4. Add a Webhook node:');
    console.log('   - HTTP Method: POST');
    console.log('   - Path: agent-events');
    console.log('   - Response Mode: Respond to Webhook');
    console.log('5. Add a Code node with this JavaScript:');
    console.log(`
// Log the incoming event
const event = $input.first().json;

console.log('🤖 Agent Event Received:');
console.log('Event Type:', event.eventType);
console.log('Timestamp:', event.timestamp);
console.log('Data:', JSON.stringify(event, null, 2));

// Create a simple response
const response = {
    status: 'processed',
    eventType: event.eventType,
    receivedAt: new Date().toISOString(),
    message: 'Event logged successfully'
};

return [{
    json: response
}];
    `);
    console.log('6. Connect the nodes and activate the workflow');
    console.log('7. Test with: curl -X POST http://localhost:5678/webhook/agent-events -H "Content-Type: application/json" -d \'{"eventType": "test", "message": "Hello!"}\'');
    
    return null;
}

async function testWebhook() {
    const n8nUrl = 'http://localhost:5678';
    
    try {
        console.log('\n🧪 Testing webhook...');
        
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
        
        console.log('✅ Webhook test successful!');
        console.log('Response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Webhook test failed:', error.message);
        return null;
    }
}

async function main() {
    try {
        // Try to create workflow
        const workflow = await createQuickWorkflow();
        
        if (workflow) {
            // Test the webhook
            await testWebhook();
            
            console.log('\n🎉 Quick workflow setup completed!');
            console.log('\n📋 Next Steps:');
            console.log('1. Open n8n dashboard: http://localhost:5678');
            console.log('2. View your workflow: "Quick Agent Monitor"');
            console.log('3. Check the "Executions" tab to see incoming events');
            console.log('4. Enhance the workflow with more sophisticated processing');
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { createQuickWorkflow, testWebhook }; 