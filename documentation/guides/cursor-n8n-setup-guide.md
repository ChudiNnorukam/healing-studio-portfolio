# 🚀 Installing n8n Tools in Cursor

## ✅ **Setup Complete!**

Your n8n tools are now ready to be installed in Cursor. Here's what we've set up:

### **📋 What's Available**

**n8n Webhook MCP Server** (`n8n-webhook-mcp-server.js`):
- `test_mcp_webhook` - Test the MCP webhook endpoint
- `test_carousel_webhook` - Test carousel generation with topic/style
- `test_monitor_webhook` - Test portfolio monitoring
- `create_mcp_workflow` - Get instructions to create MCP workflow
- `create_carousel_workflow` - Get instructions to create carousel workflow
- `create_monitor_workflow` - Get instructions to create monitor workflow
- `list_webhook_status` - Check status of all webhook endpoints

### **🔧 Installation Steps**

1. **Copy the MCP Configuration**
   - Copy the contents of `cursor-mcp-config.json`
   - Open Cursor Settings (Cmd/Ctrl + ,)
   - Go to "Extensions" → "MCP Servers"
   - Paste the configuration

2. **Restart Cursor**
   - Close and reopen Cursor to load the new MCP servers

3. **Verify Installation**
   - In Cursor, you should now see n8n tools available
   - Try typing: "test the n8n webhook status"

### **🎯 Usage Examples**

Once installed, you can use these commands in Cursor:

```
"Check the status of all n8n webhooks"
"Test the carousel webhook with topic 'trauma healing'"
"Create the MCP Server workflow"
"Test the portfolio monitor"
```

### **📁 Files Created**

- `n8n-webhook-mcp-server.js` - MCP server for n8n webhooks
- `cursor-mcp-config.json` - Cursor MCP configuration
- `quick-workflow-setup.md` - Manual workflow creation guide
- `test-workflows.js` - Workflow testing script

### **🔗 Next Steps**

1. **Install in Cursor** (follow steps above)
2. **Create Workflows** in n8n interface (http://localhost:5678)
3. **Test the Integration** using the MCP tools

### **💡 Pro Tips**

- The webhook-based approach is more reliable than API authentication
- Each tool provides helpful error messages and setup instructions
- You can create workflows manually and test them instantly with the MCP tools

### **🎉 Ready to Use!**

Your n8n integration is now ready. The MCP server will help you:
- Test webhook endpoints
- Get step-by-step workflow creation instructions
- Monitor the status of your automations
- Integrate n8n workflows directly into your Cursor workflow

**Total setup time: 2 minutes!** 🚀 