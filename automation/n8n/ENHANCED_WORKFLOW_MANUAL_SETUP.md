# 🚀 Enhanced Agent Workflow with Email Notifications - Manual Setup

## Overview
This guide will help you create an enhanced n8n workflow with email notifications and improved HTTP request handling.

## 🎯 Enhanced Features

### ✅ **Improved HTTP Request Handling**
- Better error handling and validation
- Enhanced response headers
- Proper status codes (200/400)
- Request validation and sanitization

### ✅ **Email Notifications**
- Critical alerts for portfolio issues
- Cost spike notifications
- Performance degradation alerts
- Conditional email sending based on severity

### ✅ **Enhanced Event Processing**
- Detailed event analysis
- Priority-based actions
- Comprehensive logging
- Error recovery mechanisms

## 🛠️ Manual Setup Steps

### Step 1: Create New Enhanced Workflow
1. Open n8n dashboard: **http://localhost:5678**
2. Click **"New Workflow"**
3. Name it: **"Enhanced Agent Monitor with Email"**
4. Click **"Create"**

### Step 2: Add Enhanced Webhook Trigger
1. Click **"+"** to add a node
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure:
   - **HTTP Method**: POST
   - **Path**: `agent-events-enhanced`
   - **Response Mode**: Respond to Webhook
   - **Options**:
     - ✅ **Raw Body**: true
     - **Response Headers**: Add `Content-Type: application/json`

### Step 3: Add Enhanced Event Processor
1. Add a **"Code"** node
2. Use this enhanced JavaScript code:

```javascript
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
            analysis.emailBody = `
🚨 CRITICAL PORTFOLIO ALERT

Audit Score: ${score}/100
Type: ${type}
Duration: ${duration}ms
Agent ID: ${event.agentId || 'Unknown'}

IMMEDIATE ACTION REQUIRED:
- Review portfolio structure
- Check for broken links or missing files
- Optimize content and performance
- Consider emergency optimization

This requires immediate attention to prevent further degradation.
            `;
        } else if (score < 50) {
            analysis.priority = 'high';
            analysis.action = 'urgent_optimization';
            analysis.requiresEmail = true;
            analysis.severity = 'high';
            analysis.emailSubject = '⚠️ HIGH PRIORITY: Portfolio Audit Score ' + score;
            analysis.emailBody = `
⚠️ HIGH PRIORITY PORTFOLIO ALERT

Audit Score: ${score}/100
Type: ${type}
Duration: ${duration}ms
Agent ID: ${event.agentId || 'Unknown'}

URGENT OPTIMIZATION NEEDED:
- Review and fix identified issues
- Optimize performance bottlenecks
- Update outdated content
- Schedule immediate review

Please address these issues within 24 hours.
            `;
        } else if (score < 70) {
            analysis.priority = 'medium';
            analysis.action = 'optimization_needed';
            analysis.requiresEmail = true;
            analysis.severity = 'medium';
            analysis.emailSubject = '📊 MEDIUM: Portfolio Audit Score ' + score;
            analysis.emailBody = `
📊 PORTFOLIO OPTIMIZATION NEEDED

Audit Score: ${score}/100
Type: ${type}
Duration: ${duration}ms
Agent ID: ${event.agentId || 'Unknown'}

OPTIMIZATION RECOMMENDATIONS:
- Review performance metrics
- Update content where needed
- Optimize for better scores
- Schedule regular maintenance

Consider addressing these improvements soon.
            `;
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
            analysis.emailBody = `
🚨 EMERGENCY COST ALERT

Current Cost: $${current}
Threshold: $${threshold}
Percentage: ${percentage}%

EMERGENCY ACTION REQUIRED:
- IMMEDIATELY stop all expensive operations
- Review and terminate unnecessary processes
- Check for runaway processes
- Contact support if needed

This is a critical cost emergency requiring immediate action.
            `;
        } else if (percentage > 120) {
            analysis.priority = 'critical';
            analysis.action = 'immediate_stop';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 CRITICAL: Cost Spike ' + percentage + '%';
            analysis.emailBody = `
🚨 CRITICAL COST ALERT

Current Cost: $${current}
Threshold: $${threshold}
Percentage: ${percentage}%

IMMEDIATE ACTION REQUIRED:
- Stop expensive operations immediately
- Reduce usage and concurrency
- Review cost drivers
- Implement cost controls

Please take immediate action to control costs.
            `;
        } else if (percentage > 100) {
            analysis.priority = 'high';
            analysis.action = 'reduce_usage';
            analysis.requiresEmail = true;
            analysis.severity = 'high';
            analysis.emailSubject = '⚠️ HIGH: Cost Spike ' + percentage + '%';
            analysis.emailBody = `
⚠️ HIGH PRIORITY COST ALERT

Current Cost: $${current}
Threshold: $${threshold}
Percentage: ${percentage}%

ACTION REQUIRED:
- Reduce usage and concurrency
- Optimize expensive operations
- Review cost patterns
- Implement monitoring

Please address cost optimization soon.
            `;
        } else if (percentage > 80) {
            analysis.priority = 'medium';
            analysis.action = 'optimize';
            analysis.requiresEmail = true;
            analysis.severity = 'medium';
            analysis.emailSubject = '📊 MEDIUM: Cost Alert ' + percentage + '%';
            analysis.emailBody = `
📊 COST OPTIMIZATION ALERT

Current Cost: $${current}
Threshold: $${threshold}
Percentage: ${percentage}%

RECOMMENDATIONS:
- Monitor usage patterns
- Optimize where possible
- Review cost efficiency
- Plan for optimization

Consider cost optimization strategies.
            `;
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
            analysis.emailBody = `
🚨 EMERGENCY PERFORMANCE ALERT

Performance Score: ${score}/100
Issues: ${issues.join(', ')}

EMERGENCY ACTION REQUIRED:
- IMMEDIATELY restart all agents
- Check system resources
- Review for system failures
- Contact support if needed

This is a critical performance emergency.
            `;
        } else if (score < 40) {
            analysis.priority = 'critical';
            analysis.action = 'immediate_fix';
            analysis.requiresEmail = true;
            analysis.severity = 'critical';
            analysis.emailSubject = '🚨 CRITICAL: Performance Score ' + score;
            analysis.emailBody = `
🚨 CRITICAL PERFORMANCE ALERT

Performance Score: ${score}/100
Issues: ${issues.join(', ')}

IMMEDIATE ACTION REQUIRED:
- Restart agents immediately
- Check system resources
- Review performance bottlenecks
- Implement fixes

Please take immediate action to restore performance.
            `;
        } else if (score < 60) {
            analysis.priority = 'high';
            analysis.action = 'urgent_optimization';
            analysis.requiresEmail = true;
            analysis.severity = 'high';
            analysis.emailSubject = '⚠️ HIGH: Performance Score ' + score;
            analysis.emailBody = `
⚠️ HIGH PRIORITY PERFORMANCE ALERT

Performance Score: ${score}/100
Issues: ${issues.join(', ')}

URGENT ACTION REQUIRED:
- Optimize workflows urgently
- Review performance issues
- Implement optimizations
- Monitor closely

Please address performance issues soon.
            `;
        } else if (score < 80) {
            analysis.priority = 'medium';
            analysis.action = 'optimization';
            analysis.requiresEmail = true;
            analysis.severity = 'medium';
            analysis.emailSubject = '📊 MEDIUM: Performance Score ' + score;
            analysis.emailBody = `
📊 PERFORMANCE OPTIMIZATION ALERT

Performance Score: ${score}/100
Issues: ${issues.join(', ')}

OPTIMIZATION NEEDED:
- Review performance metrics
- Implement optimizations
- Monitor improvements
- Plan for enhancement

Consider performance optimization strategies.
            `;
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
            emailBody: `
❌ EVENT PROCESSING ERROR

Error: ${error.message}
Timestamp: ${new Date().toISOString()}

Please check the n8n workflow logs for more details.
            `
        }
    }];
}
```

### Step 4: Add Email Notification Node
1. Add another node by clicking **"+"**
2. Search for **"Email Send"**
3. Select **"Email Send"** node
4. Configure:
   - **From Email**: `{{ $json.analysis.requiresEmail ? 'your-email@example.com' : '' }}`
   - **To Email**: `{{ $json.analysis.requiresEmail ? 'your-email@example.com' : '' }}`
   - **Subject**: `{{ $json.analysis.emailSubject || 'Agent Event Notification' }}`
   - **Text**: `{{ $json.analysis.emailBody || 'No email content' }}`
   - **Options**: ✅ Allow unauthorized certs

### Step 5: Add Enhanced Response Node
1. Add another **"Respond to Webhook"** node
2. Configure:
   - **Response Code**: `{{ $json.analysis.error ? 400 : 200 }}`
   - **Response Headers**:
     - `Content-Type: application/json`
     - `X-Event-Processed: true`
     - `X-Priority: {{ $json.analysis.priority }}`

### Step 6: Connect the Nodes
1. Connect **Webhook** → **Enhanced Event Processor**
2. Connect **Enhanced Event Processor** → **Email Send**
3. Connect **Email Send** → **Enhanced Response**

### Step 7: Activate the Workflow
1. Click the **"Activate"** toggle in the top right
2. Your enhanced workflow is now live!

## 📧 Email Configuration

### Step 1: Set Up Email Credentials
1. In n8n dashboard, go to **Settings** → **Credentials**
2. Click **"Add Credential"**
3. Search for **"Email"** and select your provider

### Step 2: Gmail Setup (Recommended)
1. **Type**: Gmail
2. **Email**: your-email@gmail.com
3. **Password**: Use App Password (not regular password)
4. **App Password Setup**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password for "n8n"
   - Use this password in n8n

### Step 3: Update Email Addresses
1. Open your workflow
2. Click on **"Send Email Notifications"** node
3. Update **From Email** and **To Email** with your actual email

## 🧪 Testing the Enhanced Workflow

### Test Critical Audit Event
```bash
curl -X POST http://localhost:5678/webhook/agent-events-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "audit_completed",
    "agentId": "portfolio_auditor_1752888632025",
    "result": {
      "score": 25,
      "type": "portfolio_health",
      "duration": 5000
    }
  }'
```

### Test Cost Spike Event
```bash
curl -X POST http://localhost:5678/webhook/agent-events-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "cost_spike",
    "current": 6.50,
    "threshold": 4.00,
    "percentage": 162.5
  }'
```

### Test Performance Issue Event
```bash
curl -X POST http://localhost:5678/webhook/agent-events-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "performance_issue",
    "score": 15,
    "issues": ["System overload", "Memory exhaustion", "High CPU usage"]
  }'
```

## 📊 Enhanced Features Summary

### ✅ **Improved HTTP Request Handling**
- **Validation**: Checks for required fields
- **Error Handling**: Graceful error responses
- **Response Headers**: Custom headers for tracking
- **Status Codes**: Proper HTTP status codes

### ✅ **Email Notifications**
- **Critical Alerts**: Score < 30, Cost > 150%, Performance < 20
- **High Priority**: Score < 50, Cost > 120%, Performance < 40
- **Medium Priority**: Score < 70, Cost > 100%, Performance < 60
- **Conditional Sending**: Only sends emails when needed

### ✅ **Enhanced Event Processing**
- **Detailed Analysis**: Comprehensive event evaluation
- **Priority-Based Actions**: Different actions for different severities
- **Rich Metadata**: Additional context and tracking
- **Error Recovery**: Handles malformed requests gracefully

## 🎯 Next Steps

1. **Configure Email**: Set up your email credentials
2. **Test Notifications**: Send test events to verify email delivery
3. **Monitor Executions**: Check n8n dashboard for workflow executions
4. **Customize Templates**: Modify email content as needed
5. **Scale Up**: Add more recipients or notification channels

## 🚀 Benefits

- **Real-time Alerts**: Get immediate notifications for critical issues
- **Improved Reliability**: Better error handling and validation
- **Enhanced Monitoring**: More detailed event analysis
- **Professional Notifications**: Well-formatted email alerts
- **Scalable Architecture**: Easy to extend and customize

Your enhanced autonomous workflow is now ready to provide professional email notifications for all critical portfolio events! 📧✨ 