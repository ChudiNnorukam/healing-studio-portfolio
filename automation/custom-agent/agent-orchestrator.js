const RecursivePortfolioAuditor = require('./recursive-portfolio-auditor');
const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class AgentOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map();
        this.agentConfigs = new Map();
        this.performanceMetrics = new Map();
        this.auditResults = [];
        this.config = {
            resultsFile: 'agent-audit-results.json',
            metricsFile: 'agent-performance-metrics.json',
            maxAgents: 5,
            autoOptimize: true,
            optimizationInterval: 600000 // 10 minutes
        };
    }

    async createCustomAgent(agentType, config = {}) {
        const agentId = `${agentType}_${Date.now()}`;
        
        if (this.agents.size >= this.config.maxAgents) {
            throw new Error(`Maximum number of agents (${this.config.maxAgents}) reached`);
        }
        
        let agent;
        switch (agentType) {
            case 'portfolio_auditor':
                agent = new RecursivePortfolioAuditor(config);
                break;
            // Add more agent types here
            default:
                throw new Error(`Unknown agent type: ${agentType}`);
        }

        this.agents.set(agentId, agent);
        this.agentConfigs.set(agentId, config);
        
        // Set up event listeners
        this.setupAgentEventListeners(agentId, agent);
        
        this.emit('agent:created', { agentId, agentType, config });
        return agentId;
    }

    setupAgentEventListeners(agentId, agent) {
        agent.on('audit:completed', (result) => {
            this.recordPerformance(agentId, result);
            this.auditResults.push({ agentId, ...result });
            this.emit('audit:completed', { agentId, result });
        });

        agent.on('audit:failed', (error) => {
            this.emit('audit:failed', { agentId, error });
        });

        agent.on('error', (error) => {
            this.emit('agent:error', { agentId, error });
        });

        agent.on('agent:started', (data) => {
            this.emit('agent:started', { agentId, ...data });
        });

        agent.on('agent:stopped', (data) => {
            this.emit('agent:stopped', { agentId, ...data });
        });
    }

    async startAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        await agent.start();
        this.emit('agent:started', { agentId });
    }

    async stopAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            await agent.stop();
            this.emit('agent:stopped', { agentId });
        }
    }

    async stopAllAgents() {
        const stopPromises = Array.from(this.agents.keys()).map(agentId => 
            this.stopAgent(agentId)
        );
        await Promise.all(stopPromises);
    }

    recordPerformance(agentId, result) {
        if (!this.performanceMetrics.has(agentId)) {
            this.performanceMetrics.set(agentId, []);
        }
        
        this.performanceMetrics.get(agentId).push({
            timestamp: new Date(),
            duration: result.duration,
            type: result.type,
            score: result.result.score || result.result.overall || 0,
            depth: result.depth
        });

        // Keep only last 100 metrics per agent
        const metrics = this.performanceMetrics.get(agentId);
        if (metrics.length > 100) {
            metrics.splice(0, metrics.length - 100);
        }
    }

    getAgentPerformance(agentId) {
        return this.performanceMetrics.get(agentId) || [];
    }

    getAllPerformanceMetrics() {
        const allMetrics = {};
        for (const [agentId, metrics] of this.performanceMetrics) {
            allMetrics[agentId] = metrics;
        }
        return allMetrics;
    }

    async optimizeAgent(agentId) {
        const performance = this.getAgentPerformance(agentId);
        const config = this.agentConfigs.get(agentId);
        
        if (performance.length === 0) {
            return { optimized: false, reason: 'No performance data available' };
        }

        // Analyze performance and suggest optimizations
        const optimizations = this.analyzePerformanceForOptimizations(performance, config);
        
        if (optimizations.length > 0) {
            // Apply optimizations
            await this.applyOptimizations(agentId, optimizations);
            return { optimized: true, optimizations };
        }

        return { optimized: false, reason: 'No optimizations needed' };
    }

    analyzePerformanceForOptimizations(performance, config) {
        const optimizations = [];
        
        // Analyze average duration
        const avgDuration = performance.reduce((sum, p) => sum + p.duration, 0) / performance.length;
        if (avgDuration > 5000) { // 5 seconds
            optimizations.push({
                type: 'reduce_audit_depth',
                reason: 'High average duration',
                suggestion: 'Reduce audit depth for faster execution',
                current: config.auditDepth,
                recommended: Math.max(1, config.auditDepth - 1)
            });
        }
        
        // Analyze success rate
        const successRate = performance.filter(p => p.score > 0).length / performance.length;
        if (successRate < 0.8) {
            optimizations.push({
                type: 'improve_error_handling',
                reason: 'Low success rate',
                suggestion: 'Improve error handling and retry logic',
                current: config.maxRetries || 0,
                recommended: (config.maxRetries || 0) + 1
            });
        }

        // Analyze concurrent audit efficiency
        const avgScore = performance.reduce((sum, p) => sum + p.score, 0) / performance.length;
        if (avgScore < 70 && config.maxConcurrentAudits > 1) {
            optimizations.push({
                type: 'reduce_concurrency',
                reason: 'Low average score with high concurrency',
                suggestion: 'Reduce concurrent audits for better quality',
                current: config.maxConcurrentAudits,
                recommended: Math.max(1, config.maxConcurrentAudits - 1)
            });
        }
        
        return optimizations;
    }

    async applyOptimizations(agentId, optimizations) {
        const agent = this.agents.get(agentId);
        const config = this.agentConfigs.get(agentId);
        
        let configChanged = false;
        
        optimizations.forEach(optimization => {
            switch (optimization.type) {
                case 'reduce_audit_depth':
                    config.auditDepth = optimization.recommended;
                    configChanged = true;
                    break;
                case 'improve_error_handling':
                    config.maxRetries = optimization.recommended;
                    configChanged = true;
                    break;
                case 'reduce_concurrency':
                    config.maxConcurrentAudits = optimization.recommended;
                    configChanged = true;
                    break;
            }
        });
        
        if (configChanged) {
            // Restart agent with new config
            await this.stopAgent(agentId);
            await this.startAgent(agentId);
            
            this.emit('agent:optimized', { agentId, optimizations });
        }
    }

    async startAutoOptimization() {
        if (!this.config.autoOptimize) return;
        
        setInterval(async () => {
            for (const agentId of this.agents.keys()) {
                try {
                    await this.optimizeAgent(agentId);
                } catch (error) {
                    this.emit('optimization:error', { agentId, error });
                }
            }
        }, this.config.optimizationInterval);
    }

    async saveResults() {
        try {
            await fs.writeFile(this.config.resultsFile, JSON.stringify(this.auditResults, null, 2));
            console.log('✅ Audit results saved successfully');
        } catch (error) {
            console.error('❌ Failed to save audit results:', error.message);
        }
    }

    async saveMetrics() {
        try {
            const metrics = this.getAllPerformanceMetrics();
            await fs.writeFile(this.config.metricsFile, JSON.stringify(metrics, null, 2));
            console.log('✅ Performance metrics saved successfully');
        } catch (error) {
            console.error('❌ Failed to save performance metrics:', error.message);
        }
    }

    async loadResults() {
        try {
            if (await fs.access(this.config.resultsFile).then(() => true).catch(() => false)) {
                const data = await fs.readFile(this.config.resultsFile, 'utf8');
                this.auditResults = JSON.parse(data);
            }
        } catch (error) {
            console.warn('Could not load audit results:', error.message);
        }
    }

    async loadMetrics() {
        try {
            if (await fs.access(this.config.metricsFile).then(() => true).catch(() => false)) {
                const data = await fs.readFile(this.config.metricsFile, 'utf8');
                const metrics = JSON.parse(data);
                for (const [agentId, agentMetrics] of Object.entries(metrics)) {
                    this.performanceMetrics.set(agentId, agentMetrics);
                }
            }
        } catch (error) {
            console.warn('Could not load performance metrics:', error.message);
        }
    }

    getAuditResults(agentId = null, limit = 50) {
        let results = this.auditResults;
        
        if (agentId) {
            results = results.filter(r => r.agentId === agentId);
        }
        
        return results.slice(-limit);
    }

    getAgentSummary(agentId) {
        const performance = this.getAgentPerformance(agentId);
        const config = this.agentConfigs.get(agentId);
        const recentResults = this.getAuditResults(agentId, 10);
        
        if (performance.length === 0) {
            return { error: 'No performance data available' };
        }

        const avgDuration = performance.reduce((sum, p) => sum + p.duration, 0) / performance.length;
        const avgScore = performance.reduce((sum, p) => sum + p.score, 0) / performance.length;
        const successRate = performance.filter(p => p.score > 0).length / performance.length;

        return {
            agentId,
            config,
            performance: {
                totalAudits: performance.length,
                averageDuration: Math.round(avgDuration),
                averageScore: Math.round(avgScore),
                successRate: Math.round(successRate * 100),
                lastAudit: performance[performance.length - 1]?.timestamp
            },
            recentResults: recentResults.length
        };
    }

    getAllAgentSummaries() {
        const summaries = {};
        for (const agentId of this.agents.keys()) {
            summaries[agentId] = this.getAgentSummary(agentId);
        }
        return summaries;
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalAgents: this.agents.size,
            activeAgents: Array.from(this.agents.keys()),
            agentSummaries: this.getAllAgentSummaries(),
            recentResults: this.getAuditResults(null, 20),
            performance: this.getAllPerformanceMetrics()
        };

        return report;
    }

    async printReport() {
        const report = await this.generateReport();
        
        console.log('\n🤖 AGENT ORCHESTRATOR REPORT');
        console.log('=' .repeat(50));
        console.log(`Total Agents: ${report.totalAgents}`);
        console.log(`Active Agents: ${report.activeAgents.join(', ')}`);
        console.log(`Timestamp: ${report.timestamp}`);
        
        console.log('\n📊 AGENT PERFORMANCE:');
        for (const [agentId, summary] of Object.entries(report.agentSummaries)) {
            if (summary.error) {
                console.log(`  ${agentId}: ${summary.error}`);
            } else {
                console.log(`  ${agentId}:`);
                console.log(`    Total Audits: ${summary.performance.totalAudits}`);
                console.log(`    Avg Duration: ${summary.performance.averageDuration}ms`);
                console.log(`    Avg Score: ${summary.performance.averageScore}`);
                console.log(`    Success Rate: ${summary.performance.successRate}%`);
            }
        }
        
        console.log('\n📈 RECENT RESULTS:');
        report.recentResults.slice(-5).forEach(result => {
            console.log(`  ${result.timestamp}: ${result.type} (${result.duration}ms, score: ${result.result.score || result.result.overall || 'N/A'})`);
        });
    }
}

module.exports = AgentOrchestrator; 