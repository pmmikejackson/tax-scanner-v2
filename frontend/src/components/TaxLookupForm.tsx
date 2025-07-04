'use client'

import { useState, useEffect } from 'react'
import apiClient, { LocationOption } from '@/lib/api'

interface TaxLookupFormProps {
  onLookup: (state: string, county: string, city: string) => void
  isLoading: boolean
  // Optional location data from parent component (used when location detection succeeds)
  // This allows the form to auto-populate dropdowns with detected location
  selectedLocation?: {
    state: string
    county: string
    city: string
  }
  // Callback to clear selectedLocation when user manually interacts with form
  onClearSelectedLocation?: () => void
}

export default function TaxLookupForm({ onLookup, isLoading, selectedLocation, onClearSelectedLocation }: TaxLookupFormProps) {
  // Form state - stores the selected values for dropdowns
  const [selectedState, setSelectedState] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  
  // Data arrays populated from API calls
  const [states, setStates] = useState<LocationOption[]>([])
  const [counties, setCounties] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])
  
  // Loading and error state for API calls
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load states on component mount
  useEffect(() => {
    loadStates()
  }, [])

  // LOCATION DETECTION INTEGRATION
  // When parent component detects user location via GPS/geocoding,
  // automatically update form selections to match detected location
  useEffect(() => {
    console.log('📝 TaxLookupForm received selectedLocation:', selectedLocation)
    console.log('📝 States array length:', states.length)
    
    // If selectedLocation is cleared (undefined), reset form to allow manual interaction
    if (selectedLocation === undefined) {
      console.log('📝 selectedLocation cleared - resetting form for manual interaction')
      setSelectedState('')
      setSelectedCounty('')
      setSelectedCity('')
      setCounties([])
      setCities([])
      return
    }
    
    if (selectedLocation && states.length > 0) {
      const state = states.find(s => s.name === selectedLocation.state)
      console.log('📝 Looking for state name:', selectedLocation.state, 'Found:', state)
      
      if (state) {
        // Clear existing selections first to ensure clean state
        setSelectedCounty('')
        setSelectedCity('')
        setCounties([])
        setCities([])
        
        console.log('📝 Setting selectedState to:', state.value)
        setSelectedState(state.value)
        // Note: counties and cities will load automatically via other effects
      }
    }
  }, [selectedLocation, states])

  // Auto-select county when it becomes available after location detection
  // This runs after counties are loaded and we have a selectedLocation
  useEffect(() => {
    console.log('📝 County effect triggered - selectedLocation:', selectedLocation?.county, 'counties:', counties.length)
    
    if (selectedLocation && counties.length > 0) {
      console.log('📝 Looking for county:', selectedLocation.county)
      const county = counties.find(c => c.name === selectedLocation.county)
      console.log('📝 Found county:', county)
      console.log('📝 Available counties:', counties.map(c => c.name))
      
      if (county) {
        setSelectedCounty(county.value)
        console.log('📝 Setting county to:', county.value)
        // Clear cities to ensure clean state
        setCities([])
        setSelectedCity('')
      } else {
        console.warn('📝 County not found in dropdown options:', selectedLocation.county)
      }
    }
  }, [selectedLocation, counties])

  // Auto-select city when it becomes available after location detection
  // This runs after cities are loaded and we have a selectedLocation
  useEffect(() => {
    console.log('📝 City effect triggered - selectedLocation:', selectedLocation?.city, 'cities:', cities.length)
    
    if (selectedLocation && cities.length > 0) {
      console.log('📝 Looking for city:', selectedLocation.city)
      const city = cities.find(c => c.name === selectedLocation.city)
      console.log('📝 Found city:', city)
      console.log('📝 Available cities:', cities.map(c => c.name))
      
      if (city) {
        setSelectedCity(city.value)
        console.log('📝 Setting city to:', city.value)
      } else {
        console.warn('📝 City not found in dropdown options:', selectedLocation.city)
      }
    }
  }, [selectedLocation, cities])

  // Load counties when state changes (both manual selection and auto-selection)
  useEffect(() => {
    if (selectedState) {
      loadCounties(selectedState)
    } else {
      // Clear dependent dropdowns when no state selected
      setCounties([])
      setCities([])
      setSelectedCounty('')
      setSelectedCity('')
    }
  }, [selectedState])

  // Load cities when county changes (both manual selection and auto-selection)
  useEffect(() => {
    if (selectedState && selectedCounty) {
      loadCities(selectedState, selectedCounty)
    } else {
      // Clear cities when no county selected
      setCities([])
      setSelectedCity('')
    }
  }, [selectedState, selectedCounty])

  // API FUNCTIONS - Load data from backend
  
  /**
   * Loads all available states from the backend API
   * Called once on component mount
   */
  const loadStates = async () => {
    try {
      setIsLoadingData(true)
      setError(null)
      const statesData = await apiClient.getStates()
      setStates(statesData)
    } catch (err) {
      console.error('Error loading states:', err)
      setError('Failed to load states. Please refresh the page.')
    } finally {
      setIsLoadingData(false)
    }
  }

  /**
   * Loads counties for a specific state
   * @param stateCode - State code (e.g., "TX")
   * Clears existing county/city selections when called
   */
  const loadCounties = async (stateCode: string) => {
    try {
      setIsLoadingData(true)
      setError(null)
      console.log('📝 Loading counties for state:', stateCode)
      const countiesData = await apiClient.getCounties(stateCode)
      console.log('📝 Loaded counties:', countiesData.length, 'counties:', countiesData.map(c => c.name))
      setCounties(countiesData)
      // Clear dependent selections when counties reload
      setSelectedCounty('')
      setSelectedCity('')
    } catch (err) {
      console.error('Error loading counties:', err)
      setError('Failed to load counties. Please try again.')
      setCounties([])
    } finally {
      setIsLoadingData(false)
    }
  }

  /**
   * Loads cities for a specific county within a state
   * @param stateCode - State code (e.g., "TX")
   * @param countyValue - Processed county value from dropdown (e.g., "rockwall")
   * 
   * IMPORTANT: This function resolves the actual county name from the counties array
   * because the API expects the real county name (e.g., "Rockwall") but the dropdown
   * stores a processed value (e.g., "rockwall" - lowercase, no spaces)
   */
  const loadCities = async (stateCode: string, countyValue: string) => {
    try {
      setIsLoadingData(true)
      setError(null)
      
      // DEBUG: Log counties array and search parameters
      console.log('Counties array:', counties)
      console.log('Looking for county with value:', countyValue)
      
      // CRITICAL FIX: Convert processed county value back to actual county name
      // Counties dropdown stores processed values like "rockwall" but API needs "Rockwall"
      const county = counties.find(c => c.value === countyValue)
      console.log('Found county object:', county)
      
      const actualCountyName = county?.name || countyValue
      
      console.log(`Loading cities for state: ${stateCode}, county: ${actualCountyName} (value: ${countyValue})`)
      
      // Call API with actual county name, not processed value
      const citiesData = await apiClient.getCities(stateCode, actualCountyName)
      console.log(`Loaded ${citiesData.length} cities:`, citiesData)
      
      setCities(citiesData)
      setSelectedCity('') // Clear city selection when cities reload
    } catch (err) {
      console.error('Error loading cities:', err)
      const errorMsg = `Failed to load cities for ${countyValue}. Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      setError(errorMsg)
      
      setCities([])
    } finally {
      setIsLoadingData(false)
    }
  }

  /**
   * Handles form submission for manual tax rate lookup
   * Converts dropdown values back to actual names before calling parent's onLookup
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedState && selectedCounty && selectedCity) {
      // Convert stored values back to actual names for API call
      // Dropdowns store processed values but API expects real names
      const stateName = states.find(s => s.value === selectedState)?.name || selectedState
      const countyName = counties.find(c => c.value === selectedCounty)?.name || selectedCounty
      const cityName = cities.find(c => c.value === selectedCity)?.name || selectedCity
      
      onLookup(stateName, countyName, cityName)
    }
  }

  // Form validation and state
  const isFormValid = selectedState && selectedCounty && selectedCity
  const isDisabled = isLoading || isLoadingData

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* State Selection Dropdown */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
          State
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value)
            if (onClearSelectedLocation) {
              onClearSelectedLocation()
            }
          }}
          className="input-field"
          disabled={isDisabled}
          required
        >
          <option value="">Select a state</option>
          {states.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
      </div>

      {/* County Selection Dropdown */}
      <div>
        <label htmlFor="county" className="block text-sm font-medium text-gray-700">
          County
        </label>
        <select
          id="county"
          value={selectedCounty}
          onChange={(e) => {
            setSelectedCounty(e.target.value)
            if (onClearSelectedLocation) {
              onClearSelectedLocation()
            }
          }}
          className="input-field"
          disabled={isDisabled || !selectedState}
          required
        >
          <option value="">
            {isLoadingData ? 'Loading counties...' : 'Select a county'}
          </option>
          {counties.map((county) => (
            <option key={county.value} value={county.value}>
              {county.label}
            </option>
          ))}
        </select>
      </div>

      {/* City Selection Dropdown */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value)
            if (onClearSelectedLocation) {
              onClearSelectedLocation()
            }
          }}
          className="input-field"
          disabled={isDisabled || !selectedCounty}
          required
        >
          <option value="">
            {isLoadingData ? 'Loading cities...' : 'Select a city'}
          </option>
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isDisabled}
        className="btn-primary w-full"
      >
        {isLoading ? 'Looking up taxes...' : 'Get Tax Rates'}
      </button>
    </form>
  )
} 