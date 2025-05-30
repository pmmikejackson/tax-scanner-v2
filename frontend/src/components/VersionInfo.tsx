/**
 * Version Information Component
 * Displays current build version and deployment information
 * Helps track which version is deployed and when it was built
 */

'use client'

import { useState, useEffect } from 'react'

interface VersionInfo {
  version: string
  buildTime: string
  environment: string
}

export default function VersionInfo() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we only render on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Get version info from package.json and environment
    const getVersionInfo = async () => {
      try {
        // In production, we'll get this from a generated file
        // For now, we'll use environment variables and package.json
        const response = await fetch('/api/version').catch(() => null)
        
        if (response && response.ok) {
          const data = await response.json()
          setVersionInfo(data)
        } else {
          // Fallback to client-side version detection
          setVersionInfo({
            version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.3',
            buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
          })
        }
      } catch (error) {
        console.error('Failed to load version info:', error)
        // Fallback version info - ALWAYS show something
        setVersionInfo({
          version: '0.1.3',
          buildTime: new Date().toISOString(),
          environment: 'unknown'
        })
      }
    }

    getVersionInfo()
  }, [isClient])

  // Don't render anything on server or before client hydration
  if (!isClient || !versionInfo) return null

  // Format build time for display
  const buildDate = new Date(versionInfo.buildTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-75 hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-3">
          <div>
            <span className="font-semibold">v{versionInfo.version}</span>
          </div>
          <div className="text-gray-300">
            {buildDate}
          </div>
          <div className={`px-2 py-1 rounded text-xs ${
            versionInfo.environment === 'production' 
              ? 'bg-green-600' 
              : versionInfo.environment === 'development'
              ? 'bg-blue-600'
              : 'bg-yellow-600'
          }`}>
            {versionInfo.environment.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
} 