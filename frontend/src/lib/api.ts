// API utility for communicating with the Railway backend
// Handles all HTTP requests to the tax lookup API with debugging and error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tax-scanner-v2-production.up.railway.app'

// INTERFACES - Define data structures for type safety

export interface TaxData {
  state: string
  county: string
  city: string
  stateTaxRate: number
  countyTaxRate: number
  cityTaxRate: number
  totalTaxRate: number
  lastUpdated: string
}

export interface LocationOption {
  value: string      // Processed value for dropdown (lowercase, no spaces)
  label: string      // Display name for dropdown
  code?: string      // State code (for states only)
  name?: string      // Actual name for API calls
}

export interface DataStatus {
  lastUpdated: string
  recordCount: number
  status: string
  source: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Generic request handler with comprehensive debugging
   * Logs all requests/responses for troubleshooting
   * @param endpoint - API endpoint path (e.g., "/api/tax/states")
   * @returns Parsed JSON response
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log('API Request:', url) // Debug logging
    
    try {
      const response = await fetch(url)
      
      // Debug logging for response details
      console.log('API Response status:', response.status)
      console.log('API Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('API Response data:', data) // Debug logging
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // TAX LOOKUP METHODS

  /**
   * Get tax rates for a specific location
   * @param state - State name (e.g., "Texas")
   * @param county - County name (e.g., "Rockwall")  
   * @param city - City name (e.g., "Rockwall")
   */
  async getTaxRates(state: string, county: string, city: string): Promise<TaxData> {
    return this.request<TaxData>(`/api/tax/lookup?state=${state}&county=${county}&city=${city}`)
  }

  /**
   * Get tax rates by GPS coordinates (not currently used)
   */
  async getTaxRatesByLocation(lat: number, lng: number): Promise<TaxData> {
    return this.request<TaxData>(`/api/tax/location?lat=${lat}&lng=${lng}`)
  }

  /**
   * Geocode an address to get location components
   * @param address - Address string or "lat,lng" coordinates
   */
  async geocodeAddress(address: string): Promise<{state: string, county: string, city: string, lat: number, lng: number}> {
    return this.request(`/api/tax/geocode?address=${encodeURIComponent(address)}`)
  }

  // DROPDOWN DATA METHODS

  /**
   * Get all available states
   * Returns states with both code (for API) and name (for display)
   */
  async getStates(): Promise<LocationOption[]> {
    const states = await this.request<Array<{code: string, name: string}>>('/api/tax/states')
    return states.map(state => ({
      value: state.code,    // Use code as value for API calls
      label: state.name,    // Display full name
      code: state.code,     // Store code separately
      name: state.name      // Store name separately
    }))
  }

  /**
   * Get counties for a specific state
   * @param stateCode - State code (e.g., "TX")
   * 
   * IMPORTANT: Counties are processed for dropdown use
   * - value: lowercase, no spaces (e.g., "rockwall") 
   * - label: display name (e.g., "Rockwall")
   * - name: actual name for API calls (e.g., "Rockwall")
   */
  async getCounties(stateCode: string): Promise<LocationOption[]> {
    const counties = await this.request<Array<{name: string}>>(`/api/tax/counties?state=${stateCode}`)
    return counties.map(county => ({
      value: county.name.toLowerCase().replace(/\s+/g, ''), // Processed for dropdown
      label: county.name,   // Display name
      name: county.name     // Actual name for API calls
    }))
  }

  /**
   * Get cities for a specific county
   * @param stateCode - State code (e.g., "TX")
   * @param countyName - Actual county name (e.g., "Rockwall", not "rockwall")
   * 
   * IMPORTANT: Cities are processed for dropdown use similar to counties
   */
  async getCities(stateCode: string, countyName: string): Promise<LocationOption[]> {
    const cities = await this.request<Array<{name: string}>>(`/api/tax/cities?state=${stateCode}&county=${countyName}`)
    return cities.map(city => ({
      value: city.name.toLowerCase().replace(/\s+/g, ''), // Processed for dropdown
      label: city.name,     // Display name
      name: city.name       // Actual name for API calls
    }))
  }

  // UTILITY METHODS

  /**
   * Get data freshness information
   */
  async getDataStatus(): Promise<DataStatus> {
    return this.request<DataStatus>('/api/tax/status')
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{status: string, timestamp: string, uptime: number}> {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient 