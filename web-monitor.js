const axios = require('axios');
const fs = require('fs');

class WebMonitor {
  constructor() {
    this.results = [];
  }

  async checkWebsite(url) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true // Don't throw on HTTP errors
      });
      
      const loadTime = Date.now() - startTime;
      
      const result = {
        url,
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        loadTime,
        contentLength: response.headers['content-length'],
        contentType: response.headers['content-type'],
        cacheControl: response.headers['cache-control'],
        etag: response.headers['etag'],
        lastModified: response.headers['last-modified'],
        success: response.status >= 200 && response.status < 300
      };
      
      this.results.push(result);
      return result;
      
    } catch (error) {
      const result = {
        url,
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false
      };
      
      this.results.push(result);
      return result;
    }
  }

  async checkResources(url, resources) {
    const results = [];
    
    for (const resource of resources) {
      const resourceUrl = new URL(resource, url).href;
      console.log(`🔍 Checking resource: ${resourceUrl}`);
      const result = await this.checkWebsite(resourceUrl);
      results.push(result);
    }
    
    return results;
  }

  async checkPerformance(url) {
    try {
      // Check load time
      const loadTimeResult = await this.checkWebsite(url);
      
      // Check if it's cached
      const isCached = loadTimeResult.cacheControl && 
                      (loadTimeResult.cacheControl.includes('max-age') || 
                       loadTimeResult.cacheControl.includes('public'));
      
      // Check content size
      const contentSize = loadTimeResult.contentLength ? 
                         parseInt(loadTimeResult.contentLength) : 0;
      
      return {
        url,
        loadTime: loadTimeResult.loadTime,
        isCached,
        contentSize,
        performance: {
          excellent: loadTimeResult.loadTime < 1000,
          good: loadTimeResult.loadTime < 2000,
          poor: loadTimeResult.loadTime >= 2000
        }
      };
    } catch (error) {
      return {
        url,
        error: error.message,
        performance: { excellent: false, good: false, poor: true }
      };
    }
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        averageLoadTime: this.results.reduce((sum, r) => sum + (r.loadTime || 0), 0) / this.results.length
      },
      details: this.results,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('web-monitor-report.json', JSON.stringify(report, null, 2));
    return report;
  }

  printReport() {
    const report = this.generateReport();
    
    console.log('\n📊 Web Monitoring Report');
    console.log('='.repeat(50));
    console.log(`Total checks: ${report.summary.total}`);
    console.log(`Successful: ${report.summary.successful}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Average load time: ${report.summary.averageLoadTime.toFixed(2)}ms`);
    
    // Check for specific issues
    const failedResources = report.details.filter(r => !r.success);
    if (failedResources.length > 0) {
      console.log('\n❌ Failed resources:');
      failedResources.forEach(r => {
        console.log(`  - ${r.url}: ${r.error || r.statusText}`);
      });
    }
    
    // Performance analysis
    const slowResources = report.details.filter(r => r.loadTime > 2000);
    if (slowResources.length > 0) {
      console.log('\n🐌 Slow resources (>2s):');
      slowResources.forEach(r => {
        console.log(`  - ${r.url}: ${r.loadTime}ms`);
      });
    }
    
    return report;
  }
}

module.exports = WebMonitor; 