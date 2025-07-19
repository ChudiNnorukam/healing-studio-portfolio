# 🔧 Setting Up n8n Workflows

## 🚨 Current Status
The workflows are **NOT set up** in n8n yet. The webhook URLs are returning 404 errors because no workflows exist.

## ✅ Solution: Manual Setup

### Step 1: Access n8n Interface
1. Open your browser
2. Go to: http://localhost:5678
3. You should see the n8n workflow editor

### Step 2: Create MCP Server Workflow

1. **Click "Add Workflow"**
2. **Add Webhook Node**:
   - Drag "Webhook" from the nodes panel
   - Set HTTP Method to: `GET`
   - Set Path to: `mcp`
   - Enable "Respond with all data"

3. **Add Respond to Webhook Node**:
   - Drag "Respond to Webhook" from the nodes panel
   - Set Response Mode to: `JSON`
   - Set Response Body to:
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

4. **Connect the nodes**: Webhook → Respond to Webhook
5. **Save the workflow** as "MCP Server Workflow"
6. **Activate the workflow** (toggle switch in top-right)

### Step 3: Create Content Generation Workflow

1. **Click "Add Workflow"**
2. **Add Webhook Node**:
   - HTTP Method: `POST`
   - Path: `content`
   - Enable "Respond with all data"

3. **Add HTTP Request Node**:
   - Method: `POST`
   - URL: `https://api.openai.com/v1/chat/completions`
   - Headers: `Authorization: Bearer YOUR_OPENAI_KEY`
   - Body: 
   ```json
   {
     "model": "gpt-4",
     "messages": [
       {
         "role": "user",
         "content": "{{ $json.prompt }}"
       }
     ]
   }
   ```

4. **Add Respond to Webhook Node**:
   - Response Mode: `JSON`
   - Response Body: `{{ $json.choices[0].message.content }}`

5. **Connect**: Webhook → HTTP Request → Respond to Webhook
6. **Save** as "Content Generation Workflow"
7. **Activate** the workflow

### Step 4: Create Carousel Automation Workflow

1. **Click "Add Workflow"**
2. **Add Webhook Node**:
   - HTTP Method: `POST`
   - Path: `carousel`
   - Enable "Respond with all data"

3. **Add Code Node**:
   - JavaScript code to generate carousel content
   - Use your existing carousel-automation-system.js logic

4. **Add Respond to Webhook Node**:
   - Response Mode: `JSON`
   - Response Body: `{{ $json.carousel }}`

5. **Connect**: Webhook → Code → Respond to Webhook
6. **Save** as "Carousel Automation Workflow"
7. **Activate** the workflow

### Step 5: Create Portfolio Monitor Workflow

1. **Click "Add Workflow"**
2. **Add Webhook Node**:
   - HTTP Method: `GET`
   - Path: `monitor`
   - Enable "Respond with all data"

3. **Add HTTP Request Node**:
   - Method: `GET`
   - URL: `https://chudinnorukam.github.io`
   - Check for 200 status

4. **Add Respond to Webhook Node**:
   - Response Mode: `JSON`
   - Response Body:
   ```json
   {
     "status": "{{ $json.status }}",
     "url": "https://chudinnorukam.github.io",
     "timestamp": "{{ $now }}"
   }
   ```

5. **Connect**: Webhook → HTTP Request → Respond to Webhook
6. **Save** as "Portfolio Monitor Workflow"
7. **Activate** the workflow

## 🧪 Testing the Workflows

After setting up all workflows, test them:

```bash
# Test MCP Server
curl http://localhost:5678/webhook/mcp

# Test Content Generation
curl -X POST http://localhost:5678/webhook/content \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write about trauma healing"}'

# Test Carousel Creation
curl -X POST http://localhost:5678/webhook/carousel \
  -H "Content-Type: application/json" \
  -d '{"topic": "inner child healing", "style": "healing"}'

# Test Portfolio Monitor
curl http://localhost:5678/webhook/monitor
```

## 📝 Expected Results

- **MCP Server**: Should return available tools
- **Content Generation**: Should return AI-generated content
- **Carousel**: Should return carousel data
- **Monitor**: Should return portfolio status

## 🔄 Next Steps

1. Follow the steps above to create each workflow
2. Test each webhook URL
3. Use the MCP tools in Cursor to trigger workflows
4. Monitor workflow executions in n8n

The workflows need to be manually created in the n8n interface - they don't exist automatically! 🎯 