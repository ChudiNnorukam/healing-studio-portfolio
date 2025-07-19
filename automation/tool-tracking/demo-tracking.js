const { track, startSession, endSession, generateReport } = require('./tool-usage-tracker');

// Demo: Simulate tool usage data
function runDemo() {
    console.log('🎭 Running Tool Usage Tracking Demo...\n');
    
    // Start a demo session
    const sessionId = startSession('demo-session');
    
    // Simulate various tool calls with realistic data
    const demoData = [
        // Desktop Commander tools (most used)
        { tool: 'mcp_Desktop_Commander_read_file', category: 'file_operations', calls: 45, avgTime: 120, errors: 0 },
        { tool: 'mcp_Desktop_Commander_write_file', category: 'file_operations', calls: 23, avgTime: 180, errors: 1 },
        { tool: 'mcp_Desktop_Commander_edit_block', category: 'file_operations', calls: 18, avgTime: 95, errors: 0 },
        { tool: 'mcp_Desktop_Commander_search_files', category: 'file_operations', calls: 12, avgTime: 250, errors: 0 },
        { tool: 'mcp_Desktop_Commander_start_process', category: 'process_management', calls: 8, avgTime: 800, errors: 0 },
        
        // Core tools
        { tool: 'edit_file', category: 'file_operations', calls: 15, avgTime: 150, errors: 0 },
        { tool: 'run_terminal_cmd', category: 'terminal', calls: 10, avgTime: 300, errors: 1 },
        { tool: 'read_file', category: 'file_operations', calls: 8, avgTime: 80, errors: 0 },
        { tool: 'grep_search', category: 'search', calls: 6, avgTime: 200, errors: 0 },
        
        // MCP tools
        { tool: 'mcp_Context7_resolve-library-id', category: 'documentation', calls: 5, avgTime: 1200, errors: 0 },
        { tool: 'mcp_Context7_get-library-docs', category: 'documentation', calls: 4, avgTime: 1500, errors: 0 },
        { tool: 'mcp_n8n-mcp_init-n8n', category: 'automation', calls: 3, avgTime: 2500, errors: 2 },
        { tool: 'mcp_n8n-mcp_list-workflows', category: 'automation', calls: 2, avgTime: 1800, errors: 0 },
        { tool: 'mcp_n8n-mcp_create-workflow', category: 'automation', calls: 1, avgTime: 3500, errors: 1 },
        
        // Low-usage tools (potential candidates for removal)
        { tool: 'mcp_n8n-mcp_activate-workflow', category: 'automation', calls: 1, avgTime: 1200, errors: 0 },
        { tool: 'mcp_n8n-mcp_deactivate-workflow', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-workflow', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_list-projects', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_create-project', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-project', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_update-project', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_list-users', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_create-users', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_get-user', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-user', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_list-variables', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_create-variable', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-variable', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_create-credential', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-credential', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_get-credential-schema', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_list-executions', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_get-execution', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-execution', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_create-tag', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_list-tags', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_get-tag', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_update-tag', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_delete-tag', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_get-workflow-tags', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_update-workflow-tags', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_n8n-mcp_generate-audit', category: 'automation', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_get_config', category: 'system_info', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_list_sessions', category: 'process_management', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_get_usage_stats', category: 'analytics', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_read_multiple_files', category: 'file_operations', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_create_directory', category: 'file_operations', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_move_file', category: 'file_operations', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_search_files', category: 'file_operations', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_search_code', category: 'file_operations', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_get_file_info', category: 'file_operations', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_interact_with_process', category: 'process_management', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_read_process_output', category: 'process_management', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_force_terminate', category: 'process_management', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_list_processes', category: 'process_management', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_kill_process', category: 'process_management', calls: 0, avgTime: 0, errors: 0 },
        { tool: 'mcp_Desktop_Commander_give_feedback_to_desktop_commander', category: 'system_info', calls: 0, avgTime: 0, errors: 0 }
    ];
    
    // Simulate tool calls with realistic timing
    demoData.forEach(item => {
        for (let i = 0; i < item.calls; i++) {
            const success = Math.random() > (item.errors / item.calls);
            const responseTime = item.avgTime + (Math.random() - 0.5) * 200; // Add some variance
            const error = success ? null : new Error(`Demo error for ${item.tool}`);
            
            track(item.tool, item.category, success, responseTime, error);
        }
    });
    
    // End the session
    endSession(sessionId);
    
    console.log('✅ Demo data generated successfully!\n');
}

// Run the demo
runDemo();

// Generate a quick report to show the results
setTimeout(() => {
    console.log('📊 Generating demo report...\n');
    const { quickReport } = require('./auto-tracker');
    quickReport();
    
    console.log('\n🎉 Demo complete! Check tool-usage-report.md for full details.');
}, 1000); 