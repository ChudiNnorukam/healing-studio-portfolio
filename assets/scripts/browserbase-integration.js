// Browserbase Integration for Healing Studio Portfolio
// Simple integration script for easy usage

const HealingStudioBrowserbaseMCP = require('./healing-studio-browserbase-mcp');

class PortfolioBrowserbaseIntegration {
    constructor() {
        this.mcp = new HealingStudioBrowserbaseMCP();
        this.isInitialized = false;
    }

    async init() {
        console.log('🕊️ Initializing Browserbase integration...');
        this.isInitialized = await this.mcp.initialize();
        
        if (this.isInitialized) {
            console.log('✅ Browserbase integration ready!');
        } else {
            console.log('❌ Failed to initialize Browserbase');
        }
        
        return this.isInitialized;
    }

    // Quick content ideation
    async getContentIdeas() {
        if (!this.isInitialized) {
            console.log('⚠️ Please initialize first with .init()');
            return [];
        }

        console.log('💡 Generating content ideas...');
        const ideas = await this.mcp.generateContentIdeas();
        
        console.log('📝 Top Content Ideas:');
        ideas.slice(0, 5).forEach((idea, index) => {
            console.log(`${index + 1}. ${idea.title}`);
            console.log(`   Platform: ${idea.platform} | Engagement: ${idea.estimatedEngagement}`);
            console.log(`   Hashtags: ${idea.hashtags.join(' ')}`);
            console.log('');
        });

        return ideas;
    }

    // Quick competitor research
    async researchCompetitors() {
        if (!this.isInitialized) {
            console.log('⚠️ Please initialize first with .init()');
            return null;
        }

        console.log('🔍 Researching competitors...');
        const analysis = await this.mcp.researchCompetitors();
        
        if (analysis) {
            console.log('📊 Competitor Analysis Results:');
            console.log(`Top performing content: ${analysis.topPerformingContent.length} items found`);
            console.log(`Trending topics: ${analysis.trendingTopics.slice(0, 5).map(t => t.word).join(', ')}`);
        }

        return analysis;
    }

    // Portfolio health check
    async checkPortfolioHealth() {
        if (!this.isInitialized) {
            console.log('⚠️ Please initialize first with .init()');
            return null;
        }

        console.log('🏥 Checking portfolio health...');
        const health = await this.mcp.monitorPortfolioHealth();
        
        console.log(`📈 Portfolio Status: ${health.status}`);
        if (health.errors && health.errors.length > 0) {
            console.log(`⚠️ Found ${health.errors.length} performance issues`);
        }
        if (health.brokenLinks && health.brokenLinks.length > 0) {
            console.log(`🔗 Found ${health.brokenLinks.length} broken links`);
        }

        return health;
    }

    // Generate comprehensive report
    async generateReport() {
        if (!this.isInitialized) {
            console.log('⚠️ Please initialize first with .init()');
            return null;
        }

        console.log('📊 Generating comprehensive report...');
        const report = await this.mcp.generateWeeklyReport();
        
        console.log('📋 Weekly Report Summary:');
        console.log(`📅 Generated: ${new Date(report.timestamp).toLocaleDateString()}`);
        console.log(`💡 Content Ideas: ${report.contentIdeas.length}`);
        console.log(`🏥 Portfolio Health: ${report.portfolioHealth.status}`);
        console.log(`💡 Recommendations: ${report.recommendations.length}`);

        return report;
    }

    // Quick social media automation
    async automateSocialPosting(content) {
        if (!this.isInitialized) {
            console.log('⚠️ Please initialize first with .init()');
            return [];
        }

        console.log('📱 Automating social media posting...');
        const results = await this.mcp.automateSocialPosting(content);
        
        console.log('✅ Posting Results:');
        results.forEach(result => {
            console.log(`${result.platform}: ${result.status} (Est. reach: ${result.estimatedReach})`);
        });

        return results;
    }

    // Cleanup
    async cleanup() {
        if (this.isInitialized) {
            await this.mcp.cleanup();
            this.isInitialized = false;
            console.log('🧹 Browserbase integration cleaned up');
        }
    }
}

// Export for use
module.exports = PortfolioBrowserbaseIntegration;

// Example usage
async function example() {
    const integration = new PortfolioBrowserbaseIntegration();
    
    try {
        // Initialize
        await integration.init();
        
        // Get content ideas
        await integration.getContentIdeas();
        
        // Check portfolio health
        await integration.checkPortfolioHealth();
        
        // Generate report
        await integration.generateReport();
        
    } catch (error) {
        console.error('❌ Example failed:', error);
    } finally {
        await integration.cleanup();
    }
}

// Run example if called directly
if (require.main === module) {
    example();
} 