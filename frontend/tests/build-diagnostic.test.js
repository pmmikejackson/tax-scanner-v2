/**
 * Build Diagnostic Test Suite
 * 
 * Specifically tests for build failures, TypeScript errors, and deployment issues
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Test Build Process
 */
async function testBuildProcess() {
  console.log('🔧 Testing Build Process...\n');
  
  return new Promise((resolve) => {
    // Test the actual build command
    console.log('Running: npm run build');
    const buildProcess = exec('npm run build', { cwd: process.cwd() });
    
    let buildOutput = '';
    let buildErrors = '';
    
    buildProcess.stdout.on('data', (data) => {
      buildOutput += data;
      process.stdout.write(data);
    });
    
    buildProcess.stderr.on('data', (data) => {
      buildErrors += data;
      process.stderr.write(data);
    });
    
    buildProcess.on('close', (code) => {
      console.log(`\n📊 Build completed with exit code: ${code}\n`);
      
      const results = {
        exitCode: code,
        success: code === 0,
        output: buildOutput,
        errors: buildErrors,
        issues: []
      };
      
      // Analyze build output for specific issues
      if (code !== 0) {
        results.issues.push('❌ Build failed with non-zero exit code');
        
        // Common TypeScript errors
        if (buildErrors.includes('Type error')) {
          results.issues.push('❌ TypeScript type errors detected');
        }
        
        if (buildErrors.includes('Module not found')) {
          results.issues.push('❌ Missing module dependencies');
        }
        
        if (buildErrors.includes('ESLint')) {
          results.issues.push('⚠️ ESLint errors detected');
        }
        
        if (buildErrors.includes('out of memory') || buildErrors.includes('ENOMEM')) {
          results.issues.push('❌ Build process out of memory');
        }
        
        if (buildErrors.includes('ENOENT')) {
          results.issues.push('❌ File not found errors during build');
        }
      }
      
      resolve(results);
    });
  });
}

/**
 * Test TypeScript Configuration
 */
function testTypeScriptConfig() {
  console.log('🔍 Testing TypeScript Configuration...');
  
  const issues = [];
  
  // Check tsconfig.json
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    issues.push('❌ tsconfig.json missing');
  } else {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      if (!tsconfig.compilerOptions) {
        issues.push('❌ tsconfig.json missing compilerOptions');
      } else {
        if (!tsconfig.compilerOptions.strict) {
          issues.push('⚠️ TypeScript strict mode not enabled');
        }
        
        if (!tsconfig.compilerOptions.jsx) {
          issues.push('❌ JSX configuration missing in tsconfig.json');
        }
      }
    } catch (error) {
      issues.push('❌ tsconfig.json is invalid JSON');
    }
  }
  
  // Check for TypeScript errors in components
  const componentsDir = path.join(process.cwd(), 'src/components');
  if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));
    
    components.forEach(component => {
      const content = fs.readFileSync(path.join(componentsDir, component), 'utf8');
      
      // Check for common TypeScript issues
      if (content.includes(': any')) {
        issues.push(`⚠️ ${component} uses 'any' type`);
      }
      
      if (content.includes('// @ts-ignore')) {
        issues.push(`⚠️ ${component} has TypeScript suppression comments`);
      }
      
      // Check for proper imports
      if (content.includes('React') && !content.includes('import React')) {
        issues.push(`❌ ${component} uses React but missing import`);
      }
    });
  }
  
  return issues;
}

/**
 * Test Dependencies
 */
function testDependencies() {
  console.log('🔍 Testing Dependencies...');
  
  const issues = [];
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    issues.push('❌ package.json missing');
    return issues;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check for essential Next.js dependencies
  const requiredDeps = ['next', 'react', 'react-dom'];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      issues.push(`❌ Missing required dependency: ${dep}`);
    }
  });
  
  // Check for TypeScript dependencies
  if (!packageJson.devDependencies || (!packageJson.devDependencies.typescript && !packageJson.dependencies.typescript)) {
    issues.push('❌ TypeScript dependency missing');
  }
  
  // Check node_modules
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    issues.push('❌ node_modules directory missing - run npm install');
  }
  
  return issues;
}

/**
 * Main Build Diagnostic
 */
async function runBuildDiagnostic() {
  console.log('🚀 Starting Build Diagnostic...\n');
  
  const dependencyIssues = testDependencies();
  const typescriptIssues = testTypeScriptConfig();
  const buildResults = await testBuildProcess();
  
  console.log('\n📊 BUILD DIAGNOSTIC REPORT');
  console.log('============================\n');
  
  // All issues combined
  const allIssues = [
    ...dependencyIssues,
    ...typescriptIssues,
    ...buildResults.issues
  ];
  
  const criticalIssues = allIssues.filter(issue => issue.includes('❌'));
  const warnings = allIssues.filter(issue => issue.includes('⚠️'));
  
  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES:');
    criticalIssues.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️ WARNINGS:');
    warnings.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  console.log('📋 BUILD SUMMARY:');
  console.log(`  Build Success: ${buildResults.success ? '✅' : '❌'}`);
  console.log(`  Critical Issues: ${criticalIssues.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Build Exit Code: ${buildResults.exitCode}`);
  
  return {
    success: buildResults.success,
    critical: criticalIssues,
    warnings: warnings,
    buildOutput: buildResults.output,
    buildErrors: buildResults.errors
  };
}

// Export for use in other tests or direct execution
if (require.main === module) {
  runBuildDiagnostic().then(results => {
    process.exit(results.success ? 0 : 1);
  });
}

module.exports = {
  runBuildDiagnostic,
  testBuildProcess,
  testTypeScriptConfig,
  testDependencies
}; 