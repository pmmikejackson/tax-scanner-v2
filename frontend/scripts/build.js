#!/usr/bin/env node

/**
 * Custom build script that sets build-time environment variables,
 * updates changelog, and runs the Next.js build process
 * 
 * This ensures we have accurate build timestamps, version info, and documentation
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

/**
 * Update changelog with build information
 * This adds deployment timestamps to track when versions were actually deployed
 */
function updateChangelog() {
  try {
    const changelogPath = path.join(__dirname, '..', '..', 'CHANGELOG.md')
    
    if (fs.existsSync(changelogPath)) {
      let changelog = fs.readFileSync(changelogPath, 'utf8')
      
      // Look for the current version section
      const versionPattern = new RegExp(`## \\[${packageJson.version}\\] - (\\d{4}-\\d{2}-\\d{2})`)
      const match = changelog.match(versionPattern)
      
      if (match) {
        // Add deployment timestamp
        const deploymentNote = `\n### Deployed\n- **${new Date().toISOString().split('T')[0]} ${new Date().toISOString().split('T')[1].split('.')[0]}**: Production deployment completed\n`
        
        // Find the next version section or end of current version
        const nextVersionIndex = changelog.indexOf('\n## [', changelog.indexOf(match[0]) + 1)
        const insertIndex = nextVersionIndex === -1 ? changelog.length : nextVersionIndex
        
        // Insert deployment note if not already present
        if (!changelog.includes(`Production deployment completed`)) {
          changelog = changelog.slice(0, insertIndex) + deploymentNote + changelog.slice(insertIndex)
          fs.writeFileSync(changelogPath, changelog)
          console.log(`📋 Updated CHANGELOG.md with deployment timestamp`)
        }
      }
    }
  } catch (error) {
    console.warn('Could not update changelog:', error.message)
  }
}

// Update changelog before build
updateChangelog()

// Run Next.js build
try {
  console.log('\n🔨 Running Next.js build...')
  execSync('next build', { 
    stdio: 'inherit',
    env: { ...process.env }
  })
  
  console.log(`\n✅ Build completed successfully!`)
  console.log(`📦 Version ${packageJson.version} is ready for deployment`)
  console.log(`📋 Check CHANGELOG.md for release notes`)
} catch (error) {
  console.error('\n❌ Build failed:', error.message)
  process.exit(1)
} 