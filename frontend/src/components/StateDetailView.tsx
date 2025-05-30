'use client'

import { useState, useEffect } from 'react'
import TaxResultsCard from './TaxResultsCard'
import { apiClient } from '../lib/api'
import type { TaxData, LocationOption } from '../lib/api'

interface StateDetailViewProps {
  stateCode: string
  stateName: string
  onBack: () => void
}

export default function StateDetailView({ stateCode, stateName, onBack }: StateDetailViewProps) {
  const [counties, setCounties] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])
  const [selectedCounty, setSelectedCounty] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [taxData, setTaxData] = useState<TaxData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load counties when component mounts
  useEffect(() => {
    loadCounties()
  }, [stateCode])

  // Load cities when county changes
  useEffect(() => {
    if (selectedCounty) {
      loadCities()
    } else {
      setCities([])
      setSelectedCity('')
    }
  }, [selectedCounty])

  // Look up tax data when city changes
  useEffect(() => {
    if (selectedCity) {
      lookupTaxData()
    } else {
      setTaxData(null)
    }
  }, [selectedCity])

  const loadCounties = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.getCounties(stateCode)
      setCounties(data)
    } catch (err) {
      setError('Failed to load counties')
      console.error('Error loading counties:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Find the actual county name for API call
      const selectedCountyObj = counties.find(c => c.value === selectedCounty)
      if (selectedCountyObj && selectedCountyObj.name) {
        const data = await apiClient.getCities(stateCode, selectedCountyObj.name)
        setCities(data)
      }
    } catch (err) {
      setError('Failed to load cities')
      console.error('Error loading cities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const lookupTaxData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Find the actual names for API call
      const selectedCountyObj = counties.find(c => c.value === selectedCounty)
      const selectedCityObj = cities.find(c => c.value === selectedCity)
      
      if (selectedCountyObj?.name && selectedCityObj?.name) {
        const data = await apiClient.getTaxRates(stateName, selectedCountyObj.name, selectedCityObj.name)
        setTaxData(data)
      }
    } catch (err) {
      setError('Failed to lookup tax data')
      console.error('Error looking up tax data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Map
        </button>
        <div className="text-sm text-gray-500">|</div>
        <h1 className="text-3xl font-bold text-gray-900">{stateName}</h1>
      </div>

      {/* Selection Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Select County and City</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* County Selection */}
          <div className="space-y-2">
            <label htmlFor="county" className="block text-sm font-medium text-gray-700">
              County
            </label>
            <select
              id="county"
              value={selectedCounty}
              onChange={(e) => {
                setSelectedCounty(e.target.value)
                setSelectedCity('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || counties.length === 0}
            >
              <option value="">Select a county...</option>
              {counties.map((county) => (
                <option key={county.value} value={county.value}>
                  {county.label}
                </option>
              ))}
            </select>
            {counties.length === 0 && !isLoading && (
              <p className="text-sm text-gray-500">No counties available</p>
            )}
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !selectedCounty || cities.length === 0}
            >
              <option value="">
                {!selectedCounty ? 'Select a county first...' : 'Select a city...'}
              </option>
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            {selectedCounty && cities.length === 0 && !isLoading && (
              <p className="text-sm text-gray-500">No cities available for this county</p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-4 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Tax Results */}
      {taxData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Tax Information</h2>
          <TaxResultsCard taxData={taxData} />
        </div>
      )}

      {/* State Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">About {stateName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>State Code:</strong> {stateCode}</p>
            <p><strong>Counties Available:</strong> {counties.length}</p>
          </div>
          <div>
            <p><strong>Cities in Selected County:</strong> {cities.length}</p>
            {stateCode === 'IL' && (
              <p><strong>Tax System:</strong> Dual-rate (General vs Food/Medicine)</p>
            )}
            {stateCode === 'TX' && (
              <p><strong>Tax System:</strong> Single-rate (Uniform)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 