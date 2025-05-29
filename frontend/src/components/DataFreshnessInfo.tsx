'use client'

import { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function DataFreshnessInfo() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2024-01-15')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Call API to refresh data
      const response = await fetch('/api/tax/refresh', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setLastUpdated(data.lastUpdated)
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Data Freshness
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Last Updated
              </p>
              <p className="text-sm text-gray-600">
                {new Date(lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-600">Current</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary w-full"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Tax Data'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>
              Tax data is sourced directly from the Texas Comptroller of Public Accounts 
              and updated regularly to ensure accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 