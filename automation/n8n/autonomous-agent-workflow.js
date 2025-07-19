const axios = require('axios');

class AutonomousAgentWorkflow {
    constructor() {
        this.agentDashboardUrl = 'http://localhost:3001';
        this.n8nBaseUrl = 'http://localhost:5678';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI';
    }

    async createAutonomousWorkflow() {
        const workflow = {
            name: "Autonomous Agent Monitor & Responder",
            active: true,
            nodes: [
                // Webhook trigger for agent events
                {
                    id: "webhook-trigger",
                    name: "Agent Event Webhook",
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

                // HTTP Request to get agent status
                {
                    id: "get-agent-status",
                    name: "Get Agent Status",
                    type: "n8n-nodes-base.httpRequest",
                    typeVersion: 4.1,
                    position: [460, 300],
                    parameters: {
                        url: "{{ $json.agentDashboardUrl || 'http://localhost:3001' }}/api/agents",
                        method: "GET",
                        options: {}
                    }
                },

                // Switch node to route based on event type
                {
                    id: "event-router",
                    name: "Route Events",
                    type: "n8n-nodes-base.switch",
                    typeVersion: 3,
                    position: [680, 300],
                    parameters: {
                        rules: {
                            rules: [
                                {
                                    conditions: {
                                        options: {
                                            caseSensitive: true,
                                            leftValue: "",
                                            typeValidation: "strict"
                                        },
                                        conditions: [
                                            {
                                                id: "event-type",
                                                leftValue: "={{ $json.eventType }}",
                                                rightValue: "audit_completed",
                                                operator: {
                                                    type: "string",
                                                    operation: "equals"
                                                }
                                            }
                                        ],
                                        combinator: "and"
                                    },
                                    outputIndex: 0
                                },
                                {
                                    conditions: {
                                        options: {
                                            caseSensitive: true,
                                            leftValue: "",
                                            typeValidation: "strict"
                                        },
                                        conditions: [
                                            {
                                                id: "event-type",
                                                leftValue: "={{ $json.eventType }}",
                                                rightValue: "cost_spike",
                                                operator: {
                                                    type: "string",
                                                    operation: "equals"
                                                }
                                            }
                                        ],
                                        combinator: "and"
                                    },
                                    outputIndex: 1
                                },
                                {
                                    conditions: {
                                        options: {
                                            caseSensitive: true,
                                            leftValue: "",
                                            typeValidation: "strict"
                                        },
                                        conditions: [
                                            {
                                                id: "event-type",
                                                leftValue: "={{ $json.eventType }}",
                                                rightValue: "performance_issue",
                                                operator: {
                                                    type: "string",
                                                    operation: "equals"
                                                }
                                            }
                                        ],
                                        combinator: "and"
                                    },
                                    outputIndex: 2
                                }
                            ]
                        }
                    }
                },

                // Audit Completed Handler
                {
                    id: "audit-completed-handler",
                    name: "Handle Audit Completed",
                    type: "n8n-nodes-base.code",
                    typeVersion: 2,
                    position: [900, 200],
                    parameters: {
                        jsCode: `
// Handle audit completed event
const auditResult = $input.first().json;

// Analyze audit results
const score = auditResult.result.score || auditResult.result.overall || 0;
const type = auditResult.type;
const duration = auditResult.duration;

// Determine action based on score
let action = 'none';
let priority = 'low';

if (score < 50) {
    action = 'immediate_intervention';
    priority = 'high';
} else if (score < 70) {
    action = 'optimization_needed';
    priority = 'medium';
} else if (score < 85) {
    action = 'monitor_closely';
    priority = 'low';
} else {
    action = 'excellent_performance';
    priority = 'low';
}

// Create response
return [{
    json: {
        eventType: 'audit_completed',
        auditResult: auditResult,
        analysis: {
            score: score,
            type: type,
            duration: duration,
            action: action,
            priority: priority,
            timestamp: new Date().toISOString()
        }
    }
}];
                        `
                    }
                },

                // Cost Spike Handler
                {
                    id: "cost-spike-handler",
                    name: "Handle Cost Spike",
                    type: "n8n-nodes-base.code",
                    typeVersion: 2,
                    position: [900, 300],
                    parameters: {
                        jsCode: `
// Handle cost spike event
const costData = $input.first().json;

// Analyze cost spike
const currentCost = costData.current || 0;
const threshold = costData.threshold || 0;
const percentage = costData.percentage || 0;

// Determine severity
let severity = 'low';
let action = 'monitor';

if (percentage > 120) {
    severity = 'critical';
    action = 'immediate_stop';
} else if (percentage > 100) {
    severity = 'high';
    action = 'reduce_usage';
} else if (percentage > 80) {
    severity = 'medium';
    action = 'optimize';
}

// Create response
return [{
    json: {
        eventType: 'cost_spike',
        costData: costData,
        analysis: {
            severity: severity,
            action: action,
            currentCost: currentCost,
            threshold: threshold,
            percentage: percentage,
            timestamp: new Date().toISOString()
        }
    }
}];
                        `
                    }
                },

                // Performance Issue Handler
                {
                    id: "performance-issue-handler",
                    name: "Handle Performance Issue",
                    type: "n8n-nodes-base.code",
                    typeVersion: 2,
                    position: [900, 400],
                    parameters: {
                        jsCode: `
// Handle performance issue event
const perfData = $input.first().json;

// Analyze performance issue
const score = perfData.score || 0;
const issues = perfData.issues || [];

// Determine impact
let impact = 'low';
let action = 'monitor';

if (score < 30) {
    impact = 'critical';
    action = 'immediate_fix';
} else if (score < 50) {
    impact = 'high';
    action = 'urgent_optimization';
} else if (score < 70) {
    impact = 'medium';
    action = 'optimization';
}

// Create response
return [{
    json: {
        eventType: 'performance_issue',
        perfData: perfData,
        analysis: {
            impact: impact,
            action: action,
            score: score,
            issueCount: issues.length,
            timestamp: new Date().toISOString()
        }
    }
}];
                        `
                    }
                },

                // Action Executor
                {
                    id: "action-executor",
                    name: "Execute Actions",
                    type: "n8n-nodes-base.code",
                    typeVersion: 2,
                    position: [1120, 300],
                    parameters: {
                        jsCode: `
// Execute actions based on analysis
const analysis = $input.first().json.analysis;
const eventType = $input.first().json.eventType;

let actions = [];
let notifications = [];

// Determine actions based on event type and analysis
if (eventType === 'audit_completed') {
    if (analysis.action === 'immediate_intervention') {
        actions.push({
            type: 'optimize_agent',
            priority: 'high',
            description: 'Immediate agent optimization needed'
        });
        notifications.push({
            type: 'alert',
            message: 'Critical audit score: ' + analysis.score + '. Immediate intervention required.'
        });
    } else if (analysis.action === 'optimization_needed') {
        actions.push({
            type: 'schedule_optimization',
            priority: 'medium',
            description: 'Schedule agent optimization'
        });
        notifications.push({
            type: 'warning',
            message: 'Audit score ' + analysis.score + ' requires optimization.'
        });
    }
} else if (eventType === 'cost_spike') {
    if (analysis.action === 'immediate_stop') {
        actions.push({
            type: 'stop_expensive_operations',
            priority: 'critical',
            description: 'Stop expensive operations immediately'
        });
        notifications.push({
            type: 'critical',
            message: 'Cost spike detected: ' + analysis.percentage + '% of limit. Stopping operations.'
        });
    } else if (analysis.action === 'reduce_usage') {
        actions.push({
            type: 'reduce_concurrency',
            priority: 'high',
            description: 'Reduce agent concurrency'
        });
        notifications.push({
            type: 'alert',
            message: 'Cost spike: ' + analysis.percentage + '% of limit. Reducing usage.'
        });
    }
} else if (eventType === 'performance_issue') {
    if (analysis.action === 'immediate_fix') {
        actions.push({
            type: 'restart_agents',
            priority: 'critical',
            description: 'Restart agents immediately'
        });
        notifications.push({
            type: 'critical',
            message: 'Critical performance issue: score ' + analysis.score + '. Restarting agents.'
        });
    } else if (analysis.action === 'urgent_optimization') {
        actions.push({
            type: 'optimize_workflows',
            priority: 'high',
            description: 'Optimize workflows urgently'
        });
        notifications.push({
            type: 'alert',
            message: 'Performance issue: score ' + analysis.score + '. Urgent optimization needed.'
        });
    }
}

// Execute actions
for (const action of actions) {
    // Here you would implement the actual action execution
    console.log('Executing action:', action);
}

return [{
    json: {
        eventType: eventType,
        analysis: analysis,
        actions: actions,
        notifications: notifications,
        executedAt: new Date().toISOString()
    }
}];
                        `
                    }
                },

                // Notification Sender
                {
                    id: "notification-sender",
                    name: "Send Notifications",
                    type: "n8n-nodes-base.httpRequest",
                    typeVersion: 4.1,
                    position: [1340, 300],
                    parameters: {
                        url: "https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK",
                        method: "POST",
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                {
                                    name: "text",
                                    value: "={{ $json.notifications.map(n => n.message).join('\\n') }}"
                                }
                            ]
                        },
                        options: {}
                    }
                },

                // Report Generator
                {
                    id: "report-generator",
                    name: "Generate Report",
                    type: "n8n-nodes-base.code",
                    typeVersion: 2,
                    position: [1560, 300],
                    parameters: {
                        jsCode: `
// Generate comprehensive report
const data = $input.first().json;

const report = {
    timestamp: new Date().toISOString(),
    eventType: data.eventType,
    analysis: data.analysis,
    actions: data.actions,
    notifications: data.notifications,
    summary: {
        totalActions: data.actions.length,
        totalNotifications: data.notifications.length,
        priority: data.analysis.priority || data.analysis.severity || data.analysis.impact || 'low'
    }
};

// Store report (you could save to database, file, etc.)
console.log('Generated report:', JSON.stringify(report, null, 2));

return [{
    json: {
        report: report,
        status: 'completed',
        processedAt: new Date().toISOString()
    }
}];
                        `
                    }
                },

                // Webhook Response
                {
                    id: "webhook-response",
                    name: "Webhook Response",
                    type: "n8n-nodes-base.respondToWebhook",
                    typeVersion: 1,
                    position: [1780, 300],
                    parameters: {
                        options: {}
                    }
                }
            ],
            connections: {
                "Agent Event Webhook": {
                    main: [
                        [
                            {
                                node: "Get Agent Status",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Get Agent Status": {
                    main: [
                        [
                            {
                                node: "Route Events",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Route Events": {
                    main: [
                        [
                            {
                                node: "Handle Audit Completed",
                                type: "main",
                                index: 0
                            }
                        ],
                        [
                            {
                                node: "Handle Cost Spike",
                                type: "main",
                                index: 0
                            }
                        ],
                        [
                            {
                                node: "Handle Performance Issue",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Handle Audit Completed": {
                    main: [
                        [
                            {
                                node: "Execute Actions",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Handle Cost Spike": {
                    main: [
                        [
                            {
                                node: "Execute Actions",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Handle Performance Issue": {
                    main: [
                        [
                            {
                                node: "Execute Actions",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Execute Actions": {
                    main: [
                        [
                            {
                                node: "Send Notifications",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Send Notifications": {
                    main: [
                        [
                            {
                                node: "Generate Report",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Generate Report": {
                    main: [
                        [
                            {
                                node: "Webhook Response",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                }
            }
        };

        return workflow;
    }

    async deployWorkflow() {
        try {
            const workflow = await this.createAutonomousWorkflow();
            
            const response = await axios.post(`${this.n8nBaseUrl}/rest/workflows`, workflow, {
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Autonomous workflow deployed successfully!');
            console.log('📋 Workflow ID:', response.data.id);
            console.log('🌐 Webhook URL:', `${this.n8nBaseUrl}/webhook/agent-events`);
            
            return response.data;
        } catch (error) {
            console.error('❌ Failed to deploy workflow:', error.message);
            throw error;
        }
    }

    async testWorkflow() {
        try {
            // Test the webhook with different event types
            const testEvents = [
                {
                    eventType: 'audit_completed',
                    agentId: 'portfolio_auditor_1752888632025',
                    result: {
                        score: 65,
                        type: 'portfolio_health',
                        duration: 2500
                    }
                },
                {
                    eventType: 'cost_spike',
                    current: 4.50,
                    threshold: 4.00,
                    percentage: 112.5
                },
                {
                    eventType: 'performance_issue',
                    score: 45,
                    issues: ['High response time', 'Memory usage spike']
                }
            ];

            for (const event of testEvents) {
                console.log(`🧪 Testing event: ${event.eventType}`);
                
                await axios.post(`${this.n8nBaseUrl}/webhook/agent-events`, event, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Wait a bit between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('✅ Workflow tests completed!');
        } catch (error) {
            console.error('❌ Workflow test failed:', error.message);
        }
    }

    async createAgentIntegration() {
        // Create a simple integration script that sends events to the workflow
        const integrationScript = `
const axios = require('axios');

class AgentWorkflowIntegration {
    constructor() {
        this.workflowUrl = 'http://localhost:5678/webhook/agent-events';
    }

    async sendAuditCompleted(auditResult) {
        await this.sendEvent('audit_completed', auditResult);
    }

    async sendCostSpike(costData) {
        await this.sendEvent('cost_spike', costData);
    }

    async sendPerformanceIssue(perfData) {
        await this.sendEvent('performance_issue', perfData);
    }

    async sendEvent(eventType, data) {
        try {
            await axios.post(this.workflowUrl, {
                eventType,
                ...data
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(\`✅ Event sent: \${eventType}\`);
        } catch (error) {
            console.error(\`❌ Failed to send event \${eventType}:\`, error.message);
        }
    }
}

module.exports = AgentWorkflowIntegration;
        `;

        return integrationScript;
    }
}

module.exports = AutonomousAgentWorkflow; 