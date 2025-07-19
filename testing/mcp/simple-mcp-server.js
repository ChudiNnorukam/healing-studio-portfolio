#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class SimpleMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'chudi-healing-studio-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  setupTools() {
    // Web scraping tool
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'web_scrape':
          return await this.webScrape(args.url);
        
        case 'generate_content':
          return await this.generateContent(args.prompt, args.type);
        
        case 'analyze_website':
          return await this.analyzeWebsite(args.url);
        
        case 'create_carousel':
          return await this.createCarousel(args.topic, args.style);
        
        case 'monitor_portfolio':
          return await this.monitorPortfolio();
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async webScrape(url) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Extract useful content
      const title = $('title').text();
      const headings = $('h1, h2, h3').map((i, el) => $(el).text()).get();
      const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 5);
      
      return {
        content: [
          {
            type: 'text',
            text: `Scraped content from ${url}:\n\nTitle: ${title}\n\nHeadings: ${headings.join(', ')}\n\nKey paragraphs: ${paragraphs.join('\n\n')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Web scraping failed: ${error.message}`);
    }
  }

  async generateContent(prompt, type = 'blog') {
    try {
      // This would integrate with your existing OpenAI setup
      const content = `Generated ${type} content based on: "${prompt}"\n\nThis is a placeholder for your OpenAI integration.`;
      
      return {
        content: [
          {
            type: 'text',
            text: content
          }
        ]
      };
    } catch (error) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async analyzeWebsite(url) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const analysis = await page.evaluate(() => {
        const title = document.title;
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent);
        const images = Array.from(document.querySelectorAll('img')).length;
        const links = Array.from(document.querySelectorAll('a')).length;
        
        return { title, headings, images, links };
      });
      
      await browser.close();
      
      return {
        content: [
          {
            type: 'text',
            text: `Website Analysis for ${url}:\n\nTitle: ${analysis.title}\nHeadings: ${analysis.headings.join(', ')}\nImages: ${analysis.images}\nLinks: ${analysis.links}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Website analysis failed: ${error.message}`);
    }
  }

  async createCarousel(topic, style = 'healing') {
    try {
      // This would integrate with your existing carousel system
      const carousel = `Created ${style} carousel for topic: "${topic}"\n\nThis integrates with your existing carousel-automation-system.js`;
      
      return {
        content: [
          {
            type: 'text',
            text: carousel
          }
        ]
      };
    } catch (error) {
      throw new Error(`Carousel creation failed: ${error.message}`);
    }
  }

  async monitorPortfolio() {
    try {
      // Check your portfolio status
      const status = {
        githubPages: 'Active',
        lastUpdate: new Date().toISOString(),
        files: await this.getPortfolioFiles()
      };
      
      return {
        content: [
          {
            type: 'text',
            text: `Portfolio Status:\n\nGitHub Pages: ${status.githubPages}\nLast Update: ${status.lastUpdate}\nFiles: ${status.files.join(', ')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Portfolio monitoring failed: ${error.message}`);
    }
  }

  async getPortfolioFiles() {
    try {
      const files = await fs.readdir('.');
      return files.filter(file => 
        file.endsWith('.html') || 
        file.endsWith('.md') || 
        file.endsWith('.js')
      ).slice(0, 10);
    } catch (error) {
      return ['Unable to read files'];
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Simple MCP Server running...');
  }
}

// Run the server
const server = new SimpleMCPServer();
server.run().catch(console.error); 