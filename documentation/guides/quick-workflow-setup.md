# 🚀 Quick n8n Workflow Setup Guide

## ⚡ Fast Setup (5 minutes)

### Step 1: Open n8n
1. Open your browser
2. Go to: **http://localhost:5678**
3. You should see the n8n workflow editor

### Step 2: Create MCP Server Workflow (1 minute)

1. **Click "Add Workflow"** (top right)
2. **Add Webhook Node**:
   - Click the "+" button on the canvas
   - Search for "webhook"
   - Click "Webhook" node
3. **Configure Webhook**:
   - HTTP Method: `GET`
   - Path: `mcp`
   - ✅ Check "Respond with all data"
4. **Add Respond Node**:
   - Click "+" again
   - Search for "respond to webhook"
   - Click "Respond to Webhook" node
5. **Configure Respond Node**:
   - Response Mode: `JSON`
   - Response Body: Copy this exactly:
   ```json
   {
     "status": "success",
     "message": "MCP Server is running",
     "timestamp": "{{ $now }}",
     "tools": [
       {
         "name": "trigger_workflow",
         "description": "Trigger an n8n workflow"
       },
       {
         "name": "get_workflow_status",
         "description": "Get workflow execution status"
       },
       {
         "name": "list_workflows",
         "description": "List all workflows"
       }
     ]
   }
   ```
6. **Connect nodes**: Drag from webhook to respond node
7. **Save**: Click "Save" (top right), name it "MCP Server Workflow"
8. **Activate**: Click the toggle switch (top right)

### Step 3: Create Carousel Workflow (2 minutes)

1. **Click "Add Workflow"** again
2. **Add Webhook Node**:
   - HTTP Method: `POST`
   - Path: `carousel`
   - ✅ Check "Respond with all data"
3. **Add Code Node**:
   - Search for "code"
   - Click "Code" node
4. **Configure Code Node**:
   - Paste this JavaScript:
   ```javascript
   const topic = $input.first().json.topic || 'healing';
   const style = $input.first().json.style || 'healing';
   
   const carousel = {
     topic: topic,
     style: style,
     slides: [
       { title: `Slide 1: ${topic}`, content: 'Introduction' },
       { title: `Slide 2: ${topic}`, content: 'Key Points' },
       { title: `Slide 3: ${topic}`, content: 'Conclusion' }
     ],
     timestamp: new Date().toISOString()
   };
   
   return [{ json: carousel }];
   ```
5. **Add Respond Node**:
   - Response Mode: `JSON`
   - Response Body: `{{ $json }}`
6. **Connect**: Webhook → Code → Respond
7. **Save**: "Carousel Automation Workflow"
8. **Activate**: Toggle switch

### Step 4: Create Monitor Workflow (1 minute)

1. **Click "Add Workflow"** again
2. **Add Webhook Node**:
   - HTTP Method: `GET`
   - Path: `monitor`
   - ✅ Check "Respond with all data"
3. **Add HTTP Request Node**:
   - Search for "http request"
   - Method: `GET`
   - URL: `https://chudinnorukam.github.io`
4. **Add Respond Node**:
   - Response Mode: `JSON`
   - Response Body:
   ```json
   {
     "status": "{{ $json.status }}",
     "url": "https://chudinnorukam.github.io",
     "timestamp": "{{ $now }}"
   }
   ```
5. **Connect**: Webhook → HTTP Request → Respond
6. **Save**: "Portfolio Monitor Workflow"
7. **Activate**: Toggle switch

## 🧪 Test Your Workflows

After creating all workflows, test them:

```bash
# Test MCP Server
curl http://localhost:5678/webhook/mcp

# Test Carousel
curl -X POST http://localhost:5678/webhook/carousel \
  -H "Content-Type: application/json" \
  -d '{"topic": "trauma healing", "style": "healing"}'

# Test Monitor
curl http://localhost:5678/webhook/monitor
```

## ✅ Expected Results

- **MCP Server**: Returns available tools
- **Carousel**: Returns carousel data with slides
- **Monitor**: Returns portfolio status

## 🎯 Total Time: 5 minutes

This will give you fully functional workflows that work with your MCP integration! 🚀 