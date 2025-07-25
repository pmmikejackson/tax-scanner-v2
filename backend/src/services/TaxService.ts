import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

export interface TaxData {
  state: string
  county: string
  city: string
  stateTaxRate: number
  countyTaxRate: number
  cityTaxRate: number
  totalTaxRate: number
  // Illinois dual-rate support
  stateFoodTaxRate?: number
  countyFoodTaxRate?: number
  cityFoodTaxRate?: number
  totalFoodTaxRate?: number
  lastUpdated: string
  // Additional metadata
  stateCode: string
  hasDualRates: boolean // True if state supports different rates for food vs general items
  rateType: 'single' | 'dual' // 'single' for states like Texas, 'dual' for Illinois
}

export interface DataStatus {
  lastUpdated: string
  recordCount: number
  status: string
  source: string
}

export class TaxService {
  // Get tax rates for a specific location
  async getTaxRates(state: string, county: string, city: string): Promise<TaxData | null> {
    try {
      // Find the state
      const stateRecord = await prisma.state.findUnique({
        where: { code: state.toUpperCase() },
        include: {
          counties: {
            where: { 
              name: {
                contains: county,
                mode: 'insensitive'
              }
            },
            include: {
              cities: {
                where: {
                  name: {
                    contains: city,
                    mode: 'insensitive'
                  }
                }
              }
            }
          }
        }
      })

      if (!stateRecord || stateRecord.counties.length === 0 || stateRecord.counties[0].cities.length === 0) {
        return null
      }

      const countyRecord = stateRecord.counties[0]
      const cityRecord = countyRecord.cities[0]

      // Determine if this state has dual rates (Illinois has different rates for food vs general)
      const hasDualRates = stateRecord.foodTaxRate !== null && 
                          stateRecord.foodTaxRate !== stateRecord.taxRate
      
      const rateType = hasDualRates ? 'dual' : 'single'

      // Calculate general merchandise rates
      const stateTaxRate = stateRecord.taxRate
      const countyTaxRate = countyRecord.taxRate
      const cityTaxRate = cityRecord.taxRate
      const totalTaxRate = stateTaxRate + countyTaxRate + cityTaxRate

      // Base response for all states
      const baseResponse: TaxData = {
        state: stateRecord.name,
        county: countyRecord.name,
        city: cityRecord.name,
        stateTaxRate,
        countyTaxRate,
        cityTaxRate,
        totalTaxRate,
        lastUpdated: new Date().toISOString(),
        stateCode: stateRecord.code,
        hasDualRates,
        rateType
      }

      // Add dual-rate information for states like Illinois
      if (hasDualRates) {
        const stateFoodTaxRate = stateRecord.foodTaxRate || stateRecord.taxRate
        const countyFoodTaxRate = countyRecord.foodTaxRate || countyRecord.taxRate
        const cityFoodTaxRate = cityRecord.foodTaxRate || cityRecord.taxRate
        const totalFoodTaxRate = stateFoodTaxRate + countyFoodTaxRate + cityFoodTaxRate

        return {
          ...baseResponse,
          stateFoodTaxRate,
          countyFoodTaxRate,
          cityFoodTaxRate,
          totalFoodTaxRate
        }
      }

      return baseResponse
    } catch (error) {
      logger.error('Error getting tax rates:', error as Error)
      throw error
    }
  }

  // Get tax rates by geographic coordinates
  async getTaxRatesByLocation(lat: number, lng: number): Promise<TaxData | null> {
    try {
      // Use Google Maps Geocoding API to get address components
      const location = await this.reverseGeocode(lat, lng)
      
      if (!location) {
        return null
      }

      return await this.getTaxRates(location.state, location.county, location.city)
    } catch (error) {
      logger.error('Error getting tax rates by location:', error as Error)
      throw error
    }
  }

  // Reverse geocode coordinates to get location info
  private async reverseGeocode(lat: number, lng: number): Promise<{state: string, county: string, city: string} | null> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        logger.warn('Google Maps API key not configured')
        return null
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      )

      if (response.data.status !== 'OK' || !response.data.results.length) {
        return null
      }

      const result = response.data.results[0]
      const components = result.address_components

      let state = ''
      let county = ''
      let city = ''

      for (const component of components) {
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name
        }
        if (component.types.includes('administrative_area_level_2')) {
          county = component.long_name.replace(' County', '')
        }
        if (component.types.includes('locality')) {
          city = component.long_name
        }
      }

      return state && county && city ? { state, county, city } : null
    } catch (error) {
      logger.error('Error in reverse geocoding:', error as Error)
      return null
    }
  }

  // Refresh tax data from external sources
  async refreshTaxData(): Promise<{lastUpdated: string, recordsUpdated: number}> {
    try {
      logger.info('Starting tax data refresh...')
      
      // This would normally call external APIs to get fresh tax data
      // For now, we'll just update the data source record
      const dataSource = await prisma.dataSource.upsert({
        where: { source: 'texas_comptroller' },
        create: {
          source: 'texas_comptroller',
          lastUpdated: new Date(),
          recordsCount: 0,
          status: 'success'
        },
        update: {
          lastUpdated: new Date(),
          status: 'success'
        }
      })

      return {
        lastUpdated: dataSource.lastUpdated.toISOString(),
        recordsUpdated: dataSource.recordsCount
      }
    } catch (error) {
      logger.error('Error refreshing tax data:', error as Error)
      throw error
    }
  }

  // Get data status and freshness info
  async getDataStatus(): Promise<DataStatus> {
    try {
      const dataSource = await prisma.dataSource.findFirst({
        where: { source: 'texas_comptroller' },
        orderBy: { lastUpdated: 'desc' }
      })

      if (!dataSource) {
        return {
          lastUpdated: '2024-01-01',
          recordCount: 0,
          status: 'no_data',
          source: 'texas_comptroller'
        }
      }

      return {
        lastUpdated: dataSource.lastUpdated.toISOString(),
        recordCount: dataSource.recordsCount,
        status: dataSource.status,
        source: dataSource.source
      }
    } catch (error) {
      logger.error('Error getting data status:', error as Error)
      throw error
    }
  }

  // Geocode address to get location info
  async geocodeAddress(address: string): Promise<{state: string, county: string, city: string, lat: number, lng: number} | null> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        logger.warn('Google Maps API key not configured for geocoding')
        throw new Error('Geocoding service not available - API key not configured')
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      )

      if (response.data.status !== 'OK' || !response.data.results.length) {
        logger.warn(`Geocoding failed for address: ${address}, status: ${response.data.status}`)
        return null
      }

      const result = response.data.results[0]
      const components = result.address_components
      const location = result.geometry.location

      let state = ''
      let county = ''
      let city = ''

      for (const component of components) {
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name
        }
        if (component.types.includes('administrative_area_level_2')) {
          county = component.long_name.replace(' County', '')
        }
        if (component.types.includes('locality')) {
          city = component.long_name
        }
      }

      if (!state || !county || !city) {
        logger.warn(`Incomplete location data for address: ${address}, state: ${state}, county: ${county}, city: ${city}`)
        return null
      }

      return { 
        state, 
        county, 
        city, 
        lat: location.lat, 
        lng: location.lng 
      }
    } catch (error) {
      logger.error('Error geocoding address:', error as Error)
      throw error
    }
  }

  // Get all states
  async getStates(): Promise<Array<{code: string, name: string}>> {
    try {
      const states = await prisma.state.findMany({
        orderBy: { name: 'asc' }
      })
      
      return states.map(state => ({
        code: state.code,
        name: state.name
      }))
    } catch (error) {
      logger.error('Error getting states:', error as Error)
      throw error
    }
  }

  // Get counties for a state
  async getCounties(stateCode: string): Promise<Array<{name: string}>> {
    try {
      const counties = await prisma.county.findMany({
        where: {
          state: {
            code: stateCode.toUpperCase()
          }
        },
        orderBy: { name: 'asc' }
      })
      
      return counties.map(county => ({
        name: county.name
      }))
    } catch (error) {
      logger.error('Error getting counties:', error as Error)
      throw error
    }
  }

  // Get cities for a county in a state
  async getCities(stateCode: string, countyName: string): Promise<Array<{name: string}>> {
    try {
      const cities = await prisma.city.findMany({
        where: {
          county: {
            name: countyName,
            state: {
              code: stateCode.toUpperCase()
            }
          }
        },
        orderBy: { name: 'asc' }
      })
      
      return cities.map(city => ({
        name: city.name
      }))
    } catch (error) {
      logger.error('Error getting cities:', error as Error)
      throw error
    }
  }

  // Seed database with sample Texas data
  async seedDatabase(): Promise<void> {
    try {
      logger.info('Starting database seed...')

      // Create Texas state
      const texas = await prisma.state.upsert({
        where: { code: 'TX' },
        update: {},
        create: {
          code: 'TX',
          name: 'Texas',
          taxRate: 0.0625, // 6.25% state sales tax
        },
      })

      // Create Harris County
      const harrisCounty = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: texas.id,
            name: 'Harris County'
          }
        },
        update: {},
        create: {
          name: 'Harris County',
          taxRate: 0.0025, // 0.25% county tax
          stateId: texas.id,
        },
      })

      // Create Houston
      await prisma.city.upsert({
        where: { 
          countyId_name: {
            countyId: harrisCounty.id,
            name: 'Houston'
          }
        },
        update: {},
        create: {
          name: 'Houston',
          taxRate: 0.0125, // 1.25% city tax
          countyId: harrisCounty.id,
        },
      })

      // Create Dallas County
      const dallasCounty = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: texas.id,
            name: 'Dallas County'
          }
        },
        update: {},
        create: {
          name: 'Dallas County',
          taxRate: 0.005, // 0.5% county tax
          stateId: texas.id,
        },
      })

      // Create Dallas
      await prisma.city.upsert({
        where: { 
          countyId_name: {
            countyId: dallasCounty.id,
            name: 'Dallas'
          }
        },
        update: {},
        create: {
          name: 'Dallas',
          taxRate: 0.0125, // 1.25% city tax
          countyId: dallasCounty.id,
        },
      })

      // Create Travis County
      const travisCounty = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: texas.id,
            name: 'Travis County'
          }
        },
        update: {},
        create: {
          name: 'Travis County',
          taxRate: 0.0075, // 0.75% county tax
          stateId: texas.id,
        },
      })

      // Create Austin
      await prisma.city.upsert({
        where: { 
          countyId_name: {
            countyId: travisCounty.id,
            name: 'Austin'
          }
        },
        update: {},
        create: {
          name: 'Austin',
          taxRate: 0.01, // 1% city tax
          countyId: travisCounty.id,
        },
      })

      // Update data source record
      await prisma.dataSource.upsert({
        where: { source: 'texas_comptroller' },
        update: {
          lastUpdated: new Date(),
          recordsCount: 6,
          status: 'success'
        },
        create: {
          source: 'texas_comptroller',
          lastUpdated: new Date(),
          recordsCount: 6,
          status: 'success'
        },
      })

      logger.info('Database seeded successfully!')
    } catch (error) {
      logger.error('Error seeding database:', error as Error)
      throw error
    }
  }
}

export const taxService = new TaxService() 