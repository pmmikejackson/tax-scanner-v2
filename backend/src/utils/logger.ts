export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`)
  },
  
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`)
    if (error) {
      console.error(error.stack)
    }
  },
  
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`)
  },
  
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`)
    }
  }
} 