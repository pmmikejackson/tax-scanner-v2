/**
 * Comprehensive Analysis Test Suite
 * 
 * This test suite systematically checks for all potential issues in the Tax Scanner v2 application
 * including build problems, component functionality, API connectivity, and user experience issues.
 */

const fs = require('fs');
const path = require('path');

// Test Results Storage
const testResults = {
  buildIssues: [],
  componentIssues: [],
  apiIssues: [],
  configurationIssues: [],
  missingFeatures: [],
  performanceIssues: [],
  accessibilityIssues: []
};

// Helper function to check if file exists and is readable
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

// Helper function to read file content safely
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * TEST 1: BUILD AND DEPENDENCY ANALYSIS
 */
function testBuildConfiguration() {
  console.log('🔍 Testing Build Configuration...');
  
  // Check package.json files
  const frontendPkg = path.join(process.cwd(), 'package.json');
  const backendPkg = path.join(process.cwd(), '../backend/package.json');
  
  if (!checkFileExists(frontendPkg)) {
    testResults.buildIssues.push('❌ Frontend package.json missing');
  } else {
    const pkg = JSON.parse(readFileContent(frontendPkg));
    if (!pkg.scripts || !pkg.scripts.build) {
      testResults.buildIssues.push('❌ Build script missing in package.json');
    }
    if (!pkg.dependencies || !pkg.dependencies.next) {
      testResults.buildIssues.push('❌ Next.js dependency missing');
    }
  }
  
  // Check for node_modules issues
  const nodeModules = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    testResults.buildIssues.push('❌ node_modules directory missing - run npm install');
  }
  
  // Check for conflicting dependencies
  const lockFile = path.join(process.cwd(), '../package-lock.json');
  if (checkFileExists(lockFile)) {
    testResults.buildIssues.push('⚠️ Root package-lock.json may cause dependency conflicts');
  }
  
  // Check Next.js configuration
  const nextConfig = path.join(process.cwd(), 'next.config.js');
  if (!checkFileExists(nextConfig)) {
    testResults.configurationIssues.push('⚠️ next.config.js missing - may cause build issues');
  }
}

/**
 * TEST 2: COMPONENT ANALYSIS
 */
function testComponentStructure() {
  console.log('🔍 Testing Component Structure...');
  
  const componentsDir = path.join(process.cwd(), 'src/components');
  const expectedComponents = [
    'USStatesMap.tsx',
    'TaxLookupForm.tsx',
    'StateDetailView.tsx',
    'TaxResultsCard.tsx',
    'VersionInfo.tsx',
    'DataFreshnessInfo.tsx'
  ];
  
  expectedComponents.forEach(component => {
    const componentPath = path.join(componentsDir, component);
    if (!checkFileExists(componentPath)) {
      testResults.componentIssues.push(`❌ Component missing: ${component}`);
    } else {
      const content = readFileContent(componentPath);
      
      // Check for TypeScript errors
      if (content.includes('any') && !content.includes('// @ts-ignore')) {
        testResults.componentIssues.push(`⚠️ ${component} may have TypeScript issues (any types)`);
      }
      
      // Check for React hooks usage
      if (content.includes('useState') || content.includes('useEffect')) {
        if (!content.includes("'use client'")) {
          testResults.componentIssues.push(`❌ ${component} uses hooks but missing 'use client' directive`);
        }
      }
    }
  });
}

/**
 * TEST 3: MISSING FEATURES ANALYSIS
 */
function testMissingFeatures() {
  console.log('🔍 Testing for Missing Features...');
  
  // Check if "Use My Location" functionality exists
  const mainPage = path.join(process.cwd(), 'src/app/page.tsx');
  const taxLookupForm = path.join(process.cwd(), 'src/components/TaxLookupForm.tsx');
  
  if (checkFileExists(mainPage)) {
    const content = readFileContent(mainPage);
    if (!content.includes('location') && !content.includes('geolocation')) {
      testResults.missingFeatures.push('❌ "Use My Location" button missing from main page');
    }
  }
  
  if (checkFileExists(taxLookupForm)) {
    const content = readFileContent(taxLookupForm);
    if (!content.includes('navigator.geolocation')) {
      testResults.missingFeatures.push('❌ Geolocation functionality missing from TaxLookupForm');
    }
  }
  
  // Check for mobile responsiveness
  const components = fs.readdirSync(path.join(process.cwd(), 'src/components'));
  let hasMobileClasses = false;
  
  components.forEach(component => {
    const content = readFileContent(path.join(process.cwd(), 'src/components', component));
    if (content && (content.includes('sm:') || content.includes('md:') || content.includes('lg:'))) {
      hasMobileClasses = true;
    }
  });
  
  if (!hasMobileClasses) {
    testResults.missingFeatures.push('⚠️ Limited mobile responsive classes detected');
  }
}

/**
 * TEST 4: API CONNECTIVITY ANALYSIS
 */
function testApiConfiguration() {
  console.log('🔍 Testing API Configuration...');
  
  // Check API client
  const apiClient = path.join(process.cwd(), 'src/lib/api.ts');
  if (!checkFileExists(apiClient)) {
    testResults.apiIssues.push('❌ API client missing (src/lib/api.ts)');
  } else {
    const content = readFileContent(apiClient);
    if (!content.includes('NEXT_PUBLIC_API_URL')) {
      testResults.apiIssues.push('❌ API URL configuration missing');
    }
  }
  
  // Check environment variables
  const envExample = path.join(process.cwd(), '.env.example');
  const envLocal = path.join(process.cwd(), '.env.local');
  
  if (!checkFileExists(envExample)) {
    testResults.configurationIssues.push('⚠️ .env.example missing for documentation');
  }
  
  if (!checkFileExists(envLocal)) {
    testResults.configurationIssues.push('⚠️ .env.local missing - API calls may fail');
  }
}

/**
 * TEST 5: PERFORMANCE AND OPTIMIZATION
 */
function testPerformanceOptimization() {
  console.log('🔍 Testing Performance Optimization...');
  
  // Check for image optimization
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    const images = files.filter(file => /\.(jpg|jpeg|png|gif|svg)$/i.test(file));
    if (images.length > 0) {
      testResults.performanceIssues.push(`⚠️ ${images.length} images in public directory - consider optimization`);
    }
  }
  
  // Check for bundle size issues
  const nextConfig = path.join(process.cwd(), 'next.config.js');
  if (checkFileExists(nextConfig)) {
    const content = readFileContent(nextConfig);
    if (!content.includes('compress') && !content.includes('optimize')) {
      testResults.performanceIssues.push('⚠️ Next.js optimization config missing');
    }
  }
}

/**
 * TEST 6: ACCESSIBILITY ANALYSIS
 */
function testAccessibility() {
  console.log('🔍 Testing Accessibility...');
  
  const components = fs.readdirSync(path.join(process.cwd(), 'src/components'));
  
  components.forEach(component => {
    const content = readFileContent(path.join(process.cwd(), 'src/components', component));
    if (content) {
      // Check for ARIA labels
      if (content.includes('<button') && !content.includes('aria-label')) {
        testResults.accessibilityIssues.push(`⚠️ ${component} buttons missing aria-label`);
      }
      
      // Check for alt text on images
      if (content.includes('<img') && !content.includes('alt=')) {
        testResults.accessibilityIssues.push(`❌ ${component} images missing alt text`);
      }
      
      // Check for keyboard navigation
      if (content.includes('onClick') && !content.includes('onKeyDown')) {
        testResults.accessibilityIssues.push(`⚠️ ${component} missing keyboard navigation support`);
      }
    }
  });
}

/**
 * MAIN TEST EXECUTION
 */
function runComprehensiveAnalysis() {
  console.log('🚀 Starting Comprehensive Tax Scanner v2 Analysis...\n');
  
  testBuildConfiguration();
  testComponentStructure();
  testMissingFeatures();
  testApiConfiguration();
  testPerformanceOptimization();
  testAccessibility();
  
  // Generate Report
  console.log('\n📊 COMPREHENSIVE ANALYSIS REPORT');
  console.log('=====================================\n');
  
  // Critical Issues (Must Fix)
  const criticalIssues = [
    ...testResults.buildIssues.filter(issue => issue.includes('❌')),
    ...testResults.componentIssues.filter(issue => issue.includes('❌')),
    ...testResults.apiIssues.filter(issue => issue.includes('❌')),
    ...testResults.missingFeatures.filter(issue => issue.includes('❌'))
  ];
  
  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES (Must Fix):');
    criticalIssues.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  // Warnings (Should Fix)
  const warnings = [
    ...testResults.buildIssues.filter(issue => issue.includes('⚠️')),
    ...testResults.componentIssues.filter(issue => issue.includes('⚠️')),
    ...testResults.configurationIssues,
    ...testResults.performanceIssues,
    ...testResults.accessibilityIssues.filter(issue => issue.includes('⚠️'))
  ];
  
  if (warnings.length > 0) {
    console.log('⚠️ WARNINGS (Should Fix):');
    warnings.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  // Summary
  console.log('📋 SUMMARY:');
  console.log(`  Critical Issues: ${criticalIssues.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Total Issues Found: ${criticalIssues.length + warnings.length}`);
  
  if (criticalIssues.length === 0 && warnings.length === 0) {
    console.log('  ✅ No issues found! Application appears healthy.');
  }
  
  return {
    critical: criticalIssues,
    warnings: warnings,
    total: criticalIssues.length + warnings.length
  };
}

// Export for use in other tests or direct execution
if (require.main === module) {
  runComprehensiveAnalysis();
}

module.exports = {
  runComprehensiveAnalysis,
  testResults
}; 