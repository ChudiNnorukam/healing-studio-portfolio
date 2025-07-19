const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class EnhancedCostMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      dailyLimit: options.dailyLimit || 0.50,
      monthlyLimit: options.monthlyLimit || 15.00,
      alertThreshold: options.alertThreshold || 0.80,
      emergencyThreshold: options.emergencyThreshold || 0.90,
      monitoringInterval: options.monitoringInterval || 30000,
      ...options
    };
    
    this.dataFile = path.join(__dirname, '../../temp/reports/enhanced-cost-tracking.json');
    this.alertsFile = path.join(__dirname, '../../temp/reports/cost-alerts.json');
    
    this.currentUsage = {
      today: 0,
      thisMonth: 0,
      operationCount: 0,
      lastReset: new Date().toDateString(),
      operationHistory: [],
      alerts: [],
      projections: {}
    };
    
    this.monitoringActive = false;
    this.init();
  }

  async init() {
    await this.loadData();
    this.startMonitoring();
    console.log('🔍 Enhanced Cost Monitor initialized');
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.currentUsage = { ...this.currentUsage, ...JSON.parse(data) };
      
      // Reset daily usage if new day
      const today = new Date().toDateString();
      if (this.currentUsage.lastReset !== today) {
        this.currentUsage.today = 0;
        this.currentUsage.operationCount = 0;
        this.currentUsage.lastReset = today;
        await this.saveData();
      }
    } catch (error) {
      console.log('📊 Creating new cost tracking file');
      await this.saveData();
    }
  }

  async saveData() {
    try {
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      await fs.writeFile(this.dataFile, JSON.stringify(this.currentUsage, null, 2));
    } catch (error) {
      console.error('❌ Failed to save cost data:', error);
    }
  }

  async saveAlert(alert) {
    try {
      const alerts = await this.loadAlerts();
      alerts.push({
        ...alert,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }
      
      await fs.mkdir(path.dirname(this.alertsFile), { recursive: true });
      await fs.writeFile(this.alertsFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
      console.error('❌ Failed to save alert:', error);
    }
  }

  async loadAlerts() {
    try {
      const data = await fs.readFile(this.alertsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async trackOperation(cost, operation = 'unknown', metadata = {}) {
    const timestamp = new Date().toISOString();
    
    // Check limits before tracking
    const limits = await this.checkLimits(cost);
    if (!limits.safe) {
      const error = new Error(`💸 BUDGET LIMIT EXCEEDED: ${limits.reason}`);
      error.code = 'BUDGET_EXCEEDED';
      throw error;
    }
    
    // Track the operation
    this.currentUsage.today += cost;
    this.currentUsage.thisMonth += cost;
    this.currentUsage.operationCount += 1;
    
    // Add to operation history
    const operationRecord = {
      timestamp,
      operation,
      cost,
      metadata,
      dailyTotal: this.currentUsage.today,
      monthlyTotal: this.currentUsage.thisMonth
    };
    
    this.currentUsage.operationHistory.push(operationRecord);
    
    // Keep only last 1000 operations
    if (this.currentUsage.operationHistory.length > 1000) {
      this.currentUsage.operationHistory.shift();
    }
    
    await this.saveData();
    
    // Check for alerts
    await this.checkAndTriggerAlerts();
    
    // Emit tracking event
    this.emit('operation_tracked', operationRecord);
    
    console.log(`💰 ${operation} | $${cost.toFixed(3)} | Daily: $${this.currentUsage.today.toFixed(2)}/${this.config.dailyLimit} | Monthly: $${this.currentUsage.thisMonth.toFixed(2)}/${this.config.monthlyLimit}`);
    
    return operationRecord;
  }

  async checkLimits(estimatedCost = 0) {
    const dailyProjected = this.currentUsage.today + estimatedCost;
    const monthlyProjected = this.currentUsage.thisMonth + estimatedCost;
    
    if (dailyProjected > this.config.dailyLimit) {
      return {
        safe: false,
        reason: `Daily limit exceeded: $${dailyProjected.toFixed(2)} > $${this.config.dailyLimit}`,
        type: 'daily_exceeded'
      };
    }
    
    if (monthlyProjected > this.config.monthlyLimit) {
      return {
        safe: false,
        reason: `Monthly limit exceeded: $${monthlyProjected.toFixed(2)} > $${this.config.monthlyLimit}`,
        type: 'monthly_exceeded'
      };
    }
    
    const dailyEmergency = this.config.dailyLimit * this.config.emergencyThreshold;
    const monthlyEmergency = this.config.monthlyLimit * this.config.emergencyThreshold;
    
    if (dailyProjected > dailyEmergency || monthlyProjected > monthlyEmergency) {
      return {
        safe: false,
        reason: `Emergency threshold reached`,
        type: 'emergency_threshold'
      };
    }
    
    return {
      safe: true,
      dailyProjected,
      monthlyProjected,
      dailyPercentage: (dailyProjected / this.config.dailyLimit * 100).toFixed(1),
      monthlyPercentage: (monthlyProjected / this.config.monthlyLimit * 100).toFixed(1)
    };
  }

  async checkAndTriggerAlerts() {
    const dailyPercentage = (this.currentUsage.today / this.config.dailyLimit);
    const monthlyPercentage = (this.currentUsage.thisMonth / this.config.monthlyLimit);
    
    const alerts = [];
    
    if (dailyPercentage >= this.config.alertThreshold) {
      alerts.push({
        type: 'daily_threshold',
        level: dailyPercentage >= this.config.emergencyThreshold ? 'emergency' : 'warning',
        message: `Daily budget at ${(dailyPercentage * 100).toFixed(1)}%`,
        current: this.currentUsage.today,
        limit: this.config.dailyLimit
      });
    }
    
    if (monthlyPercentage >= this.config.alertThreshold) {
      alerts.push({
        type: 'monthly_threshold',
        level: monthlyPercentage >= this.config.emergencyThreshold ? 'emergency' : 'warning',
        message: `Monthly budget at ${(monthlyPercentage * 100).toFixed(1)}%`,
        current: this.currentUsage.thisMonth,
        limit: this.config.monthlyLimit
      });
    }
    
    // Rate-based alerts (operations per hour)
    const recentOps = this.getRecentOperations(60); // Last hour
    if (recentOps.length > 20) {
      alerts.push({
        type: 'high_frequency',
        level: 'warning',
        message: `High operation frequency: ${recentOps.length} operations in last hour`,
        operations: recentOps.length
      });
    }
    
    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  async processAlert(alert) {
    // Check if we've already sent this type of alert recently
    const recentAlerts = await this.loadAlerts();
    const recentSimilar = recentAlerts.filter(a => 
      a.type === alert.type && 
      Date.now() - new Date(a.timestamp).getTime() < 300000 // 5 minutes
    );
    
    if (recentSimilar.length > 0) {
      return; // Don't spam alerts
    }
    
    await this.saveAlert(alert);
    this.emit('alert', alert);
    
    // Console output
    const emoji = alert.level === 'emergency' ? '🚨' : '⚠️';
    console.log(`${emoji} COST ALERT: ${alert.message}`);
    
    // Emergency actions
    if (alert.level === 'emergency') {
      this.emit('emergency', alert);
      console.log('🛑 EMERGENCY: Consider stopping Background Agent operations');
    }
  }

  getRecentOperations(minutes = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.currentUsage.operationHistory.filter(op => 
      new Date(op.timestamp) >= cutoff
    );
  }

  generateProjections() {
    const hoursInDay = 24;
    const daysInMonth = 30;
    const recentOps = this.getRecentOperations(60);
    
    if (recentOps.length === 0) {
      return {
        dailyProjection: this.currentUsage.today,
        monthlyProjection: this.currentUsage.thisMonth,
        confidence: 'low'
      };
    }
    
    const avgCostPerHour = recentOps.reduce((sum, op) => sum + op.cost, 0);
    const currentHour = new Date().getHours();
    const hoursRemainingToday = 24 - currentHour;
    
    const dailyProjection = this.currentUsage.today + (avgCostPerHour * hoursRemainingToday);
    const monthlyProjection = this.currentUsage.thisMonth + (avgCostPerHour * hoursInDay * (daysInMonth - new Date().getDate()));
    
    return {
      dailyProjection: Math.max(dailyProjection, this.currentUsage.today),
      monthlyProjection: Math.max(monthlyProjection, this.currentUsage.thisMonth),
      avgCostPerHour,
      confidence: recentOps.length >= 5 ? 'high' : 'medium'
    };
  }

  getBudgetStatus() {
    const projections = this.generateProjections();
    const recentOps = this.getRecentOperations(60);
    
    return {
      daily: {
        used: this.currentUsage.today,
        limit: this.config.dailyLimit,
        percentage: (this.currentUsage.today / this.config.dailyLimit * 100).toFixed(1),
        projected: projections.dailyProjection,
        remaining: this.config.dailyLimit - this.currentUsage.today
      },
      monthly: {
        used: this.currentUsage.thisMonth,
        limit: this.config.monthlyLimit,
        percentage: (this.currentUsage.thisMonth / this.config.monthlyLimit * 100).toFixed(1),
        projected: projections.monthlyProjection,
        remaining: this.config.monthlyLimit - this.currentUsage.thisMonth
      },
      operations: {
        today: this.currentUsage.operationCount,
        lastHour: recentOps.length,
        avgCostPerOperation: this.currentUsage.operationCount > 0 ? 
          (this.currentUsage.today / this.currentUsage.operationCount).toFixed(4) : 0
      },
      status: this.getOverallStatus(),
      projections,
      lastUpdate: new Date().toISOString()
    };
  }

  getOverallStatus() {
    const dailyPct = this.currentUsage.today / this.config.dailyLimit;
    const monthlyPct = this.currentUsage.thisMonth / this.config.monthlyLimit;
    const maxPct = Math.max(dailyPct, monthlyPct);
    
    if (maxPct >= this.config.emergencyThreshold) return 'emergency';
    if (maxPct >= this.config.alertThreshold) return 'warning';
    if (maxPct >= 0.5) return 'caution';
    return 'safe';
  }

  startMonitoring() {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAndTriggerAlerts();
        this.emit('monitoring_tick', this.getBudgetStatus());
      } catch (error) {
        console.error('❌ Monitoring error:', error);
      }
    }, this.config.monitoringInterval);
    
    console.log(`🔄 Cost monitoring started (interval: ${this.config.monitoringInterval}ms)`);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.monitoringActive = false;
    console.log('🛑 Cost monitoring stopped');
  }

  async generateReport(days = 7) {
    const status = this.getBudgetStatus();
    const alerts = await this.loadAlerts();
    const recentAlerts = alerts.filter(a => 
      Date.now() - new Date(a.timestamp).getTime() < days * 24 * 60 * 60 * 1000
    );
    
    const recentOps = this.currentUsage.operationHistory.filter(op =>
      Date.now() - new Date(op.timestamp).getTime() < days * 24 * 60 * 60 * 1000
    );
    
    const operationTypes = {};
    recentOps.forEach(op => {
      operationTypes[op.operation] = (operationTypes[op.operation] || 0) + op.cost;
    });
    
    return {
      reportPeriod: `${days} days`,
      generatedAt: new Date().toISOString(),
      budgetStatus: status,
      totalOperations: recentOps.length,
      totalCost: recentOps.reduce((sum, op) => sum + op.cost, 0),
      operationBreakdown: operationTypes,
      alertsSummary: {
        total: recentAlerts.length,
        emergency: recentAlerts.filter(a => a.level === 'emergency').length,
        warning: recentAlerts.filter(a => a.level === 'warning').length
      },
      recommendations: this.generateRecommendations(status, recentOps)
    };
  }

  generateRecommendations(status, recentOps) {
    const recommendations = [];
    
    if (status.status === 'warning' || status.status === 'emergency') {
      recommendations.push('🚨 Consider reducing Background Agent usage until budget resets');
      recommendations.push('📊 Review operation costs and optimize high-cost operations');
    }
    
    if (status.operations.avgCostPerOperation > 0.05) {
      recommendations.push('💡 Consider using simpler operations to reduce average cost');
    }
    
    if (status.operations.lastHour > 10) {
      recommendations.push('⏱️ High operation frequency detected - consider batching operations');
    }
    
    const expensiveOps = recentOps
      .filter(op => op.cost > 0.08)
      .map(op => op.operation);
    
    if (expensiveOps.length > 0) {
      recommendations.push(`💰 Most expensive operations: ${[...new Set(expensiveOps)].join(', ')}`);
    }
    
    if (status.projections.confidence === 'high' && status.projections.dailyProjection > status.daily.limit) {
      recommendations.push('📈 Projected to exceed daily budget - reduce usage immediately');
    }
    
    return recommendations;
  }

  async cleanup() {
    this.stopMonitoring();
    await this.saveData();
    console.log('🧹 Cost monitor cleanup completed');
  }
}

// Export for use in other modules
module.exports = EnhancedCostMonitor;

// CLI interface for standalone usage
if (require.main === module) {
  const monitor = new EnhancedCostMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down cost monitor...');
    await monitor.cleanup();
    process.exit(0);
  });
  
  // Example usage and testing
  setInterval(async () => {
    const status = monitor.getBudgetStatus();
    console.log(`📊 Budget Status: ${status.status.toUpperCase()} | Daily: ${status.daily.percentage}% | Monthly: ${status.monthly.percentage}%`);
  }, 60000);
  
  console.log('🚀 Enhanced Cost Monitor running in standalone mode');
} 