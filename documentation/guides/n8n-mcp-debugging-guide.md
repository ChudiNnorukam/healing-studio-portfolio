# n8n-MCP Debugging Guide

## ✅ Issues Resolved

### 1. Node.js Version Conflict
**Problem**: You were running Node.js v22.16.0, but n8n-mcp requires Node.js v18.17.0
**Solution**: 
```bash
nvm install 18.17.0
nvm use 18.17.0
```

### 2. Environment Variable Missing
**Problem**: Missing required environment variable for n8n community packages
**Solution**:
```bash
export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

### 3. n8n Version Compatibility
**Problem**: Latest n8n (1.102.4) requires Node.js >=20.19, but n8n-mcp needs v18.17.0
**Solution**: Installed n8n v0.234.0 which is compatible with Node.js v18.17.0

## 🔧 Current Setup

### Installed Packages
- ✅ n8n v0.234.0 (compatible with Node.js v18.17.0)
- ✅ n8n-mcp v2.7.20
- ✅ n8n-nodes-mcp v0.1.28
- ✅ @modelcontextprotocol/sdk v1.16.0

### Configuration Files
1. **cursor-mcp-config.json** - Updated with n8n-mcp server
2. **n8n-mcp-server.js** - Custom MCP server implementation
3. **n8n-mcp-workflow.json** - n8n workflow template

## 🚀 How to Use

### 1. Start n8n
```bash
n8n start
```
n8n will be available at: http://localhost:5678

### 2. Test MCP Server
```bash
node test-mcp-server.js
```

### 3. Restart Cursor
After updating the MCP configuration, restart Cursor to load the new MCP servers.

## 🔍 Troubleshooting

### If Cursor Still Shows "Loading Tools..."

1. **Check Node.js Version**:
   ```bash
   node --version
   # Should show v18.17.0
   ```

2. **Verify Environment Variable**:
   ```bash
   echo $N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE
   # Should show "true"
   ```

3. **Test MCP Server Manually**:
   ```bash
   node n8n-mcp-server.js
   ```

4. **Check Cursor MCP Configuration**:
   - Open Cursor
   - Go to Settings > Extensions > MCP
   - Verify the configuration matches cursor-mcp-config.json

### Common Issues

1. **"Stuck Run Loop"**: Usually caused by Node.js version mismatch
2. **"Loading Tools..."**: MCP server not responding or configuration error
3. **"Unauthorized"**: n8n API requires authentication (use webhook URLs instead)

## 📋 Available Tools

The n8n-mcp server provides these tools:
- `trigger_workflow` - Trigger an n8n workflow
- `get_workflow_status` - Check workflow execution status
- `list_workflows` - List available workflows

## 🔄 Next Steps

1. **Create n8n Workflows**: Build workflows for your content automation
2. **Test Integration**: Use the MCP tools in Cursor to trigger workflows
3. **Monitor Performance**: Check n8n execution logs for any issues

## 🆘 Getting Help

If you encounter issues:
1. Check this debugging guide
2. Verify all versions match the requirements
3. Test each component individually
4. Check n8n logs at http://localhost:5678

## 📝 Notes

- Keep Node.js at v18.17.0 for n8n-mcp compatibility
- The environment variable must be set in each new terminal session
- n8n must be running for MCP tools to work
- Cursor needs to be restarted after MCP configuration changes 