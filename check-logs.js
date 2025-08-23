#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the error log file (this would be in the app's document directory)
// For development, we'll check if there's a local log file
const possibleLogPaths = [
  './error_log.txt',
  './src/logs/error_log.txt',
  './logs/error_log.txt'
];

console.log('🔍 Checking for crash logs...\n');

let foundLogs = false;

possibleLogPaths.forEach(logPath => {
  if (fs.existsSync(logPath)) {
    console.log(`📁 Found log file: ${logPath}`);
    console.log('📋 Log contents:');
    console.log('='.repeat(50));
    
    try {
      const content = fs.readFileSync(logPath, 'utf8');
      if (content.trim()) {
        console.log(content);
        foundLogs = true;
      } else {
        console.log('(Log file is empty)');
      }
    } catch (error) {
      console.log(`Error reading log file: ${error.message}`);
    }
    
    console.log('='.repeat(50));
    console.log();
  }
});

if (!foundLogs) {
  console.log('❌ No crash log files found in common locations.');
  console.log('\n💡 To view crash logs:');
  console.log('1. Open the app on your iOS device');
  console.log('2. Go to Settings → Debug & Development');
  console.log('3. Tap "View Crash Logs"');
  console.log('\n📱 Or check the device logs:');
  console.log('- Connect device to Mac');
  console.log('- Open Xcode → Window → Devices and Simulators');
  console.log('- Select your device → View Device Logs');
}

console.log('\n🔧 Additional debugging tips:');
console.log('- Check Expo logs in your terminal');
console.log('- Use "Test Error Boundary" button in Settings to test error handling');
console.log('- Look for red error screens in the app');
