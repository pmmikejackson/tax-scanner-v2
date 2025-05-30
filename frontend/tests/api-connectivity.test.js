/**
 * API Connectivity Test Suite
 * 
 * Tests API endpoints, backend connectivity, and integration issues
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Test API Endpoint
 */
function testApiEndpoint(url, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          success: true,
          statusCode: res.statusCode,
          responseTime,
          data: data.slice(0, 500), // Limit data for logging
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        responseTime: timeout
      });
    });
  });
}

/**
 * Test Environment Configuration
 */
function testEnvironmentConfig() {
  console.log('🔍 Testing Environment Configuration...');
  
  const issues = [];
  
  // Check for environment files
  const envFiles = ['.env.local', '.env.development', '.env.production'];
  let hasEnvFile = false;
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      hasEnvFile = true;
      console.log(`  ✅ Found: ${file}`);
    }
  });
  
  if (!hasEnvFile) {
    issues.push('❌ No environment files found (.env.local, .env.development, .env.production)');
  }
  
  // Check API URL in Next.js config or environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    issues.push('❌ NEXT_PUBLIC_API_URL environment variable not set');
  } else {
    console.log(`  ✅ API URL configured: ${apiUrl}`);
  }
  
  return { issues, apiUrl };
}

/**
 * Test API Client Configuration
 */
function testApiClientConfig() {
  console.log('🔍 Testing API Client Configuration...');
  
  const issues = [];
  
  // Check for API client file
  const apiClientPath = path.join(process.cwd(), 'src/lib/api.ts');
  if (!fs.existsSync(apiClientPath)) {
    issues.push('❌ API client file missing (src/lib/api.ts)');
    return issues;
  }
  
  const apiClientContent = fs.readFileSync(apiClientPath, 'utf8');
  
  // Check for proper API URL configuration
  if (!apiClientContent.includes('NEXT_PUBLIC_API_URL')) {
    issues.push('❌ API client not using NEXT_PUBLIC_API_URL');
  }
  
  // Check for error handling
  if (!apiClientContent.includes('catch') && !apiClientContent.includes('error')) {
    issues.push('⚠️ API client missing error handling');
  }
  
  // Check for CORS handling
  if (!apiClientContent.includes('cors') && !apiClientContent.includes('headers')) {
    issues.push('⚠️ API client may have CORS issues');
  }
  
  return issues;
}

/**
 * Test Backend Connectivity
 */
async function testBackendConnectivity(apiUrl) {
  console.log('🔍 Testing Backend Connectivity...');
  
  if (!apiUrl) {
    return ['❌ Cannot test backend - API URL not configured'];
  }
  
  const issues = [];
  const endpoints = [
    '/health',
    '/api/health',
    '/tax/states',
    '/api/tax/states'
  ];
  
  console.log(`  Testing connectivity to: ${apiUrl}`);
  
  for (const endpoint of endpoints) {
    const fullUrl = `${apiUrl}${endpoint}`;
    console.log(`  Testing: ${endpoint}`);
    
    const result = await testApiEndpoint(fullUrl);
    
    if (result.success) {
      if (result.statusCode === 200) {
        console.log(`    ✅ ${endpoint} - OK (${result.responseTime}ms)`);
        return []; // Found working endpoint
      } else {
        console.log(`    ⚠️ ${endpoint} - Status ${result.statusCode}`);
      }
    } else {
      console.log(`    ❌ ${endpoint} - ${result.error}`);
    }
  }
  
  issues.push('❌ No working API endpoints found');
  issues.push('⚠️ Backend may be down or unreachable');
  
  return issues;
}

/**
 * Test CORS Configuration
 */
async function testCorsConfiguration(apiUrl) {
  console.log('🔍 Testing CORS Configuration...');
  
  if (!apiUrl) {
    return ['❌ Cannot test CORS - API URL not configured'];
  }
  
  const issues = [];
  
  // Test preflight request
  const testUrl = `${apiUrl}/api/tax/states`;
  
  return new Promise((resolve) => {
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const protocol = testUrl.startsWith('https') ? https : http;
    const req = protocol.request(testUrl, options, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };
      
      if (!corsHeaders['access-control-allow-origin']) {
        issues.push('❌ CORS Access-Control-Allow-Origin header missing');
      }
      
      if (!corsHeaders['access-control-allow-methods']) {
        issues.push('⚠️ CORS Access-Control-Allow-Methods header missing');
      }
      
      if (corsHeaders['access-control-allow-origin'] === '*') {
        issues.push('⚠️ CORS configured to allow all origins (security risk)');
      }
      
      console.log(`  CORS Headers:`, corsHeaders);
      resolve(issues);
    });
    
    req.on('error', (error) => {
      issues.push(`❌ CORS test failed: ${error.message}`);
      resolve(issues);
    });
    
    req.setTimeout(5000, () => {
      issues.push('❌ CORS test timeout');
      resolve(issues);
    });
    
    req.end();
  });
}

/**
 * Test Tax API Functionality
 */
async function testTaxApiEndpoints(apiUrl) {
  console.log('🔍 Testing Tax API Endpoints...');
  
  if (!apiUrl) {
    return ['❌ Cannot test Tax API - API URL not configured'];
  }
  
  const issues = [];
  
  // Test supported states endpoint
  const statesResult = await testApiEndpoint(`${apiUrl}/api/tax/states`);
  if (!statesResult.success) {
    issues.push('❌ Tax states endpoint not accessible');
  } else if (statesResult.statusCode !== 200) {
    issues.push(`❌ Tax states endpoint returned ${statesResult.statusCode}`);
  } else {
    try {
      const statesData = JSON.parse(statesResult.data);
      if (!Array.isArray(statesData) && !statesData.states) {
        issues.push('❌ Tax states endpoint returns invalid format');
      } else {
        console.log('  ✅ Tax states endpoint working');
      }
    } catch (error) {
      issues.push('❌ Tax states endpoint returns invalid JSON');
    }
  }
  
  // Test tax lookup endpoint with sample data
  const taxLookupResult = await testApiEndpoint(`${apiUrl}/api/tax/lookup?address=1234 Main St&city=Austin&state=TX&zip=78701`);
  if (taxLookupResult.success && taxLookupResult.statusCode === 200) {
    console.log('  ✅ Tax lookup endpoint working');
  } else {
    issues.push('⚠️ Tax lookup endpoint may have issues');
  }
  
  return issues;
}

/**
 * Main API Connectivity Test
 */
async function runApiConnectivityTest() {
  console.log('🚀 Starting API Connectivity Test...\n');
  
  const envConfig = testEnvironmentConfig();
  const clientIssues = testApiClientConfig();
  
  let backendIssues = [];
  let corsIssues = [];
  let taxApiIssues = [];
  
  if (envConfig.apiUrl) {
    backendIssues = await testBackendConnectivity(envConfig.apiUrl);
    corsIssues = await testCorsConfiguration(envConfig.apiUrl);
    taxApiIssues = await testTaxApiEndpoints(envConfig.apiUrl);
  }
  
  console.log('\n📊 API CONNECTIVITY REPORT');
  console.log('============================\n');
  
  const allIssues = [
    ...envConfig.issues,
    ...clientIssues,
    ...backendIssues,
    ...corsIssues,
    ...taxApiIssues
  ];
  
  const criticalIssues = allIssues.filter(issue => issue.includes('❌'));
  const warnings = allIssues.filter(issue => issue.includes('⚠️'));
  
  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL API ISSUES:');
    criticalIssues.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️ API WARNINGS:');
    warnings.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  console.log('📋 API SUMMARY:');
  console.log(`  API URL: ${envConfig.apiUrl || 'Not configured'}`);
  console.log(`  Critical Issues: ${criticalIssues.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Backend Accessible: ${backendIssues.length === 0 ? '✅' : '❌'}`);
  
  return {
    apiUrl: envConfig.apiUrl,
    critical: criticalIssues,
    warnings: warnings,
    backendAccessible: backendIssues.length === 0
  };
}

// Export for use in other tests or direct execution
if (require.main === module) {
  runApiConnectivityTest().then(results => {
    process.exit(results.critical.length > 0 ? 1 : 0);
  });
}

module.exports = {
  runApiConnectivityTest,
  testApiEndpoint,
  testEnvironmentConfig,
  testBackendConnectivity,
  testCorsConfiguration
}; 