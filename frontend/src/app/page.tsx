'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import TaxLookupForm from '@/components/TaxLookupForm'
import TaxResultsCard from '@/components/TaxResultsCard'
import DataFreshnessInfo from '@/components/DataFreshnessInfo'

interface TaxData {
  state: string
  county: string
  city: string
  stateTaxRate: number
  countyTaxRate: number
  cityTaxRate: number
  totalTaxRate: number
  lastUpdated: string
}

export default function HomePage() {
  const [taxData, setTaxData] = useState<TaxData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Get user's location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        })
      })
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      
      // Reverse geocode to get address and lookup tax
      await reverseGeocodeAndLookupTax(position.coords.latitude, position.coords.longitude)
    } catch (err) {
      console.error('Geolocation error:', err)
      setError('Unable to get your location. Please select manually.')
    } finally {
      setIsLoading(false)
    }
  }

  const reverseGeocodeAndLookupTax = async (lat: number, lng: number) => {
    try {
      // This would call your backend API to reverse geocode and get tax data
      const response = await fetch(`/api/tax/location?lat=${lat}&lng=${lng}`)
      if (!response.ok) throw new Error('Failed to get tax data')
      
      const data = await response.json()
      setTaxData(data)
      setError(null)
    } catch (err) {
      console.error('Tax lookup error:', err)
      setError('Failed to lookup tax data for your location.')
    }
  }

  const handleManualLookup = async (state: string, county: string, city: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tax/lookup?state=${state}&county=${county}&city=${city}`)
      if (!response.ok) throw new Error('Failed to get tax data')
      
      const data = await response.json()
      setTaxData(data)
    } catch (err) {
      console.error('Manual lookup error:', err)
      setError('Failed to lookup tax data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Restaurant Sales Tax Lookup
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get accurate sales tax rates for your restaurant by state, county, and city. 
          Currently supporting Texas with plans to expand nationwide.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tax Lookup Form */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Find Tax Rates
            </h3>
          </div>
          <div className="p-6">
            {/* Auto-detect location button */}
            <div className="mb-6">
              <button
                onClick={detectLocation}
                disabled={isLoading}
                className="btn-primary w-full mb-4"
              >
                <MapPinIcon className="w-5 h-5 mr-2" />
                {isLoading ? 'Detecting Location...' : 'Use My Current Location'}
              </button>
              <div className="text-center text-gray-500 text-sm">
                or select manually below
              </div>
            </div>

            {/* Manual selection form */}
            <TaxLookupForm 
              onLookup={handleManualLookup}
              isLoading={isLoading}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {taxData && (
            <TaxResultsCard taxData={taxData} />
          )}
          
          <DataFreshnessInfo />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-16 bg-blue-50 rounded-lg p-8">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          About Tax Scanner
        </h3>
        <div className="text-blue-800 space-y-3">
          <p>
            Tax Scanner provides up-to-date sales tax information for restaurant owners and managers. 
            Our data is sourced directly from state comptroller offices to ensure accuracy.
          </p>
          <p>
            <strong>Currently supporting:</strong> Texas (with county and municipal taxes)
          </p>
          <p>
            <strong>Coming soon:</strong> Additional states with comprehensive tax breakdowns
          </p>
        </div>
      </div>
    </div>
  )
} 