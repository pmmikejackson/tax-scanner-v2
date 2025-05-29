// API utility for communicating with the Railway backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tax-scanner-v2-production.up.railway.app'

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
  value: string
  label: string
  code?: string
  name?: string
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

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  // Get tax rates for a specific location
  async getTaxRates(state: string, county: string, city: string): Promise<TaxData> {
    return this.request<TaxData>(`/api/tax/lookup?state=${state}&county=${county}&city=${city}`)
  }

  // Get tax rates by coordinates
  async getTaxRatesByLocation(lat: number, lng: number): Promise<TaxData> {
    return this.request<TaxData>(`/api/tax/location?lat=${lat}&lng=${lng}`)
  }

  // Geocode an address
  async geocodeAddress(address: string): Promise<{state: string, county: string, city: string, lat: number, lng: number}> {
    return this.request(`/api/tax/geocode?address=${encodeURIComponent(address)}`)
  }

  // Get all states
  async getStates(): Promise<LocationOption[]> {
    const states = await this.request<Array<{code: string, name: string}>>('/api/tax/states')
    return states.map(state => ({
      value: state.code,
      label: state.name,
      code: state.code,
      name: state.name
    }))
  }

  // Get counties for a state
  async getCounties(stateCode: string): Promise<LocationOption[]> {
    const counties = await this.request<Array<{name: string}>>(`/api/tax/counties?state=${stateCode}`)
    return counties.map(county => ({
      value: county.name.toLowerCase().replace(/\s+/g, ''),
      label: county.name,
      name: county.name
    }))
  }

  // Get cities for a county in a state
  async getCities(stateCode: string, countyName: string): Promise<LocationOption[]> {
    const cities = await this.request<Array<{name: string}>>(`/api/tax/cities?state=${stateCode}&county=${countyName}`)
    return cities.map(city => ({
      value: city.name.toLowerCase().replace(/\s+/g, ''),
      label: city.name,
      name: city.name
    }))
  }

  // Get data status
  async getDataStatus(): Promise<DataStatus> {
    return this.request<DataStatus>('/api/tax/status')
  }

  // Health check
  async healthCheck(): Promise<{status: string, timestamp: string, uptime: number}> {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient 