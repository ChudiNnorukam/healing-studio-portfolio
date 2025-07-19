#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { track } = require('./tool-usage-tracker');

class PortfolioOrganizer {
    constructor() {
        this.rootPath = process.cwd();
        this.backupPath = path.join(this.rootPath, 'backup-before-organization');
        this.operations = [];
        this.errors = [];
    }

    async organize() {
        console.log('🗂️ Starting Portfolio Organization...\n');
        
        const startTime = Date.now();
        
        try {
            // Phase 1: Create backup
            await this.createBackup();
            
            // Phase 2: Create new directory structure
            await this.createDirectoryStructure();
            
            // Phase 3: Move files systematically
            await this.moveCoreFiles();
            await this.moveAutomationFiles();
            await this.moveDocumentationFiles();
            await this.moveConfigurationFiles();
            await this.moveTestingFiles();
            await this.moveTemporaryFiles();
            await this.cleanupDeprecatedFiles();
            
            // Phase 4: Update references
            await this.updateFileReferences();
            
            // Phase 5: Generate report
            await this.generateOrganizationReport();
            
            const duration = Date.now() - startTime;
            track('portfolio_organization', 'automation', true, duration, null);
            
            console.log('\n✅ Portfolio organization completed successfully!');
            console.log(`📊 Operations performed: ${this.operations.length}`);
            console.log(`⚠️ Errors encountered: ${this.errors.length}`);
            
        } catch (error) {
            track('portfolio_organization', 'automation', false, 0, error);
            console.error('❌ Organization failed:', error);
            throw error;
        }
    }

    async createBackup() {
        console.log('💾 Creating backup...');
        
        if (fs.existsSync(this.backupPath)) {
            console.log('⚠️ Backup already exists, skipping...');
            return;
        }
        
        try {
            execSync(`cp -r "${this.rootPath}" "${this.backupPath}"`, { stdio: 'inherit' });
            this.operations.push('Created backup');
            console.log('✅ Backup created successfully');
        } catch (error) {
            this.errors.push(`Backup failed: ${error.message}`);
            console.error('❌ Backup failed:', error.message);
        }
    }

    async createDirectoryStructure() {
        console.log('📁 Creating directory structure...');
        
        const directories = [
            'core/assets/images',
            'core/assets/css',
            'core/assets/scripts',
            'automation/n8n',
            'automation/carousel',
            'automation/cost-monitor',
            'automation/tool-tracking',
            'documentation/guides',
            'documentation/reports',
            'documentation/templates',
            'documentation/architecture',
            'configuration/cursor',
            'configuration/n8n',
            'configuration/carousel',
            'configuration/cost-monitor',
            'configuration/zapier',
            'testing/web-testing',
            'testing/github-pages',
            'testing/openai',
            'testing/mcp',
            'temp/logs',
            'temp/mocks',
            'temp/previews',
            'temp/reports',
            'deprecated'
        ];
        
        for (const dir of directories) {
            try {
                const fullPath = path.join(this.rootPath, dir);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    this.operations.push(`Created directory: ${dir}`);
                }
            } catch (error) {
                this.errors.push(`Failed to create ${dir}: ${error.message}`);
            }
        }
        
        console.log('✅ Directory structure created');
    }

    async moveCoreFiles() {
        console.log('📦 Moving core files...');
        
        const coreFiles = [
            { src: 'index.html', dest: 'core/index.html' },
            { src: 'healing-studio-dashboard.html', dest: 'core/healing-studio-dashboard.html' },
            { src: 'README.md', dest: 'core/README.md' }
        ];
        
        for (const file of coreFiles) {
            await this.moveFile(file.src, file.dest);
        }
        
        // Move assets directory
        if (fs.existsSync('assets')) {
            await this.moveDirectory('assets', 'core/assets');
        }
        
        console.log('✅ Core files moved');
    }

    async moveAutomationFiles() {
        console.log('🤖 Moving automation files...');
        
        const automationFiles = [
            // Carousel automation
            { src: 'carousel-automation-system.js', dest: 'automation/carousel/carousel-automation-system.js' },
            { src: 'simple-carousel-sample.js', dest: 'automation/carousel/simple-carousel-sample.js' },
            { src: 'carousel-preview-generator.js', dest: 'automation/carousel/carousel-preview-generator.js' },
            
            // Cost monitoring
            { src: 'cost-monitor.js', dest: 'automation/cost-monitor/cost-monitor.js' },
            
            // Tool tracking
            { src: 'tool-usage-tracker.js', dest: 'automation/tool-tracking/tool-usage-tracker.js' },
            { src: 'auto-tracker.js', dest: 'automation/tool-tracking/auto-tracker.js' },
            { src: 'start-tracking.js', dest: 'automation/tool-tracking/start-tracking.js' },
            { src: 'demo-tracking.js', dest: 'automation/tool-tracking/demo-tracking.js' },
            
            // n8n automation
            { src: 'n8n-mcp-server.js', dest: 'automation/n8n/n8n-mcp-server.js' },
            { src: 'n8n-webhook-mcp-server.js', dest: 'automation/n8n/n8n-webhook-mcp-server.js' },
            { src: 'test-n8n-mcp.js', dest: 'automation/n8n/test-n8n-mcp.js' },
            { src: 'create-n8n-workflows.js', dest: 'automation/n8n/create-n8n-workflows.js' },
            { src: 'create-simple-workflows.js', dest: 'automation/n8n/create-simple-workflows.js' },
            { src: 'test-workflows.js', dest: 'automation/n8n/test-workflows.js' },
            { src: 'list-workflows.js', dest: 'automation/n8n/list-workflows.js' },
            { src: 'check-workflow-status.js', dest: 'automation/n8n/check-workflow-status.js' },
            { src: 'import-mcp-workflow.js', dest: 'automation/n8n/import-mcp-workflow.js' }
        ];
        
        for (const file of automationFiles) {
            await this.moveFile(file.src, file.dest);
        }
        
        console.log('✅ Automation files moved');
    }

    async moveDocumentationFiles() {
        console.log('📚 Moving documentation files...');
        
        const documentationFiles = [
            // Guides
            { src: 'tool-tracking-guide.md', dest: 'documentation/guides/tool-tracking-guide.md' },
            { src: 'hosted-n8n-mcp-guide.md', dest: 'documentation/guides/hosted-n8n-mcp-guide.md' },
            { src: 'cursor-n8n-setup-guide.md', dest: 'documentation/guides/cursor-n8n-setup-guide.md' },
            { src: 'n8n-mcp-debugging-guide.md', dest: 'documentation/guides/n8n-mcp-debugging-guide.md' },
            { src: 'n8n-mcp-setup-complete.md', dest: 'documentation/guides/n8n-mcp-setup-complete.md' },
            { src: 'quick-workflow-setup.md', dest: 'documentation/guides/quick-workflow-setup.md' },
            { src: 'setup-n8n-workflows.md', dest: 'documentation/guides/setup-n8n-workflows.md' },
            { src: 'Personalized_Usage_Strategy.md', dest: 'documentation/guides/Personalized_Usage_Strategy.md' },
            
            // Reports
            { src: 'OpenAI_Cost_Analysis.md', dest: 'documentation/reports/OpenAI_Cost_Analysis.md' },
            { src: 'OpenAI_Integration_Summary.md', dest: 'documentation/reports/OpenAI_Integration_Summary.md' },
            { src: 'PORTFOLIO_ENHANCEMENTS_SUMMARY.md', dest: 'documentation/reports/PORTFOLIO_ENHANCEMENTS_SUMMARY.md' },
            { src: 'REPOSITORY_CLEANUP_SUMMARY.md', dest: 'documentation/reports/REPOSITORY_CLEANUP_SUMMARY.md' },
            { src: 'TOOL_TRACKING_SUMMARY.md', dest: 'documentation/reports/TOOL_TRACKING_SUMMARY.md' },
            
            // Templates
            { src: 'high-value-prompt-template.md', dest: 'documentation/templates/high-value-prompt-template.md' },
            
            // Architecture
            { src: 'MCP_Implementation_Guide.md', dest: 'documentation/architecture/MCP_Implementation_Guide.md' }
        ];
        
        for (const file of documentationFiles) {
            await this.moveFile(file.src, file.dest);
        }
        
        console.log('✅ Documentation files moved');
    }

    async moveConfigurationFiles() {
        console.log('⚙️ Moving configuration files...');
        
        const configFiles = [
            // Cursor configs
            { src: 'cursor_hallucination_guard.json', dest: 'configuration/cursor/cursor_hallucination_guard.json' },
            { src: 'cursor-mcp-config.json', dest: 'configuration/cursor/cursor-mcp-config.json' },
            { src: 'cursor-openai-config.json', dest: 'configuration/cursor/cursor-openai-config.json' },
            
            // n8n configs
            { src: 'n8n-config.env', dest: 'configuration/n8n/n8n-config.env' },
            { src: 'n8n-mcp-workflow.json', dest: 'configuration/n8n/n8n-mcp-workflow.json' },
            { src: 'n8n-webhook-config.json', dest: 'configuration/n8n/n8n-webhook-config.json' },
            
            // Other configs
            { src: 'carousel-config.json', dest: 'configuration/carousel/carousel-config.json' },
            { src: 'cost-monitor-config.json', dest: 'configuration/cost-monitor/cost-monitor-config.json' },
            { src: 'zapier-automation-config.json', dest: 'configuration/zapier/zapier-automation-config.json' }
        ];
        
        for (const file of configFiles) {
            await this.moveFile(file.src, file.dest);
        }
        
        console.log('✅ Configuration files moved');
    }

    async moveTestingFiles() {
        console.log('🧪 Moving testing files...');
        
        const testingFiles = [
            // Web testing
            { src: 'web-testing-agent.js', dest: 'testing/web-testing/web-testing-agent.js' },
            { src: 'web-monitor.js', dest: 'testing/web-testing/web-monitor.js' },
            
            // GitHub Pages testing
            { src: 'github-pages-tester.js', dest: 'testing/github-pages/github-pages-tester.js' },
            
            // Other testing
            { src: 'test-openai-integration.js', dest: 'testing/openai/test-openai-integration.js' },
            { src: 'test-mcp-server.js', dest: 'testing/mcp/test-mcp-server.js' },
            { src: 'simple-mcp-server.js', dest: 'testing/mcp/simple-mcp-server.js' }
        ];
        
        for (const file of testingFiles) {
            await this.moveFile(file.src, file.dest);
        }
        
        console.log('✅ Testing files moved');
    }

    async moveTemporaryFiles() {
        console.log('📄 Moving temporary files...');
        
        const tempFiles = [
            // Logs
            { src: 'cost-alerts.log', dest: 'temp/logs/cost-alerts.log' },
            { src: 'openai-usage.log', dest: 'temp/logs/openai-usage.log' },
            
            // Reports
            { src: 'daily-usage-report.json', dest: 'temp/reports/daily-usage-report.json' },
            { src: 'openai-integration-report.json', dest: 'temp/reports/openai-integration-report.json' },
            { src: 'web-testing-report.md', dest: 'temp/reports/web-testing-report.md' }
        ];
        
        for (const file of tempFiles) {
            await this.moveFile(file.src, file.dest);
        }
        
        // Move mock files
        const mockFiles = fs.readdirSync(this.rootPath).filter(file => 
            file.startsWith('carousel-mock-') && file.endsWith('.json')
        );
        
        for (const file of mockFiles) {
            await this.moveFile(file, `temp/mocks/${file}`);
        }
        
        // Move preview directories
        if (fs.existsSync('carousel-previews')) {
            await this.moveDirectory('carousel-previews', 'temp/previews/carousel-previews');
        }
        
        if (fs.existsSync('carousel-samples')) {
            await this.moveDirectory('carousel-samples', 'temp/previews/carousel-samples');
        }
        
        console.log('✅ Temporary files moved');
    }

    async cleanupDeprecatedFiles() {
        console.log('🗑️ Cleaning up deprecated files...');
        
        // Move healing-studio-portfolio directory contents to core
        if (fs.existsSync('healing-studio-portfolio')) {
            const healingStudioPath = path.join(this.rootPath, 'healing-studio-portfolio');
            const items = fs.readdirSync(healingStudioPath);
            
            for (const item of items) {
                const srcPath = path.join(healingStudioPath, item);
                const destPath = path.join(this.rootPath, 'core', item);
                
                if (fs.existsSync(destPath)) {
                    // File exists in core, move to deprecated
                    await this.moveFile(`healing-studio-portfolio/${item}`, `deprecated/healing-studio-${item}`);
                } else {
                    // Move to core
                    await this.moveFile(`healing-studio-portfolio/${item}`, `core/${item}`);
                }
            }
            
            // Remove empty directory
            try {
                fs.rmdirSync(healingStudioPath);
                this.operations.push('Removed empty healing-studio-portfolio directory');
            } catch (error) {
                this.errors.push(`Failed to remove healing-studio-portfolio: ${error.message}`);
            }
        }
        
        // Move .DS_Store files to deprecated
        const dsStoreFiles = fs.readdirSync(this.rootPath).filter(file => file === '.DS_Store');
        for (const file of dsStoreFiles) {
            await this.moveFile(file, `deprecated/${file}`);
        }
        
        console.log('✅ Deprecated files cleaned up');
    }

    async moveFile(src, dest) {
        const srcPath = path.join(this.rootPath, src);
        const destPath = path.join(this.rootPath, dest);
        
        if (fs.existsSync(srcPath)) {
            try {
                // Ensure destination directory exists
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                fs.renameSync(srcPath, destPath);
                this.operations.push(`Moved: ${src} → ${dest}`);
            } catch (error) {
                this.errors.push(`Failed to move ${src}: ${error.message}`);
            }
        }
    }

    async moveDirectory(src, dest) {
        const srcPath = path.join(this.rootPath, src);
        const destPath = path.join(this.rootPath, dest);
        
        if (fs.existsSync(srcPath)) {
            try {
                // Ensure destination directory exists
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                fs.renameSync(srcPath, destPath);
                this.operations.push(`Moved directory: ${src} → ${dest}`);
            } catch (error) {
                this.errors.push(`Failed to move directory ${src}: ${error.message}`);
            }
        }
    }

    async updateFileReferences() {
        console.log('🔗 Updating file references...');
        
        // Update package.json scripts
        await this.updatePackageJsonScripts();
        
        // Update import statements in JS files
        await this.updateImportStatements();
        
        console.log('✅ File references updated');
    }

    async updatePackageJsonScripts() {
        const packageJsonPath = path.join(this.rootPath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const scripts = packageJson.scripts || {};
                
                // Update script paths
                const updatedScripts = {};
                for (const [name, script] of Object.entries(scripts)) {
                    let updatedScript = script;
                    
                    // Update paths for moved files
                    updatedScript = updatedScript.replace('tool-usage-tracker.js', 'automation/tool-tracking/tool-usage-tracker.js');
                    updatedScript = updatedScript.replace('auto-tracker.js', 'automation/tool-tracking/auto-tracker.js');
                    updatedScript = updatedScript.replace('start-tracking.js', 'automation/tool-tracking/start-tracking.js');
                    updatedScript = updatedScript.replace('demo-tracking.js', 'automation/tool-tracking/demo-tracking.js');
                    updatedScript = updatedScript.replace('carousel-automation-system.js', 'automation/carousel/carousel-automation-system.js');
                    updatedScript = updatedScript.replace('simple-carousel-sample.js', 'automation/carousel/simple-carousel-sample.js');
                    updatedScript = updatedScript.replace('cost-monitor.js', 'automation/cost-monitor/cost-monitor.js');
                    updatedScript = updatedScript.replace('web-testing-agent.js', 'testing/web-testing/web-testing-agent.js');
                    updatedScript = updatedScript.replace('web-monitor.js', 'testing/web-testing/web-monitor.js');
                    updatedScript = updatedScript.replace('github-pages-tester.js', 'testing/github-pages/github-pages-tester.js');
                    updatedScript = updatedScript.replace('test-openai-integration.js', 'testing/openai/test-openai-integration.js');
                    
                    updatedScripts[name] = updatedScript;
                }
                
                packageJson.scripts = updatedScripts;
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
                this.operations.push('Updated package.json scripts');
                
            } catch (error) {
                this.errors.push(`Failed to update package.json: ${error.message}`);
            }
        }
    }

    async updateImportStatements() {
        const jsFiles = this.findJsFiles();
        
        for (const file of jsFiles) {
            try {
                let content = fs.readFileSync(file, 'utf8');
                let updated = false;
                
                // Update require statements
                const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
                content = content.replace(requireRegex, (match, modulePath) => {
                    if (modulePath.startsWith('.')) {
                        // Local module, update path
                        const updatedPath = this.updateLocalPath(modulePath, file);
                        if (updatedPath !== modulePath) {
                            updated = true;
                            return `require('${updatedPath}')`;
                        }
                    }
                    return match;
                });
                
                if (updated) {
                    fs.writeFileSync(file, content);
                    this.operations.push(`Updated imports in ${file}`);
                }
                
            } catch (error) {
                this.errors.push(`Failed to update imports in ${file}: ${error.message}`);
            }
        }
    }

    updateLocalPath(modulePath, currentFile) {
        // Simple path updating logic
        const updates = {
            './tool-usage-tracker': './automation/tool-tracking/tool-usage-tracker',
            './auto-tracker': './automation/tool-tracking/auto-tracker',
            './cost-monitor': './automation/cost-monitor/cost-monitor',
            './carousel-automation-system': './automation/carousel/carousel-automation-system',
            './simple-carousel-sample': './automation/carousel/simple-carousel-sample',
            './web-testing-agent': './testing/web-testing/web-testing-agent',
            './web-monitor': './testing/web-testing/web-monitor'
        };
        
        return updates[modulePath] || modulePath;
    }

    findJsFiles() {
        const jsFiles = [];
        this.scanForJsFiles(this.rootPath, jsFiles);
        return jsFiles;
    }

    scanForJsFiles(dirPath, jsFiles, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                this.scanForJsFiles(fullPath, jsFiles, relativeItemPath);
            } else if (item.endsWith('.js')) {
                jsFiles.push(relativeItemPath);
            }
        }
    }

    async generateOrganizationReport() {
        console.log('📊 Generating organization report...');
        
        const report = `# 🗂️ Portfolio Organization Report

## 📈 Summary
- **Operations Performed**: ${this.operations.length}
- **Errors Encountered**: ${this.errors.length}
- **Backup Created**: ${fs.existsSync(this.backupPath) ? 'Yes' : 'No'}

## ✅ Operations Completed
${this.operations.map(op => `- ${op}`).join('\n')}

## ❌ Errors Encountered
${this.errors.length > 0 ? this.errors.map(error => `- ${error}`).join('\n') : '- None'}

## 📁 New Structure
\`\`\`
Chudi's Prompt Engineering Portfolio/
├── 📁 core/                          # Core portfolio files
├── 📁 automation/                    # All automation tools
│   ├── n8n/                         # n8n related files
│   ├── carousel/                    # Carousel automation
│   ├── cost-monitor/                # Cost monitoring
│   └── tool-tracking/               # Tool usage tracking
├── 📁 documentation/                 # All documentation
│   ├── guides/                      # How-to guides
│   ├── reports/                     # Analysis reports
│   ├── templates/                   # Templates and examples
│   └── architecture/                # System architecture docs
├── 📁 configuration/                 # All config files
│   ├── cursor/                      # Cursor specific configs
│   ├── n8n/                         # n8n configs
│   └── openai/                      # OpenAI configs
├── 📁 testing/                       # Testing and monitoring
│   ├── web-testing/                 # Web testing tools
│   ├── github-pages/                # GitHub Pages testing
│   └── reports/                     # Test reports
├── 📁 temp/                          # Temporary files
│   ├── logs/                        # Log files
│   ├── mocks/                       # Mock data
│   └── previews/                    # Generated previews
└── 📁 deprecated/                    # Old/unused files
\`\`\`

## 🎯 Next Steps
1. **Test Functionality**: Verify all automation tools work
2. **Update Documentation**: Reflect new file locations
3. **Clean Backup**: Remove backup after testing (if desired)
4. **Update Scripts**: Modify any remaining hardcoded paths

## ⚠️ Important Notes
- Backup available at: \`${this.backupPath}\`
- All file references have been updated
- Package.json scripts updated
- Import statements updated

---
*Report generated on ${new Date().toLocaleString()}*
`;

        const reportPath = path.join(this.rootPath, 'portfolio-organization-report.md');
        fs.writeFileSync(reportPath, report);
        console.log(`📄 Report saved to: ${reportPath}`);
    }
}

// Run if called directly
if (require.main === module) {
    const organizer = new PortfolioOrganizer();
    organizer.organize()
        .then(() => {
            console.log('\n🎉 Portfolio organization completed!');
            console.log('📖 Check portfolio-organization-report.md for details');
        })
        .catch(error => {
            console.error('❌ Organization failed:', error);
            process.exit(1);
        });
}

module.exports = PortfolioOrganizer; 