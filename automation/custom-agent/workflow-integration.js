const axios = require('axios');
const { EventEmitter } = require('events');

class AgentWorkflowIntegration extends EventEmitter {
    constructor() {
        super();
        this.workflowUrl = 'http://localhost:5678/webhook/agent-events';
        this.agentDashboardUrl = 'http://localhost:3001';
        this.isConnected = false;
        this.eventQueue = [];
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds
    }

    async connect() {
        try {
            // Test connection to n8n
            await axios.get('http://localhost:5678/healthz');
            this.isConnected = true;
            console.log('✅ Connected to n8n workflow system');
            
            // Process any queued events
            await this.processEventQueue();
            
            return true;
        } catch (error) {
            console.warn('⚠️ n8n not available, events will be queued');
            this.isConnected = false;
            return false;
        }
    }

    async sendEvent(eventType, data) {
        const event = {
            eventType,
            timestamp: new Date().toISOString(),
            ...data
        };

        if (this.isConnected) {
            try {
                await this.sendToWorkflow(event);
                console.log(`✅ Event sent: ${eventType}`);
                this.emit('event_sent', event);
            } catch (error) {
                console.error(`❌ Failed to send event ${eventType}:`, error.message);
                this.queueEvent(event);
                this.emit('event_failed', { event, error });
            }
        } else {
            this.queueEvent(event);
            console.log(`📋 Event queued: ${eventType}`);
        }
    }

    async sendToWorkflow(event) {
        const response = await axios.post(this.workflowUrl, event, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        return response.data;
    }

    queueEvent(event) {
        this.eventQueue.push(event);
        // Keep only last 100 events to prevent memory issues
        if (this.eventQueue.length > 100) {
            this.eventQueue.shift();
        }
    }

    async processEventQueue() {
        if (this.eventQueue.length === 0) return;

        console.log(`📤 Processing ${this.eventQueue.length} queued events...`);
        
        const eventsToProcess = [...this.eventQueue];
        this.eventQueue = [];

        for (const event of eventsToProcess) {
            try {
                await this.sendToWorkflow(event);
                console.log(`✅ Queued event sent: ${event.eventType}`);
            } catch (error) {
                console.error(`❌ Failed to send queued event ${event.eventType}:`, error.message);
                // Re-queue failed events
                this.queueEvent(event);
            }
            
            // Small delay between events
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Specific event methods
    async sendAuditCompleted(auditResult) {
        await this.sendEvent('audit_completed', {
            agentId: auditResult.agentId,
            result: {
                score: auditResult.result.score || auditResult.result.overall || 0,
                type: auditResult.type,
                duration: auditResult.duration,
                depth: auditResult.depth
            }
        });
    }

    async sendCostSpike(costData) {
        await this.sendEvent('cost_spike', {
            current: costData.current,
            threshold: costData.threshold,
            percentage: costData.percentage,
            dailyLimit: costData.dailyLimit
        });
    }

    async sendPerformanceIssue(perfData) {
        await this.sendEvent('performance_issue', {
            score: perfData.score,
            issues: perfData.issues,
            agentId: perfData.agentId
        });
    }

    async sendAgentOptimized(optimizationData) {
        await this.sendEvent('agent_optimized', {
            agentId: optimizationData.agentId,
            optimizations: optimizationData.optimizations,
            reason: optimizationData.reason
        });
    }

    async sendAgentError(errorData) {
        await this.sendEvent('agent_error', {
            agentId: errorData.agentId,
            error: errorData.error.message,
            timestamp: errorData.timestamp
        });
    }

    // Monitor agent system and send events
    async startMonitoring() {
        console.log('🔍 Starting agent system monitoring...');
        
        // Monitor for audit completions
        setInterval(async () => {
            try {
                const response = await axios.get(`${this.agentDashboardUrl}/api/results?limit=5`);
                const recentResults = response.data;
                
                // Check for new audit results (you might want to implement a more sophisticated tracking)
                for (const result of recentResults) {
                    const resultAge = Date.now() - new Date(result.timestamp).getTime();
                    if (resultAge < 60000) { // Last minute
                        await this.sendAuditCompleted(result);
                    }
                }
            } catch (error) {
                console.warn('⚠️ Could not check for recent audit results:', error.message);
            }
        }, 30000); // Check every 30 seconds

        // Monitor for cost spikes
        setInterval(async () => {
            try {
                const response = await axios.get(`${this.agentDashboardUrl}/api/report`);
                const report = response.data;
                
                // Check for cost-related issues
                if (report.agentSummaries) {
                    for (const [agentId, summary] of Object.entries(report.agentSummaries)) {
                        if (summary.performance && summary.performance.averageScore < 70) {
                            await this.sendPerformanceIssue({
                                score: summary.performance.averageScore,
                                issues: [`Low performance score: ${summary.performance.averageScore}`],
                                agentId
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ Could not check for performance issues:', error.message);
            }
        }, 60000); // Check every minute

        console.log('✅ Agent monitoring started');
    }

    // Test the integration
    async testIntegration() {
        console.log('🧪 Testing workflow integration...');

        const testEvents = [
            {
                type: 'audit_completed',
                data: {
                    agentId: 'portfolio_auditor_1752888632025',
                    result: {
                        score: 85,
                        type: 'portfolio_health',
                        duration: 2500,
                        depth: 1
                    }
                }
            },
            {
                type: 'cost_spike',
                data: {
                    current: 4.50,
                    threshold: 4.00,
                    percentage: 112.5,
                    dailyLimit: 5.00
                }
            },
            {
                type: 'performance_issue',
                data: {
                    score: 45,
                    issues: ['High response time', 'Memory usage spike'],
                    agentId: 'portfolio_auditor_1752888632025'
                }
            }
        ];

        for (const testEvent of testEvents) {
            console.log(`🧪 Testing ${testEvent.type}...`);
            await this.sendEvent(testEvent.type, testEvent.data);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('✅ Integration test completed');
    }

    // Get integration status
    async getStatus() {
        return {
            isConnected: this.isConnected,
            workflowUrl: this.workflowUrl,
            agentDashboardUrl: this.agentDashboardUrl,
            queuedEvents: this.eventQueue.length,
            lastEvent: this.eventQueue.length > 0 ? this.eventQueue[this.eventQueue.length - 1] : null
        };
    }

    // Disconnect and cleanup
    async disconnect() {
        this.isConnected = false;
        console.log('🔌 Disconnected from workflow system');
    }
}

// Create and export a singleton instance
const workflowIntegration = new AgentWorkflowIntegration();

// Auto-connect when module is loaded
workflowIntegration.connect().catch(console.error);

module.exports = workflowIntegration;
module.exports.AgentWorkflowIntegration = AgentWorkflowIntegration; 