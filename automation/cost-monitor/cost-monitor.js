#!/usr/bin/env node

/**
 * OpenAI Cost Monitor
 * Tracks and controls OpenAI API usage costs
 */

const fs = require('fs');
const path = require('path');

class CostMonitor {
  constructor() {
    this.usageLog = 'openai-usage.log';
    this.costLog = 'openai-costs.json';
    this.alertsLog = 'cost-alerts.log';
    this.config = this.loadConfig();
  }

  loadConfig() {
    const defaultConfig = {
      dailyLimit: 5.00, // $5/day
      monthlyLimit: 100.00, // $100/month
      alertThreshold: 0.80, // Alert at 80% of limit
      modelCosts: {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
      },
      notifications: {
        email: false,
        slack: false,
        console: true
      }
    };

    try {
      if (fs.existsSync('cost-monitor-config.json')) {
        return { ...defaultConfig, ...JSON.parse(fs.readFileSync('cost-monitor-config.json', 'utf8')) };
      }
    } catch (error) {
      console.warn('Using default cost monitor configuration');
    }

    return defaultConfig;
  }

  calculateCost(tokens, model, type = 'output') {
    const modelCost = this.config.modelCosts[model];
    if (!modelCost) {
      console.warn(`Unknown model: ${model}, using GPT-4 pricing`);
      return (tokens / 1000) * 0.06;
    }
    
    const rate = type === 'input' ? modelCost.input : modelCost.output;
    return (tokens / 1000) * rate;
  }

  logUsage(action, tokens, model, cost, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      tokens,
      model,
      cost,
      metadata,
      userId: process.env.USER || 'unknown'
    };

    // Append to usage log
    fs.appendFileSync(this.usageLog, JSON.stringify(entry) + '\n');

    // Update cost tracking
    this.updateCostTracking(entry);

    // Check for alerts
    this.checkAlerts(entry);

    return entry;
  }

  updateCostTracking(entry) {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    let costData = {};
    if (fs.existsSync(this.costLog)) {
      costData = JSON.parse(fs.readFileSync(this.costLog, 'utf8'));
    }

    // Initialize if not exists
    if (!costData.daily) costData.daily = {};
    if (!costData.monthly) costData.monthly = {};
    if (!costData.daily[today]) costData.daily[today] = { total: 0, requests: 0, models: {} };
    if (!costData.monthly[month]) costData.monthly[month] = { total: 0, requests: 0, models: {} };

    // Update daily costs
    costData.daily[today].total += entry.cost;
    costData.daily[today].requests += 1;
    costData.daily[today].models[entry.model] = (costData.daily[today].models[entry.model] || 0) + entry.cost;

    // Update monthly costs
    costData.monthly[month].total += entry.cost;
    costData.monthly[month].requests += 1;
    costData.monthly[month].models[entry.model] = (costData.monthly[month].models[entry.model] || 0) + entry.cost;

    // Save updated data
    fs.writeFileSync(this.costLog, JSON.stringify(costData, null, 2));
  }

  checkAlerts(entry) {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().slice(0, 7);

    if (!fs.existsSync(this.costLog)) return;

    const costData = JSON.parse(fs.readFileSync(this.costLog, 'utf8'));
    const dailyCost = costData.daily[today]?.total || 0;
    const monthlyCost = costData.monthly[month]?.total || 0;

    const alerts = [];

    // Daily limit alert
    if (dailyCost > this.config.dailyLimit * this.config.alertThreshold) {
      alerts.push(`Daily cost alert: $${dailyCost.toFixed(2)} (${(dailyCost/this.config.dailyLimit*100).toFixed(1)}% of limit)`);
    }

    // Monthly limit alert
    if (monthlyCost > this.config.monthlyLimit * this.config.alertThreshold) {
      alerts.push(`Monthly cost alert: $${monthlyCost.toFixed(2)} (${(monthlyCost/this.config.monthlyLimit*100).toFixed(1)}% of limit)`);
    }

    // High cost request alert
    if (entry.cost > 1.00) {
      alerts.push(`High cost request: $${entry.cost.toFixed(2)} for ${entry.action} using ${entry.model}`);
    }

    // Log alerts
    if (alerts.length > 0) {
      const alertEntry = {
        timestamp: new Date().toISOString(),
        alerts,
        context: { dailyCost, monthlyCost, entry }
      };

      fs.appendFileSync(this.alertsLog, JSON.stringify(alertEntry) + '\n');

      // Send notifications
      this.sendNotifications(alerts);
    }
  }

  sendNotifications(alerts) {
    if (this.config.notifications.console) {
      console.log('\n🚨 COST ALERTS:');
      alerts.forEach(alert => console.log(`⚠️  ${alert}`));
    }

    // TODO: Implement email and Slack notifications
    if (this.config.notifications.email) {
      // this.sendEmailAlert(alerts);
    }

    if (this.config.notifications.slack) {
      // this.sendSlackAlert(alerts);
    }
  }

  getDailyReport(date = new Date().toISOString().split('T')[0]) {
    if (!fs.existsSync(this.costLog)) {
      return { error: 'No cost data available' };
    }

    const costData = JSON.parse(fs.readFileSync(this.costLog, 'utf8'));
    const dailyData = costData.daily[date];

    if (!dailyData) {
      return { error: `No data for ${date}` };
    }

    return {
      date,
      totalCost: dailyData.total,
      totalRequests: dailyData.requests,
      averageCostPerRequest: dailyData.total / dailyData.requests,
      modelBreakdown: dailyData.models,
      limitStatus: {
        dailyLimit: this.config.dailyLimit,
        percentageUsed: (dailyData.total / this.config.dailyLimit) * 100,
        remaining: this.config.dailyLimit - dailyData.total
      }
    };
  }

  getMonthlyReport(month = new Date().toISOString().slice(0, 7)) {
    if (!fs.existsSync(this.costLog)) {
      return { error: 'No cost data available' };
    }

    const costData = JSON.parse(fs.readFileSync(this.costLog, 'utf8'));
    const monthlyData = costData.monthly[month];

    if (!monthlyData) {
      return { error: `No data for ${month}` };
    }

    return {
      month,
      totalCost: monthlyData.total,
      totalRequests: monthlyData.requests,
      averageCostPerRequest: monthlyData.total / monthlyData.requests,
      modelBreakdown: monthlyData.models,
      limitStatus: {
        monthlyLimit: this.config.monthlyLimit,
        percentageUsed: (monthlyData.total / this.config.monthlyLimit) * 100,
        remaining: this.config.monthlyLimit - monthlyData.total
      }
    };
  }

  getUsageTrends(days = 7) {
    if (!fs.existsSync(this.costLog)) {
      return { error: 'No cost data available' };
    }

    const costData = JSON.parse(fs.readFileSync(this.costLog, 'utf8'));
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dailyData = costData.daily[dateStr];

      trends.push({
        date: dateStr,
        cost: dailyData?.total || 0,
        requests: dailyData?.requests || 0
      });
    }

    return {
      period: `${days} days`,
      trends,
      averageDailyCost: trends.reduce((sum, day) => sum + day.cost, 0) / days,
      averageDailyRequests: trends.reduce((sum, day) => sum + day.requests, 0) / days
    };
  }

  printDailySummary() {
    const report = this.getDailyReport();
    
    if (report.error) {
      console.log(`❌ ${report.error}`);
      return;
    }

    console.log('\n📊 Daily Cost Summary');
    console.log('=====================');
    console.log(`Date: ${report.date}`);
    console.log(`Total Cost: $${report.totalCost.toFixed(2)}`);
    console.log(`Total Requests: ${report.totalRequests}`);
    console.log(`Average Cost/Request: $${report.averageCostPerRequest.toFixed(4)}`);
    console.log(`Daily Limit: $${report.limitStatus.dailyLimit}`);
    console.log(`Usage: ${report.limitStatus.percentageUsed.toFixed(1)}%`);
    console.log(`Remaining: $${report.limitStatus.remaining.toFixed(2)}`);

    if (Object.keys(report.modelBreakdown).length > 0) {
      console.log('\nModel Breakdown:');
      Object.entries(report.modelBreakdown).forEach(([model, cost]) => {
        console.log(`  ${model}: $${cost.toFixed(2)}`);
      });
    }
  }

  printMonthlySummary() {
    const report = this.getMonthlyReport();
    
    if (report.error) {
      console.log(`❌ ${report.error}`);
      return;
    }

    console.log('\n📊 Monthly Cost Summary');
    console.log('=======================');
    console.log(`Month: ${report.month}`);
    console.log(`Total Cost: $${report.totalCost.toFixed(2)}`);
    console.log(`Total Requests: ${report.totalRequests}`);
    console.log(`Average Cost/Request: $${report.averageCostPerRequest.toFixed(4)}`);
    console.log(`Monthly Limit: $${report.limitStatus.monthlyLimit}`);
    console.log(`Usage: ${report.limitStatus.percentageUsed.toFixed(1)}%`);
    console.log(`Remaining: $${report.limitStatus.remaining.toFixed(2)}`);

    if (Object.keys(report.modelBreakdown).length > 0) {
      console.log('\nModel Breakdown:');
      Object.entries(report.modelBreakdown).forEach(([model, cost]) => {
        console.log(`  ${model}: $${cost.toFixed(2)}`);
      });
    }
  }

  printTrends(days = 7) {
    const trends = this.getUsageTrends(days);
    
    if (trends.error) {
      console.log(`❌ ${trends.error}`);
      return;
    }

    console.log(`\n📈 Usage Trends (${trends.period})`);
    console.log('========================');
    console.log(`Average Daily Cost: $${trends.averageDailyCost.toFixed(2)}`);
    console.log(`Average Daily Requests: ${trends.averageDailyRequests.toFixed(1)}`);

    console.log('\nDaily Breakdown:');
    trends.trends.forEach(day => {
      const status = day.cost > this.config.dailyLimit ? '🚨' : day.cost > this.config.dailyLimit * 0.8 ? '⚠️' : '✅';
      console.log(`${status} ${day.date}: $${day.cost.toFixed(2)} (${day.requests} requests)`);
    });
  }

  setLimits(dailyLimit, monthlyLimit) {
    this.config.dailyLimit = dailyLimit;
    this.config.monthlyLimit = monthlyLimit;
    fs.writeFileSync('cost-monitor-config.json', JSON.stringify(this.config, null, 2));
    console.log(`✅ Limits updated: $${dailyLimit}/day, $${monthlyLimit}/month`);
  }

  resetData() {
    if (fs.existsSync(this.usageLog)) fs.unlinkSync(this.usageLog);
    if (fs.existsSync(this.costLog)) fs.unlinkSync(this.costLog);
    if (fs.existsSync(this.alertsLog)) fs.unlinkSync(this.alertsLog);
    console.log('✅ All cost data reset');
  }
}

// Export for use in other scripts
module.exports = CostMonitor;

// Run if called directly
if (require.main === module) {
  const monitor = new CostMonitor();
  const args = process.argv.slice(2);

  switch (args[0]) {
    case 'daily':
      monitor.printDailySummary();
      break;
    case 'monthly':
      monitor.printMonthlySummary();
      break;
    case 'trends':
      const days = parseInt(args[1]) || 7;
      monitor.printTrends(days);
      break;
    case 'set-limits':
      const daily = parseFloat(args[1]);
      const monthly = parseFloat(args[2]);
      if (daily && monthly) {
        monitor.setLimits(daily, monthly);
      } else {
        console.log('Usage: node cost-monitor.js set-limits <daily> <monthly>');
      }
      break;
    case 'reset':
      monitor.resetData();
      break;
    default:
      console.log('OpenAI Cost Monitor');
      console.log('==================');
      console.log('Usage:');
      console.log('  node cost-monitor.js daily          - Show daily summary');
      console.log('  node cost-monitor.js monthly        - Show monthly summary');
      console.log('  node cost-monitor.js trends [days]  - Show usage trends');
      console.log('  node cost-monitor.js set-limits <daily> <monthly> - Set cost limits');
      console.log('  node cost-monitor.js reset          - Reset all data');
      break;
  }
} 