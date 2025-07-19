const AgentOrchestrator = require('./agent-orchestrator');
const path = require('path');
const workflowIntegration = require('./workflow-integration');

async function startCustomAgent() {
    const orchestrator = new AgentOrchestrator();
    
    // Load existing data
    await orchestrator.loadResults();
    await orchestrator.loadMetrics();
    
    // Set up orchestrator event listeners
    orchestrator.on('audit:completed', async ({ agentId, result }) => {
        console.log(`[${new Date().toISOString()}] ✅ Audit completed by ${agentId}:`, {
            type: result.type,
            duration: result.duration,
            score: result.result.score || result.result.overall || 'N/A'
        });
        
        // Send to n8n workflow
        await workflowIntegration.sendAuditCompleted({ agentId, result });
    });

    orchestrator.on('audit:failed', async ({ agentId, error }) => {
        console.error(`[${new Date().toISOString()}] ❌ Audit failed by ${agentId}:`, error);
        
        // Send to n8n workflow
        await workflowIntegration.sendAgentError({ agentId, error, timestamp: new Date() });
    });

    orchestrator.on('agent:error', async ({ agentId, error }) => {
        console.error(`[${new Date().toISOString()}] 🚨 Agent error in ${agentId}:`, error);
        
        // Send to n8n workflow
        await workflowIntegration.sendAgentError({ agentId, error, timestamp: new Date() });
    });

    orchestrator.on('agent:optimized', async ({ agentId, optimizations }) => {
        console.log(`[${new Date().toISOString()}] 🔧 Agent ${agentId} optimized:`, optimizations);
        
        // Send to n8n workflow
        await workflowIntegration.sendAgentOptimized({ agentId, optimizations, reason: 'Auto-optimization' });
    });

    orchestrator.on('optimization:error', ({ agentId, error }) => {
        console.error(`[${new Date().toISOString()}] ⚠️ Optimization error for ${agentId}:`, error);
    });

    // Create and start the portfolio auditor agent
    const agentId = await orchestrator.createCustomAgent('portfolio_auditor', {
        auditInterval: 300000, // 5 minutes
        maxConcurrentAudits: 3,
        auditDepth: 3,
        maxRetries: 2
    });

    await orchestrator.startAgent(agentId);
    
    console.log(`🤖 Custom agent started with ID: ${agentId}`);
    
    // Start auto-optimization
    orchestrator.startAutoOptimization();
    
    // Start workflow monitoring
    await workflowIntegration.startMonitoring();
    
    // Set up periodic reporting
    setInterval(async () => {
        await orchestrator.printReport();
    }, 300000); // Every 5 minutes
    
    // Set up graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down agents...');
        await orchestrator.stopAllAgents();
        await orchestrator.saveResults();
        await orchestrator.saveMetrics();
        console.log('✅ Shutdown complete');
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Shutting down agents...');
        await orchestrator.stopAllAgents();
        await orchestrator.saveResults();
        await orchestrator.saveMetrics();
        console.log('✅ Shutdown complete');
        process.exit(0);
    });
    
    return { orchestrator, agentId };
}

// Start the agent if this file is run directly
if (require.main === module) {
    startCustomAgent().catch(console.error);
}

module.exports = { startCustomAgent }; 