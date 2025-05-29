/**
 * Version API Endpoint
 * Returns current build version, build time, and deployment information
 * Used by VersionInfo component to display build details
 */

import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Read package.json to get current version
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    // Get build-time environment variables
    const buildTime = process.env.BUILD_TIME || new Date().toISOString()
    const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'unknown'
    const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'unknown'
    
    const versionInfo = {
      version: packageJson.version,
      buildTime: buildTime,
      environment: process.env.NODE_ENV || 'development',
      git: {
        commit: gitCommit.substring(0, 8), // Short commit hash
        branch: gitBranch
      },
      platform: {
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'local'
      }
    }

    return NextResponse.json(versionInfo)
  } catch (error) {
    console.error('Failed to generate version info:', error)
    
    // Return fallback version info
    return NextResponse.json({
      version: '0.1.0',
      buildTime: new Date().toISOString(),
      environment: 'unknown',
      git: {
        commit: 'unknown',
        branch: 'unknown'
      },
      platform: {
        vercel: false,
        region: 'unknown'
      }
    })
  }
} 