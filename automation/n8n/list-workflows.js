#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class WorkflowManager {
  constructor() {
    this.workflows = [
      {
        id: 'mcp-server-workflow',
        name: 'MCP Server Workflow',
        description: 'Basic MCP server workflow for n8n integration',
        status: 'ready',
        type: 'webhook',
        path: '/webhook/mcp'
      },
      {
        id: 'content-generation-workflow',
        name: 'Content Generation Workflow',
        description: 'Automated content generation for healing topics',
        status: 'ready',
        type: 'webhook',
        path: '/webhook/content'
      },
      {
        id: 'carousel-automation-workflow',
        name: 'Carousel Automation Workflow',
        description: 'Automated social media carousel creation',
        status: 'ready',
        type: 'webhook',
        path: '/webhook/carousel'
      },
      {
        id: 'portfolio-monitor-workflow',
        name: 'Portfolio Monitor Workflow',
        description: 'Monitor and test portfolio website status',
        status: 'ready',
        type: 'webhook',
        path: '/webhook/monitor'
      }
    ];
  }

  listWorkflows() {
    console.log('📋 Available Workflows:\n');
    
    this.workflows.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name}`);
      console.log(`   ID: ${workflow.id}`);
      console.log(`   Description: ${workflow.description}`);
      console.log(`   Status: ${workflow.status}`);
      console.log(`   Type: ${workflow.type}`);
      console.log(`   Webhook: http://localhost:5678${workflow.path}`);
      console.log('');
    });

    console.log('🔧 Available MCP Tools:');
    console.log('   - trigger_workflow');
    console.log('   - get_workflow_status');
    console.log('   - list_workflows');
    console.log('');
    
    console.log('📝 Usage Examples:');
    console.log('   node cursor-integration.js create_carousel "trauma healing" healing');
    console.log('   node cursor-integration.js monitor_portfolio');
    console.log('   node cursor-integration.js analyze_website https://example.com');
  }

  getWorkflowById(id) {
    return this.workflows.find(w => w.id === id);
  }

  getWorkflowByPath(path) {
    return this.workflows.find(w => w.path === path);
  }

  createWorkflow(name, description, type = 'webhook') {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const path = `/webhook/${id}`;
    
    const workflow = {
      id,
      name,
      description,
      status: 'ready',
      type,
      path
    };
    
    this.workflows.push(workflow);
    return workflow;
  }
}

// Run if called directly
if (require.main === module) {
  const manager = new WorkflowManager();
  manager.listWorkflows();
}

module.exports = WorkflowManager; 