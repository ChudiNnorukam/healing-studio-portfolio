#!/bin/bash

# OpenAI Cursor Integration Setup Script
# This script automates the configuration of OpenAI API integration with Cursor

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CURSOR_SETTINGS_DIR="$HOME/Library/Application Support/Cursor/User"
CURSOR_SETTINGS_FILE="$CURSOR_SETTINGS_DIR/settings.json"
BACKUP_FILE="$CURSOR_SETTINGS_DIR/settings.json.backup.$(date +%Y%m%d_%H%M%S)"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"

echo -e "${BLUE}🚀 OpenAI Cursor Integration Setup${NC}"
echo -e "${BLUE}================================${NC}\n"

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Cursor is installed
check_cursor_installation() {
    print_info "Checking Cursor installation..."
    
    if [ -d "$CURSOR_SETTINGS_DIR" ]; then
        print_status "Cursor settings directory found"
    else
        print_error "Cursor settings directory not found. Please install Cursor first."
        exit 1
    fi
    
    if [ -f "$CURSOR_SETTINGS_FILE" ]; then
        print_status "Cursor settings file found"
    else
        print_warning "Cursor settings file not found. Will create new one."
    fi
}

# Backup existing settings
backup_settings() {
    print_info "Backing up existing settings..."
    
    if [ -f "$CURSOR_SETTINGS_FILE" ]; then
        cp "$CURSOR_SETTINGS_FILE" "$BACKUP_FILE"
        print_status "Settings backed up to: $BACKUP_FILE"
    else
        print_warning "No existing settings to backup"
    fi
}

# Create enhanced settings JSON
create_enhanced_settings() {
    print_info "Creating enhanced Cursor settings..."
    
    cat > "$CURSOR_SETTINGS_FILE" << EOF
{
    "terminal.integrated.sendKeybindingsToShell": true,
    "[python]": {
        "editor.formatOnType": true
    },
    "files.autoSave": "afterDelay",
    "cursor.composer.shouldChimeAfterChatFinishes": true,
    "cursor.composer.shouldAllowCustomModes": true,
    "terminal.integrated.inheritEnv": false,
    "diffEditor.maxComputationTime": 0,
    "cursor.windowSwitcher.sidebarHoverCollapsed": true,
    "git.autofetch": true,
    "cursor.openai.apiKey": "$OPENAI_API_KEY",
    "cursor.openai.model": "gpt-4",
    "cursor.openai.baseURL": "https://api.openai.com/v1",
    "cursor.openai.maxTokens": 4000,
    "cursor.openai.temperature": 0.7,
    "cursor.openai.fallbackModel": "gpt-3.5-turbo",
    "cursor.openai.useFallbackOnError": true,
    "cursor.openai.useStreaming": true,
    "cursor.openai.enableCaching": true,
    "cursor.openai.cacheExpiration": 3600,
    "cursor.openai.topP": 0.9,
    "cursor.openai.frequencyPenalty": 0.0,
    "cursor.openai.presencePenalty": 0.0,
    "cursor.ai.enableCodeCompletion": true,
    "cursor.ai.enableChat": true,
    "cursor.ai.enableFileAnalysis": true,
    "cursor.ai.enableDebugging": true,
    "cursor.ai.contextWindow": 8000,
    "cursor.ai.maxConcurrentRequests": 3,
    "cursor.ai.requestTimeout": 30000,
    "cursor.ai.retryAttempts": 3,
    "cursor.ai.retryDelay": 1000
}
EOF
    
    print_status "Enhanced settings created"
}

# Create .cursorrules file
create_cursorrules() {
    print_info "Creating .cursorrules file..."
    
    cat > ".cursorrules" << 'EOF'
# Cursor AI Configuration for OpenAI Integration

## Model Settings
- Use GPT-4 for all AI interactions
- Maintain context across conversations
- Enable code completion and suggestions
- Implement streaming responses for better UX

## Behavior Guidelines
- Follow the Research Guardian + MCP Orchestrator persona
- Cross-check factual claims with citations
- Implement MCP workflow capabilities when appropriate
- Maintain audit trails for automated actions
- Use the enhanced hallucination checking capabilities

## Code Generation Preferences
- Prefer modern JavaScript/TypeScript patterns
- Include comprehensive error handling
- Add JSDoc comments for functions
- Follow project-specific linting rules
- Implement proper TypeScript types
- Use async/await patterns consistently

## Integration Features
- Enable web scraping capabilities for research
- Use hallucination checking for factual verification
- Implement workflow orchestration for complex tasks
- Maintain security best practices for API calls
- Support MCP server/client mode for tool integration

## Development Workflow
- Provide context-aware code suggestions
- Assist with debugging and error resolution
- Help with code refactoring and optimization
- Support testing and documentation generation
- Enable seamless integration with external tools

## Security and Best Practices
- Never expose API keys in code
- Use environment variables for sensitive data
- Implement proper error handling
- Follow OWASP security guidelines
- Maintain clean and maintainable code

## Performance Optimization
- Suggest efficient algorithms and data structures
- Help optimize database queries
- Recommend caching strategies
- Assist with performance profiling
- Guide memory management best practices
EOF
    
    print_status ".cursorrules file created"
}

# Create environment file
create_env_file() {
    print_info "Creating .env file..."
    
    cat > ".env" << EOF
# OpenAI Configuration
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=gpt-4
OPENAI_BASE_URL=https://api.openai.com/v1
CURSOR_OPENAI_INTEGRATION=true

# Cursor Configuration
CURSOR_AI_ENABLED=true
CURSOR_STREAMING_ENABLED=true
CURSOR_CACHING_ENABLED=true
EOF
    
    print_status ".env file created"
}

# Update .gitignore
update_gitignore() {
    print_info "Updating .gitignore..."
    
    if [ ! -f ".gitignore" ]; then
        touch .gitignore
    fi
    
    # Add OpenAI-related entries if they don't exist
    if ! grep -q "\.env" .gitignore; then
        echo ".env" >> .gitignore
    fi
    
    if ! grep -q "openai-integration-report.json" .gitignore; then
        echo "openai-integration-report.json" >> .gitignore
    fi
    
    if ! grep -q "cursor-settings.json" .gitignore; then
        echo "cursor-settings.json" >> .gitignore
    fi
    
    print_status ".gitignore updated"
}

# Install required npm packages
install_dependencies() {
    print_info "Installing required npm packages..."
    
    if [ ! -f "package.json" ]; then
        npm init -y
    fi
    
    # Install OpenAI package
    if ! npm list openai > /dev/null 2>&1; then
        npm install openai
        print_status "OpenAI package installed"
    else
        print_status "OpenAI package already installed"
    fi
    
    # Install additional useful packages
    npm install --save-dev dotenv
    print_status "Additional dependencies installed"
}

# Test the integration
test_integration() {
    print_info "Testing OpenAI integration..."
    
    if [ -f "test-openai-integration.js" ]; then
        print_info "Running integration tests..."
        node test-openai-integration.js
    else
        print_warning "Test file not found. Skipping integration test."
    fi
}

# Create usage monitoring script
create_monitoring_script() {
    print_info "Creating usage monitoring script..."
    
    cat > "monitor-usage.js" << 'EOF'
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
EOF
    
    chmod +x monitor-usage.js
    print_status "Usage monitoring script created"
}

# Main setup function
main() {
    echo -e "${BLUE}Starting OpenAI Cursor integration setup...${NC}\n"
    
    check_cursor_installation
    backup_settings
    create_enhanced_settings
    create_cursorrules
    create_env_file
    update_gitignore
    install_dependencies
    create_monitoring_script
    
    echo -e "\n${GREEN}🎉 Setup completed successfully!${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo -e "1. Restart Cursor to apply the new settings"
    echo -e "2. Test the integration by running: ${YELLOW}node test-openai-integration.js${NC}"
    echo -e "3. Monitor usage with: ${YELLOW}node monitor-usage.js${NC}"
    echo -e "4. Check your OpenAI dashboard for usage tracking"
    echo -e "\n${BLUE}Backup location:${NC} $BACKUP_FILE"
    echo -e "\n${YELLOW}⚠️  Remember to never commit your API key to version control!${NC}"
}

# Run main function
main "$@" 