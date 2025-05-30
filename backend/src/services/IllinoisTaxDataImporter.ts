import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

interface IllinoisTaxEntry {
  county: string
  municipality: string
  countyGeneralRate: number
  countyFoodRate: number
  municipalGeneralRate: number
  municipalFoodRate: number
  stateGeneralRate: number
  stateFoodRate: number
  totalGeneralRate: number
  totalFoodRate: number
}

export class IllinoisTaxDataImporter {
  // Illinois Department of Revenue - Machine Readable Files
  private static readonly ILLINOIS_DOL_URL = 'https://tax.illinois.gov/content/dam/soi/en/web/tax/localgovernment/property/documents/county-municipal-sales-tax-rates.csv'
  
  // Illinois tax rates (as of 2024)
  private static readonly STATE_GENERAL_RATE = 0.0625 // 6.25% general merchandise
  private static readonly STATE_FOOD_RATE = 0.01      // 1% food & medicine (restaurant food)

  /**
   * Download and import official Illinois Department of Revenue tax rate data
   * Illinois has dual rates: 6.25% general, 1% food/medicine (includes restaurant food)
   */
  async importOfficialTaxData(): Promise<{ imported: number; updated: number; errors: number }> {
    try {
      logger.info('Starting import of official Illinois Department of Revenue tax data')
      
      // Download the official CSV data
      const response = await axios.get(IllinoisTaxDataImporter.ILLINOIS_DOL_URL, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Tax-Scanner-App/1.0'
        }
      })

      const csvData = response.data
      logger.info(`Downloaded Illinois tax data: ${csvData.length} characters`)

      // Parse CSV and import data
      const results = await this.parseAndImportCSVData(csvData)
      
      // Update data source record
      await this.updateDataSource(results)
      
      logger.info(`Illinois import completed: ${results.imported} imported, ${results.updated} updated, ${results.errors} errors`)
      return results

    } catch (error) {
      logger.error('Error importing Illinois tax data:', error as Error)
      throw error
    }
  }

  /**
   * Parse Illinois CSV tax rate data and import into database
   * Illinois CSV format typically includes columns for county, municipality, and various rate breakdowns
   */
  private async parseAndImportCSVData(csvData: string): Promise<{ imported: number; updated: number; errors: number }> {
    let imported = 0
    let updated = 0
    let errors = 0

    const lines = csvData.split('\n')
    logger.info(`Processing ${lines.length} lines of Illinois CSV data`)

    // Skip header row(s) - find first data line
    let startIndex = 0
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].toLowerCase()
      if (line.includes('county') && line.includes('municipal')) {
        startIndex = i + 1
        break
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (!line) continue

      try {
        const entry = this.parseIllinoisCSVLine(line)
        if (entry && entry.county && entry.municipality) {
          const result = await this.saveToDatabase(entry)
          if (result.isNew) {
            imported++
          } else {
            updated++
          }
        }
      } catch (error) {
        logger.warn(`Error parsing Illinois line ${i}: ${line}`)
        errors++
      }
    }

    return { imported, updated, errors }
  }

  /**
   * Parse a single line of Illinois CSV tax rate data
   * Illinois format varies but typically includes county, municipality, and rate breakdowns
   */
  private parseIllinoisCSVLine(line: string): IllinoisTaxEntry | null {
    // Split by comma (CSV format)
    const parts = line.split(',').map(part => part.trim().replace(/^["']|["']$/g, ''))
    
    if (parts.length < 6) {
      return null
    }

    // Clean up the data
    const cleanString = (str: string) => str?.trim() || ''
    const parseRate = (str: string) => {
      const cleaned = cleanString(str)
      return cleaned === 'n/a' || cleaned === '0' || !cleaned ? 0 : parseFloat(cleaned) / 100 // Convert percentage to decimal
    }

    // Illinois typically provides total rates, so we calculate component rates
    const county = cleanString(parts[0])
    const municipality = cleanString(parts[1])
    const totalGeneralRate = parseRate(parts[2]) || 0
    const totalFoodRate = parseRate(parts[3]) || 0

    // Calculate component rates (Illinois provides totals, we derive parts)
    const countyGeneralRate = parseRate(parts[4]) || 0
    const countyFoodRate = parseRate(parts[5]) || 0
    const municipalGeneralRate = totalGeneralRate - IllinoisTaxDataImporter.STATE_GENERAL_RATE - countyGeneralRate
    const municipalFoodRate = totalFoodRate - IllinoisTaxDataImporter.STATE_FOOD_RATE - countyFoodRate

    return {
      county,
      municipality,
      countyGeneralRate,
      countyFoodRate,
      municipalGeneralRate,
      municipalFoodRate,
      stateGeneralRate: IllinoisTaxDataImporter.STATE_GENERAL_RATE,
      stateFoodRate: IllinoisTaxDataImporter.STATE_FOOD_RATE,
      totalGeneralRate,
      totalFoodRate
    }
  }

  /**
   * Save parsed Illinois tax data to database with dual-rate support
   */
  private async saveToDatabase(entry: IllinoisTaxEntry): Promise<{ isNew: boolean }> {
    try {
      // Find or create Illinois state
      const state = await prisma.state.upsert({
        where: { code: 'IL' },
        update: {},
        create: {
          name: 'Illinois',
          code: 'IL',
          taxRate: IllinoisTaxDataImporter.STATE_GENERAL_RATE,
          foodTaxRate: IllinoisTaxDataImporter.STATE_FOOD_RATE
        }
      })

      // Find or create county
      const county = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: state.id,
            name: entry.county
          }
        },
        update: {
          taxRate: entry.countyGeneralRate,
          foodTaxRate: entry.countyFoodRate
        },
        create: {
          name: entry.county,
          stateId: state.id,
          taxRate: entry.countyGeneralRate,
          foodTaxRate: entry.countyFoodRate
        }
      })

      // Find or create municipality/city
      const existingCity = await prisma.city.findFirst({
        where: {
          name: entry.municipality,
          countyId: county.id
        }
      })

      if (existingCity) {
        // Update existing city
        await prisma.city.update({
          where: { id: existingCity.id },
          data: {
            taxRate: entry.municipalGeneralRate,
            foodTaxRate: entry.municipalFoodRate
          }
        })
        return { isNew: false }
      } else {
        // Create new city
        await prisma.city.create({
          data: {
            name: entry.municipality,
            countyId: county.id,
            taxRate: entry.municipalGeneralRate,
            foodTaxRate: entry.municipalFoodRate
          }
        })
        return { isNew: true }
      }

    } catch (error) {
      logger.error(`Error saving Illinois data to database: ${entry.municipality}, ${entry.county}`, error as Error)
      throw error
    }
  }

  /**
   * Update the Illinois data source record
   */
  private async updateDataSource(results: { imported: number; updated: number; errors: number }) {
    await prisma.dataSource.upsert({
      where: { source: 'illinois_department_revenue' },
      update: {
        lastUpdated: new Date(),
        recordsCount: results.imported + results.updated,
        status: results.errors > 0 ? 'partial_success' : 'success',
        errorMessage: results.errors > 0 ? `${results.errors} errors encountered during import` : null
      },
      create: {
        source: 'illinois_department_revenue',
        lastUpdated: new Date(),
        recordsCount: results.imported + results.updated,
        status: results.errors > 0 ? 'partial_success' : 'success',
        errorMessage: results.errors > 0 ? `${results.errors} errors encountered during import` : null
      }
    })
  }

  /**
   * Seed Illinois database with major cities for testing
   * This provides immediate functionality while full import is being set up
   */
  async seedIllinoisData(): Promise<void> {
    try {
      logger.info('Seeding Illinois database with major cities...')

      // Create Illinois state
      const illinois = await prisma.state.upsert({
        where: { code: 'IL' },
        update: {},
        create: {
          code: 'IL',
          name: 'Illinois',
          taxRate: IllinoisTaxDataImporter.STATE_GENERAL_RATE,
          foodTaxRate: IllinoisTaxDataImporter.STATE_FOOD_RATE
        },
      })

      // Cook County (Chicago area)
      const cookCounty = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: illinois.id,
            name: 'Cook County'
          }
        },
        update: {},
        create: {
          name: 'Cook County',
          taxRate: 0.0175, // 1.75% county general
          foodTaxRate: 0.0175, // 1.75% county food (Cook County doesn't differentiate)
          stateId: illinois.id,
        },
      })

      // Chicago
      await prisma.city.upsert({
        where: { 
          countyId_name: {
            countyId: cookCounty.id,
            name: 'Chicago'
          }
        },
        update: {},
        create: {
          name: 'Chicago',
          taxRate: 0.0125, // 1.25% city general
          foodTaxRate: 0.0125, // 1.25% city food
          countyId: cookCounty.id,
        },
      })

      // DuPage County
      const duPageCounty = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: illinois.id,
            name: 'DuPage County'
          }
        },
        update: {},
        create: {
          name: 'DuPage County',
          taxRate: 0.0075, // 0.75% county general
          foodTaxRate: 0.0075, // 0.75% county food
          stateId: illinois.id,
        },
      })

      // Naperville
      await prisma.city.upsert({
        where: { 
          countyId_name: {
            countyId: duPageCounty.id,
            name: 'Naperville'
          }
        },
        update: {},
        create: {
          name: 'Naperville',
          taxRate: 0.01, // 1% city general
          foodTaxRate: 0.01, // 1% city food
          countyId: duPageCounty.id,
        },
      })

      // Will County
      const willCounty = await prisma.county.upsert({
        where: { 
          stateId_name: {
            stateId: illinois.id,
            name: 'Will County'
          }
        },
        update: {},
        create: {
          name: 'Will County',
          taxRate: 0.0075, // 0.75% county general
          foodTaxRate: 0.0075, // 0.75% county food
          stateId: illinois.id,
        },
      })

      // Joliet
      await prisma.city.upsert({
        where: { 
          countyId_name: {
            countyId: willCounty.id,
            name: 'Joliet'
          }
        },
        update: {},
        create: {
          name: 'Joliet',
          taxRate: 0.01, // 1% city general
          foodTaxRate: 0.01, // 1% city food
          countyId: willCounty.id,
        },
      })

      // Update data source record
      await prisma.dataSource.upsert({
        where: { source: 'illinois_department_revenue' },
        update: {
          lastUpdated: new Date(),
          recordsCount: 6, // 3 counties + 3 cities
          status: 'success'
        },
        create: {
          source: 'illinois_department_revenue',
          lastUpdated: new Date(),
          recordsCount: 6,
          status: 'success'
        },
      })

      logger.info('Illinois database seeded successfully!')
    } catch (error) {
      logger.error('Error seeding Illinois database:', error as Error)
      throw error
    }
  }
}

export const illinoisTaxDataImporter = new IllinoisTaxDataImporter() 