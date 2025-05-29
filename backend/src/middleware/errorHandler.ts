import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'
  
  logger.error(`Error ${statusCode}: ${message}`, error)
  
  // Don't leak error details in production
  const errorResponse = {
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  }
  
  res.status(statusCode).json(errorResponse)
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
} 