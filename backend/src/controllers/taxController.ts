import { Router, Request, Response } from 'express'
import { taxService } from '../services/TaxService'
import { taxDataImporter } from '../services/TaxDataImporter'
import { illinoisTaxDataImporter } from '../services/IllinoisTaxDataImporter'
import { logger } from '../utils/logger'

const router = Router()

// Get tax rates for a specific location
router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const { state, county, city } = req.query

    if (!state || !county || !city) {
      return res.status(400).json({ error: 'Missing required parameters: state, county, city' })
    }

    const taxRates = await taxService.getTaxRates(
      state as string,
      county as string,
      city as string
    )

    if (!taxRates) {
      return res.status(404).json({ error: 'Tax rates not found for the specified location' })
    }

    res.json(taxRates)
  } catch (error) {
    logger.error('Error getting tax rates:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get geocoded location data
router.get('/geocode', async (req: Request, res: Response) => {
  try {
    const { address } = req.query

    if (!address) {
      return res.status(400).json({ error: 'Missing required parameter: address' })
    }

    const location = await taxService.geocodeAddress(address as string)
    res.json(location)
  } catch (error) {
    logger.error('Error geocoding address:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get states list
router.get('/states', async (req: Request, res: Response) => {
  try {
    const states = await taxService.getStates()
    res.json(states)
  } catch (error) {
    logger.error('Error getting states:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get counties for a state
router.get('/counties', async (req: Request, res: Response) => {
  try {
    const { state } = req.query

    if (!state) {
      return res.status(400).json({ error: 'Missing required parameter: state' })
    }

    const counties = await taxService.getCounties(state as string)
    res.json(counties)
  } catch (error) {
    logger.error('Error getting counties:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get cities for a county
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const { state, county } = req.query

    if (!state || !county) {
      return res.status(400).json({ error: 'Missing required parameters: state, county' })
    }

    const cities = await taxService.getCities(state as string, county as string)
    res.json(cities)
  } catch (error) {
    logger.error('Error getting cities:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
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

// Import official Texas Comptroller data
router.post('/import-official-data', async (req: Request, res: Response) => {
  try {
    logger.info('Starting official tax data import...')
    const results = await taxDataImporter.importOfficialTaxData()
    res.json({ 
      message: 'Official tax data imported successfully',
      results
    })
  } catch (error) {
    logger.error('Error importing official tax data:', error as Error)
    res.status(500).json({ error: 'Failed to import official tax data' })
  }
})

// Import official Illinois Department of Revenue data
router.post('/import-illinois-data', async (req: Request, res: Response) => {
  try {
    logger.info('Starting Illinois Department of Revenue data import...')
    const results = await illinoisTaxDataImporter.importOfficialTaxData()
    res.json({ 
      message: 'Illinois tax data imported successfully',
      results,
      note: 'Illinois dual-rate system: General merchandise vs Restaurant food/medicine rates'
    })
  } catch (error) {
    logger.error('Error importing Illinois tax data:', error as Error)
    res.status(500).json({ error: 'Failed to import Illinois tax data' })
  }
})

// Seed Illinois database with major cities
router.post('/seed-illinois', async (req: Request, res: Response) => {
  try {
    logger.info('Starting Illinois database seeding...')
    await illinoisTaxDataImporter.seedIllinoisData()
    res.json({ 
      message: 'Illinois database seeded successfully',
      note: 'Added major Illinois cities: Chicago, Naperville, Joliet with dual-rate support'
    })
  } catch (error) {
    logger.error('Error seeding Illinois database:', error as Error)
    res.status(500).json({ error: 'Failed to seed Illinois database' })
  }
})

// Simple location test endpoint (Texas coordinates fallback)
router.get('/location-test', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lng' })
    }

    const latitude = parseFloat(lat as string)
    const longitude = parseFloat(lng as string)

    // Simple Texas bounds check (rough approximation)
    if (latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5) {
      // For testing, return Dallas as fallback for any Texas coordinates
      const taxRates = await taxService.getTaxRates('TX', 'Dallas', 'Dallas')
      
      if (taxRates) {
        res.json({
          ...taxRates,
          note: 'Fallback location used - Dallas, TX'
        })
      } else {
        res.status(404).json({ error: 'Fallback location data not found' })
      }
    } else {
      res.status(400).json({ error: 'Coordinates outside Texas bounds' })
    }
  } catch (error) {
    logger.error('Error in location test:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Debug endpoint to check API key status
router.get('/debug', async (req: Request, res: Response) => {
  try {
    const hasGoogleMapsKey = !!process.env.GOOGLE_MAPS_API_KEY
    const corsOrigin = process.env.CORS_ORIGIN
    
    res.json({
      googleMapsApiKey: hasGoogleMapsKey ? 'configured' : 'missing',
      corsOrigin: corsOrigin || 'not set',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    logger.error('Error in debug endpoint:', error as Error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 