# Tax Scanner v2

**Version 0.3.0** - A modular web application for looking up sales tax rates for restaurants by state, county, and city.

## 🗺️ Interactive US States Map

Tax Scanner v2 now features a beautiful, interactive map interface that makes selecting your state intuitive and engaging:

- **Grid-based layout** that resembles the actual US geography
- **Visual state indicators**: Supported states in green, coming soon in gray
- **Hover effects** with state information and status
- **Mobile-friendly** responsive design
- **Immediate feedback** for supported vs. unsupported states

### Currently Supported States
- ✅ **Texas (TX)** - Complete city and county coverage
- ✅ **Illinois (IL)** - Complete city and county coverage
- 🚧 **48 additional states** - Coming soon!

## Architecture Overview

This project uses a modular architecture to ensure maintainability and scalability:

- **Frontend**: React/Next.js application with interactive state map
- **Backend**: Node.js API with Express for tax data management
- **Database**: PostgreSQL for storing tax rates and audit information
- **External APIs**: Google Maps/Geolocation with proper error handling

## Features

- 🗺️ **Interactive US Map**: Click on any supported state to get started
- 🏢 Select state, county, and city for tax lookup
- 📍 Auto-detect location using browser geolocation (with fallbacks)
- 📊 Display total sales tax breakdown with restaurant-specific rates
- 🔄 Refresh tax data from official government sources
- ⏰ View data freshness and last update timestamps
- 🎨 Modern, responsive UI with smooth animations
- ♿ Accessibility-focused design with keyboard navigation

## Latest Updates (v0.3.0)

### 🎉 New Interactive Map
- Complete redesign of the state selection interface
- Grid layout that matches US geography
- Visual feedback for state support status
- Smooth hover effects and transitions

### 🐛 Bug Fixes
- Fixed infinite loading spinner issue
- Improved API error handling
- Enhanced mobile responsiveness

### 🔧 Technical Improvements
- Comprehensive code documentation
- Performance optimizations
- Better state management

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

MIT License - see LICENSE file for details. 