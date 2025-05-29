'use client'

import { useState, useEffect } from 'react'

interface TaxLookupFormProps {
  onLookup: (state: string, county: string, city: string) => void
  isLoading: boolean
}

interface LocationOption {
  value: string
  label: string
}

export default function TaxLookupForm({ onLookup, isLoading }: TaxLookupFormProps) {
  const [selectedState, setSelectedState] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [counties, setCounties] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])

  // Texas-only for now
  const states: LocationOption[] = [
    { value: 'TX', label: 'Texas' }
  ]

  // Sample Texas counties - in production, this would come from your API
  const texasCounties: LocationOption[] = [
    { value: 'harris', label: 'Harris County' },
    { value: 'dallas', label: 'Dallas County' },
    { value: 'tarrant', label: 'Tarrant County' },
    { value: 'bexar', label: 'Bexar County' },
    { value: 'travis', label: 'Travis County' },
    { value: 'collin', label: 'Collin County' },
    { value: 'denton', label: 'Denton County' },
    { value: 'fortbend', label: 'Fort Bend County' },
    { value: 'montgomery', label: 'Montgomery County' },
    { value: 'williamson', label: 'Williamson County' },
  ].sort((a, b) => a.label.localeCompare(b.label))

  // Sample cities by county - in production, this would come from your API
  const citiesByCounty: Record<string, LocationOption[]> = {
    harris: [
      { value: 'houston', label: 'Houston' },
      { value: 'pasadena', label: 'Pasadena' },
      { value: 'baytown', label: 'Baytown' },
      { value: 'pearland', label: 'Pearland' },
      { value: 'sugarland', label: 'Sugar Land' },
    ],
    dallas: [
      { value: 'dallas', label: 'Dallas' },
      { value: 'plano', label: 'Plano' },
      { value: 'garland', label: 'Garland' },
      { value: 'irving', label: 'Irving' },
      { value: 'grandprairie', label: 'Grand Prairie' },
    ],
    travis: [
      { value: 'austin', label: 'Austin' },
      { value: 'roundrock', label: 'Round Rock' },
      { value: 'pflugerville', label: 'Pflugerville' },
      { value: 'cedarpark', label: 'Cedar Park' },
      { value: 'lakeway', label: 'Lakeway' },
    ],
    // Add more counties and cities as needed
  }

  useEffect(() => {
    if (selectedState === 'TX') {
      setCounties(texasCounties)
      setSelectedCounty('')
      setSelectedCity('')
      setCities([])
    }
  }, [selectedState])

  useEffect(() => {
    if (selectedCounty && citiesByCounty[selectedCounty]) {
      const countyCities = citiesByCounty[selectedCounty].sort((a, b) => 
        a.label.localeCompare(b.label)
      )
      setCities(countyCities)
      setSelectedCity('')
    } else {
      setCities([])
      setSelectedCity('')
    }
  }, [selectedCounty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedState && selectedCounty && selectedCity) {
      onLookup(selectedState, selectedCounty, selectedCity)
    }
  }

  const isFormValid = selectedState && selectedCounty && selectedCity

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={!selectedState}
          required
        >
          <option value="">Select a county</option>
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
          disabled={!selectedCounty}
          required
        >
          <option value="">Select a city</option>
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
        disabled={!isFormValid || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Looking up taxes...' : 'Get Tax Rates'}
      </button>
    </form>
  )
} 