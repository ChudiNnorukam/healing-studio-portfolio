#!/usr/bin/env node

const AutonomousAgentWorkflow = require('./autonomous-agent-workflow');
const fs = require('fs').promises;
const path = require('path');

async function deployAutonomousWorkflow() {
    console.log('🚀 Deploying Autonomous Agent Workflow...\n');

    try {
        const workflowManager = new AutonomousAgentWorkflow();

        // Deploy the workflow
        console.log('📦 Creating workflow...');
        const workflow = await workflowManager.deployWorkflow();
        
        console.log('✅ Workflow deployed successfully!');
        console.log(`📋 Workflow ID: ${workflow.id}`);
        console.log(`🌐 Webhook URL: ${workflowManager.n8nBaseUrl}/webhook/agent-events`);
        console.log(`📊 n8n Dashboard: ${workflowManager.n8nBaseUrl}`);

        // Create integration script
        console.log('\n🔧 Creating integration script...');
        const integrationScript = await workflowManager.createAgentIntegration();
        
        const integrationPath = path.join(__dirname, 'agent-workflow-integration.js');
        await fs.writeFile(integrationPath, integrationScript);
        console.log(`✅ Integration script created: ${integrationPath}`);

        // Create documentation
        const documentation = `
# Autonomous Agent Workflow

## Overview
This n8n workflow automatically monitors and responds to events from your custom agent system.

## Workflow Components

### 1. Webhook Trigger
- **URL**: ${workflowManager.n8nBaseUrl}/webhook/agent-events
- **Method**: POST
- **Purpose**: Receives events from the agent system

### 2. Event Router
Routes different types of events:
- **audit_completed**: When an audit finishes
- **cost_spike**: When costs exceed thresholds
- **performance_issue**: When performance degrades

### 3. Event Handlers
Each event type has a dedicated handler that:
- Analyzes the event data
- Determines appropriate actions
- Sets priority levels

### 4. Action Executor
Executes actions based on analysis:
- **immediate_intervention**: Critical issues requiring immediate action
- **optimization_needed**: Issues requiring optimization
- **monitor_closely**: Issues requiring monitoring

### 5. Notification System
Sends notifications for:
- Critical alerts
- Performance warnings
- Cost spikes

### 6. Report Generator
Creates comprehensive reports of all events and actions taken.

## Event Types

### Audit Completed
Triggered when an agent completes an audit.
**Data Structure:**
\`\`\`json
{
  "eventType": "audit_completed",
  "agentId": "portfolio_auditor_1752888632025",
  "result": {
    "score": 85,
    "type": "portfolio_health",
    "duration": 2500
  }
}
\`\`\`

### Cost Spike
Triggered when costs exceed thresholds.
**Data Structure:**
\`\`\`json
{
  "eventType": "cost_spike",
  "current": 4.50,
  "threshold": 4.00,
  "percentage": 112.5
}
\`\`\`

### Performance Issue
Triggered when performance degrades.
**Data Structure:**
\`\`\`json
{
  "eventType": "performance_issue",
  "score": 45,
  "issues": ["High response time", "Memory usage spike"]
}
\`\`\`

## Integration

### Using the Integration Script
\`\`\`javascript
const AgentWorkflowIntegration = require('./agent-workflow-integration');

const integration = new AgentWorkflowIntegration();

// Send audit completed event
await integration.sendAuditCompleted({
    agentId: 'portfolio_auditor_1752888632025',
    result: {
        score: 85,
        type: 'portfolio_health',
        duration: 2500
    }
});

// Send cost spike event
await integration.sendCostSpike({
    current: 4.50,
    threshold: 4.00,
    percentage: 112.5
});

// Send performance issue event
await integration.sendPerformanceIssue({
    score: 45,
    issues: ['High response time', 'Memory usage spike']
});
\`\`\`

### Manual Testing
You can test the workflow manually by sending POST requests to the webhook URL:

\`\`\`bash
curl -X POST ${workflowManager.n8nBaseUrl}/webhook/agent-events \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "audit_completed",
    "agentId": "portfolio_auditor_1752888632025",
    "result": {
      "score": 65,
      "type": "portfolio_health",
      "duration": 2500
    }
  }'
\`\`\`

## Configuration

### Notification Settings
Update the Slack webhook URL in the workflow:
1. Open n8n dashboard: ${workflowManager.n8nBaseUrl}
2. Find the "Send Notifications" node
3. Update the webhook URL with your Slack webhook

### Thresholds
You can adjust thresholds in the event handlers:
- **Audit Score Thresholds**: 50, 70, 85
- **Cost Spike Thresholds**: 80%, 100%, 120%
- **Performance Thresholds**: 30, 50, 70

## Monitoring

### View Workflow Executions
1. Open n8n dashboard: ${workflowManager.n8nBaseUrl}
2. Navigate to "Executions" tab
3. Filter by workflow name: "Autonomous Agent Monitor & Responder"

### View Logs
Check the n8n logs for detailed execution information:
\`\`\`bash
# If running n8n locally
tail -f ~/.n8n/logs/n8n.log
\`\`\`

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check if n8n is running
   - Verify webhook URL is correct
   - Check firewall settings

2. **Workflow not executing**
   - Ensure workflow is activated
   - Check node configurations
   - Review execution logs

3. **Notifications not sending**
   - Verify Slack webhook URL
   - Check network connectivity
   - Review notification node settings

### Debug Mode
Enable debug mode in n8n to get detailed logs:
\`\`\`bash
N8N_LOG_LEVEL=debug n8n start
\`\`\`

## Next Steps

1. **Customize Actions**: Modify the action executor to implement your specific actions
2. **Add More Event Types**: Extend the workflow to handle additional event types
3. **Integrate with External Services**: Add integrations with monitoring tools, databases, etc.
4. **Set Up Monitoring**: Configure alerts and monitoring for the workflow itself
5. **Scale**: Consider running multiple instances for high availability

## Support

For issues or questions:
1. Check the n8n documentation
2. Review execution logs
3. Test individual nodes
4. Verify event data format
        `;

        const docsPath = path.join(__dirname, 'autonomous-workflow-docs.md');
        await fs.writeFile(docsPath, documentation);
        console.log(`✅ Documentation created: ${docsPath}`);

        // Test the workflow
        console.log('\n🧪 Testing workflow...');
        await workflowManager.testWorkflow();

        console.log('\n🎉 Autonomous workflow deployment completed!');
        console.log('\n📋 Summary:');
        console.log(`   • Workflow ID: ${workflow.id}`);
        console.log(`   • Webhook URL: ${workflowManager.n8nBaseUrl}/webhook/agent-events`);
        console.log(`   • Integration Script: ${integrationPath}`);
        console.log(`   • Documentation: ${docsPath}`);
        console.log(`   • n8n Dashboard: ${workflowManager.n8nBaseUrl}`);

        console.log('\n🚀 Next Steps:');
        console.log('   1. Open the n8n dashboard to view your workflow');
        console.log('   2. Update the Slack webhook URL in the notification node');
        console.log('   3. Test the workflow with different event types');
        console.log('   4. Integrate with your custom agent system');

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    deployAutonomousWorkflow();
}

module.exports = { deployAutonomousWorkflow }; 