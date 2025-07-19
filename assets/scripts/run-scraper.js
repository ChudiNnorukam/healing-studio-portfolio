#!/usr/bin/env node

// Simple script to run the real scraper
const RealHealingStudioScraper = require('./real-healing-studio-scraper');

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
    const scraper = new RealHealingStudioScraper();
    
    try {
        console.log('🕊️ Healing Studio Real Scraper');
        console.log('================================');
        
        await scraper.initialize();
        
        switch (command) {
            case 'health':
                console.log('🏥 Checking portfolio health...');
                const health = await scraper.checkRealPortfolioHealth();
                if (health && health.status !== 'error') {
                    console.log(`✅ Health Score: ${health.healthScore}/100`);
                    console.log(`📈 Status: ${health.status}`);
                    console.log(`⚡ Load Time: ${health.performance?.loadTime || 'N/A'}ms`);
                } else {
                    console.log('❌ Health check failed');
                }
                break;
                
            case 'ideas':
                console.log('💡 Generating content ideas...');
                const ideas = await scraper.generateRealContentIdeas();
                if (ideas && ideas.length > 0) {
                    console.log(`✅ Generated ${ideas.length} ideas:`);
                    ideas.slice(0, 5).forEach((idea, index) => {
                        console.log(`\n${index + 1}. ${idea.title}`);
                        console.log(`   Platform: ${idea.platform}`);
                        console.log(`   Engagement: ${idea.estimatedEngagement}`);
                        console.log(`   Hashtags: ${idea.hashtags.join(' ')}`);
                    });
                } else {
                    console.log('❌ No ideas generated');
                }
                break;
                
            case 'competitors':
                console.log('🔍 Researching competitors...');
                const competitors = await scraper.researchCompetitors();
                if (competitors) {
                    console.log(`✅ Found ${competitors.totalPosts || 0} competitor posts`);
                    console.log(`📊 Platforms: ${Object.keys(competitors.platforms || {}).join(', ')}`);
                    console.log(`🔥 Top trends: ${(competitors.trendingTopics || []).slice(0, 5).map(t => t.word).join(', ')}`);
                } else {
                    console.log('❌ Competitor research failed');
                }
                break;
                
            case 'trends':
                console.log('📈 Researching trends...');
                const trends = await scraper.researchRealTrends();
                if (trends) {
                    console.log('✅ Trends data collected:');
                    Object.entries(trends).forEach(([keyword, data]) => {
                        console.log(`\n${keyword}:`);
                        console.log(`  Interest: ${data.interest}`);
                        console.log(`  Related: ${data.related.join(', ')}`);
                    });
                } else {
                    console.log('❌ Trends research failed');
                }
                break;
                
            case 'report':
                console.log('📊 Generating comprehensive report...');
                const report = await scraper.generateRealReport();
                if (report) {
                    console.log('✅ Report generated successfully!');
                    console.log(`📅 Generated: ${new Date(report.timestamp).toLocaleDateString()}`);
                    console.log(`🔍 Competitors: ${report.competitors?.totalPosts || 0}`);
                    console.log(`📈 Trends: ${Object.keys(report.trends || {}).length}`);
                    console.log(`💡 Ideas: ${report.contentIdeas?.length || 0}`);
                    console.log(`🏥 Health Score: ${report.portfolioHealth?.healthScore || 0}/100`);
                    console.log(`💡 Recommendations: ${report.recommendations?.length || 0}`);
                } else {
                    console.log('❌ Report generation failed');
                }
                break;
                
            case 'test':
                console.log('🧪 Running full test...');
                const testHealth = await scraper.checkRealPortfolioHealth();
                const testIdeas = await scraper.generateRealContentIdeas();
                
                console.log('✅ Test Results:');
                if (testHealth && testHealth.status !== 'error') {
                    console.log(`  Portfolio Health: ${testHealth.healthScore}/100`);
                }
                if (testIdeas && testIdeas.length > 0) {
                    console.log(`  Content Ideas: ${testIdeas.length} generated`);
                }
                break;
                
            case 'help':
            default:
                console.log('Usage: node run-scraper.js [command]');
                console.log('\nCommands:');
                console.log('  health     - Check portfolio health');
                console.log('  ideas      - Generate content ideas');
                console.log('  competitors - Research competitors');
                console.log('  trends     - Research trends');
                console.log('  report     - Generate comprehensive report');
                console.log('  test       - Run quick test');
                console.log('  help       - Show this help');
                break;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await scraper.cleanup();
    }
}

main(); 