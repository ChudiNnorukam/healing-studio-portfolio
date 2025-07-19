const fs = require('fs');
const path = require('path');
const { track } = require('./tool-usage-tracker');

class PortfolioOrganizer {
    constructor() {
        this.rootPath = '/Users/chudinnorukam/Documents/Chudi\'s Prompt Engineering Portfolio';
        this.analysis = {
            totalFiles: 0,
            totalDirectories: 0,
            totalSize: 0,
            duplicates: [],
            redundancies: [],
            issues: [],
            recommendations: [],
            structure: {},
            categories: {
                core: [],
                documentation: [],
                automation: [],
                testing: [],
                config: [],
                assets: [],
                temp: [],
                deprecated: []
            }
        };
    }

    async analyzePortfolio() {
        console.log('🔍 Starting Portfolio Organization Audit...\n');
        
        const startTime = Date.now();
        
        try {
            // Analyze root directory
            await this.analyzeDirectory(this.rootPath, '');
            
            // Identify issues and redundancies
            this.identifyIssues();
            this.identifyRedundancies();
            this.categorizeFiles();
            this.generateRecommendations();
            
            const duration = Date.now() - startTime;
            track('portfolio_analysis', 'analysis', true, duration, null);
            
            return this.analysis;
        } catch (error) {
            track('portfolio_analysis', 'analysis', false, 0, error);
            throw error;
        }
    }

    async analyzeDirectory(dirPath, relativePath) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.analysis.totalDirectories++;
                this.analysis.structure[relativeItemPath] = {
                    type: 'directory',
                    size: 0,
                    items: 0
                };
                await this.analyzeDirectory(fullPath, relativeItemPath);
            } else {
                this.analysis.totalFiles++;
                this.analysis.totalSize += stats.size;
                
                if (this.analysis.structure[relativePath]) {
                    this.analysis.structure[relativePath].size += stats.size;
                    this.analysis.structure[relativePath].items++;
                }
            }
        }
    }

    identifyIssues() {
        console.log('🔧 Identifying Issues...');
        
        // Check for duplicate files
        const fileHashes = new Map();
        this.scanForDuplicates(this.rootPath, fileHashes);
        
        // Check for broken links/references
        this.checkForBrokenReferences();
        
        // Check for inconsistent naming
        this.checkNamingConventions();
        
        // Check for large files
        this.checkLargeFiles();
    }

    scanForDuplicates(dirPath, fileHashes, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.scanForDuplicates(fullPath, fileHashes, relativeItemPath);
            } else {
                const content = fs.readFileSync(fullPath);
                const hash = require('crypto').createHash('md5').update(content).digest('hex');
                
                if (fileHashes.has(hash)) {
                    this.analysis.duplicates.push({
                        original: fileHashes.get(hash),
                        duplicate: relativeItemPath,
                        size: stats.size
                    });
                } else {
                    fileHashes.set(hash, relativeItemPath);
                }
            }
        }
    }

    checkForBrokenReferences() {
        // Check for broken imports in JS files
        const jsFiles = this.findFilesByExtension('.js');
        jsFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const imports = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
                
                imports.forEach(importStr => {
                    const modulePath = importStr.match(/require\(['"]([^'"]+)['"]\)/)[1];
                    if (!modulePath.startsWith('.') && !modulePath.startsWith('/')) {
                        // External module, skip
                        return;
                    }
                    
                    const resolvedPath = path.resolve(path.dirname(file), modulePath);
                    if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.js')) {
                        this.analysis.issues.push({
                            type: 'broken_import',
                            file: file,
                            import: modulePath,
                            severity: 'high'
                        });
                    }
                });
            } catch (error) {
                // Skip files that can't be read
            }
        });
    }

    checkNamingConventions() {
        const items = fs.readdirSync(this.rootPath);
        
        items.forEach(item => {
            // Check for inconsistent naming
            if (item.includes(' ') && !item.startsWith('.')) {
                this.analysis.issues.push({
                    type: 'naming_convention',
                    file: item,
                    issue: 'Contains spaces in filename',
                    severity: 'low'
                });
            }
            
            // Check for mixed case
            if (item !== item.toLowerCase() && item !== item.toUpperCase()) {
                this.analysis.issues.push({
                    type: 'naming_convention',
                    file: item,
                    issue: 'Mixed case filename',
                    severity: 'low'
                });
            }
        });
    }

    checkLargeFiles() {
        const largeFileThreshold = 10 * 1024 * 1024; // 10MB
        
        this.scanForLargeFiles(this.rootPath, largeFileThreshold);
    }

    scanForLargeFiles(dirPath, threshold, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.scanForLargeFiles(fullPath, threshold, relativeItemPath);
            } else if (stats.size > threshold) {
                this.analysis.issues.push({
                    type: 'large_file',
                    file: relativeItemPath,
                    size: stats.size,
                    sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                    severity: 'medium'
                });
            }
        }
    }

    identifyRedundancies() {
        console.log('🔄 Identifying Redundancies...');
        
        // Check for duplicate functionality
        this.checkDuplicateFunctionality();
        
        // Check for outdated files
        this.checkOutdatedFiles();
        
        // Check for unused dependencies
        this.checkUnusedDependencies();
    }

    checkDuplicateFunctionality() {
        // Check for multiple similar files
        const similarFiles = {
            'package.json': [],
            'README.md': [],
            'config.js': [],
            'test.js': []
        };
        
        this.scanForSimilarFiles(this.rootPath, similarFiles);
        
        Object.entries(similarFiles).forEach(([pattern, files]) => {
            if (files.length > 1) {
                this.analysis.redundancies.push({
                    type: 'duplicate_functionality',
                    pattern: pattern,
                    files: files,
                    recommendation: 'Consider consolidating into single file'
                });
            }
        });
    }

    scanForSimilarFiles(dirPath, similarFiles, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.scanForSimilarFiles(fullPath, similarFiles, relativeItemPath);
            } else {
                Object.keys(similarFiles).forEach(pattern => {
                    if (item.includes(pattern.replace('*', ''))) {
                        similarFiles[pattern].push(relativeItemPath);
                    }
                });
            }
        }
    }

    checkOutdatedFiles() {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        this.scanForOutdatedFiles(this.rootPath, oneMonthAgo);
    }

    scanForOutdatedFiles(dirPath, threshold, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.scanForOutdatedFiles(fullPath, threshold, relativeItemPath);
            } else if (stats.mtime.getTime() < threshold) {
                this.analysis.redundancies.push({
                    type: 'outdated_file',
                    file: relativeItemPath,
                    lastModified: stats.mtime,
                    daysOld: Math.floor((Date.now() - stats.mtime.getTime()) / (24 * 60 * 60 * 1000))
                });
            }
        }
    }

    checkUnusedDependencies() {
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.rootPath, 'package.json'), 'utf8'));
            const dependencies = Object.keys(packageJson.dependencies || {});
            const devDependencies = Object.keys(packageJson.devDependencies || {});
            
            // Simple check - look for import statements
            const allDeps = [...dependencies, ...devDependencies];
            const usedDeps = new Set();
            
            this.scanForDependencyUsage(this.rootPath, allDeps, usedDeps);
            
            const unusedDeps = allDeps.filter(dep => !usedDeps.has(dep));
            
            if (unusedDeps.length > 0) {
                this.analysis.redundancies.push({
                    type: 'unused_dependencies',
                    dependencies: unusedDeps,
                    recommendation: 'Consider removing unused dependencies'
                });
            }
        } catch (error) {
            // Skip if package.json doesn't exist or is invalid
        }
    }

    scanForDependencyUsage(dirPath, dependencies, usedDeps, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.scanForDependencyUsage(fullPath, dependencies, usedDeps, relativeItemPath);
            } else if (item.endsWith('.js') || item.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    dependencies.forEach(dep => {
                        if (content.includes(dep)) {
                            usedDeps.add(dep);
                        }
                    });
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        }
    }

    categorizeFiles() {
        console.log('📂 Categorizing Files...');
        
        this.categorizeDirectory(this.rootPath, '');
    }

    categorizeDirectory(dirPath, relativePath) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.categorizeDirectory(fullPath, relativeItemPath);
            } else {
                this.categorizeFile(relativeItemPath, stats);
            }
        }
    }

    categorizeFile(filePath, stats) {
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath).toLowerCase();
        
        // Core files
        if (fileName === 'package.json' || fileName === 'readme.md' || fileName === 'index.html') {
            this.analysis.categories.core.push(filePath);
        }
        // Documentation
        else if (ext === '.md' || ext === '.txt' || fileName.includes('guide') || fileName.includes('readme')) {
            this.analysis.categories.documentation.push(filePath);
        }
        // Automation
        else if (fileName.includes('automation') || fileName.includes('workflow') || fileName.includes('n8n')) {
            this.analysis.categories.automation.push(filePath);
        }
        // Testing
        else if (fileName.includes('test') || fileName.includes('spec') || fileName.includes('tester')) {
            this.analysis.categories.testing.push(filePath);
        }
        // Configuration
        else if (ext === '.json' || ext === '.env' || ext === '.config' || fileName.includes('config')) {
            this.analysis.categories.config.push(filePath);
        }
        // Assets
        else if (ext === '.css' || ext === '.js' || ext === '.png' || ext === '.jpg' || ext === '.svg') {
            this.analysis.categories.assets.push(filePath);
        }
        // Temporary files
        else if (fileName.includes('temp') || fileName.includes('tmp') || fileName.includes('log')) {
            this.analysis.categories.temp.push(filePath);
        }
        // Deprecated (based on naming patterns)
        else if (fileName.includes('old') || fileName.includes('backup') || fileName.includes('deprecated')) {
            this.analysis.categories.deprecated.push(filePath);
        }
        else {
            this.analysis.categories.core.push(filePath);
        }
    }

    generateRecommendations() {
        console.log('💡 Generating Recommendations...');
        
        // Space optimization
        if (this.analysis.totalSize > 100 * 1024 * 1024) { // 100MB
            this.analysis.recommendations.push({
                type: 'space_optimization',
                priority: 'high',
                action: 'Consider compressing large files or moving to cloud storage',
                impact: 'Reduce portfolio size by ' + Math.round(this.analysis.totalSize / (1024 * 1024)) + 'MB'
            });
        }
        
        // Duplicate removal
        if (this.analysis.duplicates.length > 0) {
            this.analysis.recommendations.push({
                type: 'duplicate_removal',
                priority: 'medium',
                action: 'Remove duplicate files',
                impact: 'Save ' + this.analysis.duplicates.reduce((sum, dup) => sum + dup.size, 0) + ' bytes'
            });
        }
        
        // Structure improvement
        if (this.analysis.totalDirectories < 5) {
            this.analysis.recommendations.push({
                type: 'structure_improvement',
                priority: 'medium',
                action: 'Organize files into logical directories',
                impact: 'Improve navigation and maintainability'
            });
        }
        
        // Issue resolution
        if (this.analysis.issues.length > 0) {
            this.analysis.recommendations.push({
                type: 'issue_resolution',
                priority: 'high',
                action: 'Fix identified issues',
                impact: 'Improve portfolio reliability and functionality'
            });
        }
    }

    findFilesByExtension(ext) {
        const files = [];
        this.scanForExtension(this.rootPath, ext, files);
        return files;
    }

    scanForExtension(dirPath, ext, files, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativeItemPath = path.join(relativePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                this.scanForExtension(fullPath, ext, files, relativeItemPath);
            } else if (item.endsWith(ext)) {
                files.push(relativeItemPath);
            }
        }
    }

    generateReport() {
        const report = `# 📊 Portfolio Organization Audit Report

## 📈 Summary Statistics
- **Total Files**: ${this.analysis.totalFiles}
- **Total Directories**: ${this.analysis.totalDirectories}
- **Total Size**: ${(this.analysis.totalSize / (1024 * 1024)).toFixed(2)} MB
- **Issues Found**: ${this.analysis.issues.length}
- **Redundancies Found**: ${this.analysis.redundancies.length}
- **Duplicates Found**: ${this.analysis.duplicates.length}

## 🚨 Issues Identified
${this.analysis.issues.map(issue => 
    `- **${issue.type.toUpperCase()}**: ${issue.file} - ${issue.issue || 'See details'} (${issue.severity} priority)`
).join('\n')}

## 🔄 Redundancies Found
${this.analysis.redundancies.map(redundancy => 
    `- **${redundancy.type.toUpperCase()}**: ${redundancy.files ? redundancy.files.join(', ') : redundancy.file} - ${redundancy.recommendation}`
).join('\n')}

## 📁 File Categories
${Object.entries(this.analysis.categories).map(([category, files]) => 
    `- **${category.toUpperCase()}**: ${files.length} files`
).join('\n')}

## 💡 Recommendations
${this.analysis.recommendations.map(rec => 
    `- **${rec.type.toUpperCase()}** (${rec.priority} priority): ${rec.action} - ${rec.impact}`
).join('\n')}

## 📂 Directory Structure
${Object.entries(this.analysis.structure).map(([path, info]) => 
    `- **${path}**: ${info.type} (${info.items} items, ${(info.size / 1024).toFixed(2)} KB)`
).join('\n')}

---
*Report generated on ${new Date().toLocaleString()}*
`;

        return report;
    }
}

// Export for use
module.exports = PortfolioOrganizer;

// Run if called directly
if (require.main === module) {
    const organizer = new PortfolioOrganizer();
    organizer.analyzePortfolio()
        .then(analysis => {
            console.log('\n📊 Analysis Complete!');
            console.log(organizer.generateReport());
            
            // Save report
            const reportPath = path.join(organizer.rootPath, 'portfolio-organization-report.md');
            fs.writeFileSync(reportPath, organizer.generateReport());
            console.log(`\n📄 Report saved to: ${reportPath}`);
        })
        .catch(error => {
            console.error('❌ Analysis failed:', error);
        });
} 