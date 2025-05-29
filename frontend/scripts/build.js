#!/usr/bin/env node

/**
 * Custom build script that sets build-time environment variables
 * and then runs the Next.js build process
 * 
 * This ensures we have accurate build timestamps and version info
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Set build time environment variable
process.env.BUILD_TIME = new Date().toISOString()

// Get git information if available
try {
  const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
  
  process.env.GIT_COMMIT = gitCommit
  process.env.GIT_BRANCH = gitBranch
} catch (error) {
  console.warn('Could not get git information:', error.message)
}

// Read current version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

console.log(`🚀 Building Tax Scanner v2 version ${packageJson.version}`)
console.log(`📅 Build time: ${process.env.BUILD_TIME}`)
console.log(`🌿 Git branch: ${process.env.GIT_BRANCH || 'unknown'}`)
console.log(`📝 Git commit: ${(process.env.GIT_COMMIT || 'unknown').substring(0, 8)}`)

// Run Next.js build
try {
  console.log('\n🔨 Running Next.js build...')
  execSync('next build', { 
    stdio: 'inherit',
    env: { ...process.env }
  })
  
  console.log(`\n✅ Build completed successfully!`)
  console.log(`📦 Version ${packageJson.version} is ready for deployment`)
} catch (error) {
  console.error('\n❌ Build failed:', error.message)
  process.exit(1)
} 