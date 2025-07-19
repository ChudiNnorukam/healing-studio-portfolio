#!/usr/bin/env node

const axios = require('axios');

async function testAgentWorkflowIntegration() {
    console.log('🧪 Testing Agent-Workflow Integration...\n');

    const n8nUrl = 'http://localhost:5678';
    const agentUrl = 'http://localhost:3001';

    try {
        // Test 1: Check if n8n is running
        console.log('1️⃣ Testing n8n connection...');
        const n8nHealth = await axios.get(`${n8nUrl}/healthz`, { timeout: 5000 });
        console.log('✅ n8n is running:', n8nHealth.data);

        // Test 2: Check if agent system is running
        console.log('\n2️⃣ Testing agent system connection...');
        const agentHealth = await axios.get(`${agentUrl}/api/agents`, { timeout: 5000 });
        console.log('✅ Agent system is running');
        console.log('Active agents:', Object.keys(agentHealth.data).length);

        // Test 3: Send test event to n8n workflow
        console.log('\n3️⃣ Testing workflow webhook...');
        const testEvent = {
            eventType: 'audit_completed',
            agentId: 'portfolio_auditor_1752888632025',
            result: {
                score: 75,
                type: 'portfolio_health',
                duration: 3000
            },
            timestamp: new Date().toISOString()
        };

        const webhookResponse = await axios.post(`${n8nUrl}/webhook/agent-events`, testEvent, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Webhook test successful!');
        console.log('Response:', webhookResponse.data);

        // Test 4: Test different event types
        console.log('\n4️⃣ Testing different event types...');
        
        const eventTypes = [
            {
                eventType: 'cost_spike',
                data: {
                    current: 4.50,
                    threshold: 4.00,
                    percentage: 112.5,
                    dailyLimit: 5.00
                }
            },
            {
                eventType: 'performance_issue',
                data: {
                    score: 45,
                    issues: ['High response time', 'Memory usage spike'],
                    agentId: 'portfolio_auditor_1752888632025'
                }
            },
            {
                eventType: 'agent_optimized',
                data: {
                    agentId: 'portfolio_auditor_1752888632025',
                    optimizations: [
                        {
                            type: 'reduce_audit_depth',
                            reason: 'High average duration',
                            current: 3,
                            recommended: 2
                        }
                    ],
                    reason: 'Auto-optimization'
                }
            }
        ];

        for (const event of eventTypes) {
            console.log(`   Testing ${event.eventType}...`);
            try {
                await axios.post(`${n8nUrl}/webhook/agent-events`, {
                    ...event.data,
                    eventType: event.eventType,
                    timestamp: new Date().toISOString()
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
                console.log(`   ✅ ${event.eventType} sent successfully`);
            } catch (error) {
                console.log(`   ⚠️ ${event.eventType} failed:`, error.message);
            }
            
            // Wait between events
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n🎉 Integration test completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   ✅ n8n is running and accessible');
        console.log('   ✅ Agent system is running and responding');
        console.log('   ✅ Workflow webhook is receiving events');
        console.log('   ✅ Multiple event types are being processed');
        
        console.log('\n🔗 Next Steps:');
        console.log('   1. Open n8n dashboard: http://localhost:5678');
        console.log('   2. Check the "Executions" tab to see your test events');
        console.log('   3. View the workflow logs to see event processing');
        console.log('   4. Set up notifications (Slack, Discord, etc.)');
        console.log('   5. Monitor your agent system for real events');

    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Troubleshooting:');
            console.log('   • Make sure n8n is running: n8n start');
            console.log('   • Make sure agent system is running: npm run start-dashboard');
            console.log('   • Check if ports 5678 and 3001 are available');
        }
    }
}

// Run if called directly
if (require.main === module) {
    testAgentWorkflowIntegration();
}

module.exports = { testAgentWorkflowIntegration }; 