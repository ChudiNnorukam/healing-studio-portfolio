const puppeteer = require('puppeteer');

class WebTestingAgent {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Capture console logs
    this.page.on('console', msg => {
      console.log('📝 Console:', msg.text());
    });
    
    // Capture errors
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    // Capture network errors
    this.page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Network Error: ${response.url()} - ${response.status()}`);
      }
    });
  }

  async testWebsite(url) {
    try {
      console.log(`🔍 Testing website: ${url}`);
      
      // Navigate to website
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Capture screenshot
      await this.page.screenshot({ path: 'website-screenshot.png', fullPage: true });
      console.log('📸 Screenshot captured: website-screenshot.png');
      
      // Capture console logs
      const consoleLogs = await this.page.evaluate(() => {
        return window.console.logs || [];
      });
      
      // Check for errors
      const errors = await this.page.evaluate(() => {
        return window.errors || [];
      });
      
      // Test responsive design
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 1024, height: 768 },
        { name: 'desktop', width: 1920, height: 1080 }
      ];
      
      const screenshots = [];
      
      for (const viewport of viewports) {
        await this.page.setViewport(viewport);
        const filename = `${viewport.name}-screenshot.png`;
        await this.page.screenshot({ path: filename, fullPage: true });
        screenshots.push(filename);
        console.log(`📸 ${viewport.name} screenshot captured: ${filename}`);
      }
      
      // Check for specific elements
      const elementChecks = await this.page.evaluate(() => {
        const checks = {};
        
        // Check for profile photo
        const profilePhoto = document.querySelector('.profile-photo');
        checks.profilePhoto = {
          exists: !!profilePhoto,
          visible: profilePhoto ? profilePhoto.offsetParent !== null : false,
          hasBackground: profilePhoto ? window.getComputedStyle(profilePhoto).backgroundImage !== 'none' : false
        };
        
        // Check for security headers
        checks.securityHeaders = {
          hasCSP: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
          hasXFrameOptions: !!document.querySelector('meta[http-equiv="X-Frame-Options"]'),
          hasXContentTypeOptions: !!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')
        };
        
        // Check for Google Analytics
        checks.googleAnalytics = {
          hasScript: !!document.querySelector('script[src*="googletagmanager"]'),
          hasConfig: !!document.querySelector('script').textContent.includes('G-65WBXV2MJV')
        };
        
        return checks;
      });
      
      return {
        success: true,
        url,
        screenshots: ['website-screenshot.png', ...screenshots],
        consoleLogs,
        errors,
        elementChecks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testUserInteractions(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      
      const interactions = [];
      
      // Test hover effects
      const hoverElements = await this.page.$$('.profile-photo, .nav a, button, .section-title');
      for (let i = 0; i < Math.min(hoverElements.length, 3); i++) {
        await hoverElements[i].hover();
        await this.page.waitForTimeout(500);
        interactions.push(`Hovered over element ${i + 1}`);
      }
      
      // Test clicks
      const clickElements = await this.page.$$('.nav a, button');
      for (let i = 0; i < Math.min(clickElements.length, 2); i++) {
        try {
          await clickElements[i].click();
          await this.page.waitForTimeout(1000);
          interactions.push(`Clicked element ${i + 1}`);
        } catch (e) {
          interactions.push(`Click failed on element ${i + 1}: ${e.message}`);
        }
      }
      
      return {
        success: true,
        interactions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = WebTestingAgent; 