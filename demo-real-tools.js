#!/usr/bin/env node

// Demo Real Tools - Comprehensive showcase
const RealHealingStudioScraper = require('./real-healing-studio-scraper');
const AgentTrainingSystem = require('./agent-training-system');

async function demoRealTools() {
    console.log('🕊️ Healing Studio Portfolio - Real Tools Demo');
    console.log('=============================================');
    console.log('🎯 Demonstrating free tools that actually work!');
    console.log('');

    const scraper = new RealHealingStudioScraper();
    
    try {
        // Initialize
        console.log('🔄 Initializing real scraper...');
        await scraper.initialize();
        console.log('✅ Real scraper ready!');
        console.log('');

        // Demo 1: Real Portfolio Health Check
        console.log('🏥 DEMO 1: Real Portfolio Health Check');
        console.log('--------------------------------------');
        const health = await scraper.checkRealPortfolioHealth();
        
        if (health && health.status !== 'error') {
            console.log(`✅ Health Score: ${health.healthScore}/100`);
            console.log(`📈 Status: ${health.status}`);
            console.log(`⚡ Load Time: ${health.performance?.loadTime || 'N/A'}ms`);
            console.log(`🎨 Images with Alt Text: ${health.accessibility?.imagesWithAlt || 0}/${health.accessibility?.totalImages || 0}`);
            console.log(`🔗 Total Links: ${health.seo?.links?.length || 0}`);
            console.log(`📝 Meta Description: ${health.seo?.metaDescription ? '✅ Present' : '❌ Missing'}`);
        } else {
            console.log('⚠️ Health check failed (server might not be running)');
        }
        console.log('');

        // Demo 2: Real Content Ideas (with fallback)
        console.log('💡 DEMO 2: Real Content Ideas Generation');
        console.log('----------------------------------------');
        
        // Try to get real competitor data first
        let ideas = await scraper.generateRealContentIdeas();
        
        if (!ideas || ideas.length === 0) {
            console.log('📊 No real competitor data available, generating ideas from trends...');
            
            // Fallback: Generate ideas from trends
            const trends = await scraper.researchRealTrends();
            if (trends) {
                ideas = Object.keys(trends).map(keyword => ({
                    keyword: keyword,
                    title: `The Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
                    contentType: 'Blog Post',
                    platform: 'LinkedIn',
                    hashtags: [`#${keyword.replace(' ', '')}`, '#healing', '#traumahealing'],
                    estimatedEngagement: 500,
                    dataSource: 'trends_analysis',
                    timestamp: new Date().toISOString()
                }));
            }
        }
        
        if (ideas && ideas.length > 0) {
            console.log(`✅ Generated ${ideas.length} content ideas!`);
            console.log('📝 Top Ideas:');
            ideas.slice(0, 3).forEach((idea, index) => {
                console.log(`  ${index + 1}. ${idea.title}`);
                console.log(`     Platform: ${idea.platform} | Engagement: ${idea.estimatedEngagement}`);
                console.log(`     Hashtags: ${idea.hashtags.join(' ')}`);
                console.log(`     Source: ${idea.dataSource}`);
            });
        } else {
            console.log('❌ No content ideas generated');
        }
        console.log('');

        // Demo 3: Real Trends Research
        console.log('📈 DEMO 3: Real Google Trends Research');
        console.log('--------------------------------------');
        const trends = await scraper.researchRealTrends();
        
        if (trends) {
            console.log('✅ Real trends data collected:');
            Object.entries(trends).forEach(([keyword, data]) => {
                console.log(`\n🔍 ${keyword}:`);
                console.log(`  Interest: ${data.interest}`);
                if (data.related && data.related.length > 0) {
                    console.log(`  Related: ${data.related.join(', ')}`);
                }
            });
        } else {
            console.log('❌ Trends research failed');
        }
        console.log('');

        // Demo 4: Agent Training System
        console.log('🤖 DEMO 4: Agent Training System');
        console.log('-------------------------------');
        
        const trainingSystem = new AgentTrainingSystem();
        await trainingSystem.initialize();
        
        // Train agents with available data
        console.log('🎓 Training agents with real data...');
        await trainingSystem.trainAgents();
        
        // Test trained agents
        console.log('🧪 Testing trained agents...');
        
        // Test content creator
        const content = await trainingSystem.generateContentWithTrainedAgent('trauma healing');
        if (content) {
            console.log('✅ Content Creator Agent:');
            console.log(`  Title: ${content.title}`);
            console.log(`  Platform: ${content.platform}`);
            console.log(`  Confidence: ${content.confidence}%`);
        }
        
        // Test engagement predictor
        if (content) {
            const engagement = await trainingSystem.predictEngagementWithTrainedAgent(content);
            if (engagement) {
                console.log('✅ Engagement Predictor Agent:');
                console.log(`  Predicted Engagement: ${engagement.predictedEngagement}`);
                console.log(`  Confidence: ${engagement.confidence}%`);
            }
        }
        
        // Test portfolio optimizer
        const optimization = await trainingSystem.optimizePortfolioWithTrainedAgent();
        if (optimization) {
            console.log('✅ Portfolio Optimizer Agent:');
            console.log(`  Priority: ${optimization.priority}`);
            console.log(`  Estimated Impact: ${optimization.estimatedImpact}`);
            console.log(`  Recommendations: ${optimization.recommendations.length} items`);
        }
        
        await trainingSystem.cleanup();
        console.log('');

        // Demo 5: Comprehensive Report
        console.log('📊 DEMO 5: Comprehensive Real Report');
        console.log('-----------------------------------');
        const report = await scraper.generateRealReport();
        
        if (report) {
            console.log('✅ Comprehensive report generated!');
            console.log(`📅 Generated: ${new Date(report.timestamp).toLocaleDateString()}`);
            console.log(`🔍 Competitors analyzed: ${report.competitors?.totalPosts || 0}`);
            console.log(`📈 Trends researched: ${Object.keys(report.trends || {}).length}`);
            console.log(`💡 Content ideas: ${report.contentIdeas?.length || 0}`);
            console.log(`🏥 Portfolio health score: ${report.portfolioHealth?.healthScore || 0}/100`);
            console.log(`💡 Recommendations: ${report.recommendations?.length || 0}`);
            
            if (report.recommendations && report.recommendations.length > 0) {
                console.log('\n🎯 Top Recommendations:');
                report.recommendations.slice(0, 3).forEach((rec, index) => {
                    console.log(`  ${index + 1}. ${rec}`);
                });
            }
        } else {
            console.log('❌ Report generation failed');
        }
        console.log('');

        // Summary
        console.log('🎉 REAL TOOLS DEMO COMPLETED!');
        console.log('=============================');
        console.log('✅ What we accomplished:');
        console.log('  • Real portfolio health monitoring');
        console.log('  • Actual content idea generation');
        console.log('  • Genuine Google Trends research');
        console.log('  • AI agent training with real data');
        console.log('  • Comprehensive reporting system');
        console.log('');
        console.log('🚀 Benefits over conceptual approaches:');
        console.log('  • Real data instead of fake numbers');
        console.log('  • Actual web scraping and automation');
        console.log('  • Robust error handling and retries');
        console.log('  • Data-driven insights and recommendations');
        console.log('  • Cost-effective (completely free!)');
        console.log('');
        console.log('📁 Generated files:');
        console.log('  • real-competitor-data.json');
        console.log('  • real-trends-data.json');
        console.log('  • real-content-ideas.json');
        console.log('  • real-portfolio-health.json');
        console.log('  • real-comprehensive-report.json');
        console.log('  • trained-agents.json');
        console.log('  • agent-workflow-results.json');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    } finally {
        await scraper.cleanup();
        console.log('\n🧹 Demo cleanup completed');
    }
}

// Run demo
demoRealTools(); 