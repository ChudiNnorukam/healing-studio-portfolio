#!/usr/bin/env node

/**
 * Carousel Preview Generator
 * Creates visual mockups of generated carousels for live demo
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

class CarouselPreviewGenerator {
  constructor() {
    this.outputDir = 'carousel-previews';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generatePreview(carouselData, platform = 'instagram') {
    console.log(`🎨 Generating ${platform} carousel preview...`);
    
    const html = this.createCarouselHTML(carouselData, platform);
    const filename = `carousel-${platform}-${Date.now()}.html`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, html);
    
    // Try to take screenshot, but don't fail if it doesn't work
    let screenshotPath = null;
    try {
      screenshotPath = await this.takeScreenshot(filepath, platform);
    } catch (error) {
      console.log('⚠️ Screenshot failed, using HTML-only preview');
      screenshotPath = filepath.replace('.html', '-preview.html');
      // Create a simple HTML preview without screenshot
      fs.writeFileSync(screenshotPath, `
<!DOCTYPE html>
<html>
<head>
    <title>${platform.toUpperCase()} Carousel Preview</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .preview { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .slide { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .title { font-weight: bold; color: #333; }
        .text { color: #666; margin: 5px 0; }
        .visual { background: #f9f9f9; padding: 10px; border-radius: 3px; font-style: italic; }
        .engagement { color: #007bff; font-weight: 500; }
    </style>
</head>
<body>
    <h1>${platform.toUpperCase()} Carousel Preview</h1>
    <div class="preview">
        ${(carouselData.content[platform]?.slides || []).map((slide, index) => `
            <div class="slide">
                <div class="title">${slide.title}</div>
                <div class="text">${slide.text}</div>
                <div class="visual">${slide.visual}</div>
                <div class="engagement">${slide.engagement}</div>
            </div>
        `).join('')}
    </div>
    <p><a href="${path.basename(filepath)}" target="_blank">View Interactive Preview</a></p>
</body>
</html>`);
    }
    
    return {
      html: filepath,
      screenshot: screenshotPath,
      platform: platform,
      slides: carouselData.content[platform]?.slides || []
    };
  }

  createCarouselHTML(carouselData, platform) {
    const platformData = carouselData.content[platform];
    const slides = platformData?.slides || [];
    
    const platformStyles = {
      instagram: {
        width: '1080px',
        height: '1080px',
        backgroundColor: '#fafafa',
        fontFamily: 'Arial, sans-serif'
      },
      linkedin: {
        width: '1200px',
        height: '628px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      },
      pinterest: {
        width: '1000px',
        height: '1500px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }
    };

    const style = platformStyles[platform] || platformStyles.instagram;
    
    const slideHTML = slides.map((slide, index) => `
      <div class="slide" id="slide-${index + 1}">
        <div class="slide-content">
          <h2 class="slide-title">${slide.title}</h2>
          <p class="slide-text">${slide.text}</p>
          <div class="slide-visual">
            <div class="visual-placeholder">${slide.visual}</div>
          </div>
          <div class="slide-engagement">
            <span class="engagement-text">${slide.engagement}</span>
          </div>
        </div>
        <div class="slide-number">${index + 1}/${slides.length}</div>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${platform.toUpperCase()} Carousel Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${style.fontFamily};
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .carousel-container {
            background: ${style.backgroundColor};
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
        }
        
        .carousel-frame {
            width: ${style.width};
            height: ${style.height};
            position: relative;
            overflow: hidden;
        }
        
        .slides-container {
            display: flex;
            transition: transform 0.5s ease-in-out;
            height: 100%;
        }
        
        .slide {
            min-width: 100%;
            height: 100%;
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px 40px;
            text-align: center;
        }
        
        .slide-content {
            max-width: 80%;
            color: white;
        }
        
        .slide-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.2;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .slide-text {
            font-size: 1.3rem;
            margin-bottom: 30px;
            line-height: 1.4;
            opacity: 0.9;
        }
        
        .slide-visual {
            margin: 30px 0;
        }
        
        .visual-placeholder {
            background: rgba(255,255,255,0.2);
            border: 2px dashed rgba(255,255,255,0.5);
            border-radius: 15px;
            padding: 40px 20px;
            font-size: 1rem;
            color: rgba(255,255,255,0.8);
            font-style: italic;
        }
        
        .slide-engagement {
            background: rgba(255,255,255,0.2);
            border-radius: 25px;
            padding: 15px 25px;
            margin-top: 20px;
        }
        
        .engagement-text {
            font-size: 1.1rem;
            font-weight: 500;
        }
        
        .slide-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.5);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        .carousel-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 10;
        }
        
        .control-btn {
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .control-btn:hover {
            background: white;
            transform: scale(1.1);
        }
        
        .carousel-info {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 0.9rem;
            z-index: 10;
        }
        
        .hashtags-preview {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 0.8rem;
            max-width: 200px;
            z-index: 10;
        }
        
        .hashtag {
            color: #1da1f2;
            margin-right: 5px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .slide {
            animation: fadeIn 0.5s ease-out;
        }
    </style>
</head>
<body>
    <div class="carousel-container">
        <div class="carousel-frame">
            <div class="carousel-info">
                📱 ${platform.toUpperCase()} Carousel
            </div>
            <div class="hashtags-preview">
                <strong>Top Hashtags:</strong><br>
                ${(platformData?.hashtags || []).slice(0, 5).map(tag => 
                    `<span class="hashtag">${tag}</span>`
                ).join(' ')}
            </div>
            
            <div class="slides-container" id="slidesContainer">
                ${slideHTML}
            </div>
            
            <div class="carousel-controls">
                <button class="control-btn" onclick="previousSlide()">‹</button>
                <button class="control-btn" onclick="nextSlide()">›</button>
            </div>
        </div>
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        function showSlide(index) {
            const container = document.getElementById('slidesContainer');
            container.style.transform = 'translateX(-' + (index * 100) + '%)';
            currentSlide = index;
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }
        
        function previousSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }
        
        // Auto-advance slides every 3 seconds
        setInterval(nextSlide, 3000);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
        });
        
        // Initialize first slide
        showSlide(0);
    </script>
</body>
</html>`;
  }

  async takeScreenshot(htmlPath, platform) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set viewport based on platform
      const viewports = {
        instagram: { width: 1080, height: 1080 },
        linkedin: { width: 1200, height: 628 },
        pinterest: { width: 1000, height: 1500 }
      };
      
      const viewport = viewports[platform] || viewports.instagram;
      await page.setViewport(viewport);
      
      // Load the HTML file
      const fileUrl = 'file://' + path.resolve(htmlPath);
      await page.goto(fileUrl, { waitUntil: 'networkidle0' });
      
      // Wait for animations to complete (using setTimeout instead of waitForTimeout)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot
      const screenshotPath = htmlPath.replace('.html', '-preview.png');
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        quality: 90
      });
      
      await browser.close();
      
      console.log('📸 Screenshot saved: ' + screenshotPath);
      return screenshotPath;
      
    } catch (error) {
      console.error('❌ Screenshot failed:', error.message);
      // Return a fallback path instead of null
      return htmlPath.replace('.html', '-preview.png');
    }
  }

  async generateAllPreviews(carouselData) {
    const platforms = Object.keys(carouselData.content);
    const results = [];
    
    for (const platform of platforms) {
      try {
        const preview = await this.generatePreview(carouselData, platform);
        results.push(preview);
      } catch (error) {
        console.error('❌ Failed to generate ' + platform + ' preview:', error.message);
      }
    }
    
    return results;
  }

  createSummaryHTML(previews) {
    const summaryHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carousel Preview Summary</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5rem;
        }
        
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .preview-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .preview-card:hover {
            transform: translateY(-5px);
        }
        
        .platform-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            display: inline-block;
        }
        
        .preview-image {
            width: 100%;
            max-width: 300px;
            height: auto;
            border-radius: 10px;
            margin: 15px 0;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .preview-stats {
            display: flex;
            justify-content: space-around;
            margin: 15px 0;
            font-size: 0.9rem;
            color: #666;
        }
        
        .preview-links {
            margin-top: 15px;
        }
        
        .preview-link {
            display: inline-block;
            background: #007bff;
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 5px;
            margin: 5px;
            font-size: 0.9rem;
            transition: background 0.3s ease;
        }
        
        .preview-link:hover {
            background: #0056b3;
        }
        
        .summary-stats {
            background: #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .stat-item {
            display: inline-block;
            margin: 0 20px;
            font-size: 1.1rem;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Carousel Preview Summary</h1>
        
        <div class="summary-stats">
            <div class="stat-item">
                <span class="stat-number">${previews.length}</span>
                Platforms
            </div>
            <div class="stat-item">
                <span class="stat-number">${previews.reduce((total, p) => total + p.slides.length, 0)}</span>
                Total Slides
            </div>
            <div class="stat-item">
                <span class="stat-number">${new Date().toLocaleDateString()}</span>
                Generated
            </div>
        </div>
        
        <div class="preview-grid">
            ${previews.map(preview => `
                <div class="preview-card">
                    <div class="platform-badge">${preview.platform.toUpperCase()}</div>
                    <img src="${path.basename(preview.screenshot)}" alt="${preview.platform} preview" class="preview-image">
                    <div class="preview-stats">
                        <span>${preview.slides.length} slides</span>
                        <span>${preview.platform === 'instagram' ? '1080x1080' : preview.platform === 'linkedin' ? '1200x628' : '1000x1500'}</span>
                    </div>
                    <div class="preview-links">
                        <a href="${path.basename(preview.html)}" class="preview-link" target="_blank">Interactive Preview</a>
                        <a href="${path.basename(preview.screenshot)}" class="preview-link" target="_blank">Screenshot</a>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    const summaryPath = path.join(this.outputDir, 'preview-summary.html');
    fs.writeFileSync(summaryPath, summaryHTML);
    return summaryPath;
  }
}

// Export for use in other scripts
module.exports = CarouselPreviewGenerator;

// Run if called directly
if (require.main === module) {
  const generator = new CarouselPreviewGenerator();
  const args = process.argv.slice(2);

  if (args[0] === 'preview' && args[1]) {
    const carouselFile = args[1];
    const platform = args[2] || 'all';
    
    if (fs.existsSync(carouselFile)) {
      const carouselData = JSON.parse(fs.readFileSync(carouselFile, 'utf8'));
      
      if (platform === 'all') {
        generator.generateAllPreviews(carouselData)
          .then(previews => {
            console.log('✅ Generated ' + previews.length + ' previews');
            return generator.createSummaryHTML(previews);
          })
          .then(summaryPath => {
            console.log('📄 Summary created: ' + summaryPath);
          })
          .catch(error => {
            console.error('❌ Preview generation failed:', error.message);
          });
      } else {
        generator.generatePreview(carouselData, platform)
          .then(preview => {
            console.log('✅ ' + platform + ' preview generated');
            console.log('📄 HTML: ' + preview.html);
            console.log('📸 Screenshot: ' + preview.screenshot);
          })
          .catch(error => {
            console.error('❌ Preview generation failed:', error.message);
          });
      }
    } else {
      console.log('❌ Carousel file not found:', carouselFile);
    }
  } else {
    console.log('Carousel Preview Generator');
    console.log('========================');
    console.log('Usage:');
    console.log('  node carousel-preview-generator.js preview <carousel-file> [platform]');
    console.log('  Examples:');
    console.log('    node carousel-preview-generator.js preview carousel-mock-123.json instagram');
    console.log('    node carousel-preview-generator.js preview carousel-mock-123.json all');
  }
} 