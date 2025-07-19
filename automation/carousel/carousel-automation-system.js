#!/usr/bin/env node

/**
 * Carousel Automation System
 * Automated carousel content generation for social media platforms
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class CarouselAutomationSystem {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE'
    });
    
    this.outputDir = 'temp/carousel-outputs';
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateCarouselContent(topic, audience, platforms = ['pinterest']) {
    console.log('🎨 Generating carousel content...');
    
    const prompt = `Create a 5-slide carousel for ${platforms.join(', ')} about "${topic}" for ${audience}.
    
    Each slide should have:
    - Compelling title
    - Brief description (2-3 sentences)
    - Platform-specific formatting
    
    Format as JSON with this structure:
    {
      "topic": "${topic}",
      "platform": "${platforms[0]}",
      "slides": [
        {
          "slideNumber": "s0",
          "title": "Title here",
          "description": "Description here",
          "platform": "${platforms[0]}",
          "specs": {
            "slides": 5,
            "format": "2:3 (1000x1500px)",
            "textOverlay": "required",
            "keywords": ["#SEO", "#VisualContent"]
          }
        }
      ],
      "totalSlides": 5,
      "specs": {
        "slides": 5,
        "format": "2:3 (1000x1500px)",
        "textOverlay": "required",
        "keywords": ["#SEO", "#VisualContent"]
      }
    }`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = JSON.parse(completion.choices[0].message.content);
      
      // Save to file
      const filename = `${this.outputDir}/carousel-content.json`;
      fs.writeFileSync(filename, JSON.stringify(content, null, 2));
      
      console.log(`✅ Carousel content saved to: ${filename}`);
      return content;
      
    } catch (error) {
      console.error('❌ Error generating carousel content:', error.message);
      throw error;
    }
  }

  async generateSchedule(topic, platforms = ['pinterest', 'instagram', 'linkedin'], days = 30) {
    console.log('📅 Generating content schedule...');
    
    const prompt = `Create a ${days}-day content posting schedule for "${topic}" across ${platforms.join(', ')}.
    
    Include:
    - Daily posting schedule
    - Platform rotation
    - Optimal posting times
    - Content type variety
    
    Format as JSON with this structure:
    {
      "totalDays": ${days},
      "platforms": ${JSON.stringify(platforms)},
      "contentTypes": ["quote", "infographic", "exercise"],
      "schedule": [
        {
          "day": "Day 1",
          "platform": "platform_name",
          "contentType": "content_type",
          "optimalTime": "time",
          "topic": "${topic}"
        }
      ]
    }`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      });

      const schedule = JSON.parse(completion.choices[0].message.content);
      
      // Save to file
      const filename = `${this.outputDir}/30-day-schedule.json`;
      fs.writeFileSync(filename, JSON.stringify(schedule, null, 2));
      
      console.log(`✅ Schedule saved to: ${filename}`);
      return schedule;
      
    } catch (error) {
      console.error('❌ Error generating schedule:', error.message);
      throw error;
    }
  }

  async run() {
    console.log('🚀 Carousel Automation System');
    console.log('=' * 40);
    
    const topic = "inner child healing";
    const audience = "trauma survivors";
    const platforms = ["pinterest", "instagram", "linkedin"];
    
    try {
      // Generate carousel content
      const carouselContent = await this.generateCarouselContent(topic, audience, platforms);
      
      // Generate schedule
      const schedule = await this.generateSchedule(topic, platforms, 30);
      
      console.log('\n🎉 Automation complete!');
      console.log(`📊 Generated ${carouselContent.totalSlides} carousel slides`);
      console.log(`📅 Created ${schedule.totalDays}-day posting schedule`);
      
    } catch (error) {
      console.error('❌ Automation failed:', error.message);
    }
  }
}

// Run the system
if (require.main === module) {
  const system = new CarouselAutomationSystem();
  system.run();
}

module.exports = CarouselAutomationSystem; 