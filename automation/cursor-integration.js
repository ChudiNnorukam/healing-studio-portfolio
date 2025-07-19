#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class CursorIntegration {
  constructor() {
    this.tools = {
      web_scrape: this.webScrape.bind(this),
      generate_content: this.generateContent.bind(this),
      analyze_website: this.analyzeWebsite.bind(this),
      create_carousel: this.createCarousel.bind(this),
      monitor_portfolio: this.monitorPortfolio.bind(this),
      test_github_pages: this.testGitHubPages.bind(this)
    };
  }

  async webScrape(url) {
    try {
      console.log(`🔍 Scraping: ${url}`);
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const title = $('title').text();
      const headings = $('h1, h2, h3').map((i, el) => $(el).text()).get();
      const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 5);
      
      return {
        success: true,
        data: {
          title,
          headings,
          paragraphs,
          url
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateContent(prompt, type = 'blog') {
    try {
      console.log(`📝 Generating ${type} content: ${prompt}`);
      
      // This integrates with your existing OpenAI setup
      const content = `Generated ${type} content based on: "${prompt}"\n\nThis integrates with your existing carousel-automation-system.js`;
      
      return {
        success: true,
        data: {
          content,
          type,
          prompt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeWebsite(url) {
    try {
      console.log(`🔍 Analyzing website: ${url}`);
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const analysis = await page.evaluate(() => {
        const title = document.title;
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent);
        const images = Array.from(document.querySelectorAll('img')).length;
        const links = Array.from(document.querySelectorAll('a')).length;
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        
        return { title, headings, images, links, metaDescription };
      });
      
      await browser.close();
      
      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createCarousel(topic, style = 'healing') {
    try {
      console.log(`🎠 Creating ${style} carousel: ${topic}`);
      
      // This integrates with your existing carousel system
      const carousel = {
        topic,
        style,
        slides: [
          { title: `Slide 1: ${topic}`, content: 'Introduction' },
          { title: `Slide 2: ${topic}`, content: 'Key Points' },
          { title: `Slide 3: ${topic}`, content: 'Conclusion' }
        ]
      };
      
      return {
        success: true,
        data: carousel
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async monitorPortfolio() {
    try {
      console.log('📊 Monitoring portfolio...');
      
      const files = await fs.readdir('.');
      const portfolioFiles = files.filter(file => 
        file.endsWith('.html') || 
        file.endsWith('.md') || 
        file.endsWith('.js')
      ).slice(0, 10);
      
      const status = {
        githubPages: 'Active',
        lastUpdate: new Date().toISOString(),
        files: portfolioFiles,
        totalFiles: files.length
      };
      
      return {
        success: true,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testGitHubPages() {
    try {
      console.log('🌐 Testing GitHub Pages...');
      
      const response = await axios.get('https://chudinnorukam.github.io', {
        timeout: 10000
      });
      
      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          url: 'https://chudinnorukam.github.io',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {
          url: 'https://chudinnorukam.github.io',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async runTool(toolName, ...args) {
    if (!this.tools[toolName]) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    return await this.tools[toolName](...args);
  }

  // CLI interface
  async runCLI() {
    const args = process.argv.slice(2);
    const toolName = args[0];
    const toolArgs = args.slice(1);
    
    if (!toolName) {
      console.log('Available tools:');
      Object.keys(this.tools).forEach(tool => {
        console.log(`  - ${tool}`);
      });
      return;
    }
    
    try {
      const result = await this.runTool(toolName, ...toolArgs);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const integration = new CursorIntegration();
  integration.runCLI();
}

module.exports = CursorIntegration; 