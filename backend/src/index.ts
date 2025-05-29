import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Load environment variables
dotenv.config()

import taxRoutes from './controllers/taxController'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

const app = express()
const PORT = process.env.PORT || 3001

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://taxscanner-j7r3o67qc-pmmikejacksons-projects.vercel.app',
    'https://taxscanner-rl24lhgop-pmmikejacksons-projects.vercel.app',
    'https://taxscanner-ep5jp3xcv-pmmikejacksons-projects.vercel.app',
    'https://taxscanner-fy5ljj3ka-pmmikejacksons-projects.vercel.app',
    'https://taxscanner-58hasjjtq-pmmikejacksons-projects.vercel.app',
    /^https:\/\/taxscanner-.*-pmmikejacksons-projects\.vercel\.app$/,
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
  ],
  credentials: true
}))
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// API Routes
app.use('/api/tax', taxRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`)
}) 