#!/usr/bin/env node

// Brand Compliance System - Ensures all content follows Chudi's brand guidelines
const fs = require('fs');
const path = require('path');

class BrandComplianceSystem {
  constructor() {
    this.brandGuidelines = this.loadBrandGuidelines();
    this.complianceRules = this.extractComplianceRules();
    this.voicePatterns = this.extractVoicePatterns();
    this.seoStandards = this.extractSEOStandards();
  }

  loadBrandGuidelines() {
    try {
      // Load core brand files
      const cursorRules = fs.readFileSync('.cursorrules', 'utf8');
      const cursorRulesJson = JSON.parse(fs.readFileSync('.cursorrules.json', 'utf8'));
      const chudiHumanized = fs.readFileSync('chudi_humanized.mdc', 'utf8');

      return {
        cursorRules,
        cursorRulesJson,
        chudiHumanized,
        loadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to load brand guidelines:', error.message);
      return null;
    }
  }

  extractComplianceRules() {
    if (!this.brandGuidelines) return {};

    return {
      // Technical standards from .cursorrules
      technical: {
        model: 'GPT-4',
        patterns: ['modern JavaScript/TypeScript', 'async/await patterns', 'comprehensive error handling'],
        security: ['Never expose API keys', 'Use environment variables', 'OWASP guidelines'],
        performance: ['efficient algorithms', 'caching strategies', 'performance profiling']
      },
      
      // Brand voice from chudi_humanized.mdc
      voice: {
        identity: 'Someone who survived abandonment',
        tone: 'Authentic, vulnerable, healing-focused',
        expertise: 'Trauma healing, inner child work, professional development',
        approach: 'Research Guardian + MCP Orchestrator persona'
      },
      
      // Content requirements
      content: {
        platforms: ['Pinterest', 'Instagram', 'LinkedIn'],
        formats: ['Carousel', 'Quote', 'Infographic', 'Exercise'],
        seoRequired: true,
        audienceFirst: true,
        healingFocused: true
      }
    };
  }

  extractVoicePatterns() {
    return {
      // Voice characteristics to maintain
      authenticity: [
        'Personal experience with trauma healing',
        'Vulnerable storytelling',
        'Professional expertise combined with lived experience',
        'Gentle, compassionate tone'
      ],
      
      // Content patterns
      patterns: [
        'Lead with empathy',
        'Validate emotions',
        'Provide practical guidance',
        'Connect personal to professional',
        'Use inclusive language',
        'Focus on healing and growth'
      ],
      
      // Prohibited patterns
      avoid: [
        'Clinical, detached language',
        'One-size-fits-all advice',
        'Dismissive of pain',
        'Overly academic tone',
        'Pushy sales language'
      ]
    };
  }

  extractSEOStandards() {
    return {
      keywords: {
        primary: ['inner child healing', 'trauma recovery', 'professional development'],
        secondary: ['self-compassion', 'healing journey', 'authentic leadership'],
        hashtags: ['#InnerChildHealing', '#TraumaRecovery', '#SelfCompassion', '#HealingJourney']
      },
      
      platforms: {
        pinterest: {
          format: '2:3 ratio (1000x1500px)',
          seoFocus: 'Title optimization, keyword-rich descriptions',
          bestTimes: '8:00 PM EST'
        },
        instagram: {
          format: '1:1 ratio (1080x1080px)',
          seoFocus: 'Hashtag strategy, engagement optimization',
          bestTimes: '12:00 PM EST'
        },
        linkedin: {
          format: '1.91:1 ratio (1200x628px)',
          seoFocus: 'Professional keywords, business insights',
          bestTimes: '9:00 AM EST'
        }
      }
    };
  }

  // Validate content against brand guidelines
  validateContent(content, contentType = 'general') {
    const validation = {
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      brandAlignment: {}
    };

    // Voice validation
    const voiceScore = this.validateVoice(content);
    validation.brandAlignment.voice = voiceScore;

    // SEO validation
    const seoScore = this.validateSEO(content, contentType);
    validation.brandAlignment.seo = seoScore;

    // Technical validation
    const techScore = this.validateTechnical(content, contentType);
    validation.brandAlignment.technical = techScore;

    // Calculate overall score
    validation.score = Math.round((voiceScore.score + seoScore.score + techScore.score) / 3);
    validation.passed = validation.score >= 80;

    // Collect all issues
    validation.issues = [
      ...voiceScore.issues,
      ...seoScore.issues,
      ...techScore.issues
    ];

    // Collect all recommendations
    validation.recommendations = [
      ...voiceScore.recommendations,
      ...seoScore.recommendations,
      ...techScore.recommendations
    ];

    return validation;
  }

  validateVoice(content) {
    const result = {
      score: 100,
      issues: [],
      recommendations: []
    };

    const contentStr = JSON.stringify(content).toLowerCase();

    // Check for authentic voice patterns
    const authenticityKeywords = ['healing', 'compassion', 'journey', 'growth', 'authentic'];
    const foundAuthenticity = authenticityKeywords.filter(keyword => 
      contentStr.includes(keyword)
    );

    if (foundAuthenticity.length < 2) {
      result.score -= 20;
      result.issues.push('Content lacks authentic healing voice');
      result.recommendations.push('Include more healing-focused, compassionate language');
    }

    // Check for prohibited patterns
    const clinicalWords = ['patient', 'diagnosis', 'disorder', 'treatment'];
    const foundClinical = clinicalWords.filter(word => contentStr.includes(word));

    if (foundClinical.length > 0) {
      result.score -= 15;
      result.issues.push('Content uses clinical language instead of human-centered approach');
      result.recommendations.push('Replace clinical terms with more personal, relatable language');
    }

    // Check for empathy and validation
    const empathyWords = ['understand', 'valid', 'heard', 'seen', 'matter'];
    const foundEmpathy = empathyWords.filter(word => contentStr.includes(word));

    if (foundEmpathy.length === 0) {
      result.score -= 10;
      result.recommendations.push('Add more validating, empathetic language');
    }

    return result;
  }

  validateSEO(content, contentType) {
    const result = {
      score: 100,
      issues: [],
      recommendations: []
    };

    const contentStr = JSON.stringify(content).toLowerCase();

    // Check for primary keywords
    const primaryKeywords = this.seoStandards.keywords.primary;
    const foundPrimary = primaryKeywords.filter(keyword => 
      contentStr.includes(keyword.toLowerCase())
    );

    if (foundPrimary.length === 0) {
      result.score -= 25;
      result.issues.push('Missing primary SEO keywords');
      result.recommendations.push(`Include at least one primary keyword: ${primaryKeywords.join(', ')}`);
    }

    // Check for hashtags (if applicable)
    if (contentType === 'social' && !contentStr.includes('#')) {
      result.score -= 15;
      result.issues.push('Missing hashtags for social media content');
      result.recommendations.push('Add relevant hashtags for platform optimization');
    }

    // Check title optimization
    if (content.title && content.title.length < 30) {
      result.score -= 10;
      result.recommendations.push('Consider longer, more descriptive titles for better SEO');
    }

    return result;
  }

  validateTechnical(content, contentType) {
    const result = {
      score: 100,
      issues: [],
      recommendations: []
    };

    // Check for proper structure
    if (typeof content !== 'object') {
      result.score -= 20;
      result.issues.push('Content should be structured as an object');
    }

    // Check for required fields based on content type
    const requiredFields = this.getRequiredFields(contentType);
    const missingFields = requiredFields.filter(field => !content[field]);

    if (missingFields.length > 0) {
      result.score -= (missingFields.length * 10);
      result.issues.push(`Missing required fields: ${missingFields.join(', ')}`);
      result.recommendations.push('Ensure all required fields are included');
    }

    // Check for error handling (if code content)
    if (contentType === 'code' && content.code) {
      if (!content.code.includes('try') && !content.code.includes('catch')) {
        result.score -= 15;
        result.recommendations.push('Add error handling to code examples');
      }
    }

    return result;
  }

  getRequiredFields(contentType) {
    const fieldMap = {
      carousel: ['title', 'description', 'platform', 'slides'],
      social: ['platform', 'content', 'hashtags'],
      schedule: ['day', 'platform', 'contentType', 'optimalTime'],
      workflow: ['name', 'nodes', 'connections'],
      general: ['title', 'description']
    };

    return fieldMap[contentType] || fieldMap.general;
  }

  // Apply brand guidelines to content
  applyBrandGuidelines(content, contentType = 'general') {
    const enhanced = { ...content };

    // Apply voice enhancements
    enhanced.brandVoice = {
      tone: 'Authentic, healing-focused',
      perspective: 'Lived experience + professional expertise',
      approach: 'Empathetic, validating, growth-oriented'
    };

    // Apply SEO enhancements
    if (!enhanced.seo) {
      enhanced.seo = this.generateSEOEnhancements(content, contentType);
    }

    // Apply platform optimization
    if (enhanced.platform) {
      enhanced.platformOptimization = this.seoStandards.platforms[enhanced.platform.toLowerCase()];
    }

    // Add compliance metadata
    enhanced.brandCompliance = {
      validated: true,
      validatedAt: new Date().toISOString(),
      guidelinesVersion: this.brandGuidelines.loadedAt,
      complianceScore: this.validateContent(content, contentType).score
    };

    return enhanced;
  }

  generateSEOEnhancements(content, contentType) {
    const seo = {
      primaryKeywords: this.seoStandards.keywords.primary,
      secondaryKeywords: this.seoStandards.keywords.secondary,
      hashtags: this.seoStandards.keywords.hashtags
    };

    // Add content-specific SEO
    if (contentType === 'carousel') {
      seo.carouselSEO = {
        titleOptimization: 'Include primary keyword in first 60 characters',
        descriptionOptimization: 'Include secondary keywords naturally',
        slideOptimization: 'Each slide should support overall SEO strategy'
      };
    }

    if (contentType === 'schedule') {
      seo.scheduleOptimization = {
        consistentKeywords: 'Maintain keyword consistency across posts',
        platformKeywords: 'Adapt keywords for each platform',
        timingOptimization: 'Post at platform-optimal times'
      };
    }

    return seo;
  }

  // Generate brand-compliant content templates
  generateContentTemplate(contentType, platform = null) {
    const template = {
      metadata: {
        contentType,
        platform,
        brandCompliant: true,
        createdAt: new Date().toISOString()
      },
      brandGuidelines: {
        voice: this.complianceRules.voice,
        seo: platform ? this.seoStandards.platforms[platform.toLowerCase()] : this.seoStandards.keywords,
        technical: this.complianceRules.technical
      }
    };

    // Add content-specific template
    switch (contentType) {
      case 'carousel':
        template.structure = this.getCarouselTemplate(platform);
        break;
      case 'schedule':
        template.structure = this.getScheduleTemplate();
        break;
      case 'social':
        template.structure = this.getSocialTemplate(platform);
        break;
      case 'workflow':
        template.structure = this.getWorkflowTemplate();
        break;
    }

    return template;
  }

  getCarouselTemplate(platform) {
    return {
      title: '[Include primary keyword] - [Healing benefit]',
      description: '[Personal connection] + [Professional insight] + [Call to action]',
      slides: [
        {
          slideNumber: 1,
          purpose: 'Hook - Personal connection',
          voiceNote: 'Lead with empathy and shared experience'
        },
        {
          slideNumber: 2,
          purpose: 'Problem - Acknowledge pain',
          voiceNote: 'Validate their experience'
        },
        {
          slideNumber: 3,
          purpose: 'Solution - Provide hope',
          voiceNote: 'Offer gentle, practical guidance'
        },
        {
          slideNumber: 4,
          purpose: 'Action - Give steps',
          voiceNote: 'Make it accessible and non-overwhelming'
        },
        {
          slideNumber: 5,
          purpose: 'Encouragement - End with support',
          voiceNote: 'Remind them they\'re not alone'
        }
      ],
      platform: platform || 'pinterest',
      specs: this.seoStandards.platforms[platform?.toLowerCase() || 'pinterest']
    };
  }

  getScheduleTemplate() {
    return {
      totalDays: 30,
      platforms: ['pinterest', 'instagram', 'linkedin'],
      contentTypes: ['quote', 'infographic', 'exercise'],
      brandConsistency: {
        voiceTone: 'Maintain healing-focused, authentic voice across all platforms',
        keywordStrategy: 'Rotate primary keywords throughout the month',
        engagementApproach: 'Always validate, never dismiss'
      },
      dailyTemplate: {
        platform: '[Platform]',
        contentType: '[Type]',
        optimalTime: '[Platform-specific optimal time]',
        brandVoice: 'Authentic, empathetic, growth-oriented',
        seoFocus: '[Primary or secondary keyword focus]',
        engagementGoal: 'Connection, validation, practical value'
      }
    };
  }

  getSocialTemplate(platform) {
    const templates = {
      pinterest: {
        title: '[Primary keyword] - [Emotional benefit]',
        description: '[Personal hook] + [Professional insight] + [SEO keywords]',
        format: '2:3 ratio (1000x1500px)',
        hashtags: 'Include 3-5 relevant hashtags',
        voiceNote: 'Focus on searchable, valuable content'
      },
      instagram: {
        caption: '[Emoji] [Personal story] + [Practical tip] + [Question for engagement]',
        format: '1:1 ratio (1080x1080px)',
        hashtags: 'Use 10-15 hashtags in first comment',
        voiceNote: 'More personal, conversational tone'
      },
      linkedin: {
        title: '[Professional angle] - [Personal insight]',
        content: '[Business context] + [Personal experience] + [Professional application]',
        format: '1.91:1 ratio (1200x628px)',
        hashtags: 'Use 3-5 professional hashtags',
        voiceNote: 'Connect personal healing to professional growth'
      }
    };

    return templates[platform?.toLowerCase()] || templates.pinterest;
  }

  getWorkflowTemplate() {
    return {
      name: '[Descriptive workflow name]',
      brandCompliance: {
        budgetValidation: 'Always include budget checks',
        voiceValidation: 'Validate content against brand voice',
        seoValidation: 'Ensure SEO optimization',
        errorHandling: 'Comprehensive error responses'
      },
      requiredNodes: [
        'Input Validation',
        'Brand Compliance Check',
        'Content Generation',
        'SEO Optimization',
        'File Output',
        'Success/Error Response'
      ],
      brandIntegration: 'Every node should reference brand guidelines'
    };
  }

  // Generate compliance report
  generateComplianceReport(content, contentType) {
    const validation = this.validateContent(content, contentType);
    const enhanced = this.applyBrandGuidelines(content, contentType);

    const report = {
      summary: {
        contentType,
        complianceScore: validation.score,
        passed: validation.passed,
        validatedAt: new Date().toISOString()
      },
      brandAlignment: validation.brandAlignment,
      issues: validation.issues,
      recommendations: validation.recommendations,
      enhancedContent: enhanced,
      guidelines: {
        voice: this.complianceRules.voice,
        seo: this.seoStandards,
        technical: this.complianceRules.technical
      }
    };

    return report;
  }

  // Save compliance report
  saveComplianceReport(report, filename = null) {
    const outputDir = 'temp/brand-compliance';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportFile = filename || `compliance-report-${Date.now()}.json`;
    const reportPath = path.join(outputDir, reportFile);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Brand compliance report saved: ${reportPath}`);

    return reportPath;
  }
}

// Export for use in other scripts
module.exports = BrandComplianceSystem;

// Run if called directly
if (require.main === module) {
  console.log('🎯 Brand Compliance System - Loaded Successfully');
  console.log('📋 Use this system to ensure all content follows Chudi\'s brand guidelines');
  
  const compliance = new BrandComplianceSystem();
  
  // Example usage
  const exampleContent = {
    title: 'Healing Your Inner Child: A Journey to Self-Acceptance',
    description: 'Discover the power of reconnecting with your younger self through gentle healing practices.',
    platform: 'pinterest'
  };

  const report = compliance.generateComplianceReport(exampleContent, 'social');
  compliance.saveComplianceReport(report);
  
  console.log(`✅ Compliance Score: ${report.summary.complianceScore}%`);
  console.log(`📊 Report saved with ${report.issues.length} issues and ${report.recommendations.length} recommendations`);
} 