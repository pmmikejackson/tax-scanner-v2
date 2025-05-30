'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import TaxLookupForm from '@/components/TaxLookupForm'
import TaxResultsCard from '@/components/TaxResultsCard'
import DataFreshnessInfo from '@/components/DataFreshnessInfo'
import apiClient, { TaxData } from '@/lib/api'

export default function HomePage() {
  // COMPONENT STATE
  const [taxData, setTaxData] = useState<TaxData | null>(null) // Tax rates result
  const [isLoading, setIsLoading] = useState(false) // Loading state for API calls
  const [error, setError] = useState<string | null>(null) // Error messages for user
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null) // GPS coordinates
  // Location detected from GPS + geocoding - passed to form to auto-populate dropdowns
  const [detectedLocation, setDetectedLocation] = useState<{state: string, county: string, city: string} | undefined>(undefined)

  // LOCATION DETECTION FLOW
  /**
   * Initiates GPS location detection and subsequent geocoding
   * Flow: GPS coordinates → Geocoding API → Location names → Tax lookup
   */
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Get GPS coordinates from browser
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // Cache for 10 minutes
        })
      })
      
      console.log(`Got coordinates: ${position.coords.latitude}, ${position.coords.longitude}`)
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      
      // Convert coordinates to location names and lookup tax
      await geocodeAndLookupTax(position.coords.latitude, position.coords.longitude)
    } catch (err) {
      console.error('Geolocation error:', err)
      setError('Unable to get your location. Please select manually.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Converts GPS coordinates to location names and gets tax rates
   * @param lat - Latitude from GPS
   * @param lng - Longitude from GPS
   * Flow: Coordinates → Google Maps Geocoding → Location names → Tax rates → Update form
   */
  const geocodeAndLookupTax = async (lat: number, lng: number) => {
    try {
      console.log(`Geocoding coordinates: ${lat}, ${lng}`)
      
      // Use Google Maps Geocoding API to convert coordinates to location names
      const locationData = await apiClient.geocodeAddress(`${lat},${lng}`)
      console.log('Geocoding result:', locationData)
      
      if (locationData) {
        // Keep the original state code for API calls
        const stateCode = locationData.state
        
        // Convert state code to full name for UI display only
        let stateName = locationData.state
        if (locationData.state === 'TX') {
          stateName = 'Texas'
        }
        // Add more state conversions as needed when expanding beyond Texas
        
        console.log(`Looking up tax rates for: ${stateCode}, ${locationData.county}, ${locationData.city}`)
        
        try {
          // IMPORTANT: Send state CODE to backend API, not full name
          const taxData = await apiClient.getTaxRates(stateCode, locationData.county, locationData.city)
          
          // Update results and form
          setTaxData(taxData)
          setError(null)
          
          // IMPORTANT: Set detected location with full state name for UI display
          // This triggers the TaxLookupForm to update its selections
          console.log('🔄 Setting detected location for form auto-population:', {
            state: stateName,
            county: locationData.county,
            city: locationData.city
          })
          setDetectedLocation({
            state: stateName,           // Use converted name for UI, not code
            county: locationData.county,
            city: locationData.city
          })
        } catch (taxLookupError) {
          console.error('Tax lookup failed for detected location:', taxLookupError)
          
          // Show specific error with the location that failed
          const locationStr = `${locationData.city}, ${locationData.county}, ${stateName}`;
          setError(`Tax rates not found for "${locationStr}". This location might not be in our database yet. Please try selecting manually from the dropdowns below, or try a nearby city.`)
          
          // Still set the detected location so form can auto-populate for manual correction
          setDetectedLocation({
            state: stateName,
            county: locationData.county,
            city: locationData.city
          })
        }
      } else {
        setError('Could not determine location from coordinates. Please select manually.')
      }
    } catch (err) {
      console.error('Geocoding and tax lookup error:', err)
      setError('Failed to detect your location. Please try manual selection.')
    }
  }

  /**
   * Handles manual tax rate lookup from form submission
   * @param state - State name (e.g., "Texas")
   * @param county - County name (e.g., "Rockwall")
   * @param city - City name (e.g., "Rockwall")
   */
  const handleManualLookup = async (state: string, county: string, city: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Convert state name back to state code for API call
      // The form sends full names but the backend expects state codes
      let stateCode = state
      if (state === 'Texas') {
        stateCode = 'TX'
      }
      // Add more state conversions as needed when expanding beyond Texas
      
      console.log(`Manual lookup: Converting "${state}" to "${stateCode}" for API call`)
      
      const data = await apiClient.getTaxRates(stateCode, county, city)
      setTaxData(data)
    } catch (err) {
      console.error('Manual lookup error:', err)
      
      // Provide more helpful error message for missing tax data
      const errorMessage = err instanceof Error && err.message.includes('Tax rates not found') 
        ? `No tax data found for ${city}, ${county}. This city may not have municipal taxes or data may be unavailable. Try selecting a nearby larger city in the same county for reference.

💡 **Suggestion:** Many small towns use the county tax rate. Try selecting the county seat or largest city in ${county} County for a similar rate.`
        : 'Failed to lookup tax data. Please try again.'
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Clears the detected location - called when user manually interacts with form
   * This prevents GPS location from overriding manual selections
   */
  const clearDetectedLocation = () => {
    console.log('🧹 Clearing detected location to allow manual form interaction')
    setDetectedLocation(undefined)
    // Also clear any tax data to prevent confusion
    setTaxData(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Restaurant Sales Tax Lookup
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Get accurate sales tax rates for your restaurant by state, county, and city. 
          Currently supporting Texas with official government data from the Texas Comptroller.
        </p>
        <Link 
          href="/guide"
          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
        >
          <BookOpenIcon className="w-5 h-5 mr-2" />
          View User Guide
        </Link>
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
              selectedLocation={detectedLocation}
              onClearSelectedLocation={clearDetectedLocation}
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
            Our data is sourced directly from the Texas Comptroller's office to ensure accuracy.
          </p>
          <p>
            <strong>Currently supporting:</strong> Texas with {taxData ? 'thousands of' : 'comprehensive'} locations including county and municipal taxes
          </p>
          <p>
            <strong>Data source:</strong> Official Texas Comptroller EDI files, updated quarterly
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-blue-200">
          <Link 
            href="/guide"
            className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium"
          >
            <BookOpenIcon className="w-5 h-5 mr-2" />
            Need help? Check out our user guide
          </Link>
        </div>
      </div>
    </div>
  )
} 