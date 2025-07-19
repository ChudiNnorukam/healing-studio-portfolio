// Test Real Scraper - Quick demonstration
const RealHealingStudioScraper = require('./real-healing-studio-scraper');

async function testRealScraper() {
    console.log('🧪 Testing Real Healing Studio Scraper...');
    
    const scraper = new RealHealingStudioScraper();
    
    try {
        // Initialize scraper
        console.log('🔄 Initializing scraper...');
        const initialized = await scraper.initialize();
        
        if (!initialized) {
            console.error('❌ Failed to initialize scraper');
            return;
        }
        
        console.log('✅ Scraper initialized successfully');
        
        // Test portfolio health check (this should work with your local server)
        console.log('🏥 Testing portfolio health check...');
        const health = await scraper.checkRealPortfolioHealth();
        
        if (health && health.status !== 'error') {
            console.log(`✅ Portfolio health check completed!`);
            console.log(`📊 Health Score: ${health.healthScore}/100`);
            console.log(`📈 Status: ${health.status}`);
            console.log(`⚡ Load Time: ${health.performance?.loadTime || 'N/A'}ms`);
        } else {
            console.log('⚠️ Portfolio health check failed (server might not be running)');
        }
        
        // Test content idea generation
        console.log('💡 Testing content idea generation...');
        const ideas = await scraper.generateRealContentIdeas();
        
        if (ideas && ideas.length > 0) {
            console.log(`✅ Generated ${ideas.length} content ideas!`);
            console.log('📝 Top 3 Ideas:');
            ideas.slice(0, 3).forEach((idea, index) => {
                console.log(`  ${index + 1}. ${idea.title}`);
                console.log(`     Platform: ${idea.platform} | Engagement: ${idea.estimatedEngagement}`);
            });
        } else {
            console.log('⚠️ Content idea generation failed (no competitor data available)');
        }
        
        console.log('🎉 Real scraper test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await scraper.cleanup();
        console.log('🧹 Test cleanup completed');
    }
}

// Run test
testRealScraper(); 