# 🚀 **Cursor Background Agent + n8n Browser Automation Setup Guide**

## **📋 Overview**

This guide sets up an integrated system combining:
- ✅ **Enhanced MCP Server** with browser automation capabilities
- ✅ **Comprehensive Cost Monitoring** with budget protection
- ✅ **Cursor Background Agent** integration 
- ✅ **n8n Workflow Automation** via UI and API

**🔒 Cost Safety**: All operations are monitored and protected by strict budget limits ($0.50 daily, $15 monthly).

---

## **⚡ Quick Start (5 Minutes)**

### **1. Install Dependencies**
```bash
cd automation/n8n
npm run setup
```

### **2. Start Cost Monitor**
```bash
npm run monitor &
```

### **3. Launch Enhanced MCP Server**
```bash
npm start
```

### **4. Configure Cursor MCP**
Add to your Cursor MCP settings:
```json
{
  "mcpServers": {
    "enhanced-n8n-browser": {
      "command": "node",
      "args": ["automation/n8n/enhanced-n8n-browser-mcp-server.js"]
    }
  }
}
```

### **5. Test Background Agent**
```bash
# In Cursor, press Ctrl+E and try:
"Use the enhanced-n8n-browser MCP to check my current budget status"
```

---

## **🔧 Detailed Setup**

### **System Requirements**
- ✅ **Node.js** 18+ 
- ✅ **Chrome/Chromium** (auto-installed via Puppeteer)
- ✅ **n8n Instance** running on `localhost:5678`
- ✅ **Cursor Pro Plan** with Background Agents enabled

### **Configuration Files Created**
```
├── automation/n8n/
│   ├── enhanced-n8n-browser-mcp-server.js     # Main MCP server
│   ├── package.json                           # Dependencies
│   └── CURSOR_BACKGROUND_AGENT_SETUP_GUIDE.md # This guide
├── automation/cost-monitor/
│   └── enhanced-cost-monitor.js               # Cost tracking system
├── configuration/
│   ├── cursor/cursor-mcp-browser-config.json  # Cursor MCP settings
│   └── cost-monitor/cost-monitor-config.json  # Budget limits
└── temp/reports/                              # Usage tracking data
```

---

## **💰 Cost Management System**

### **Budget Protection Features**
- 🚨 **Hard Stop**: Operations blocked at budget limits
- ⚠️  **Alerts**: Warnings at 80% usage
- 📊 **Real-time Tracking**: Every operation monitored
- 📈 **Projections**: Predict daily/monthly usage
- 🔄 **Auto-reset**: Daily/monthly budget cycles

### **Budget Limits**
```json
{
  "dailyLimit": 0.50,      // $0.50 per day
  "monthlyLimit": 15.00,   // $15.00 per month  
  "alertThreshold": 0.80,  // 80% alert level
  "emergencyThreshold": 0.90 // 90% emergency stop
}
```

### **Cost Per Operation**
| Operation Type | Simple | Medium | Complex |
|---------------|--------|--------|---------|
| Browser Automation | $0.03 | $0.08 | $0.15 |
| Workflow Import | $0.02 | $0.05 | $0.10 |
| API Calls | $0.01 | $0.03 | $0.05 |

---

## **🎯 Background Agent Usage**

### **1. Check Budget Before Operations**
```
"Before we start, check my current budget status using the enhanced MCP server"
```

### **2. Import n8n Workflows**
```
"Use browser automation to import the workflow JSON at 'simple-social-workflow.json' into my n8n dashboard at localhost:5678, name it 'Social Media Automation v2'"
```

### **3. Configure Multiple Nodes**
```
"Navigate to workflow ID '123' and configure these nodes:
- OpenAI node: set API key and model to gpt-4
- Gmail node: configure SMTP settings  
- Webhook node: set URL to my endpoint
Take a screenshot when done."
```

### **4. Bulk Workflow Deployment**
```
"Deploy these 3 workflows simultaneously:
1. pinterest-trauma-healing-workflow.json
2. inner-child-pinterest-workflow.json  
3. cost-effective-carousel-content-workflow.json

Configure credentials for each and activate them."
```

### **5. Monitor and Report**
```
"Generate a cost report for the last 7 days and provide optimization recommendations"
```

---

## **🛠️ Available MCP Tools**

### **Cost Management Tools**
- ✅ `check_budget_status` - Current usage and limits
- ✅ `estimate_operation_cost` - Preview costs before execution

### **n8n API Tools**  
- ✅ `list_workflows` - Show all workflows
- ✅ `get_workflow_details` - Detailed workflow info
- ✅ `trigger_workflow` - Execute workflows programmatically

### **Browser Automation Tools**
- ✅ `open_n8n_dashboard` - Launch browser to n8n UI
- ✅ `import_workflow_json` - Upload workflow files via UI
- ✅ `configure_workflow_nodes` - Set node parameters
- ✅ `bulk_workflow_deployment` - Deploy multiple workflows
- ✅ `take_screenshot` - Capture current state for debugging

---

## **🚨 Safety & Emergency Procedures**

### **Budget Exceeded Response**
```bash
# Manual cost check
npm run generate-report

# Emergency stop all operations
pkill -f "enhanced-n8n-browser-mcp-server"
pkill -f "enhanced-cost-monitor"
```

### **Background Agent Safety Settings**
```json
{
  "maxConcurrentOperations": 3,
  "costSafetyMode": true,
  "autoApproveLimit": 0.10,
  "requireConfirmationAbove": 0.25,
  "emergencyStopAt": 0.45
}
```

### **Emergency Commands**
- ⛔ **Stop All**: `npm run stop-all`
- 📊 **Quick Status**: `npm run health-check`  
- 🔄 **Restart Safe**: `npm run restart-safe`

---

## **📊 Monitoring & Reporting**

### **Real-time Monitoring**
```bash
# Watch cost usage live
npm run monitor

# Generate detailed report
npm run generate-report
```

### **Dashboard Access**
- 📊 **Cost Monitor**: `http://localhost:3001/cost-dashboard`
- 🔧 **n8n Interface**: `http://localhost:5678`
- 📈 **Usage Reports**: `temp/reports/`

### **Alert Types**
- 🚨 **Emergency**: 90%+ budget usage
- ⚠️  **Warning**: 80%+ budget usage  
- 📊 **High Frequency**: 20+ operations/hour
- 💰 **Expensive Operation**: >$0.08 per operation

---

## **🎯 Optimization Tips**

### **Cost Reduction Strategies**
1. ✅ **Use API First**: Try n8n API before browser automation
2. ✅ **Batch Operations**: Group multiple configs together
3. ✅ **Cache Results**: Reuse workflow IDs and configurations
4. ✅ **Precise Prompts**: Specific instructions reduce retries

### **Performance Optimization**
```javascript
// Prefer this (API - $0.02):
await mcp.call('trigger_workflow', { workflow_id: '123' });

// Over this (Browser - $0.08):
await mcp.call('open_n8n_dashboard');
await mcp.call('configure_workflow_nodes', {...});
```

### **Background Agent Best Practices**
- 📝 **Specific Prompts**: "Import workflow X with settings Y"
- 💰 **Cost Awareness**: Always check budget first
- 🔄 **Error Handling**: Request fallback strategies
- 📊 **Verification**: Ask for screenshots/confirmations

---

## **🔍 Troubleshooting**

### **Common Issues**

#### **Budget Exceeded Error**
```
Error: DAILY BUDGET EXCEEDED: $0.52 > $0.50
```
**Solution**: Wait for daily reset or increase limits in `cost-monitor-config.json`

#### **Browser Launch Failed**
```
Error: Failed to launch browser
```
**Solution**: 
```bash
npm run install-deps
export DISPLAY=:0  # If on Linux/WSL
```

#### **n8n Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:5678
```
**Solution**: 
```bash
cd automation/n8n
./start-n8n.sh
```

#### **MCP Server Not Found**
**Solution**: Update Cursor MCP settings and restart:
```json
{
  "mcpServers": {
    "enhanced-n8n-browser": {
      "command": "node",
      "args": ["./automation/n8n/enhanced-n8n-browser-mcp-server.js"],
      "cwd": "/full/path/to/workspace"
    }
  }
}
```

### **Debug Mode**
```bash
DEBUG=* npm start              # Verbose logging
npm run dev                    # Auto-reload on changes
npm run test:integration       # Run integration tests
```

---

## **📈 Advanced Usage Examples**

### **Complex Workflow Import + Configuration**
```
"I need you to:
1. Check budget status first
2. Import 'enhanced-workflow-with-email.js' as 'Email Marketing v3'  
3. Configure the Gmail node with SMTP settings
4. Set the OpenAI node to use gpt-4-turbo
5. Configure webhook URLs for all webhook nodes
6. Test the workflow with sample data
7. Take screenshots of each step
8. Provide a cost breakdown"
```

### **Multi-Environment Deployment**
```
"Deploy the same workflow to 3 different n8n instances:
- localhost:5678 (development)
- staging.n8n.mycompany.com (staging)  
- production.n8n.mycompany.com (production)

Use different API keys for each environment and activate only in development initially."
```

### **Workflow Health Check Automation**
```
"Create a monitoring workflow that:
1. Lists all workflows in my n8n instance
2. Checks which ones haven't run in 7 days
3. Tests inactive workflows with sample data
4. Generates a health report
5. Sends me an email summary
Set this to run daily."
```

---

## **🚀 Next Steps**

1. ✅ **Complete Setup**: Follow Quick Start guide
2. ✅ **Test Basic Operations**: Import one workflow manually
3. ✅ **Configure Budget Alerts**: Set up email/Slack notifications
4. ✅ **Create Workflow Templates**: Build reusable configurations
5. ✅ **Scale Usage**: Gradually increase automation complexity

### **Integration Opportunities**
- 🔗 **GitHub Actions**: Auto-deploy workflows on code changes
- 📧 **Email Alerts**: Budget and error notifications
- 📱 **Slack Integration**: Team workflow status updates
- 🔄 **Zapier Backup**: Fallback automation if n8n fails

---

## **📞 Support & Feedback**

- 🐛 **Issues**: Create GitHub issue with MCP server logs
- 💡 **Feature Requests**: Tag as 'enhancement' 
- 📧 **Email**: your-email@domain.com
- 💬 **Discussion**: GitHub Discussions tab

---

**🎉 You're now ready to use Cursor Background Agents with n8n browser automation while staying within budget! Start with simple operations and gradually scale up as you become comfortable with the system.** 