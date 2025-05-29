'use client'

import { useState, useEffect } from 'react'
import apiClient, { LocationOption } from '@/lib/api'

interface TaxLookupFormProps {
  onLookup: (state: string, county: string, city: string) => void
  isLoading: boolean
}

export default function TaxLookupForm({ onLookup, isLoading }: TaxLookupFormProps) {
  const [selectedState, setSelectedState] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [states, setStates] = useState<LocationOption[]>([])
  const [counties, setCounties] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load states on component mount
  useEffect(() => {
    loadStates()
  }, [])

  // Load counties when state changes
  useEffect(() => {
    if (selectedState) {
      loadCounties(selectedState)
    } else {
      setCounties([])
      setCities([])
      setSelectedCounty('')
      setSelectedCity('')
    }
  }, [selectedState])

  // Load cities when county changes
  useEffect(() => {
    if (selectedState && selectedCounty) {
      loadCities(selectedState, selectedCounty)
    } else {
      setCities([])
      setSelectedCity('')
    }
  }, [selectedState, selectedCounty])

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

  const loadCounties = async (stateCode: string) => {
    try {
      setIsLoadingData(true)
      setError(null)
      const countiesData = await apiClient.getCounties(stateCode)
      setCounties(countiesData)
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

  const loadCities = async (stateCode: string, countyName: string) => {
    try {
      setIsLoadingData(true)
      setError(null)
      console.log(`Loading cities for state: ${stateCode}, county: ${countyName}`)
      
      // Add visible debugging
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://tax-scanner-v2-production.up.railway.app'}/api/tax/cities?state=${stateCode}&county=${countyName}`
      console.log('Cities API URL:', url)
      
      const citiesData = await apiClient.getCities(stateCode, countyName)
      console.log(`Loaded ${citiesData.length} cities:`, citiesData)
      
      // Add temporary alert for debugging
      if (countyName.toLowerCase().includes('rockwall')) {
        alert(`Debug: Found ${citiesData.length} cities for ${countyName}`)
      }
      
      setCities(citiesData)
      setSelectedCity('')
    } catch (err) {
      console.error('Error loading cities:', err)
      const errorMsg = `Failed to load cities for ${countyName}. Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      setError(errorMsg)
      
      // Add temporary alert for debugging
      if (countyName.toLowerCase().includes('rockwall')) {
        alert(`Debug Error: ${errorMsg}`)
      }
      
      setCities([])
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedState && selectedCounty && selectedCity) {
      // Find the actual names to pass to the API
      const stateName = states.find(s => s.value === selectedState)?.name || selectedState
      const countyName = counties.find(c => c.value === selectedCounty)?.name || selectedCounty
      const cityName = cities.find(c => c.value === selectedCity)?.name || selectedCity
      
      onLookup(stateName, countyName, cityName)
    }
  }

  const isFormValid = selectedState && selectedCounty && selectedCity
  const isDisabled = isLoading || isLoadingData

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* State Selection */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
          State
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
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

      {/* County Selection */}
      <div>
        <label htmlFor="county" className="block text-sm font-medium text-gray-700">
          County
        </label>
        <select
          id="county"
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
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

      {/* City Selection */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
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