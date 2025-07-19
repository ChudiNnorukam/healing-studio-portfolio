#!/usr/bin/env node

const { startSession, quickReport, generateFullReport } = require('./auto-tracker');

console.log('🛠️ Tool Usage Tracking System');
console.log('=============================\n');

// Start tracking session
const sessionName = process.argv[2] || 'daily-workflow';
startSession(sessionName);

console.log(`🚀 Tracking started for session: "${sessionName}"`);
console.log('\n📋 What to do next:');
console.log('1. Continue your normal work in Cursor');
console.log('2. Tools will be tracked automatically');
console.log('3. Run quick analysis anytime:');
console.log('   node -e "require(\'./auto-tracker\').quickReport()"');
console.log('4. Generate full report:');
console.log('   node -e "require(\'./auto-tracker\').generateFullReport()"');
console.log('\n💡 Tips:');
console.log('- Run quick analysis every hour to see patterns');
console.log('- Check for slow or error-prone tools');
console.log('- Identify unused tools for removal');
console.log('\n📊 Files created:');
console.log('- tool-usage-data.json (raw data)');
console.log('- tool-usage-report.md (detailed reports)');

// Show current status
setTimeout(() => {
    console.log('\n🔍 Current Status:');
    quickReport();
}, 2000);

// Keep the process running to maintain session
console.log('\n⏳ Session active... Press Ctrl+C to end tracking');
console.log('(This will end the current session and save data)');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n📊 Final Report:');
    quickReport();
    console.log('\n✅ Session ended. Data saved to tool-usage-data.json');
    process.exit(0);
}); 