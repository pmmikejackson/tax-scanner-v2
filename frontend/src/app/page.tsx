'use client'

import { useState, useEffect } from 'react'
import USStatesMap from '../components/USStatesMap'
import StateDetailView from '../components/StateDetailView'
import { apiClient } from '../lib/api'

interface SupportedState {
  code: string
  name: string
}

export default function HomePage() {
  const [supportedStates, setSupportedStates] = useState<SupportedState[]>([])
  const [selectedState, setSelectedState] = useState<{ code: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSupportedStates() {
      try {
        const states = await apiClient.getStates()
        // Filter out any states with undefined code or name
        const validStates = states
          .filter(state => state.code && state.name)
          .map(state => ({ 
            code: state.code as string, 
            name: state.name as string 
          }))
        setSupportedStates(validStates)
      } catch (error) {
        console.error('Failed to fetch supported states:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupportedStates()
  }, [])

  const handleStateSelect = (stateCode: string, stateName: string) => {
    setSelectedState({ code: stateCode, name: stateName })
  }

  const handleBackToMap = () => {
    setSelectedState(null)
  }

  /**
   * Use My Location functionality
   * Gets user's GPS coordinates and automatically navigates to tax lookup
   */
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          console.log('📍 Location detected:', latitude, longitude)
          
          // Geocode the coordinates to get state information
          const locationData = await apiClient.geocodeAddress(`${latitude},${longitude}`)
          console.log('📍 Geocoded location:', locationData)
          
          // Find matching supported state
          const matchingState = supportedStates.find(state => 
            state.name.toLowerCase() === locationData.state.toLowerCase() ||
            state.code.toLowerCase() === locationData.state.toLowerCase()
          )
          
          if (matchingState) {
            console.log('📍 Found supported state:', matchingState)
            handleStateSelect(matchingState.code, matchingState.name)
          } else {
            setLocationError(`Sorry, ${locationData.state} is not supported yet. Please select a state manually.`)
          }
        } catch (error) {
          console.error('Geocoding failed:', error)
          setLocationError('Unable to determine your location. Please select a state manually.')
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Unable to get your location. '
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
            break
        }
        
        setLocationError(errorMessage)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  if (selectedState) {
    return (
      <StateDetailView
        stateCode={selectedState.code}
        stateName={selectedState.name}
        onBack={handleBackToMap}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tax Scanner v2
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Find sales tax rates for restaurants across America
          </p>
          <p className="text-lg text-gray-500 mb-6">
            Click on a supported state to get started
          </p>
          
          {/* Use My Location Button */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Use my current location to find tax rates"
            >
              {isLocating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Use My Location</span>
                </>
              )}
            </button>
            
            {locationError && (
              <div className="max-w-md px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {locationError}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="max-w-6xl mx-auto mb-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 text-lg">Loading map...</span>
            </div>
          ) : (
            <USStatesMap
              onStateSelect={handleStateSelect}
              supportedStates={supportedStates}
              className="mx-auto"
            />
          )}
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Tax Scanner v2?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accurate Data</h3>
              <p className="text-gray-600">Official government tax rates from state comptroller offices</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Instant tax lookups with comprehensive city and county coverage</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurant Focus</h3>
              <p className="text-gray-600">Special rates for food vs general merchandise where applicable</p>
            </div>
          </div>
        </div>

        {/* Currently Supported */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Currently Supported States</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {supportedStates.map((state) => (
              <div
                key={state.code}
                className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full border border-emerald-200"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-medium">{state.name}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 mb-4">
            More states coming soon! We're working to expand coverage across all 50 states.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/guide"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              User Guide
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11H3m0 0l3-3m-3 3l3 3m8-9v6m0 0H9" />
              </svg>
              Back to Map
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 