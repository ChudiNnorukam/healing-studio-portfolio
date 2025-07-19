#!/usr/bin/env node

/**
 * OpenAI Usage Monitor
 * Monitors and logs OpenAI API usage for cost tracking
 */

const fs = require('fs');
const path = require('path');

class UsageMonitor {
  constructor() {
    this.usageLog = 'openai-usage.log';
    this.dailyReport = 'daily-usage-report.json';
  }

  logUsage(action, tokens, model, cost) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      tokens,
      model,
      cost,
      userId: process.env.USER || 'unknown'
    };

    fs.appendFileSync(this.usageLog, JSON.stringify(entry) + '\n');
  }

  getDailyUsage() {
    const today = new Date().toDateString();
    const log = fs.existsSync(this.usageLog) ? fs.readFileSync(this.usageLog, 'utf8') : '';
    const entries = log.split('\n').filter(line => line.trim());
    
    return entries
      .map(entry => JSON.parse(entry))
      .filter(entry => new Date(entry.timestamp).toDateString() === today);
  }

  generateDailyReport() {
    const dailyUsage = this.getDailyUsage();
    const totalTokens = dailyUsage.reduce((sum, entry) => sum + entry.tokens, 0);
    const totalCost = dailyUsage.reduce((sum, entry) => sum + entry.cost, 0);
    
    const report = {
      date: new Date().toISOString().split('T')[0],
      totalTokens,
      totalCost,
      requests: dailyUsage.length,
      breakdown: dailyUsage
    };
    
    fs.writeFileSync(this.dailyReport, JSON.stringify(report, null, 2));
    return report;
  }

  printDailySummary() {
    const report = this.generateDailyReport();
    console.log('\n📊 Daily Usage Summary');
    console.log('=====================');
    console.log(`Date: ${report.date}`);
    console.log(`Total Requests: ${report.requests}`);
    console.log(`Total Tokens: ${report.totalTokens}`);
    console.log(`Total Cost: $${report.totalCost.toFixed(4)}`);
  }
}

// Export for use in other scripts
module.exports = UsageMonitor;

// Run if called directly
if (require.main === module) {
  const monitor = new UsageMonitor();
  monitor.printDailySummary();
}
