#!/usr/bin/env node

/**
 * Master Test Runner for Tax Scanner v2
 * 
 * Runs all test suites and provides a comprehensive report of all issues
 */

const path = require('path');
const fs = require('fs');

// Import test suites
const { runComprehensiveAnalysis } = require('./comprehensive-analysis.test.js');
const { runBuildDiagnostic } = require('./build-diagnostic.test.js');
const { runApiConnectivityTest } = require('./api-connectivity.test.js');

/**
 * Format time duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Generate Issues Report
 */
function generateIssuesReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      buildSuccess: false,
      apiConnected: false
    },
    issues: {
      critical: [],
      warnings: []
    },
    recommendations: []
  };
  
  // Collect all issues
  results.forEach(result => {
    if (result.critical) {
      report.issues.critical.push(...result.critical);
    }
    if (result.warnings) {
      report.issues.warnings.push(...result.warnings);
    }
  });
  
  // Update summary
  report.summary.criticalIssues = report.issues.critical.length;
  report.summary.warnings = report.issues.warnings.length;
  report.summary.totalIssues = report.summary.criticalIssues + report.summary.warnings;
  
  // Build and API status
  const buildResult = results.find(r => r.type === 'build');
  const apiResult = results.find(r => r.type === 'api');
  
  if (buildResult) {
    report.summary.buildSuccess = buildResult.success || false;
  }
  
  if (apiResult) {
    report.summary.apiConnected = apiResult.backendAccessible || false;
  }
  
  // Generate recommendations based on issues
  if (!report.summary.buildSuccess) {
    report.recommendations.push('🚨 URGENT: Fix build errors to enable deployment');
  }
  
  if (!report.summary.apiConnected) {
    report.recommendations.push('🚨 URGENT: Fix API connectivity for functionality');
  }
  
  if (report.issues.critical.some(issue => issue.includes('node_modules'))) {
    report.recommendations.push('💡 Run: npm install to resolve dependency issues');
  }
  
  if (report.issues.critical.some(issue => issue.includes('TypeScript'))) {
    report.recommendations.push('💡 Fix TypeScript errors for successful build');
  }
  
  if (report.issues.critical.some(issue => issue.includes('geolocation'))) {
    report.recommendations.push('💡 Add "Use My Location" functionality to improve UX');
  }
  
  if (report.issues.warnings.some(issue => issue.includes('accessibility'))) {
    report.recommendations.push('💡 Improve accessibility for better user experience');
  }
  
  return report;
}

/**
 * Save Report to File
 */
function saveReport(report) {
  const reportsDir = path.join(process.cwd(), 'tests/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `test-report-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  return reportPath;
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log('🚀 TAX SCANNER V2 - COMPREHENSIVE TESTING SUITE');
  console.log('================================================\n');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // Test 1: Comprehensive Analysis
    console.log('📋 RUNNING: Comprehensive Analysis...');
    const analysisStart = Date.now();
    const analysisResult = runComprehensiveAnalysis();
    const analysisDuration = Date.now() - analysisStart;
    
    results.push({
      type: 'analysis',
      duration: analysisDuration,
      ...analysisResult
    });
    
    console.log(`✅ Completed in ${formatDuration(analysisDuration)}\n`);
    
    // Test 2: Build Diagnostic
    console.log('🔧 RUNNING: Build Diagnostic...');
    const buildStart = Date.now();
    const buildResult = await runBuildDiagnostic();
    const buildDuration = Date.now() - buildStart;
    
    results.push({
      type: 'build',
      duration: buildDuration,
      ...buildResult
    });
    
    console.log(`✅ Completed in ${formatDuration(buildDuration)}\n`);
    
    // Test 3: API Connectivity
    console.log('🌐 RUNNING: API Connectivity Test...');
    const apiStart = Date.now();
    const apiResult = await runApiConnectivityTest();
    const apiDuration = Date.now() - apiStart;
    
    results.push({
      type: 'api',
      duration: apiDuration,
      ...apiResult
    });
    
    console.log(`✅ Completed in ${formatDuration(apiDuration)}\n`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    results.push({
      type: 'error',
      error: error.message,
      critical: [`❌ Test suite error: ${error.message}`],
      warnings: []
    });
  }
  
  // Generate comprehensive report
  const totalDuration = Date.now() - startTime;
  const report = generateIssuesReport(results);
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 FINAL COMPREHENSIVE REPORT');
  console.log('='.repeat(80));
  
  // Summary
  console.log('\n📊 EXECUTIVE SUMMARY:');
  console.log(`   Test Duration: ${formatDuration(totalDuration)}`);
  console.log(`   Build Status: ${report.summary.buildSuccess ? '✅ Success' : '❌ Failed'}`);
  console.log(`   API Status: ${report.summary.apiConnected ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`   Total Issues: ${report.summary.totalIssues}`);
  console.log(`   Critical: ${report.summary.criticalIssues}`);
  console.log(`   Warnings: ${report.summary.warnings}`);
  
  // Priority Issues
  if (report.issues.critical.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (Must Fix):');
    report.issues.critical.forEach(issue => console.log(`   ${issue}`));
  }
  
  if (report.issues.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS (Should Fix):');
    report.issues.warnings.slice(0, 10).forEach(issue => console.log(`   ${issue}`));
    if (report.issues.warnings.length > 10) {
      console.log(`   ... and ${report.issues.warnings.length - 10} more warnings`);
    }
  }
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDED ACTIONS:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
  }
  
  // Next Steps
  console.log('\n🎯 IMMEDIATE NEXT STEPS:');
  if (!report.summary.buildSuccess) {
    console.log('   1. 🚨 Fix build errors (highest priority)');
    console.log('   2. 🔧 Run build diagnostic: node tests/build-diagnostic.test.js');
  }
  
  if (!report.summary.apiConnected) {
    console.log(`   ${!report.summary.buildSuccess ? '3' : '1'}. 🌐 Fix API connectivity`);
    console.log(`   ${!report.summary.buildSuccess ? '4' : '2'}. 🔧 Check backend deployment`);
  }
  
  if (report.issues.critical.some(issue => issue.includes('geolocation'))) {
    console.log('   📍 Add missing "Use My Location" functionality');
  }
  
  // Health Score
  const maxScore = 100;
  let healthScore = maxScore;
  healthScore -= report.summary.criticalIssues * 10; // -10 per critical issue
  healthScore -= report.summary.warnings * 2; // -2 per warning
  healthScore = Math.max(0, healthScore);
  
  console.log(`\n🏥 APPLICATION HEALTH SCORE: ${healthScore}/${maxScore}`);
  
  if (healthScore >= 90) {
    console.log('   🟢 EXCELLENT - Ready for production');
  } else if (healthScore >= 70) {
    console.log('   🟡 GOOD - Minor issues to address');
  } else if (healthScore >= 50) {
    console.log('   🟠 FAIR - Several issues need attention');
  } else {
    console.log('   🔴 POOR - Critical issues must be fixed');
  }
  
  // Save detailed report
  const reportPath = saveReport(report);
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎉 Testing completed in ${formatDuration(totalDuration)}`);
  console.log('='.repeat(80) + '\n');
  
  // Exit with appropriate code
  const exitCode = report.summary.criticalIssues > 0 ? 1 : 0;
  return { report, exitCode, reportPath };
}

// Run if called directly
if (require.main === module) {
  runAllTests().then(({ exitCode }) => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  generateIssuesReport,
  formatDuration
}; 