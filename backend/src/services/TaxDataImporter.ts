import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

interface TaxRateEntry {
  city: string
  cityCode: string
  cityRate: number
  county: string
  countyCode: string
  countyRate: number
  district1: string
  district1Code: string
  district1Rate: number
  district2: string
  district2Code: string
  district2Rate: number
}

export class TaxDataImporter {
  private static readonly TEXAS_COMPTROLLER_URL = 'https://comptroller.texas.gov/data/edi/sales-tax/taxrates.txt'
  private static readonly STATE_RATE = 0.0625 // Texas state sales tax rate

  /**
   * Download and import official Texas Comptroller tax rate data
   */
  async importOfficialTaxData(): Promise<{ imported: number; updated: number; errors: number }> {
    try {
      logger.info('Starting import of official Texas Comptroller tax data')
      
      // Download the official data
      const response = await axios.get(TaxDataImporter.TEXAS_COMPTROLLER_URL, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Tax-Scanner-App/1.0'
        }
      })

      const dataLines = response.data.split('\n')
      logger.info(`Downloaded ${dataLines.length} lines of tax data`)

      // Parse and import data
      const results = await this.parseAndImportData(dataLines)
      
      // Update data source record
      await this.updateDataSource(results)
      
      logger.info(`Import completed: ${results.imported} imported, ${results.updated} updated, ${results.errors} errors`)
      return results

    } catch (error) {
      logger.error('Error importing tax data:', error as Error)
      throw error
    }
  }

  /**
   * Parse tax rate data lines and import into database
   */
  private async parseAndImportData(dataLines: string[]): Promise<{ imported: number; updated: number; errors: number }> {
    let imported = 0
    let updated = 0
    let errors = 0

    // Start processing from line that contains actual tax data (skip headers)
    const dataStartIndex = dataLines.findIndex(line => 
      line.includes('Abbott') || line.includes('Austin') || line.includes('Houston') || line.includes('Dallas')
    )

    if (dataStartIndex === -1) {
      throw new Error('Could not find start of tax data in file')
    }

    for (let i = dataStartIndex; i < dataLines.length; i++) {
      const line = dataLines[i].trim()
      
      // Skip empty lines or lines that look like headers/metadata
      if (!line || line.includes('Required Upgrade') || line.includes('q\t') || line.includes('m\t')) {
        continue
      }

      try {
        const entry = this.parseTaxRateLine(line)
        if (entry && entry.city && entry.county) {
          const result = await this.saveToDatabase(entry)
          if (result.isNew) {
            imported++
          } else {
            updated++
          }
        }
      } catch (error) {
        logger.warn(`Error parsing line ${i}: ${line}`)
        errors++
      }
    }

    return { imported, updated, errors }
  }

  /**
   * Parse a single line of tax rate data
   */
  private parseTaxRateLine(line: string): TaxRateEntry | null {
    // Split by tabs - the format appears to be tab-delimited
    const parts = line.split('\t')
    
    if (parts.length < 12) {
      return null
    }

    // Clean up the data
    const cleanString = (str: string) => str?.trim().replace(/^["']|["']$/g, '') || ''
    const parseRate = (str: string) => {
      const cleaned = cleanString(str)
      return cleaned === 'n/a' || cleaned === '0' || !cleaned ? 0 : parseFloat(cleaned)
    }

    return {
      city: cleanString(parts[0]),
      cityCode: cleanString(parts[1]),
      cityRate: parseRate(parts[2]),
      county: cleanString(parts[3]),
      countyCode: cleanString(parts[4]),
      countyRate: parseRate(parts[5]),
      district1: cleanString(parts[6]),
      district1Code: cleanString(parts[7]),
      district1Rate: parseRate(parts[8]),
      district2: cleanString(parts[9]),
      district2Code: cleanString(parts[10]),
      district2Rate: parseRate(parts[11])
    }
  }

  /**
   * Save parsed tax data to database
   */
  private async saveToDatabase(entry: TaxRateEntry): Promise<{ isNew: boolean }> {
    try {
      // Find or create state
      const state = await prisma.state.upsert({
        where: { code: 'TX' },
        update: {},
        create: {
          name: 'Texas',
          code: 'TX'
        }
      })

      // Find or create county
      const county = await prisma.county.upsert({
        where: { 
          name_stateId: {
            name: entry.county,
            stateId: state.id
          }
        },
        update: {},
        create: {
          name: entry.county,
          stateId: state.id
        }
      })

      // Find or create city
      const existingCity = await prisma.city.findFirst({
        where: {
          name: entry.city,
          countyId: county.id
        }
      })

      const totalTaxRate = TaxDataImporter.STATE_RATE + entry.cityRate + entry.countyRate + entry.district1Rate + entry.district2Rate

      if (existingCity) {
        // Update existing city
        await prisma.city.update({
          where: { id: existingCity.id },
          data: {
            stateTaxRate: TaxDataImporter.STATE_RATE,
            localTaxRate: entry.cityRate + entry.countyRate + entry.district1Rate + entry.district2Rate,
            totalTaxRate: totalTaxRate,
            lastUpdated: new Date()
          }
        })
        return { isNew: false }
      } else {
        // Create new city
        await prisma.city.create({
          data: {
            name: entry.city,
            countyId: county.id,
            stateTaxRate: TaxDataImporter.STATE_RATE,
            localTaxRate: entry.cityRate + entry.countyRate + entry.district1Rate + entry.district2Rate,
            totalTaxRate: totalTaxRate,
            lastUpdated: new Date()
          }
        })
        return { isNew: true }
      }

    } catch (error) {
      logger.error(`Error saving to database: ${entry.city}, ${entry.county}`, error as Error)
      throw error
    }
  }

  /**
   * Update the data source record
   */
  private async updateDataSource(results: { imported: number; updated: number; errors: number }) {
    await prisma.dataSource.upsert({
      where: { source: 'texas_comptroller' },
      update: {
        lastUpdated: new Date(),
        recordsCount: results.imported + results.updated,
        status: results.errors > 0 ? 'partial_success' : 'success',
        errorMessage: results.errors > 0 ? `${results.errors} errors encountered during import` : null
      },
      create: {
        source: 'texas_comptroller',
        lastUpdated: new Date(),
        recordsCount: results.imported + results.updated,
        status: results.errors > 0 ? 'partial_success' : 'success',
        errorMessage: results.errors > 0 ? `${results.errors} errors encountered during import` : null
      }
    })
  }
}

export const taxDataImporter = new TaxDataImporter() 