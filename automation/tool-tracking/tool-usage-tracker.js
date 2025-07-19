const fs = require('fs');
const path = require('path');

class ToolUsageTracker {
    constructor() {
        this.dataFile = path.join(__dirname, 'tool-usage-data.json');
        this.reportFile = path.join(__dirname, 'tool-usage-report.md');
        this.data = this.loadData();
        this.startTime = Date.now();
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
            }
        } catch (error) {
            console.log('Creating new tool usage data file');
        }
        
        return {
            tools: {},
            sessions: [],
            summary: {
                totalCalls: 0,
                uniqueTools: 0,
                mostUsed: [],
                leastUsed: [],
                categories: {},
                performance: {
                    averageResponseTime: 0,
                    totalErrors: 0,
                    successRate: 0
                }
            },
            metadata: {
                created: Date.now(),
                lastUpdated: Date.now(),
                totalSessions: 0
            }
        };
    }

    saveData() {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
            this.data.metadata.lastUpdated = Date.now();
        } catch (error) {
            console.error('Error saving tool usage data:', error);
        }
    }

    trackToolCall(toolName, category = 'unknown', success = true, responseTime = 0, error = null) {
        const timestamp = Date.now();
        
        // Initialize tool if not exists
        if (!this.data.tools[toolName]) {
            this.data.tools[toolName] = {
                name: toolName,
                category: category,
                calls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                firstUsed: timestamp,
                lastUsed: timestamp,
                errors: []
            };
        }

        // Update tool stats
        const tool = this.data.tools[toolName];
        tool.calls++;
        tool.lastUsed = timestamp;
        tool.totalResponseTime += responseTime;
        tool.averageResponseTime = tool.totalResponseTime / tool.calls;

        if (success) {
            tool.successfulCalls++;
        } else {
            tool.failedCalls++;
            if (error) {
                tool.errors.push({
                    timestamp,
                    error: error.toString(),
                    context: `Response time: ${responseTime}ms`
                });
            }
        }

        // Update summary
        this.data.summary.totalCalls++;
        this.data.summary.uniqueTools = Object.keys(this.data.tools).length;

        // Update category stats
        if (!this.data.summary.categories[category]) {
            this.data.summary.categories[category] = {
                calls: 0,
                tools: new Set()
            };
        }
        this.data.summary.categories[category].calls++;
        this.data.summary.categories[category].tools.add(toolName);

        this.saveData();
    }

    startSession(sessionName = 'default') {
        const session = {
            id: `session_${Date.now()}`,
            name: sessionName,
            startTime: Date.now(),
            endTime: null,
            tools: [],
            totalCalls: 0,
            errors: 0
        };
        
        this.data.sessions.push(session);
        this.data.metadata.totalSessions++;
        this.currentSession = session;
        
        console.log(`🚀 Session started: ${sessionName} (ID: ${session.id})`);
        return session.id;
    }

    endSession(sessionId = null) {
        const session = sessionId ? 
            this.data.sessions.find(s => s.id === sessionId) : 
            this.currentSession;
        
        if (session) {
            session.endTime = Date.now();
            session.duration = session.endTime - session.startTime;
            console.log(`✅ Session ended: ${session.name} (Duration: ${session.duration}ms, Calls: ${session.totalCalls})`);
        }
        
        this.currentSession = null;
        this.saveData();
    }

    generateReport() {
        this.updateSummary();
        
        const report = `# 🛠️ Tool Usage Report

## 📊 Summary Statistics
- **Total Tool Calls**: ${this.data.summary.totalCalls}
- **Unique Tools Used**: ${this.data.summary.uniqueTools}
- **Success Rate**: ${this.data.summary.performance.successRate.toFixed(2)}%
- **Average Response Time**: ${this.data.summary.performance.averageResponseTime.toFixed(2)}ms
- **Total Errors**: ${this.data.summary.performance.totalErrors}

## 🏆 Most Used Tools (Top 10)
${this.data.summary.mostUsed.slice(0, 10).map((tool, index) => 
    `${index + 1}. **${tool.name}** (${tool.calls} calls, ${tool.category})`
).join('\n')}

## 📈 Tool Categories
${Object.entries(this.data.summary.categories).map(([category, stats]) => 
    `- **${category}**: ${stats.calls} calls, ${stats.tools.size} tools`
).join('\n')}

## ⚠️ Tools with Errors
${this.data.summary.mostUsed.filter(tool => tool.failedCalls > 0).map(tool => 
    `- **${tool.name}**: ${tool.failedCalls} errors (${((tool.failedCalls / tool.calls) * 100).toFixed(1)}% failure rate)`
).join('\n')}

## 🐌 Slowest Tools (Average Response Time)
${this.data.summary.mostUsed
    .filter(tool => tool.averageResponseTime > 1000)
    .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
    .slice(0, 5)
    .map(tool => 
        `- **${tool.name}**: ${tool.averageResponseTime.toFixed(0)}ms average`
    ).join('\n')}

## 📅 Recent Sessions
${this.data.sessions.slice(-5).map(session => 
    `- **${session.name}**: ${session.totalCalls} calls, ${session.duration ? session.duration + 'ms' : 'active'}`
).join('\n')}

## 💡 Optimization Recommendations

### 🚀 High-Value Tools (Keep)
${this.data.summary.mostUsed.slice(0, 15).map(tool => 
    `- ${tool.name} (${tool.calls} calls)`
).join('\n')}

### 🗑️ Low-Usage Tools (Consider Removing)
${this.data.summary.mostUsed
    .filter(tool => tool.calls <= 2 && tool.lastUsed < Date.now() - (7 * 24 * 60 * 60 * 1000))
    .map(tool => 
        `- ${tool.name} (${tool.calls} calls, last used: ${new Date(tool.lastUsed).toLocaleDateString()})`
    ).join('\n')}

### 🔧 Performance Issues
${this.data.summary.mostUsed
    .filter(tool => tool.averageResponseTime > 2000 || (tool.failedCalls / tool.calls) > 0.1)
    .map(tool => 
        `- ${tool.name}: ${tool.averageResponseTime.toFixed(0)}ms avg, ${((tool.failedCalls / tool.calls) * 100).toFixed(1)}% errors`
    ).join('\n')}

---
*Report generated on ${new Date().toLocaleString()}*
*Total tools tracked: ${this.data.summary.uniqueTools}*
`;

        fs.writeFileSync(this.reportFile, report);
        console.log(`📊 Report generated: ${this.reportFile}`);
        return report;
    }

    updateSummary() {
        const tools = Object.values(this.data.tools);
        
        // Sort by usage
        this.data.summary.mostUsed = tools.sort((a, b) => b.calls - a.calls);
        this.data.summary.leastUsed = tools.filter(t => t.calls <= 2);
        
        // Calculate performance metrics
        const totalResponseTime = tools.reduce((sum, tool) => sum + tool.totalResponseTime, 0);
        const totalErrors = tools.reduce((sum, tool) => sum + tool.failedCalls, 0);
        
        this.data.summary.performance.averageResponseTime = 
            this.data.summary.totalCalls > 0 ? totalResponseTime / this.data.summary.totalCalls : 0;
        this.data.summary.performance.totalErrors = totalErrors;
        this.data.summary.performance.successRate = 
            this.data.summary.totalCalls > 0 ? 
            ((this.data.summary.totalCalls - totalErrors) / this.data.summary.totalCalls) * 100 : 0;
    }

    getToolStats(toolName) {
        return this.data.tools[toolName] || null;
    }

    getCategoryStats(category) {
        return this.data.summary.categories[category] || null;
    }

    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.data, null, 2);
        } else if (format === 'csv') {
            const csv = ['Tool Name,Category,Calls,Success Rate,Avg Response Time,Last Used\n'];
            Object.values(this.data.tools).forEach(tool => {
                const successRate = tool.calls > 0 ? ((tool.calls - tool.failedCalls) / tool.calls * 100).toFixed(2) : '0';
                const lastUsed = new Date(tool.lastUsed).toISOString().split('T')[0];
                csv.push(`${tool.name},${tool.category},${tool.calls},${successRate}%,${tool.averageResponseTime.toFixed(0)}ms,${lastUsed}\n`);
            });
            return csv.join('');
        }
    }
}

// Create global tracker instance
const tracker = new ToolUsageTracker();

// Export for use in other files
module.exports = {
    ToolUsageTracker,
    tracker,
    
    // Convenience functions
    track: (toolName, category, success, responseTime, error) => 
        tracker.trackToolCall(toolName, category, success, responseTime, error),
    
    startSession: (name) => tracker.startSession(name),
    endSession: (id) => tracker.endSession(id),
    generateReport: () => tracker.generateReport(),
    getStats: (toolName) => tracker.getToolStats(toolName),
    exportData: (format) => tracker.exportData(format)
};

// Auto-start session if running directly
if (require.main === module) {
    tracker.startSession('tool-usage-tracker');
    console.log('🛠️ Tool Usage Tracker initialized');
    console.log(`📁 Data file: ${tracker.dataFile}`);
    console.log(`📊 Report file: ${tracker.reportFile}`);
} 