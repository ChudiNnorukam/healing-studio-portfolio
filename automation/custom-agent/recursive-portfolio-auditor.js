const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');
const CostMonitor = require('../cost-monitor/cost-monitor');

class RecursivePortfolioAuditor extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            auditInterval: config.auditInterval || 300000, // 5 minutes
            maxConcurrentAudits: config.maxConcurrentAudits || 3,
            auditDepth: config.auditDepth || 3,
            maxRetries: config.maxRetries || 2,
            ...config
        };
        
        this.auditQueue = [];
        this.activeAudits = new Set();
        this.auditHistory = new Map();
        this.isRunning = false;
        this.auditResults = [];
        this.costMonitor = new CostMonitor();
        this.lastFileCheck = new Date();
        this.fileHashes = new Map();
    }

    async start() {
        this.isRunning = true;
        this.emit('agent:started', { timestamp: new Date() });
        
        // Initialize file monitoring
        await this.initializeFileMonitoring();
        
        // Start the main audit loop
        this.auditLoop();
        
        // Start periodic full audits
        this.periodicAudit();
    }

    async stop() {
        this.isRunning = false;
        this.emit('agent:stopped', { timestamp: new Date() });
    }

    async auditLoop() {
        while (this.isRunning) {
            try {
                // Process audit queue
                await this.processAuditQueue();
                
                // Trigger new audits based on events
                await this.triggerEventBasedAudits();
                
                // Wait before next iteration
                await this.sleep(1000);
            } catch (error) {
                this.emit('error', { error, timestamp: new Date() });
            }
        }
    }

    async processAuditQueue() {
        while (this.auditQueue.length > 0 && 
               this.activeAudits.size < this.config.maxConcurrentAudits) {
            
            const auditTask = this.auditQueue.shift();
            this.activeAudits.add(auditTask.id);
            
            // Execute audit asynchronously
            this.executeAudit(auditTask).finally(() => {
                this.activeAudits.delete(auditTask.id);
            });
        }
    }

    async executeAudit(auditTask) {
        const startTime = Date.now();
        this.emit('audit:started', { task: auditTask, timestamp: new Date() });

        try {
            let result;
            
            switch (auditTask.type) {
                case 'portfolio_health':
                    result = await this.auditPortfolioHealth(auditTask.depth);
                    break;
                case 'cost_optimization':
                    result = await this.auditCostOptimization(auditTask.depth);
                    break;
                case 'workflow_efficiency':
                    result = await this.auditWorkflowEfficiency(auditTask.depth);
                    break;
                case 'content_quality':
                    result = await this.auditContentQuality(auditTask.depth);
                    break;
                case 'comprehensive_audit':
                    result = await this.auditComprehensive(auditTask.depth);
                    break;
                default:
                    result = await this.auditGeneric(auditTask);
            }

            const duration = Date.now() - startTime;
            const auditResult = {
                id: auditTask.id,
                type: auditTask.type,
                result,
                duration,
                timestamp: new Date(),
                depth: auditTask.depth
            };

            this.auditResults.push(auditResult);
            this.auditHistory.set(auditTask.id, auditResult);
            
            this.emit('audit:completed', auditResult);
            
            // Trigger recursive audits based on results
            await this.triggerRecursiveAudits(auditResult);
            
        } catch (error) {
            this.emit('audit:failed', { 
                task: auditTask, 
                error, 
                timestamp: new Date() 
            });
        }
    }

    async auditPortfolioHealth(depth = 1) {
        const healthChecks = [
            this.checkFileStructure(),
            this.checkBrokenLinks(),
            this.checkPerformanceMetrics(),
            this.checkSEOOptimization()
        ];

        const results = await Promise.allSettled(healthChecks);
        
        return {
            score: this.calculateHealthScore(results),
            issues: this.extractIssues(results),
            recommendations: this.generateRecommendations(results, depth)
        };
    }

    async auditCostOptimization(depth = 1) {
        const costChecks = [
            this.analyzeOpenAICosts(),
            this.analyzeInfrastructureCosts(),
            this.analyzeToolUsageEfficiency()
        ];

        const results = await Promise.allSettled(costChecks);
        
        return {
            totalCost: this.calculateTotalCost(results),
            costTrends: this.analyzeCostTrends(),
            optimizationOpportunities: this.identifyOptimizations(results, depth)
        };
    }

    async auditWorkflowEfficiency(depth = 1) {
        const workflowChecks = [
            this.analyzeN8nWorkflows(),
            this.analyzeAutomationScripts(),
            this.analyzeMCPPerformance()
        ];

        const results = await Promise.allSettled(workflowChecks);
        
        return {
            efficiency: this.calculateEfficiencyScore(results),
            bottlenecks: this.identifyBottlenecks(results),
            improvements: this.suggestWorkflowImprovements(results, depth)
        };
    }

    async auditContentQuality(depth = 1) {
        const contentChecks = [
            this.analyzeContentStructure(),
            this.analyzeContentSEO(),
            this.analyzeContentPerformance()
        ];

        const results = await Promise.allSettled(contentChecks);
        
        return {
            quality: this.calculateQualityScore(results),
            issues: this.extractContentIssues(results),
            improvements: this.suggestContentImprovements(results, depth)
        };
    }

    async auditComprehensive(depth = 1) {
        const allAudits = [
            this.auditPortfolioHealth(depth),
            this.auditCostOptimization(depth),
            this.auditWorkflowEfficiency(depth),
            this.auditContentQuality(depth)
        ];

        const results = await Promise.allSettled(allAudits);
        
        return {
            overall: this.calculateOverallScore(results),
            breakdown: results.map((result, index) => ({
                type: ['health', 'cost', 'workflow', 'content'][index],
                result: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            })),
            priority: this.identifyPriorityActions(results)
        };
    }

    async triggerRecursiveAudits(auditResult) {
        const { result, depth } = auditResult;
        
        if (depth >= this.config.auditDepth) {
            return; // Max depth reached
        }

        const recursiveTasks = [];

        // Trigger deeper audits based on issues found
        if (result.issues && result.issues.length > 0) {
            recursiveTasks.push({
                id: `recursive_${auditResult.id}_issues`,
                type: 'issue_detailed_analysis',
                depth: depth + 1,
                priority: 'high',
                context: { issues: result.issues }
            });
        }

        // Trigger optimization audits if opportunities found
        if (result.optimizationOpportunities && result.optimizationOpportunities.length > 0) {
            recursiveTasks.push({
                id: `recursive_${auditResult.id}_optimization`,
                type: 'optimization_implementation',
                depth: depth + 1,
                priority: 'medium',
                context: { opportunities: result.optimizationOpportunities }
            });
        }

        // Add recursive tasks to queue
        recursiveTasks.forEach(task => {
            this.auditQueue.push(task);
        });
    }

    async triggerEventBasedAudits() {
        // Monitor for file changes, cost spikes, performance issues
        const events = await this.detectEvents();
        
        events.forEach(event => {
            const auditTask = this.createEventBasedAudit(event);
            if (auditTask) {
                this.auditQueue.push(auditTask);
            }
        });
    }

    async detectEvents() {
        const events = [];
        
        // Check for cost spikes
        const costSpike = await this.detectCostSpike();
        if (costSpike) events.push(costSpike);
        
        // Check for performance degradation
        const perfIssue = await this.detectPerformanceIssue();
        if (perfIssue) events.push(perfIssue);
        
        // Check for file changes
        const fileChanges = await this.detectFileChanges();
        events.push(...fileChanges);
        
        return events;
    }

    createEventBasedAudit(event) {
        switch (event.type) {
            case 'cost_spike':
                return {
                    id: `event_${Date.now()}_cost`,
                    type: 'cost_optimization',
                    depth: 1,
                    priority: 'high',
                    context: { spike: event.data }
                };
            case 'performance_issue':
                return {
                    id: `event_${Date.now()}_perf`,
                    type: 'portfolio_health',
                    depth: 1,
                    priority: 'high',
                    context: { issue: event.data }
                };
            case 'file_change':
                return {
                    id: `event_${Date.now()}_file`,
                    type: 'content_quality',
                    depth: 1,
                    priority: 'medium',
                    context: { changes: event.data }
                };
            default:
                return null;
        }
    }

    async periodicAudit() {
        while (this.isRunning) {
            await this.sleep(this.config.auditInterval);
            
            // Add comprehensive audit to queue
            this.auditQueue.push({
                id: `periodic_${Date.now()}`,
                type: 'comprehensive_audit',
                depth: 1,
                priority: 'normal'
            });
        }
    }

    // File Structure Audit Methods
    async checkFileStructure() {
        try {
            const requiredDirs = ['core', 'documentation', 'automation', 'configuration'];
            const missingDirs = [];
            const emptyDirs = [];

            for (const dir of requiredDirs) {
                try {
                    const stats = await fs.stat(dir);
                    if (!stats.isDirectory()) {
                        missingDirs.push(dir);
                    } else {
                        const files = await fs.readdir(dir);
                        if (files.length === 0) {
                            emptyDirs.push(dir);
                        }
                    }
                } catch (error) {
                    missingDirs.push(dir);
                }
            }

            return {
                score: Math.max(0, 100 - (missingDirs.length * 20) - (emptyDirs.length * 10)),
                missingDirectories: missingDirs,
                emptyDirectories: emptyDirs,
                recommendations: [
                    ...missingDirs.map(dir => `Create missing directory: ${dir}`),
                    ...emptyDirs.map(dir => `Add content to empty directory: ${dir}`)
                ]
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async checkBrokenLinks() {
        try {
            const htmlFiles = await this.findHtmlFiles();
            const brokenLinks = [];
            let totalLinks = 0;

            for (const file of htmlFiles) {
                const content = await fs.readFile(file, 'utf8');
                const links = this.extractLinks(content);
                totalLinks += links.length;

                for (const link of links) {
                    if (!await this.isLinkValid(link)) {
                        brokenLinks.push({ file, link });
                    }
                }
            }

            const score = totalLinks > 0 ? Math.max(0, 100 - (brokenLinks.length / totalLinks * 100)) : 100;

            return {
                score,
                totalLinks,
                brokenLinks: brokenLinks.length,
                brokenLinkDetails: brokenLinks,
                recommendations: brokenLinks.map(({ file, link }) => 
                    `Fix broken link in ${file}: ${link}`
                )
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async checkPerformanceMetrics() {
        try {
            const metrics = {
                cssSize: await this.getCssSize(),
                jsSize: await this.getJsSize(),
                imageSize: await this.getImageSize(),
                totalSize: 0
            };

            metrics.totalSize = metrics.cssSize + metrics.jsSize + metrics.imageSize;

            const score = this.calculatePerformanceScore(metrics);

            return {
                score,
                metrics,
                recommendations: this.generatePerformanceRecommendations(metrics)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async checkSEOOptimization() {
        try {
            const htmlFiles = await this.findHtmlFiles();
            const seoIssues = [];
            let totalFiles = 0;

            for (const file of htmlFiles) {
                totalFiles++;
                const content = await fs.readFile(file, 'utf8');
                const issues = this.analyzeSEOContent(content, file);
                seoIssues.push(...issues);
            }

            const score = Math.max(0, 100 - (seoIssues.length * 5));

            return {
                score,
                totalFiles,
                seoIssues: seoIssues.length,
                issues: seoIssues,
                recommendations: seoIssues.map(issue => issue.recommendation)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    // Cost Analysis Methods
    async analyzeOpenAICosts() {
        try {
            const dailyReport = this.costMonitor.getDailyReport();
            const monthlyReport = this.costMonitor.getMonthlyReport();
            const trends = this.costMonitor.getUsageTrends(7);

            const costScore = this.calculateCostScore(dailyReport, monthlyReport);

            return {
                score: costScore,
                daily: dailyReport,
                monthly: monthlyReport,
                trends,
                recommendations: this.generateCostRecommendations(dailyReport, monthlyReport)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async analyzeInfrastructureCosts() {
        // Placeholder for infrastructure cost analysis
        return {
            score: 85,
            currentCosts: { hosting: 0, storage: 0, bandwidth: 0 },
            recommendations: ['Monitor GitHub Pages usage', 'Optimize image sizes']
        };
    }

    async analyzeToolUsageEfficiency() {
        try {
            const toolData = await this.loadToolUsageData();
            const efficiency = this.calculateToolEfficiency(toolData);

            return {
                score: efficiency.score,
                toolUsage: efficiency.usage,
                recommendations: efficiency.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    // Workflow Analysis Methods
    async analyzeN8nWorkflows() {
        try {
            const n8nDir = path.join(__dirname, '../n8n');
            const workflows = await this.findN8nWorkflows(n8nDir);
            
            const analysis = await this.analyzeWorkflowEfficiency(workflows);

            return {
                score: analysis.score,
                workflows: workflows.length,
                activeWorkflows: analysis.active,
                recommendations: analysis.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async analyzeAutomationScripts() {
        try {
            const scripts = await this.findAutomationScripts();
            const analysis = await this.analyzeScriptPerformance(scripts);

            return {
                score: analysis.score,
                totalScripts: scripts.length,
                activeScripts: analysis.active,
                recommendations: analysis.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async analyzeMCPPerformance() {
        try {
            const mcpServers = await this.findMCPServers();
            const performance = await this.analyzeMCPServerPerformance(mcpServers);

            return {
                score: performance.score,
                servers: mcpServers.length,
                activeServers: performance.active,
                recommendations: performance.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    // Content Analysis Methods
    async analyzeContentStructure() {
        try {
            const content = await this.analyzeContentOrganization();
            return {
                score: content.score,
                structure: content.structure,
                recommendations: content.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async analyzeContentSEO() {
        try {
            const seo = await this.analyzeContentSEO();
            return {
                score: seo.score,
                seoMetrics: seo.metrics,
                recommendations: seo.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async analyzeContentPerformance() {
        try {
            const performance = await this.analyzeContentPerformance();
            return {
                score: performance.score,
                metrics: performance.metrics,
                recommendations: performance.recommendations
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    // Event Detection Methods
    async detectCostSpike() {
        try {
            const dailyReport = this.costMonitor.getDailyReport();
            const threshold = this.costMonitor.config.dailyLimit * 0.8;
            
            if (dailyReport.totalCost > threshold) {
                return {
                    type: 'cost_spike',
                    data: {
                        current: dailyReport.totalCost,
                        threshold,
                        percentage: (dailyReport.totalCost / threshold) * 100
                    }
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async detectPerformanceIssue() {
        try {
            const metrics = await this.checkPerformanceMetrics();
            if (metrics.score < 70) {
                return {
                    type: 'performance_issue',
                    data: {
                        score: metrics.score,
                        issues: metrics.recommendations
                    }
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async detectFileChanges() {
        try {
            const changes = [];
            const currentHashes = await this.calculateFileHashes();
            
            for (const [file, hash] of currentHashes) {
                if (this.fileHashes.has(file) && this.fileHashes.get(file) !== hash) {
                    changes.push({
                        type: 'file_change',
                        data: { file, previousHash: this.fileHashes.get(file), newHash: hash }
                    });
                }
            }
            
            this.fileHashes = currentHashes;
            return changes;
        } catch (error) {
            return [];
        }
    }

    // Utility Methods
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    calculateHealthScore(results) {
        const validResults = results.filter(r => r.status === 'fulfilled');
        if (validResults.length === 0) return 0;
        
        const scores = validResults.map(r => r.value.score || 0);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    extractIssues(results) {
        const issues = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.issues) {
                issues.push(...result.value.issues);
            }
        });
        return issues;
    }

    generateRecommendations(results, depth) {
        const recommendations = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.recommendations) {
                recommendations.push(...result.value.recommendations);
            }
        });
        return recommendations;
    }

    calculateTotalCost(results) {
        let total = 0;
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.totalCost) {
                total += result.value.totalCost;
            }
        });
        return total;
    }

    analyzeCostTrends() {
        // Implementation for cost trend analysis
        return { trend: 'stable', change: 0 };
    }

    identifyOptimizations(results, depth) {
        const optimizations = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.optimizationOpportunities) {
                optimizations.push(...result.value.optimizationOpportunities);
            }
        });
        return optimizations;
    }

    calculateEfficiencyScore(results) {
        const validResults = results.filter(r => r.status === 'fulfilled');
        if (validResults.length === 0) return 0;
        
        const scores = validResults.map(r => r.value.efficiency || r.value.score || 0);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    identifyBottlenecks(results) {
        const bottlenecks = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.bottlenecks) {
                bottlenecks.push(...result.value.bottlenecks);
            }
        });
        return bottlenecks;
    }

    suggestWorkflowImprovements(results, depth) {
        const improvements = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.improvements) {
                improvements.push(...result.value.improvements);
            }
        });
        return improvements;
    }

    calculateQualityScore(results) {
        const validResults = results.filter(r => r.status === 'fulfilled');
        if (validResults.length === 0) return 0;
        
        const scores = validResults.map(r => r.value.quality || r.value.score || 0);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    extractContentIssues(results) {
        const issues = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.issues) {
                issues.push(...result.value.issues);
            }
        });
        return issues;
    }

    suggestContentImprovements(results, depth) {
        const improvements = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.improvements) {
                improvements.push(...result.value.improvements);
            }
        });
        return improvements;
    }

    calculateOverallScore(results) {
        const validResults = results.filter(r => r.status === 'fulfilled');
        if (validResults.length === 0) return 0;
        
        const scores = validResults.map(r => r.value.overall || r.value.score || 0);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    identifyPriorityActions(results) {
        const actions = [];
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.priority) {
                actions.push(...result.value.priority);
            }
        });
        return actions;
    }

    // Additional helper methods
    async initializeFileMonitoring() {
        this.fileHashes = await this.calculateFileHashes();
    }

    async calculateFileHashes() {
        // Simplified file hash calculation
        const hashes = new Map();
        try {
            const files = await this.getAllFiles();
            for (const file of files) {
                const stats = await fs.stat(file);
                hashes.set(file, stats.mtime.getTime().toString());
            }
        } catch (error) {
            console.warn('Could not calculate file hashes:', error.message);
        }
        return hashes;
    }

    async getAllFiles() {
        // Implementation to get all relevant files
        return [];
    }

    async findHtmlFiles() {
        // Implementation to find HTML files
        return [];
    }

    extractLinks(content) {
        // Implementation to extract links from HTML content
        return [];
    }

    async isLinkValid(link) {
        // Implementation to check if link is valid
        return true;
    }

    async getCssSize() {
        // Implementation to get CSS file sizes
        return 0;
    }

    async getJsSize() {
        // Implementation to get JS file sizes
        return 0;
    }

    async getImageSize() {
        // Implementation to get image file sizes
        return 0;
    }

    calculatePerformanceScore(metrics) {
        // Implementation to calculate performance score
        return 85;
    }

    generatePerformanceRecommendations(metrics) {
        // Implementation to generate performance recommendations
        return [];
    }

    calculateCostScore(dailyReport, monthlyReport) {
        // Implementation to calculate cost score
        return 85;
    }

    generateCostRecommendations(dailyReport, monthlyReport) {
        // Implementation to generate cost recommendations
        return [];
    }

    async loadToolUsageData() {
        // Implementation to load tool usage data
        return {};
    }

    calculateToolEfficiency(toolData) {
        // Implementation to calculate tool efficiency
        return { score: 85, usage: {}, recommendations: [] };
    }

    async findN8nWorkflows(n8nDir) {
        // Implementation to find n8n workflows
        return [];
    }

    async analyzeWorkflowEfficiency(workflows) {
        // Implementation to analyze workflow efficiency
        return { score: 85, active: 0, recommendations: [] };
    }

    async findAutomationScripts() {
        // Implementation to find automation scripts
        return [];
    }

    async analyzeScriptPerformance(scripts) {
        // Implementation to analyze script performance
        return { score: 85, active: 0, recommendations: [] };
    }

    async findMCPServers() {
        // Implementation to find MCP servers
        return [];
    }

    async analyzeMCPServerPerformance(servers) {
        // Implementation to analyze MCP server performance
        return { score: 85, active: 0, recommendations: [] };
    }

    async analyzeContentOrganization() {
        // Implementation to analyze content organization
        return { score: 85, structure: {}, recommendations: [] };
    }

    async analyzeContentSEO() {
        // Implementation to analyze content SEO
        return { score: 85, metrics: {}, recommendations: [] };
    }

    async analyzeContentPerformance() {
        // Implementation to analyze content performance
        return { score: 85, metrics: {}, recommendations: [] };
    }

    async auditGeneric(auditTask) {
        // Generic audit implementation
        return { score: 85, message: 'Generic audit completed' };
    }
}

module.exports = RecursivePortfolioAuditor; 