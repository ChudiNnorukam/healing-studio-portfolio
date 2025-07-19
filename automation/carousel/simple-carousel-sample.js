#!/usr/bin/env node

/**
 * Simple Carousel Sample Generator
 * Creates a single JPG sample slide for carousel preview
 */

const fs = require('fs');
const path = require('path');

class SimpleCarouselSample {
  constructor() {
    this.outputDir = 'carousel-samples';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateSampleSlide(carouselData, platform = 'instagram', slideIndex = 0) {
    console.log(`🎨 Generating ${platform} sample slide...`);
    
    // Handle nested carousel structure
    const actualCarouselData = carouselData.carousel || carouselData;
    const platformData = actualCarouselData.content[platform];
    if (!platformData || !platformData.slides || platformData.slides.length === 0) {
      throw new Error(`No slides found for platform: ${platform}`);
    }

    const slide = platformData.slides[slideIndex] || platformData.slides[0];
    
    // Create a simple HTML that can be converted to JPG
    const html = this.createSampleSlideHTML(slide, platform);
    const filename = `sample-${platform}-slide-${Date.now()}.html`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, html);
    
    console.log(`📄 Sample slide HTML created: ${filepath}`);
    console.log(`📸 To convert to JPG, open this file in a browser and take a screenshot`);
    
    return {
      html: filepath,
      slide: slide,
      platform: platform,
      instructions: 'Open the HTML file in a browser and take a screenshot to get your JPG sample'
    };
  }

  createSampleSlideHTML(slide, platform) {
    const platformStyles = {
      instagram: {
        width: '1080px',
        height: '1080px',
        backgroundColor: '#fafafa'
      },
      linkedin: {
        width: '1200px',
        height: '628px',
        backgroundColor: '#ffffff'
      },
      pinterest: {
        width: '1000px',
        height: '1500px',
        backgroundColor: '#ffffff'
      }
    };

    const style = platformStyles[platform] || platformStyles.instagram;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${platform.toUpperCase()} Carousel Sample</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .slide-container {
            width: ${style.width};
            height: ${style.height};
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .slide-content {
            color: white;
            max-width: 80%;
            z-index: 2;
        }
        
        .slide-title {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 30px;
            line-height: 1.2;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .slide-text {
            font-size: 1.5rem;
            margin-bottom: 40px;
            line-height: 1.4;
            opacity: 0.95;
        }
        
        .slide-visual {
            background: rgba(255,255,255,0.2);
            border: 2px dashed rgba(255,255,255,0.6);
            border-radius: 15px;
            padding: 30px 20px;
            margin: 30px 0;
            font-size: 1.1rem;
            color: rgba(255,255,255,0.9);
            font-style: italic;
        }
        
        .slide-engagement {
            background: rgba(255,255,255,0.25);
            border-radius: 30px;
            padding: 20px 30px;
            margin-top: 30px;
            font-size: 1.2rem;
            font-weight: 500;
        }
        
        .platform-badge {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        .slide-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 1rem;
            font-weight: bold;
        }
        
        .background-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
            z-index: 1;
        }
        
        .instructions {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-size: 0.9rem;
            max-width: 250px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="instructions">
        📸 <strong>Instructions:</strong><br>
        1. Right-click on the slide<br>
        2. Select "Take Screenshot" or "Save Image"<br>
        3. Save as JPG for social media
    </div>
    
    <div class="slide-container">
        <div class="background-pattern"></div>
        <div class="platform-badge">📱 ${platform.toUpperCase()}</div>
        <div class="slide-number">Sample Slide</div>
        
        <div class="slide-content">
            <h1 class="slide-title">${slide.title}</h1>
            <p class="slide-text">${slide.text}</p>
            <div class="slide-visual">${slide.visual}</div>
            <div class="slide-engagement">${slide.engagement}</div>
        </div>
    </div>
</body>
</html>`;
  }

  generateAllPlatformSamples(carouselData) {
    // Handle nested carousel structure
    const actualCarouselData = carouselData.carousel || carouselData;
    const platforms = Object.keys(actualCarouselData.content);
    const results = [];
    
    for (const platform of platforms) {
      try {
        const sample = this.generateSampleSlide(carouselData, platform, 0);
        results.push(sample);
      } catch (error) {
        console.error(`❌ Failed to generate ${platform} sample:`, error.message);
      }
    }
    
    return results;
  }
}

// Export for use in other scripts
module.exports = SimpleCarouselSample;

// Run if called directly
if (require.main === module) {
  const generator = new SimpleCarouselSample();
  const args = process.argv.slice(2);

  if (args[0] === 'sample' && args[1]) {
    const carouselFile = args[1];
    const platform = args[2] || 'all';
    const slideIndex = parseInt(args[3]) || 0;
    
    if (fs.existsSync(carouselFile)) {
      const carouselData = JSON.parse(fs.readFileSync(carouselFile, 'utf8'));
      
      if (platform === 'all') {
        const samples = generator.generateAllPlatformSamples(carouselData);
        console.log(`✅ Generated ${samples.length} sample slides`);
        samples.forEach(sample => {
          console.log(`  - ${sample.platform}: ${sample.html}`);
        });
      } else {
        const sample = generator.generateSampleSlide(carouselData, platform, slideIndex);
        console.log(`✅ ${platform} sample slide generated`);
        console.log(`📄 HTML: ${sample.html}`);
        console.log(`📋 Instructions: ${sample.instructions}`);
      }
    } else {
      console.log('❌ Carousel file not found:', carouselFile);
    }
  } else {
    console.log('Simple Carousel Sample Generator');
    console.log('================================');
    console.log('Usage:');
    console.log('  node simple-carousel-sample.js sample <carousel-file> [platform] [slide-index]');
    console.log('  Examples:');
    console.log('    node simple-carousel-sample.js sample carousel-mock-123.json instagram');
    console.log('    node simple-carousel-sample.js sample carousel-mock-123.json all');
    console.log('    node simple-carousel-sample.js sample carousel-mock-123.json linkedin 2');
  }
} 