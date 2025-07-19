const axios = require('axios');

class EnhancedWorkflowWithEmail {
    constructor() {
        this.n8nUrl = 'http://localhost:5678';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFlOWEwNy0yZGUyLTRhZGItYmY5ZC1hZWU1OTE1MTcyOGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyODc5NzkwfQ.VvUriPToUI6oeS5CPZ1y5WbBPWuTru0PzTvOvid63JI';
    }

    async createEnhancedWorkflow() {
        const workflow = {
            name: "Enhanced Agent Monitor with Email",
            active: true,
            nodes: [
                // Enhanced Webhook Trigger
                {
                    id: "enhanced-webhook",
                    name: "Agent Events Webhook",
                    type: "n8n-nodes-base.webhook",
                    typeVersion: 1,
                    position: [240, 300],
                    webhookId: "agent-events-enhanced",
                    parameters: {
                        httpMethod: "POST",
                        path: "agent-events-enhanced",
                        responseMode: "responseNode",
                        options: {
                            rawBody: true,
                            responseHeaders: {
                                parameters: [
                                    {
                                        name: "Content-Type",
                                        value: "application/json"
                                    }
                                ]
                            }
                        }
                    }
                },

                // Enhanced Event Processor with Error Handling
                {
                    id: "enhanced-processor",
                    name: "Enhanced Event Processor",
                    type: "n8n-nodes-base.code",
                    typeVersion: 2,
                    position: [460, 300],
                    parameters: {
                        jsCode: `
// Enhanced event processing with error handling
try {
    const event = $input.first().json;
    
    console.log('🤖 Enhanced Agent Event Received:', event.eventType);
    
    // Validate event structure
    if (!event.eventType) {
        throw new Error('Missing eventType in request');
    }
    
    // Enhanced analysis with more detailed metrics
    let analysis = {
        eventType: event.eventType,
        timestamp: new Date().toISOString(),
        priority: 'low',
        action: 'monitor',
        requiresEmail: false,
        emailSubject: '',
        emailBody: '',
        severity: 'info'
    };
    
    // Enhanced event type processing
    if (event.eventType === 'audit_completed') {
        const score = event.result?.score || event.result?.overall || 0;
        const type = event.result?.type || 'unknown';
        const duration = event.result?.duration || 0;
        
        // Enhanced scoring logic
        if (score < 30) {
            analysis.priority = 'critical';
            analysis.action = 'immediate_intervention';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 CRITICAL: Portfolio Audit Score ' + score;
            analysis.emailBody = \`
🚨 CRITICAL PORTFOLIO ALERT

Audit Score: \${score}/100
Type: \${type}
Duration: \${duration}ms
Agent ID: \${event.agentId || 'Unknown'}

IMMEDIATE ACTION REQUIRED:
- Review portfolio structure
- Check for broken links or missing files
- Optimize content and performance
- Consider emergency optimization

This requires immediate attention to prevent further degradation.
            \`;
        } else if (score < 50) {
            analysis.priority = 'high';
            analysis.action = 'urgent_optimization';
            analysis.requiresEmail = true;
            analysis.severity = 'high';
            analysis.emailSubject = '⚠️ HIGH PRIORITY: Portfolio Audit Score ' + score;
            analysis.emailBody = \`
⚠️ HIGH PRIORITY PORTFOLIO ALERT

Audit Score: \${score}/100
Type: \${type}
Duration: \${duration}ms
Agent ID: \${event.agentId || 'Unknown'}

URGENT OPTIMIZATION NEEDED:
- Review and fix identified issues
- Optimize performance bottlenecks
- Update outdated content
- Schedule immediate review

Please address these issues within 24 hours.
            \`;
        } else if (score < 70) {
            analysis.priority = 'medium';
            analysis.action = 'optimization_needed';
            analysis.requiresEmail = true;
            analysis.severity = 'medium';
            analysis.emailSubject = '📊 MEDIUM: Portfolio Audit Score ' + score;
            analysis.emailBody = \`
📊 PORTFOLIO OPTIMIZATION NEEDED

Audit Score: \${score}/100
Type: \${type}
Duration: \${duration}ms
Agent ID: \${event.agentId || 'Unknown'}

OPTIMIZATION RECOMMENDATIONS:
- Review performance metrics
- Update content where needed
- Optimize for better scores
- Schedule regular maintenance

Consider addressing these improvements soon.
            \`;
        } else if (score < 85) {
            analysis.priority = 'low';
            analysis.action = 'monitor_closely';
            analysis.requiresEmail = false;
            analysis.severity = 'low';
        } else {
            analysis.priority = 'low';
            analysis.action = 'excellent_performance';
            analysis.requiresEmail = false;
            analysis.severity = 'success';
        }
        
        analysis.score = score;
        analysis.type = type;
        analysis.duration = duration;
        
    } else if (event.eventType === 'cost_spike') {
        const percentage = event.percentage || 0;
        const current = event.current || 0;
        const threshold = event.threshold || 0;
        
        if (percentage > 150) {
            analysis.priority = 'critical';
            analysis.action = 'emergency_stop';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 EMERGENCY: Cost Spike ' + percentage + '%';
            analysis.emailBody = \`
🚨 EMERGENCY COST ALERT

Current Cost: $\${current}
Threshold: $\${threshold}
Percentage: \${percentage}%

EMERGENCY ACTION REQUIRED:
- IMMEDIATELY stop all expensive operations
- Review and terminate unnecessary processes
- Check for runaway processes
- Contact support if needed

This is a critical cost emergency requiring immediate action.
            \`;
        } else if (percentage > 120) {
            analysis.priority = 'critical';
            analysis.action = 'immediate_stop';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 CRITICAL: Cost Spike ' + percentage + '%';
            analysis.emailBody = \`
🚨 CRITICAL COST ALERT

Current Cost: $\${current}
Threshold: $\${threshold}
Percentage: \${percentage}%

IMMEDIATE ACTION REQUIRED:
- Stop expensive operations immediately
- Reduce usage and concurrency
- Review cost drivers
- Implement cost controls

Please take immediate action to control costs.
            \`;
        } else if (percentage > 100) {
            analysis.priority = 'high';
            analysis.action = 'reduce_usage';
            analysis.requiresEmail = true;
            analysis.severity = 'high';
            analysis.emailSubject = '⚠️ HIGH: Cost Spike ' + percentage + '%';
            analysis.emailBody = \`
⚠️ HIGH PRIORITY COST ALERT

Current Cost: $\${current}
Threshold: $\${threshold}
Percentage: \${percentage}%

ACTION REQUIRED:
- Reduce usage and concurrency
- Optimize expensive operations
- Review cost patterns
- Implement monitoring

Please address cost optimization soon.
            \`;
        } else if (percentage > 80) {
            analysis.priority = 'medium';
            analysis.action = 'optimize';
            analysis.requiresEmail = true;
            analysis.severity = 'medium';
            analysis.emailSubject = '📊 MEDIUM: Cost Alert ' + percentage + '%';
            analysis.emailBody = \`
📊 COST OPTIMIZATION ALERT

Current Cost: $\${current}
Threshold: $\${threshold}
Percentage: \${percentage}%

RECOMMENDATIONS:
- Monitor usage patterns
- Optimize where possible
- Review cost efficiency
- Plan for optimization

Consider cost optimization strategies.
            \`;
        }
        
        analysis.percentage = percentage;
        analysis.currentCost = current;
        analysis.threshold = threshold;
        
    } else if (event.eventType === 'performance_issue') {
        const score = event.score || 0;
        const issues = event.issues || [];
        
        if (score < 20) {
            analysis.priority = 'critical';
            analysis.action = 'emergency_restart';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 EMERGENCY: Performance Score ' + score;
            analysis.emailBody = \`
🚨 EMERGENCY PERFORMANCE ALERT

Performance Score: \${score}/100
Issues: \${issues.join(', ')}

EMERGENCY ACTION REQUIRED:
- IMMEDIATELY restart all agents
- Check system resources
- Review for system failures
- Contact support if needed

This is a critical performance emergency.
            \`;
        } else if (score < 40) {
            analysis.priority = 'critical';
            analysis.action = 'immediate_fix';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 CRITICAL: Performance Score ' + score;
            analysis.emailBody = \`
🚨 CRITICAL PERFORMANCE ALERT

Performance Score: \${score}/100
Issues: \${issues.join(', ')}

IMMEDIATE ACTION REQUIRED:
- Restart agents immediately
- Check system resources
- Review performance bottlenecks
- Implement fixes

Please take immediate action to restore performance.
            \`;
        } else if (score < 60) {
            analysis.priority = 'high';
            analysis.action = 'urgent_optimization';
            analysis.requiresEmail = true;
            analysis.severity = 'high';
            analysis.emailSubject = '⚠️ HIGH: Performance Score ' + score;
            analysis.emailBody = \`
⚠️ HIGH PRIORITY PERFORMANCE ALERT

Performance Score: \${score}/100
Issues: \${issues.join(', ')}

URGENT ACTION REQUIRED:
- Optimize workflows urgently
- Review performance issues
- Implement optimizations
- Monitor closely

Please address performance issues soon.
            \`;
        } else if (score < 80) {
            analysis.priority = 'medium';
            analysis.action = 'optimization';
            analysis.requiresEmail = true;
            analysis.severity = 'medium';
            analysis.emailSubject = '📊 MEDIUM: Performance Score ' + score;
            analysis.emailBody = \`
📊 PERFORMANCE OPTIMIZATION ALERT

Performance Score: \${score}/100
Issues: \${issues.join(', ')}

OPTIMIZATION NEEDED:
- Review performance metrics
- Implement optimizations
- Monitor improvements
- Plan for enhancement

Consider performance optimization strategies.
            \`;
        }
        
        analysis.score = score;
        analysis.issues = issues;
    }
    
    // Add metadata
    analysis.agentId = event.agentId || 'unknown';
    analysis.originalEvent = event;
    
    return [{
        json: {
            analysis: analysis,
            processedAt: new Date().toISOString()
        }
    }];
    
} catch (error) {
    console.error('❌ Event processing error:', error.message);
    
    // Return error response
    return [{
        json: {
            error: true,
            message: error.message,
            timestamp: new Date().toISOString(),
            requiresEmail: true,
            emailSubject: '❌ Agent Event Processing Error',
            emailBody: \`
❌ EVENT PROCESSING ERROR

Error: \${error.message}
Timestamp: \${new Date().toISOString()}

Please check the n8n workflow logs for more details.
            \`
        }
    }];
}
                        `
                    }
                },

                // Email Notification Node
                {
                    id: "email-notification",
                    name: "Send Email Notifications",
                    type: "n8n-nodes-base.emailSend",
                    typeVersion: 2,
                    position: [680, 300],
                    parameters: {
                        fromEmail: "{{ $json.analysis.requiresEmail ? 'your-email@example.com' : '' }}",
                        toEmail: "{{ $json.analysis.requiresEmail ? 'your-email@example.com' : '' }}",
                        subject: "{{ $json.analysis.emailSubject || 'Agent Event Notification' }}",
                        text: "{{ $json.analysis.emailBody || 'No email content' }}",
                        options: {
                            allowUnauthorizedCerts: true
                        }
                    }
                },

                // Enhanced Response Node
                {
                    id: "enhanced-response",
                    name: "Enhanced Response",
                    type: "n8n-nodes-base.respondToWebhook",
                    typeVersion: 1,
                    position: [900, 300],
                    parameters: {
                        options: {
                            responseCode: "={{ $json.analysis.error ? 400 : 200 }}",
                            responseHeaders: {
                                parameters: [
                                    {
                                        name: "Content-Type",
                                        value: "application/json"
                                    },
                                    {
                                        name: "X-Event-Processed",
                                        value: "true"
                                    },
                                    {
                                        name: "X-Priority",
                                        value: "={{ $json.analysis.priority }}"
                                    }
                                ]
                            }
                        }
                    }
                }
            ],
            connections: {
                "Agent Events Webhook": {
                    main: [
                        [
                            {
                                node: "Enhanced Event Processor",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Enhanced Event Processor": {
                    main: [
                        [
                            {
                                node: "Send Email Notifications",
                                type: "main",
                                index: 0
                            }
                        ]
                    ]
                },
                "Send Email Notifications": {
                    main: [
                        [
                            {
                                node: "Enhanced Response",
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

    async deployEnhancedWorkflow() {
        try {
            const workflow = await this.createEnhancedWorkflow();
            
            const response = await axios.post(`${this.n8nUrl}/rest/workflows`, workflow, {
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Enhanced workflow deployed successfully!');
            console.log('📋 Workflow ID:', response.data.id);
            console.log('🌐 Webhook URL:', `${this.n8nUrl}/webhook/agent-events-enhanced`);
            
            return response.data;
        } catch (error) {
            console.error('❌ Failed to deploy enhanced workflow:', error.message);
            throw error;
        }
    }

    async testEnhancedWorkflow() {
        try {
            console.log('🧪 Testing enhanced workflow...');
            
            const testEvents = [
                {
                    eventType: 'audit_completed',
                    agentId: 'portfolio_auditor_1752888632025',
                    result: {
                        score: 25, // Critical score
                        type: 'portfolio_health',
                        duration: 5000
                    }
                },
                {
                    eventType: 'cost_spike',
                    current: 6.50,
                    threshold: 4.00,
                    percentage: 162.5 // Critical spike
                },
                {
                    eventType: 'performance_issue',
                    score: 15, // Critical performance
                    issues: ['System overload', 'Memory exhaustion', 'High CPU usage']
                }
            ];

            for (const event of testEvents) {
                console.log(`🧪 Testing ${event.eventType} with critical data...`);
                
                const response = await axios.post(`${this.n8nUrl}/webhook/agent-events-enhanced`, event, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                });

                console.log(`✅ ${event.eventType} processed:`, response.status);
                
                // Wait between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('✅ Enhanced workflow tests completed!');
        } catch (error) {
            console.error('❌ Enhanced workflow test failed:', error.message);
        }
    }
}

module.exports = EnhancedWorkflowWithEmail; 