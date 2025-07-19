#!/usr/bin/env node

/**
 * OpenAI Integration Test Script
 * Tests the connection between Cursor and OpenAI API
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  apiKey: 'YOUR_OPENAI_API_KEY_HERE',
  model: 'gpt-4',
  baseURL: 'https://api.openai.com/v1',
  maxTokens: 1000,
  temperature: 0.7
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL
});

class OpenAIIntegrationTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async testBasicConnection() {
    console.log('🔍 Testing basic OpenAI connection...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { 
            role: "user", 
            content: "Hello! This is a test of the OpenAI integration with Cursor. Please respond with a brief confirmation that the connection is working." 
          }
        ],
        max_tokens: 100,
        temperature: config.temperature
      });
      
      const response = completion.choices[0].message.content;
      console.log('✅ Basic connection successful!');
      console.log('📝 Response:', response);
      
      this.results.push({
        test: 'Basic Connection',
        status: 'PASS',
        response: response,
        tokens: completion.usage.total_tokens,
        cost: this.calculateCost(completion.usage.total_tokens, config.model)
      });
      
      return true;
    } catch (error) {
      console.error('❌ Basic connection failed:', error.message);
      this.results.push({
        test: 'Basic Connection',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testCodeGeneration() {
    console.log('\n🔍 Testing code generation capabilities...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "user",
            content: "Generate a simple JavaScript function that calculates the factorial of a number. Include JSDoc comments and error handling."
          }
        ],
        max_tokens: 300,
        temperature: config.temperature
      });
      
      const response = completion.choices[0].message.content;
      console.log('✅ Code generation successful!');
      console.log('📝 Generated code:');
      console.log(response);
      
      this.results.push({
        test: 'Code Generation',
        status: 'PASS',
        response: response,
        tokens: completion.usage.total_tokens,
        cost: this.calculateCost(completion.usage.total_tokens, config.model)
      });
      
      return true;
    } catch (error) {
      console.error('❌ Code generation failed:', error.message);
      this.results.push({
        test: 'Code Generation',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testContextAwareness() {
    console.log('\n🔍 Testing context awareness...');
    
    try {
      const messages = [
        {
          role: "user",
          content: "I'm working on a Node.js project. What's the best way to handle environment variables?"
        },
        {
          role: "assistant",
          content: "For Node.js projects, you should use the 'dotenv' package to load environment variables from a .env file. This keeps sensitive data like API keys secure."
        },
        {
          role: "user",
          content: "Can you show me how to implement that with proper error handling?"
        }
      ];
      
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: messages,
        max_tokens: 400,
        temperature: config.temperature
      });
      
      const response = completion.choices[0].message.content;
      console.log('✅ Context awareness test successful!');
      console.log('📝 Response:');
      console.log(response);
      
      this.results.push({
        test: 'Context Awareness',
        status: 'PASS',
        response: response,
        tokens: completion.usage.total_tokens,
        cost: this.calculateCost(completion.usage.total_tokens, config.model)
      });
      
      return true;
    } catch (error) {
      console.error('❌ Context awareness test failed:', error.message);
      this.results.push({
        test: 'Context Awareness',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testErrorHandling() {
    console.log('\n🔍 Testing error handling...');
    
    try {
      // Test with invalid model name
      const completion = await openai.chat.completions.create({
        model: 'invalid-model-name',
        messages: [
          { role: "user", content: "This should fail" }
        ],
        max_tokens: 10
      });
      
      console.log('❌ Error handling test failed - should have thrown an error');
      this.results.push({
        test: 'Error Handling',
        status: 'FAIL',
        error: 'Expected error was not thrown'
      });
      return false;
    } catch (error) {
      console.log('✅ Error handling test successful!');
      console.log('📝 Error caught:', error.message);
      
      this.results.push({
        test: 'Error Handling',
        status: 'PASS',
        error: error.message
      });
      return true;
    }
  }

  calculateCost(tokens, model) {
    const rates = {
      'gpt-4': 0.03, // per 1K tokens
      'gpt-3.5-turbo': 0.002 // per 1K tokens
    };
    return (tokens / 1000) * (rates[model] || rates['gpt-4']);
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const totalTokens = this.results
      .filter(r => r.tokens)
      .reduce((sum, r) => sum + r.tokens, 0);
    
    const totalCost = this.results
      .filter(r => r.cost)
      .reduce((sum, r) => sum + r.cost, 0);
    
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const totalTests = this.results.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`🧪 Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`🔢 Total Tokens Used: ${totalTokens}`);
    console.log(`💰 Estimated Cost: $${totalCost.toFixed(4)}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.status}`);
      if (result.tokens) {
        console.log(`   Tokens: ${result.tokens}, Cost: $${result.cost.toFixed(4)}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        totalTests,
        passedTests,
        successRate: (passedTests / totalTests) * 100,
        totalTokens,
        totalCost
      },
      results: this.results
    };
    
    fs.writeFileSync('openai-integration-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: openai-integration-report.json');
    
    return passedTests === totalTests;
  }

  async runAllTests() {
    console.log('🚀 Starting OpenAI Integration Tests...\n');
    
    await this.testBasicConnection();
    await this.testCodeGeneration();
    await this.testContextAwareness();
    await this.testErrorHandling();
    
    const success = this.generateReport();
    
    if (success) {
      console.log('\n🎉 All tests passed! OpenAI integration is working correctly.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please check the configuration.');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new OpenAIIntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = OpenAIIntegrationTester; 