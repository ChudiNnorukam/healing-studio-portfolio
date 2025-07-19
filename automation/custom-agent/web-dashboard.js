const express = require('express');
const path = require('path');
const AgentOrchestrator = require('./agent-orchestrator');

class AgentDashboard {
    constructor(orchestrator, port = 3001) {
        this.orchestrator = orchestrator;
        this.port = port;
        this.app = express();
        this.setupRoutes();
    }

    setupRoutes() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'dashboard-static')));

        // API Routes
        this.app.get('/api/agents', (req, res) => {
            const summaries = this.orchestrator.getAllAgentSummaries();
            res.json(summaries);
        });

        this.app.get('/api/results', (req, res) => {
            const agentId = req.query.agentId;
            const limit = parseInt(req.query.limit) || 50;
            const results = this.orchestrator.getAuditResults(agentId, limit);
            res.json(results);
        });

        this.app.get('/api/metrics', (req, res) => {
            const metrics = this.orchestrator.getAllPerformanceMetrics();
            res.json(metrics);
        });

        this.app.get('/api/report', async (req, res) => {
            const report = await this.orchestrator.generateReport();
            res.json(report);
        });

        this.app.post('/api/agents/:agentId/optimize', async (req, res) => {
            try {
                const { agentId } = req.params;
                const result = await this.orchestrator.optimizeAgent(agentId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/agents/:agentId/stop', async (req, res) => {
            try {
                const { agentId } = req.params;
                await this.orchestrator.stopAgent(agentId);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/agents/:agentId/start', async (req, res) => {
            try {
                const { agentId } = req.params;
                await this.orchestrator.startAgent(agentId);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/agents/create', async (req, res) => {
            try {
                const { agentType, config } = req.body;
                const agentId = await this.orchestrator.createCustomAgent(agentType, config);
                await this.orchestrator.startAgent(agentId);
                res.json({ agentId, success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Serve the main dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard-static', 'index.html'));
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Agent Dashboard running on http://localhost:${this.port}`);
        });
    }
}

module.exports = AgentDashboard; 