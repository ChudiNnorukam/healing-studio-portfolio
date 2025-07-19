const { tracker, track, startSession, endSession, generateReport } = require('./tool-usage-tracker');

// Tool categories for better organization
const TOOL_CATEGORIES = {
    // Desktop Commander tools
    'mcp_Desktop_Commander_read_file': 'file_operations',
    'mcp_Desktop_Commander_write_file': 'file_operations',
    'mcp_Desktop_Commander_edit_block': 'file_operations',
    'mcp_Desktop_Commander_list_directory': 'file_operations',
    'mcp_Desktop_Commander_search_files': 'file_operations',
    'mcp_Desktop_Commander_search_code': 'file_operations',
    'mcp_Desktop_Commander_start_process': 'process_management',
    'mcp_Desktop_Commander_interact_with_process': 'process_management',
    'mcp_Desktop_Commander_read_process_output': 'process_management',
    'mcp_Desktop_Commander_get_file_info': 'file_operations',
    'mcp_Desktop_Commander_create_directory': 'file_operations',
    'mcp_Desktop_Commander_move_file': 'file_operations',
    'mcp_Desktop_Commander_get_config': 'system_info',
    'mcp_Desktop_Commander_list_sessions': 'process_management',
    'mcp_Desktop_Commander_get_usage_stats': 'analytics',
    
    // Core tools
    'read_file': 'file_operations',
    'edit_file': 'file_operations',
    'search_replace': 'file_operations',
    'run_terminal_cmd': 'terminal',
    'list_dir': 'file_operations',
    'grep_search': 'search',
    'codebase_search': 'search',
    'file_search': 'file_operations',
    'delete_file': 'file_operations',
    
    // MCP tools
    'mcp_Context7_resolve-library-id': 'documentation',
    'mcp_Context7_get-library-docs': 'documentation',
    'mcp_n8n-mcp_init-n8n': 'automation',
    'mcp_n8n-mcp_list-workflows': 'automation',
    'mcp_n8n-mcp_create-workflow': 'automation',
    'mcp_n8n-mcp_activate-workflow': 'automation',
    
    // Default category for unknown tools
    'default': 'unknown'
};

// Performance monitoring wrapper
function trackToolUsage(toolName, originalFunction) {
    return async function(...args) {
        const startTime = Date.now();
        let success = true;
        let error = null;
        let result = null;
        
        try {
            result = await originalFunction.apply(this, args);
            return result;
        } catch (err) {
            success = false;
            error = err;
            throw err;
        } finally {
            const responseTime = Date.now() - startTime;
            const category = TOOL_CATEGORIES[toolName] || TOOL_CATEGORIES.default;
            
            track(toolName, category, success, responseTime, error);
            
            // Log performance issues
            if (responseTime > 5000) {
                console.warn(`⚠️ Slow tool: ${toolName} took ${responseTime}ms`);
            }
            
            if (!success) {
                console.error(`❌ Tool error: ${toolName} - ${error?.message || error}`);
            }
        }
    };
}

// Quick analysis functions
function analyzeToolUsage() {
    const data = tracker.data;
    const tools = Object.values(data.tools);
    
    console.log('\n🔍 Quick Tool Usage Analysis');
    console.log('============================');
    
    // Most used tools
    const mostUsed = tools.sort((a, b) => b.calls - a.calls).slice(0, 5);
    console.log('\n🏆 Most Used Tools:');
    mostUsed.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}: ${tool.calls} calls`);
    });
    
    // Performance issues
    const slowTools = tools.filter(t => t.averageResponseTime > 2000);
    if (slowTools.length > 0) {
        console.log('\n🐌 Slow Tools (>2s avg):');
        slowTools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.averageResponseTime.toFixed(0)}ms avg`);
        });
    }
    
    // Error-prone tools
    const errorTools = tools.filter(t => t.failedCalls > 0);
    if (errorTools.length > 0) {
        console.log('\n⚠️ Tools with Errors:');
        errorTools.forEach(tool => {
            const errorRate = ((tool.failedCalls / tool.calls) * 100).toFixed(1);
            console.log(`- ${tool.name}: ${tool.failedCalls} errors (${errorRate}%)`);
        });
    }
    
    // Unused tools (if we have a baseline)
    const unusedTools = tools.filter(t => t.calls === 0);
    if (unusedTools.length > 0) {
        console.log(`\n📦 Unused Tools: ${unusedTools.length} tools with 0 calls`);
    }
    
    console.log(`\n📊 Total: ${data.summary.totalCalls} calls across ${data.summary.uniqueTools} tools`);
}

// Optimization recommendations
function getOptimizationRecommendations() {
    const data = tracker.data;
    const tools = Object.values(data.tools);
    
    const recommendations = {
        keep: [],
        remove: [],
        optimize: [],
        monitor: []
    };
    
    tools.forEach(tool => {
        // High-value tools (keep)
        if (tool.calls >= 10 && tool.successfulCalls / tool.calls > 0.9) {
            recommendations.keep.push(tool.name);
        }
        
        // Low-usage tools (consider removing)
        if (tool.calls <= 2 && tool.lastUsed < Date.now() - (7 * 24 * 60 * 60 * 1000)) {
            recommendations.remove.push(tool.name);
        }
        
        // Performance issues (optimize)
        if (tool.averageResponseTime > 3000 || (tool.failedCalls / tool.calls) > 0.2) {
            recommendations.optimize.push(tool.name);
        }
        
        // Monitor for issues
        if (tool.calls > 5 && (tool.failedCalls / tool.calls) > 0.1) {
            recommendations.monitor.push(tool.name);
        }
    });
    
    return recommendations;
}

// Export functions
module.exports = {
    trackToolUsage,
    analyzeToolUsage,
    getOptimizationRecommendations,
    TOOL_CATEGORIES,
    
    // Convenience functions
    quickReport: () => {
        analyzeToolUsage();
        const recs = getOptimizationRecommendations();
        
        console.log('\n💡 Recommendations:');
        if (recs.keep.length > 0) {
            console.log(`✅ Keep: ${recs.keep.slice(0, 5).join(', ')}${recs.keep.length > 5 ? '...' : ''}`);
        }
        if (recs.remove.length > 0) {
            console.log(`🗑️ Consider removing: ${recs.remove.slice(0, 5).join(', ')}${recs.remove.length > 5 ? '...' : ''}`);
        }
        if (recs.optimize.length > 0) {
            console.log(`🔧 Optimize: ${recs.optimize.join(', ')}`);
        }
        if (recs.monitor.length > 0) {
            console.log(`👀 Monitor: ${recs.monitor.join(', ')}`);
        }
    },
    
    // Start tracking session
    startSession: (sessionName = 'auto-tracker') => {
        startSession(sessionName);
        console.log(`🚀 Auto-tracking started for session: ${sessionName}`);
    },
    
    // Generate full report
    generateFullReport: () => {
        const report = generateReport();
        console.log('\n📊 Full report generated!');
        return report;
    }
};

// Auto-start if running directly
if (require.main === module) {
    startSession('auto-tracker-demo');
    console.log('🛠️ Auto-tracker initialized');
    console.log('Use quickReport() for instant analysis');
    console.log('Use generateFullReport() for detailed report');
} 