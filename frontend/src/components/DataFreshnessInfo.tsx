'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import apiClient, { DataStatus } from '@/lib/api'

export default function DataFreshnessInfo() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load data status on component mount
  useEffect(() => {
    loadDataStatus()
  }, [])

  const loadDataStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const status = await apiClient.getDataStatus()
      setDataStatus(status)
    } catch (err) {
      console.error('Error loading data status:', err)
      setError('Failed to load data status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    
    try {
      // Check if there's an import endpoint we could call
      // For now, just refresh the status
      await loadDataStatus()
    } catch (error) {
      console.error('Failed to refresh data:', error)
      setError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return { bg: 'bg-green-400', text: 'text-green-600', label: 'Current' }
      case 'partial_success':
        return { bg: 'bg-yellow-400', text: 'text-yellow-600', label: 'Partial' }
      case 'error':
        return { bg: 'bg-red-400', text: 'text-red-600', label: 'Error' }
      default:
        return { bg: 'bg-gray-400', text: 'text-gray-600', label: 'Unknown' }
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Data Freshness
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const statusColors = dataStatus ? getStatusColor(dataStatus.status) : getStatusColor('unknown')

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Data Freshness
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {dataStatus ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(dataStatus.lastUpdated)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 ${statusColors.bg} rounded-full`}></div>
                    <span className={`text-sm ${statusColors.text}`}>
                      {statusColors.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Records:</span>
                <span className="font-medium">{dataStatus.recordCount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Source:</span>
                <span className="font-medium">{dataStatus.source}</span>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>No data status available</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="btn-secondary w-full"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>
              Tax data is sourced directly from the Texas Comptroller of Public Accounts 
              EDI files and updated quarterly to ensure accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 