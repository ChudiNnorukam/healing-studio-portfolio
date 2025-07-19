const WebTestingAgent = require('./web-testing-agent');
const WebMonitor = require('./web-monitor');

async function testGitHubPages() {
  console.log('🚀 Starting GitHub Pages Testing Suite');
  console.log('='.repeat(60));
  
  const url = 'https://chudinnorukam.github.io/healing-studio-portfolio/';
  const resources = [
    'assets/images/profile-photo.jpg',
    'assets/scripts/dashboard.js',
    'assets/css/main.css',
    'healing-studio-dashboard.html',
    'index.html'
  ];
  
  // Initialize agents
  const webAgent = new WebTestingAgent();
  const monitor = new WebMonitor();
  
  try {
    // Step 1: Initialize browser automation
    console.log('\n🔧 Initializing browser automation...');
    await webAgent.initialize();
    
    // Step 2: Test website with browser automation
    console.log('\n🌐 Testing website with browser automation...');
    const webTestResult = await webAgent.testWebsite(url);
    
    if (webTestResult.success) {
      console.log('✅ Website loaded successfully in browser');
      console.log(`📸 Screenshots captured: ${webTestResult.screenshots.length} files`);
      
      // Analyze element checks
      if (webTestResult.elementChecks) {
        console.log('\n🔍 Element Analysis:');
        
        // Profile photo check
        if (webTestResult.elementChecks.profilePhoto) {
          const photo = webTestResult.elementChecks.profilePhoto;
          console.log(`  Profile Photo: ${photo.exists ? '✅ Exists' : '❌ Missing'}`);
          console.log(`    Visible: ${photo.visible ? '✅' : '❌'}`);
          console.log(`    Has Background: ${photo.hasBackground ? '✅' : '❌'}`);
        }
        
        // Security headers check
        if (webTestResult.elementChecks.securityHeaders) {
          const headers = webTestResult.elementChecks.securityHeaders;
          console.log(`  Security Headers:`);
          console.log(`    CSP: ${headers.hasCSP ? '✅' : '❌'}`);
          console.log(`    X-Frame-Options: ${headers.hasXFrameOptions ? '✅' : '❌'}`);
          console.log(`    X-Content-Type-Options: ${headers.hasXContentTypeOptions ? '✅' : '❌'}`);
        }
        
        // Google Analytics check
        if (webTestResult.elementChecks.googleAnalytics) {
          const ga = webTestResult.elementChecks.googleAnalytics;
          console.log(`  Google Analytics:`);
          console.log(`    Script: ${ga.hasScript ? '✅' : '❌'}`);
          console.log(`    Config: ${ga.hasConfig ? '✅' : '❌'}`);
        }
      }
    } else {
      console.log('❌ Website test failed:', webTestResult.error);
    }
    
    // Step 3: Test user interactions
    console.log('\n👆 Testing user interactions...');
    const interactionResult = await webAgent.testUserInteractions(url);
    
    if (interactionResult.success) {
      console.log('✅ User interactions tested successfully');
      console.log(`  Interactions: ${interactionResult.interactions.length}`);
    } else {
      console.log('❌ User interaction test failed:', interactionResult.error);
    }
    
    // Step 4: Monitor website health
    console.log('\n📊 Monitoring website health...');
    await monitor.checkWebsite(url);
    await monitor.checkResources(url, resources);
    
    // Step 5: Performance analysis
    console.log('\n⚡ Performance analysis...');
    const performanceResult = await monitor.checkPerformance(url);
    
    if (performanceResult.performance) {
      console.log(`  Load Time: ${performanceResult.loadTime}ms`);
      console.log(`  Cached: ${performanceResult.isCached ? '✅' : '❌'}`);
      console.log(`  Content Size: ${performanceResult.contentSize} bytes`);
      console.log(`  Performance: ${performanceResult.performance.excellent ? '🚀 Excellent' : performanceResult.performance.good ? '✅ Good' : '🐌 Poor'}`);
    }
    
    // Step 6: Generate comprehensive report
    console.log('\n📋 Generating comprehensive report...');
    const monitorReport = monitor.printReport();
    
    // Step 7: Overall assessment
    console.log('\n🎯 Overall Assessment');
    console.log('='.repeat(40));
    
    const issues = [];
    const successes = [];
    
    // Check for critical issues
    if (!webTestResult.success) {
      issues.push('Website failed to load in browser');
    } else {
      successes.push('Website loads successfully');
    }
    
    if (webTestResult.elementChecks) {
      if (!webTestResult.elementChecks.profilePhoto.exists) {
        issues.push('Profile photo element missing');
      } else {
        successes.push('Profile photo element found');
      }
      
      if (!webTestResult.elementChecks.securityHeaders.hasCSP) {
        issues.push('Security headers missing');
      } else {
        successes.push('Security headers present');
      }
      
      if (!webTestResult.elementChecks.googleAnalytics.hasConfig) {
        issues.push('Google Analytics not properly configured');
      } else {
        successes.push('Google Analytics properly configured');
      }
    }
    
    if (monitorReport.summary.failed > 0) {
      issues.push(`${monitorReport.summary.failed} resources failed to load`);
    } else {
      successes.push('All resources load successfully');
    }
    
    if (performanceResult.performance && performanceResult.performance.poor) {
      issues.push('Website performance is poor');
    } else {
      successes.push('Website performance is acceptable');
    }
    
    // Print summary
    console.log('\n✅ Successes:');
    successes.forEach(success => console.log(`  - ${success}`));
    
    if (issues.length > 0) {
      console.log('\n❌ Issues Found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      
      console.log('\n🔧 Recommended Actions:');
      if (issues.some(i => i.includes('Profile photo'))) {
        console.log('  - Check profile photo file path and permissions');
      }
      if (issues.some(i => i.includes('Security headers'))) {
        console.log('  - Verify GitHub Pages is serving the latest version');
      }
      if (issues.some(i => i.includes('Google Analytics'))) {
        console.log('  - Check Google Analytics configuration in HTML');
      }
      if (issues.some(i => i.includes('resources failed'))) {
        console.log('  - Check file paths and GitHub Pages deployment');
      }
    } else {
      console.log('\n🎉 All tests passed! Website is working correctly.');
    }
    
    return {
      webTest: webTestResult,
      interactions: interactionResult,
      monitoring: monitorReport,
      performance: performanceResult,
      issues,
      successes,
      overall: issues.length === 0
    };
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return {
      error: error.message,
      overall: false
    };
  } finally {
    await webAgent.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGitHubPages().then(result => {
    console.log('\n🏁 Testing complete!');
    process.exit(result.overall ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = testGitHubPages; 