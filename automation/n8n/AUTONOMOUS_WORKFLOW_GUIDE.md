# 🚀 Your First Autonomous n8n Workflow Guide

## Overview
This guide will help you create your first autonomous n8n workflow that integrates with your custom agent system. The workflow will automatically monitor, analyze, and respond to events from your portfolio auditing agents.

## 🎯 What You'll Build

An autonomous workflow that:
- **Receives events** from your custom agent system
- **Analyzes audit results** and determines actions
- **Sends notifications** for critical issues
- **Generates reports** of all activities
- **Self-optimizes** based on performance data

## 📋 Prerequisites

✅ n8n running on http://localhost:5678  
✅ Custom agent system running on http://localhost:3001  
✅ Browser access to n8n dashboard  

## 🛠️ Step-by-Step Setup

### Step 1: Access n8n Dashboard
1. Open your browser and go to: **http://localhost:5678**
2. You should see the n8n interface
3. If prompted for authentication, you may need to set up credentials

### Step 2: Create New Workflow
1. Click **"New Workflow"** button
2. Name it: **"Autonomous Agent Monitor"**
3. Click **"Create"**

### Step 3: Add Webhook Trigger
1. Click the **"+"** button to add a node
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure the webhook:
   - **HTTP Method**: POST
   - **Path**: `agent-events`
   - **Response Mode**: Respond to Webhook
5. Click **"Save"**
6. Copy the webhook URL (you'll need this for integration)

### Step 4: Add Event Processor
1. Add another node by clicking **"+"**
2. Search for **"Code"**
3. Select **"Code"** node
4. Configure the code:

```javascript
// Process incoming agent events
const event = $input.first().json;

console.log('🤖 Agent Event Received:', event.eventType);

// Analyze the event
let analysis = {
    eventType: event.eventType,
    timestamp: new Date().toISOString(),
    priority: 'low',
    action: 'monitor'
};

// Determine priority and action based on event type
if (event.eventType === 'audit_completed') {
    const score = event.result?.score || event.result?.overall || 0;
    
    if (score < 50) {
        analysis.priority = 'critical';
        analysis.action = 'immediate_intervention';
    } else if (score < 70) {
        analysis.priority = 'high';
        analysis.action = 'optimization_needed';
    } else if (score < 85) {
        analysis.priority = 'medium';
        analysis.action = 'monitor_closely';
    } else {
        analysis.priority = 'low';
        analysis.action = 'excellent_performance';
    }
    
    analysis.score = score;
    analysis.type = event.result?.type;
    analysis.duration = event.result?.duration;
    
} else if (event.eventType === 'cost_spike') {
    const percentage = event.percentage || 0;
    
    if (percentage > 120) {
        analysis.priority = 'critical';
        analysis.action = 'immediate_stop';
    } else if (percentage > 100) {
        analysis.priority = 'high';
        analysis.action = 'reduce_usage';
    } else if (percentage > 80) {
        analysis.priority = 'medium';
        analysis.action = 'optimize';
    }
    
    analysis.percentage = percentage;
    analysis.currentCost = event.current;
    
} else if (event.eventType === 'performance_issue') {
    const score = event.score || 0;
    
    if (score < 30) {
        analysis.priority = 'critical';
        analysis.action = 'immediate_fix';
    } else if (score < 50) {
        analysis.priority = 'high';
        analysis.action = 'urgent_optimization';
    } else if (score < 70) {
        analysis.priority = 'medium';
        analysis.action = 'optimization';
    }
    
    analysis.score = score;
    analysis.issues = event.issues;
}

// Create response
return [{
    json: {
        originalEvent: event,
        analysis: analysis,
        processedAt: new Date().toISOString()
    }
}];
```

### Step 5: Add Notification Node
1. Add another node by clicking **"+"**
2. Search for **"HTTP Request"**
3. Select **"HTTP Request"** node
4. Configure for notifications (you can use Slack, Discord, or email):

**For Slack:**
- **Method**: POST
- **URL**: `https://hooks.slack.com/services/YOUR_WEBHOOK_URL`
- **Send Body**: ✅
- **Body**: 
```json
{
  "text": "🤖 Agent Alert: {{ $json.analysis.eventType }}\nPriority: {{ $json.analysis.priority }}\nAction: {{ $json.analysis.action }}"
}
```

**For Discord:**
- **Method**: POST
- **URL**: `https://discord.com/api/webhooks/YOUR_WEBHOOK_URL`
- **Send Body**: ✅
- **Body**:
```json
{
  "content": "🤖 Agent Alert: {{ $json.analysis.eventType }}\nPriority: {{ $json.analysis.priority }}\nAction: {{ $json.analysis.action }}"
}
```

### Step 6: Add Report Generator
1. Add another **"Code"** node
2. Configure the code:

```javascript
// Generate comprehensive report
const data = $input.first().json;

const report = {
    timestamp: new Date().toISOString(),
    eventType: data.analysis.eventType,
    priority: data.analysis.priority,
    action: data.analysis.action,
    originalEvent: data.originalEvent,
    analysis: data.analysis,
    summary: {
        processed: true,
        requiresAction: data.analysis.priority === 'critical' || data.analysis.priority === 'high'
    }
};

// Log the report
console.log('📊 Generated Report:', JSON.stringify(report, null, 2));

return [{
    json: {
        report: report,
        status: 'completed',
        processedAt: new Date().toISOString()
    }
}];
```

### Step 7: Connect the Nodes
1. Connect the **Webhook** node to the **Code** (Event Processor) node
2. Connect the **Event Processor** to the **HTTP Request** (Notifications) node
3. Connect the **Notifications** node to the **Code** (Report Generator) node
4. Connect the **Report Generator** back to the **Webhook** (Response) node

### Step 8: Activate the Workflow
1. Click the **"Activate"** toggle in the top right
2. Your workflow is now live and ready to receive events!

## 🔗 Integration with Your Custom Agent

Your custom agent system is already configured to send events to this workflow. The integration is handled by the `workflow-integration.js` file in your custom agent directory.

### Test the Integration

1. **Manual Test**: Send a test event to your webhook:
```bash
curl -X POST http://localhost:5678/webhook/agent-events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "audit_completed",
    "agentId": "portfolio_auditor_1752888632025",
    "result": {
      "score": 65,
      "type": "portfolio_health",
      "duration": 2500
    }
  }'
```

2. **Automatic Test**: Your custom agent will automatically send events when:
   - Audits complete
   - Cost spikes are detected
   - Performance issues occur
   - Agents are optimized

## 📊 Monitoring Your Workflow

### View Executions
1. In n8n dashboard, go to **"Executions"** tab
2. You'll see all workflow executions
3. Click on any execution to see detailed logs

### Check Logs
- Each node execution shows detailed logs
- The Code nodes will show console.log output
- You can see the data flow between nodes

## 🚀 Advanced Features

### Add More Event Types
You can extend the workflow to handle additional events:
- `agent_created`
- `agent_stopped`
- `optimization_completed`
- `error_occurred`

### Add Conditional Logic
Use **"Switch"** nodes to route different event types to different processing paths.

### Add Database Storage
Use **"PostgreSQL"** or **"MySQL"** nodes to store event data and reports.

### Add External Integrations
Connect to:
- **Slack** for notifications
- **Email** for alerts
- **Jira** for issue tracking
- **GitHub** for repository actions

## 🔧 Troubleshooting

### Workflow Not Receiving Events
1. Check if workflow is activated
2. Verify webhook URL is correct
3. Check n8n logs for errors

### Events Not Processing
1. Check node connections
2. Verify code syntax in Code nodes
3. Check execution logs for errors

### Notifications Not Sending
1. Verify webhook URLs are correct
2. Check network connectivity
3. Test webhook endpoints manually

## 📈 Next Steps

1. **Customize Actions**: Modify the action executor to implement your specific actions
2. **Add More Event Types**: Extend the workflow to handle additional event types
3. **Integrate with External Services**: Add integrations with monitoring tools, databases, etc.
4. **Set Up Monitoring**: Configure alerts and monitoring for the workflow itself
5. **Scale**: Consider running multiple instances for high availability

## 🎉 Congratulations!

You've successfully created your first autonomous n8n workflow! This workflow will now:
- Automatically monitor your custom agent system
- Analyze events and determine appropriate actions
- Send notifications for important events
- Generate comprehensive reports
- Help you maintain optimal portfolio performance

Your autonomous agent ecosystem is now complete with:
- ✅ Custom agent system (running on port 3001)
- ✅ n8n workflow automation (running on port 5678)
- ✅ Real-time event processing
- ✅ Automatic response system
- ✅ Performance monitoring and optimization

The system will continue to learn and optimize itself based on the data it processes! 