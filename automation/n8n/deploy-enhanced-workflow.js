#!/usr/bin/env node

const EnhancedWorkflowWithEmail = require('./enhanced-workflow-with-email');
const fs = require('fs').promises;
const path = require('path');

async function deployEnhancedWorkflow() {
    console.log('🚀 Deploying Enhanced Agent Workflow with Email...\n');

    try {
        const workflowManager = new EnhancedWorkflowWithEmail();

        // Deploy the enhanced workflow
        console.log('📦 Creating enhanced workflow...');
        const workflow = await workflowManager.deployEnhancedWorkflow();
        
        console.log('✅ Enhanced workflow deployed successfully!');
        console.log(`📋 Workflow ID: ${workflow.id}`);
        console.log(`🌐 Webhook URL: ${workflowManager.n8nUrl}/webhook/agent-events-enhanced`);
        console.log(`📊 n8n Dashboard: ${workflowManager.n8nUrl}`);

        // Create email configuration guide
        const emailConfigGuide = `
# 📧 Email Configuration Guide for Enhanced Agent Workflow

## Overview
Your enhanced n8n workflow now includes email notifications for critical events. This guide will help you configure email settings.

## 🔧 Email Configuration Steps

### Step 1: Configure Email Credentials in n8n
1. Open n8n dashboard: ${workflowManager.n8nUrl}
2. Go to **Settings** → **Credentials**
3. Click **"Add Credential"**
4. Search for **"Email"** and select your email provider

### Step 2: Email Provider Options

#### Option A: Gmail (Recommended)
- **Type**: Gmail
- **Email**: your-email@gmail.com
- **Password**: Use an App Password (not your regular password)
- **App Password Setup**:
  1. Go to Google Account settings
  2. Security → 2-Step Verification → App passwords
  3. Generate a new app password for "n8n"
  4. Use this password in n8n

#### Option B: SMTP (Any Email Provider)
- **Type**: SMTP
- **Host**: smtp.gmail.com (for Gmail)
- **Port**: 587
- **Username**: your-email@gmail.com
- **Password**: App password
- **Security**: TLS

#### Option C: Outlook/Hotmail
- **Type**: SMTP
- **Host**: smtp-mail.outlook.com
- **Port**: 587
- **Username**: your-email@outlook.com
- **Password**: Your password
- **Security**: TLS

### Step 3: Update Workflow Email Settings
1. Open your workflow: "Enhanced Agent Monitor with Email"
2. Click on the **"Send Email Notifications"** node
3. Update the email fields:
   - **From Email**: your-email@example.com
   - **To Email**: your-email@example.com
   - **Subject**: Leave as is (uses dynamic content)
   - **Text**: Leave as is (uses dynamic content)

### Step 4: Test Email Notifications
Run this test command to trigger an email:
\`\`\`bash
curl -X POST ${workflowManager.n8nUrl}/webhook/agent-events-enhanced \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "audit_completed",
    "agentId": "portfolio_auditor_1752888632025",
    "result": {
      "score": 25,
      "type": "portfolio_health",
      "duration": 5000
    }
  }'
\`\`\`

## 📧 Email Notification Types

### Critical Alerts (Score < 30)
- **Subject**: 🚨 CRITICAL: Portfolio Audit Score [score]
- **Content**: Immediate action required
- **Priority**: Critical

### High Priority (Score < 50)
- **Subject**: ⚠️ HIGH PRIORITY: Portfolio Audit Score [score]
- **Content**: Urgent optimization needed
- **Priority**: High

### Medium Priority (Score < 70)
- **Subject**: 📊 MEDIUM: Portfolio Audit Score [score]
- **Content**: Optimization recommendations
- **Priority**: Medium

### Cost Spikes
- **Emergency (>150%)**: 🚨 EMERGENCY: Cost Spike [percentage]%
- **Critical (>120%)**: 🚨 CRITICAL: Cost Spike [percentage]%
- **High (>100%)**: ⚠️ HIGH: Cost Spike [percentage]%
- **Medium (>80%)**: 📊 MEDIUM: Cost Alert [percentage]%

### Performance Issues
- **Emergency (<20)**: 🚨 EMERGENCY: Performance Score [score]
- **Critical (<40)**: 🚨 CRITICAL: Performance Score [score]
- **High (<60)**: ⚠️ HIGH: Performance Score [score]
- **Medium (<80)**: 📊 MEDIUM: Performance Score [score]

## 🔧 Advanced Email Configuration

### Multiple Recipients
To send to multiple email addresses, separate them with commas:
\`\`\`
your-email@example.com, backup@example.com, admin@example.com
\`\`\`

### Conditional Email Sending
The workflow automatically determines when to send emails based on:
- Event severity (critical, high, medium)
- Priority levels
- Action requirements

### Email Templates
You can customize email templates by modifying the Code node in the workflow.

## 🚨 Troubleshooting

### Emails Not Sending
1. Check email credentials in n8n
2. Verify SMTP settings
3. Check n8n logs for email errors
4. Test with a simple email first

### Gmail Issues
- Use App Passwords, not regular passwords
- Enable "Less secure app access" (if not using App Passwords)
- Check if 2FA is properly configured

### SMTP Issues
- Verify host and port settings
- Check firewall settings
- Ensure TLS/SSL is properly configured

## 📊 Monitoring Email Delivery

### Check Email Logs
1. In n8n dashboard, go to **Executions**
2. Find your workflow execution
3. Click on the **"Send Email Notifications"** node
4. Check the execution logs for email status

### Email Delivery Status
- ✅ **Success**: Email sent successfully
- ❌ **Failed**: Check credentials and settings
- ⏳ **Pending**: Email queued for sending

## 🔄 Integration with Custom Agent

Your custom agent system will automatically send events to this enhanced workflow:

\`\`\`javascript
// The workflow integration automatically sends events
await workflowIntegration.sendAuditCompleted({
    agentId: 'portfolio_auditor_1752888632025',
    result: {
        score: 85,
        type: 'portfolio_health',
        duration: 2500
    }
});
\`\`\`

## 🎯 Next Steps

1. **Configure Email**: Set up your email credentials in n8n
2. **Test Notifications**: Send test events to verify email delivery
3. **Customize Templates**: Modify email content as needed
4. **Monitor Delivery**: Check execution logs for email status
5. **Scale Up**: Add more recipients or notification channels

## 📞 Support

If you encounter issues:
1. Check n8n documentation
2. Review email provider settings
3. Test with simple email first
4. Check n8n execution logs
        `;

        const emailGuidePath = path.join(__dirname, 'email-configuration-guide.md');
        await fs.writeFile(emailGuidePath, emailConfigGuide);
        console.log(`✅ Email configuration guide created: ${emailGuidePath}`);

        // Test the enhanced workflow
        console.log('\n🧪 Testing enhanced workflow...');
        await workflowManager.testEnhancedWorkflow();

        console.log('\n🎉 Enhanced workflow deployment completed!');
        console.log('\n📋 Summary:');
        console.log(`   • Workflow ID: ${workflow.id}`);
        console.log(`   • Webhook URL: ${workflowManager.n8nUrl}/webhook/agent-events-enhanced`);
        console.log(`   • Email Guide: ${emailGuidePath}`);
        console.log(`   • n8n Dashboard: ${workflowManager.n8nUrl}`);

        console.log('\n📧 Email Setup Required:');
        console.log('   1. Configure email credentials in n8n dashboard');
        console.log('   2. Update email addresses in the workflow');
        console.log('   3. Test email notifications');
        console.log('   4. Monitor email delivery');

        console.log('\n🚀 Enhanced Features:');
        console.log('   ✅ Improved HTTP request handling');
        console.log('   ✅ Email notifications for critical events');
        console.log('   ✅ Enhanced error handling');
        console.log('   ✅ Better response headers');
        console.log('   ✅ Conditional email sending');
        console.log('   ✅ Detailed event analysis');

    } catch (error) {
        console.error('❌ Enhanced workflow deployment failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    deployEnhancedWorkflow();
}

module.exports = { deployEnhancedWorkflow }; 