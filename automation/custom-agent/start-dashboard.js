const AgentOrchestrator = require('./agent-orchestrator');
const AgentDashboard = require('./web-dashboard');
const { startCustomAgent } = require('./start-custom-agent');

async function startDashboard() {
    try {
        // Start the agent system
        const { orchestrator, agentId } = await startCustomAgent();
        
        // Start the web dashboard
        const dashboard = new AgentDashboard(orchestrator, 3001);
        dashboard.start();
        
        console.log('🚀 Custom Agent System and Dashboard started successfully!');
        console.log('📊 Dashboard available at: http://localhost:3001');
        console.log('🤖 Agent ID:', agentId);
        
    } catch (error) {
        console.error('❌ Failed to start dashboard:', error);
        process.exit(1);
    }
}

// Start if run directly
if (require.main === module) {
    startDashboard();
}

module.exports = { startDashboard }; 