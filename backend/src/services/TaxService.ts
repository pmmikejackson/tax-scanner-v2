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
  lastUpdated: string
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

      return {
        state: stateRecord.name,
        county: countyRecord.name,
        city: cityRecord.name,
        stateTaxRate: stateRecord.taxRate,
        countyTaxRate: countyRecord.taxRate,
        cityTaxRate: cityRecord.taxRate,
        totalTaxRate: stateRecord.taxRate + countyRecord.taxRate + cityRecord.taxRate,
        lastUpdated: new Date().toISOString()
      }
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
} 