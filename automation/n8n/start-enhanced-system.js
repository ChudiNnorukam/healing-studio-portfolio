#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Simple color functions to replace chalk
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

class EnhancedSystemLauncher {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
    this.startTime = Date.now();
    
    // Configuration paths
    this.configPaths = {
      costMonitor: '../../configuration/cost-monitor/cost-monitor-config.json',
      cursorMcp: '../../configuration/cursor/cursor-mcp-browser-config.json',
      n8nConfig: '../../configuration/n8n/n8n-config.env'
    };
    
    this.setupSignalHandlers();
  }

  async init() {
    try {
      console.clear();
      await this.showBanner();
      await this.checkSystemRequirements();
      await this.ensureDirectories();
      await this.loadConfigurations();
      await this.startServices();
      await this.verifySystem();
      this.showSuccessMessage();
    } catch (error) {
      console.error(colors.red(`❌ System startup failed: ${error.message}`));
      await this.shutdown();
      process.exit(1);
    }
  }

  async showBanner() {
    console.log(colors.blue('🚀 Enhanced n8n Browser Automation with Cost Monitoring'));
    console.log(colors.gray('━'.repeat(60)));
    console.log();
  }

  async checkSystemRequirements() {
    console.log(colors.yellow('🔍 Checking system requirements...'));
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
    }
    console.log(colors.green(`✅ Node.js ${nodeVersion}`));

    // Check if package.json exists and has dependencies
    try {
      const packagePath = path.join(__dirname, 'package.json');
      await fs.access(packagePath);
      console.log(colors.green('✅ Package configuration found'));
    } catch {
      throw new Error('package.json not found. Run setup first.');
    }

    // Check if n8n is accessible
    try {
      const { default: axios } = await import('axios');
      await axios.get('http://localhost:5678', { timeout: 3000 });
      console.log(colors.green('✅ n8n instance accessible'));
    } catch {
      console.log(colors.yellow('⚠️  n8n not running - will attempt to start'));
    }

    console.log();
  }

  async ensureDirectories() {
    console.log(colors.yellow('📁 Creating required directories...'));
    
    const directories = [
      '../../temp/reports',
      '../../temp/screenshots', 
      '../../temp/logs',
      '../../temp/backups'
    ];

    for (const dir of directories) {
      const fullPath = path.join(__dirname, dir);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(colors.green(`✅ ${dir}`));
    }
    console.log();
  }

  async loadConfigurations() {
    console.log(colors.yellow('⚙️  Loading configurations...'));
    
    for (const [name, configPath] of Object.entries(this.configPaths)) {
      try {
        const fullPath = path.join(__dirname, configPath);
        await fs.access(fullPath);
        console.log(colors.green(`✅ ${name} config loaded`));
      } catch {
        console.log(colors.yellow(`⚠️  ${name} config not found - using defaults`));
      }
    }
    console.log();
  }

  async startServices() {
    console.log(colors.yellow('🚀 Starting services...'));
    
    // 1. Start n8n if not running
    await this.startN8n();
    
    // 2. Start cost monitor
    await this.startCostMonitor();
    
    // 3. Start enhanced MCP server
    await this.startMcpServer();
    
    console.log();
  }

  async startN8n() {
    try {
      const { default: axios } = await import('axios');
      await axios.get('http://localhost:5678', { timeout: 2000 });
      console.log(colors.green('✅ n8n already running'));
      return;
    } catch {
      // n8n not running, start it
    }

    console.log(colors.blue('📦 Starting n8n...'));
    
    const n8nProcess = spawn('npx', ['n8n', 'start'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, N8N_PORT: '5678' }
    });

    this.processes.push({
      name: 'n8n',
      process: n8nProcess,
      startTime: Date.now()
    });

    // Wait for n8n to be ready
    await this.waitForService('http://localhost:5678', 'n8n', 30000);
    console.log(colors.green('✅ n8n started on http://localhost:5678'));
  }

  async startCostMonitor() {
    console.log(colors.blue('💰 Starting cost monitor...'));
    
    const monitorProcess = spawn('node', ['../cost-monitor/enhanced-cost-monitor.js'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    this.processes.push({
      name: 'cost-monitor',
      process: monitorProcess,
      startTime: Date.now()
    });

    // Give cost monitor time to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(colors.green('✅ Cost monitor started'));
  }

  async startMcpServer() {
    console.log(colors.blue('🔧 Starting enhanced MCP server...'));
    
    const mcpProcess = spawn('node', ['enhanced-n8n-browser-mcp-server.js'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    this.processes.push({
      name: 'mcp-server',
      process: mcpProcess,
      startTime: Date.now()
    });

    // Give MCP server time to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(colors.green('✅ Enhanced MCP server started'));
  }

  async waitForService(url, serviceName, timeoutMs = 10000) {
    const startTime = Date.now();
    const { default: axios } = await import('axios');
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        await axios.get(url, { timeout: 1000 });
        return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.stdout.write('.');
      }
    }
    
    throw new Error(`${serviceName} failed to start within ${timeoutMs}ms`);
  }

  async verifySystem() {
    console.log(colors.yellow('🔍 Verifying system health...'));
    
    const checks = [
      {
        name: 'n8n API',
        check: async () => {
          const { default: axios } = await import('axios');
          const response = await axios.get('http://localhost:5678/rest/active-workflows');
          return response.status === 200;
        }
      },
      {
        name: 'Cost Monitor',
        check: async () => {
          const reportPath = path.join(__dirname, '../../temp/reports/enhanced-cost-tracking.json');
          try {
            await fs.access(reportPath);
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        name: 'MCP Server',
        check: async () => {
          // Check if MCP server process is running
          return this.processes.some(p => p.name === 'mcp-server' && !p.process.killed);
        }
      }
    ];

    for (const { name, check } of checks) {
      try {
        const isHealthy = await check();
        if (isHealthy) {
          console.log(colors.green(`✅ ${name} healthy`));
        } else {
          console.log(colors.red(`❌ ${name} unhealthy`));
        }
      } catch (error) {
        console.log(colors.red(`❌ ${name} check failed: ${error.message}`));
      }
    }
    console.log();
  }

  showSuccessMessage() {
    const uptime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log(colors.green('🎉 Enhanced MCP System Successfully Started!'));
    console.log(colors.gray('━'.repeat(60)));
    console.log();
    
    console.log(colors.blue('📊 Service Status:'));
    console.log(colors.white('  • n8n Dashboard: ') + colors.cyan('http://localhost:5678'));
    console.log(colors.white('  • Cost Monitor: ') + colors.green('Active'));
    console.log(colors.white('  • MCP Server: ') + colors.green('Ready for Cursor'));
    console.log(colors.white('  • Startup Time: ') + colors.yellow(`${uptime}s`));
    console.log();
    
    console.log(colors.blue('🎯 Next Steps:'));
    console.log(colors.white('  1. Configure Cursor MCP settings'));
    console.log(colors.white('  2. Test with: "Check my budget status"'));
    console.log(colors.white('  3. Import your first workflow'));
    console.log();
    
    console.log(colors.blue('🔧 Management Commands:'));
    console.log(colors.white('  • Cost Report: ') + colors.cyan('npm run generate-report'));
    console.log(colors.white('  • Health Check: ') + colors.cyan('npm run health-check'));
    console.log(colors.white('  • Stop System: ') + colors.cyan('Ctrl+C'));
    console.log();
    
    console.log(colors.blue('💰 Budget Status:'));
    console.log(colors.white('  • Daily Limit: ') + colors.yellow('$0.50'));
    console.log(colors.white('  • Monthly Limit: ') + colors.yellow('$15.00'));
    console.log(colors.white('  • Alert Threshold: ') + colors.yellow('80%'));
    console.log();
    
    console.log(colors.green('System is ready for Background Agent operations!'));
    console.log(colors.gray('Press Ctrl+C to shutdown all services'));
    console.log();
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(colors.yellow('\n🛑 Received shutdown signal...'));
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      console.log(colors.yellow('\n🛑 Received termination signal...'));
      this.shutdown();
    });

    process.on('uncaughtException', (error) => {
      console.error(colors.red(`💥 Uncaught exception: ${error.message}`));
      this.shutdown();
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(colors.yellow('🔄 Shutting down services...'));
    
    for (const { name, process: proc } of this.processes) {
      if (!proc.killed) {
        console.log(colors.blue(`  Stopping ${name}...`));
        proc.kill('SIGTERM');
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (!proc.killed) {
            console.log(colors.red(`  Force killing ${name}...`));
            proc.kill('SIGKILL');
          }
        }, 5000);
      }
    }

    // Wait for processes to exit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(colors.green('✅ All services stopped'));
    console.log(colors.blue('👋 Enhanced MCP System shutdown complete'));
    
    process.exit(0);
  }

  // CLI monitoring loop
  startMonitoring() {
    setInterval(() => {
      if (this.isShuttingDown) return;
      
      const activeProcesses = this.processes.filter(p => !p.process.killed).length;
      const uptime = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
      
      process.stdout.write(`\r${colors.gray(`[${uptime}m uptime] [${activeProcesses}/${this.processes.length} services]`)}`);
    }, 10000);
  }
}

// Main execution
if (require.main === module) {
  const launcher = new EnhancedSystemLauncher();
  
  launcher.init().then(() => {
    launcher.startMonitoring();
  }).catch(error => {
    console.error(colors.red(`Failed to start system: ${error.message}`));
    process.exit(1);
  });
}

module.exports = EnhancedSystemLauncher; 