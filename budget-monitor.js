#!/usr/bin/env node

// Budget Monitoring for Carousel Workflow
const fs = require('fs');

class BudgetMonitor {
  constructor() {
    this.budgetFile = 'temp/reports/budget-status.json';
    this.workflowLogFile = 'temp/reports/workflow-executions.json';
    this.monthlyBudget = 50;
  }

  loadCurrentBudget() {
    try {
      if (fs.existsSync(this.budgetFile)) {
        return JSON.parse(fs.readFileSync(this.budgetFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load budget file:', error.message);
    }
    
    return {
      budget: {
        monthly: this.monthlyBudget,
        current: 7.13,
        remaining: 42.88,
        percentage: 14.2
      },
      status: {
        icon: '🟢',
        message: 'HEALTHY - On track',
        healthy: true
      }
    };
  }

  logWorkflowExecution(cost, topic, platform) {
    const execution = {
      timestamp: new Date().toISOString(),
      cost: parseFloat(cost),
      topic: topic,
      platform: platform,
      workflow: 'enhanced-carousel'
    };

    let executions = [];
    try {
      if (fs.existsSync(this.workflowLogFile)) {
        executions = JSON.parse(fs.readFileSync(this.workflowLogFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load workflow log:', error.message);
    }

    executions.push(execution);
    
    try {
      if (!fs.existsSync('temp/reports')) {
        fs.mkdirSync('temp/reports', { recursive: true });
      }
      fs.writeFileSync(this.workflowLogFile, JSON.stringify(executions, null, 2));
    } catch (error) {
      console.warn('Could not save workflow log:', error.message);
    }

    return execution;
  }

  updateBudget(cost) {
    const currentBudget = this.loadCurrentBudget();
    const newCurrent = currentBudget.budget.current + parseFloat(cost);
    const newRemaining = currentBudget.budget.monthly - newCurrent;
    const newPercentage = (newCurrent / currentBudget.budget.monthly) * 100;

    const updatedBudget = {
      budget: {
        monthly: currentBudget.budget.monthly,
        current: newCurrent,
        remaining: newRemaining,
        percentage: newPercentage
      },
      status: {
        icon: newPercentage > 90 ? '🔴' : newPercentage > 75 ? '🟡' : '🟢',
        message: newPercentage > 90 ? 'CRITICAL - Budget nearly exhausted' : 
                 newPercentage > 75 ? 'WARNING - High usage detected' : 'HEALTHY - On track',
        healthy: newPercentage < 75
      },
      lastUpdated: new Date().toISOString()
    };

    try {
      fs.writeFileSync(this.budgetFile, JSON.stringify(updatedBudget, null, 2));
      console.log('💰 Budget updated successfully');
      console.log(`Current spend: $${newCurrent.toFixed(2)} (${newPercentage.toFixed(1)}%)`);
      console.log(`Remaining: $${newRemaining.toFixed(2)}`);
    } catch (error) {
      console.warn('Could not update budget file:', error.message);
    }

    return updatedBudget;
  }

  checkBudgetHealth() {
    const budget = this.loadCurrentBudget();
    console.log('\n📊 Current Budget Status:');
    console.log(`${budget.status.icon} ${budget.status.message}`);
    console.log(`Monthly Budget: $${budget.budget.monthly}`);
    console.log(`Current Spend: $${budget.budget.current.toFixed(2)} (${budget.budget.percentage.toFixed(1)}%)`);
    console.log(`Remaining: $${budget.budget.remaining.toFixed(2)}`);
    
    return budget.status.healthy;
  }
}

// Export for use in other scripts
module.exports = BudgetMonitor;

// Run if called directly
if (require.main === module) {
  const monitor = new BudgetMonitor();
  monitor.checkBudgetHealth();
}
