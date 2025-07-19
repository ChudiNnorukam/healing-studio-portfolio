#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CursorUsageMonitor {
    constructor() {
        this.logFile = path.join(__dirname, 'cursor-usage-log.json');
        this.dailyLimit = 500; // Estimated Cursor Pro daily limit
        this.monthlyLimit = 15000; // Estimated monthly limit
    }

    async logUsage(operation, tokens = 0, model = 'claude-sonnet') {
        const usage = {
            timestamp: new Date().toISOString(),
            operation,
            tokens,
            model,
            date: new Date().toISOString().split('T')[0]
        };

        let logs = [];
        try {
            if (fs.existsSync(this.logFile)) {
                logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            }
        } catch (error) {
            console.warn('Could not read usage log, starting fresh');
        }

        logs.push(usage);

        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        logs = logs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);

        fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
        
        return this.analyzeUsage(logs);
    }

    analyzeUsage(logs = null) {
        if (!logs) {
            try {
                logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            } catch {
                return { error: 'No usage data available' };
            }
        }

        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().substring(0, 7);

        // Daily analysis
        const todayUsage = logs.filter(log => log.date === today);
        const dailyTokens = todayUsage.reduce((sum, log) => sum + log.tokens, 0);
        const dailyOperations = todayUsage.length;

        // Monthly analysis
        const monthlyUsage = logs.filter(log => log.date.startsWith(thisMonth));
        const monthlyTokens = monthlyUsage.reduce((sum, log) => sum + log.tokens, 0);
        const monthlyOperations = monthlyUsage.length;

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyUsage = logs.filter(log => new Date(log.timestamp) > weekAgo);

        return {
            today: {
                operations: dailyOperations,
                tokens: dailyTokens,
                percentage: (dailyOperations / this.dailyLimit * 100).toFixed(1),
                status: dailyOperations > this.dailyLimit * 0.8 ? 'warning' : 'ok'
            },
            thisMonth: {
                operations: monthlyOperations,
                tokens: monthlyTokens,
                percentage: (monthlyOperations / this.monthlyLimit * 100).toFixed(1),
                status: monthlyOperations > this.monthlyLimit * 0.8 ? 'warning' : 'ok'
            },
            recent: {
                avgDaily: (weeklyUsage.length / 7).toFixed(1),
                trend: this.calculateTrend(weeklyUsage),
                topOperations: this.getTopOperations(weeklyUsage)
            },
            recommendations: this.getRecommendations(dailyOperations, monthlyOperations)
        };
    }

    calculateTrend(usage) {
        if (usage.length < 2) return 'insufficient_data';
        
        const recent = usage.slice(-3);
        const previous = usage.slice(-6, -3);
        
        const recentAvg = recent.length > 0 ? recent.reduce((sum, u) => sum + u.tokens, 0) / recent.length : 0;
        const previousAvg = previous.length > 0 ? previous.reduce((sum, u) => sum + u.tokens, 0) / previous.length : 0;
        
        if (recentAvg > previousAvg * 1.2) return 'increasing';
        if (recentAvg < previousAvg * 0.8) return 'decreasing';
        return 'stable';
    }

    getTopOperations(usage) {
        const operations = {};
        usage.forEach(u => {
            operations[u.operation] = (operations[u.operation] || 0) + u.tokens;
        });
        
        return Object.entries(operations)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([op, tokens]) => ({ operation: op, tokens }));
    }

    getRecommendations(dailyOps, monthlyOps) {
        const recommendations = [];
        
        if (dailyOps > this.dailyLimit * 0.8) {
            recommendations.push('🚨 High daily usage - consider reducing operations');
        }
        
        if (monthlyOps > this.monthlyLimit * 0.8) {
            recommendations.push('⚠️ High monthly usage - may need pay-as-you-go');
        }
        
        if (dailyOps > this.dailyLimit * 0.5) {
            recommendations.push('💡 Consider batching operations');
            recommendations.push('🔧 Optimize agent recursion depth');
        }
        
        if (monthlyOps < this.monthlyLimit * 0.3) {
            recommendations.push('✅ Usage well within Pro limits');
        }
        
        return recommendations;
    }

    generateReport() {
        const analysis = this.analyzeUsage();
        
        console.log('📊 Cursor Usage Report');
        console.log('='.repeat(50));
        
        if (analysis.error) {
            console.log('❌ Error:', analysis.error);
            return;
        }
        
        console.log('\n📅 Today:');
        console.log(`   Operations: ${analysis.today.operations}`);
        console.log(`   Tokens: ${analysis.today.tokens.toLocaleString()}`);
        console.log(`   Usage: ${analysis.today.percentage}% of daily limit`);
        console.log(`   Status: ${analysis.today.status === 'warning' ? '⚠️ Warning' : '✅ OK'}`);
        
        console.log('\n📊 This Month:');
        console.log(`   Operations: ${analysis.thisMonth.operations}`);
        console.log(`   Tokens: ${analysis.thisMonth.tokens.toLocaleString()}`);
        console.log(`   Usage: ${analysis.thisMonth.percentage}% of estimated limit`);
        console.log(`   Status: ${analysis.thisMonth.status === 'warning' ? '⚠️ Warning' : '✅ OK'}`);
        
        console.log('\n📈 Trend Analysis:');
        console.log(`   Average daily: ${analysis.recent.avgDaily} operations`);
        console.log(`   Trend: ${analysis.recent.trend}`);
        
        console.log('\n🔝 Top Operations:');
        analysis.recent.topOperations.forEach((op, i) => {
            console.log(`   ${i + 1}. ${op.operation}: ${op.tokens.toLocaleString()} tokens`);
        });
        
        console.log('\n💡 Recommendations:');
        analysis.recommendations.forEach(rec => {
            console.log(`   ${rec}`);
        });
        
        return analysis;
    }

    async estimateSessionCost() {
        // Estimate current session cost based on operations
        const sessionEstimate = {
            codeGeneration: 20000, // tokens
            documentation: 15000,
            analysis: 8000,
            total: 43000
        };
        
        console.log('\n💰 Session Cost Estimate:');
        console.log('='.repeat(30));
        console.log(`Code Generation: ~${sessionEstimate.codeGeneration.toLocaleString()} tokens`);
        console.log(`Documentation: ~${sessionEstimate.documentation.toLocaleString()} tokens`);
        console.log(`Analysis: ~${sessionEstimate.analysis.toLocaleString()} tokens`);
        console.log(`Total Estimated: ~${sessionEstimate.total.toLocaleString()} tokens`);
        
        // Pro vs Pay-as-you-go comparison
        console.log('\n📋 Plan Comparison:');
        console.log('Cursor Pro: $20/month');
        console.log('- ~500 fast requests/day');
        console.log('- Unlimited slow requests');
        console.log('- Priority support');
        
        console.log('\nPay-as-you-go: ~$0.01-0.03 per 1K tokens');
        console.log(`- This session: ~$${(sessionEstimate.total * 0.00002).toFixed(2)} - $${(sessionEstimate.total * 0.00006).toFixed(2)}`);
        
        return sessionEstimate;
    }
}

// CLI usage
if (require.main === module) {
    const monitor = new CursorUsageMonitor();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'log':
            const operation = process.argv[3] || 'general';
            const tokens = parseInt(process.argv[4]) || 1000;
            monitor.logUsage(operation, tokens).then(analysis => {
                console.log('Usage logged:', analysis);
            });
            break;
            
        case 'report':
            monitor.generateReport();
            break;
            
        case 'estimate':
            monitor.estimateSessionCost();
            break;
            
        default:
            console.log('Cursor Usage Monitor');
            console.log('Commands:');
            console.log('  report    - Generate usage report');
            console.log('  estimate  - Estimate session costs');
            console.log('  log <op> <tokens> - Log usage');
            
            // Generate both by default
            monitor.generateReport();
            monitor.estimateSessionCost();
    }
}

module.exports = CursorUsageMonitor; 