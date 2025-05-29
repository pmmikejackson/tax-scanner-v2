import { Router, Request, Response } from 'express'
import { TaxService } from '../services/TaxService'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()
const taxService = new TaxService()

// Manual tax lookup by state, county, city
router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const { state, county, city } = req.query
    
    if (!state || !county || !city) {
      throw createError('State, county, and city are required', 400)
    }
    
    const taxData = await taxService.getTaxRates(
      state as string,
      county as string,
      city as string
    )
    
    if (!taxData) {
      throw createError('Tax data not found for the specified location', 404)
    }
    
    res.json(taxData)
  } catch (error) {
    logger.error('Error in tax lookup:', error as Error)
    if (error instanceof Error && 'statusCode' in error) {
      res.status((error as any).statusCode).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// Location-based tax lookup using coordinates
router.get('/location', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query
    
    if (!lat || !lng) {
      throw createError('Latitude and longitude are required', 400)
    }
    
    const taxData = await taxService.getTaxRatesByLocation(
      parseFloat(lat as string),
      parseFloat(lng as string)
    )
    
    if (!taxData) {
      throw createError('Tax data not found for the specified location', 404)
    }
    
    res.json(taxData)
  } catch (error) {
    logger.error('Error in location-based tax lookup:', error as Error)
    if (error instanceof Error && 'statusCode' in error) {
      res.status((error as any).statusCode).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// Refresh tax data
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const result = await taxService.refreshTaxData()
    res.json({
      message: 'Tax data refresh initiated',
      lastUpdated: result.lastUpdated,
      recordsUpdated: result.recordsUpdated
    })
  } catch (error) {
    logger.error('Error refreshing tax data:', error as Error)
    if (error instanceof Error && 'statusCode' in error) {
      res.status((error as any).statusCode).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// Get data freshness info
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await taxService.getDataStatus()
    res.json(status)
  } catch (error) {
    logger.error('Error getting data status:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 