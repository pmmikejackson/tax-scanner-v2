# Tax Scanner v2

A modular web application for looking up sales tax rates for restaurants by state, county, and city. Starting with Texas data.

## Architecture Overview

This project uses a modular architecture to ensure maintainability and scalability:

- **Frontend**: React/Next.js application with client-side geolocation
- **Backend**: Node.js API with Express for tax data management
- **Database**: PostgreSQL for storing tax rates and audit information
- **External APIs**: Google Maps/Geolocation with proper error handling

## Features

- 🏢 Select state, county, and city for tax lookup
- 📍 Auto-detect location using browser geolocation (with fallbacks)
- 📊 Display total sales tax breakdown
- 🔄 Refresh tax data from official sources
- ⏰ View data freshness and last update timestamps
- 🇺🇸 Currently supports Texas (expandable to other states)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── frontend/          # React/Next.js frontend
├── backend/           # Node.js API server
├── database/          # Database schemas and migrations
├── docker/            # Docker configuration
└── docs/              # Additional documentation
```

## Deployment

The application is designed for easy deployment:

- **Frontend**: Deploy to Vercel or Netlify (static)
- **Backend**: Deploy to Railway, Render, or as serverless functions
- **Database**: Use managed PostgreSQL (Supabase, AWS RDS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. # Trigger Vercel redeploy - revert to working state v0.1.22
