# Changelog

All notable changes to Tax Scanner v2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2025-05-29

### Fixed
- **CORS Configuration**: Added `https://taxscanner.vercel.app` to backend CORS origins to allow production API calls
- **API URL Construction**: Removed manual URL building in TaxLookupForm component to prevent malformed URLs
- **Vercel Project Setup**: Fixed deployment to use correct `taxscanner` project instead of accidentally created `frontend` project
- **Environment Variables**: Confirmed `NEXT_PUBLIC_API_URL` properly configured in Vercel production environment

### Changed
- Updated TaxLookupForm component to use API client consistently for all requests
- Improved debugging and error handling in API communication

### Infrastructure
- Fixed Vercel deployment configuration for monorepo structure
- Cleaned up duplicate Vercel projects
- Updated Railway backend deployment with new CORS settings

## [0.1.3] - 2025-05-29

### Added
- **Build Versioning System**: Comprehensive versioning with automatic patch/minor/major increments
- **Version API Endpoint**: `/api/version` providing build details and environment info
- **VersionInfo Component**: Displays current version in bottom-right corner of UI
- **Custom Build Scripts**: 
  - `build:deploy` (patch increment)
  - `build:feature` (minor increment) 
  - `build:major` (major increment)
- **Deployment Guide**: Comprehensive DEPLOYMENT_GUIDE.md with versioning workflow

### Fixed
- **React Hydration Errors**: Modified VersionInfo component to prevent SSR/client mismatches
- **Geolocation Integration**: Enhanced location detection to auto-populate form dropdowns
- **State Name Conversion**: Added conversion from state codes (TX) to full names (Texas) for form compatibility
- **County Name Resolution**: Fixed loadCities function to resolve actual county names from dropdown values

### Changed
- Updated package.json build scripts for Vercel compatibility
- Enhanced debugging in form components for troubleshooting
- Improved error messaging and user feedback

## [0.1.2] - 2025-05-29

### Fixed
- **Google Maps API Configuration**: Updated to use server-side API key for geocoding
- **Geolocation Dropdown Integration**: Fixed location detection to properly update form selections
- **API Key Restrictions**: Resolved "referer restrictions" error with new unrestricted API key

### Added
- Enhanced debugging for geolocation feature
- Better error handling for geocoding failures

## [0.1.1] - 2025-05-29

### Fixed
- **CORS Issues**: Updated backend to allow Vercel deployment URLs
- **API Connectivity**: Resolved Railway-to-Vercel communication issues

## [0.1.0] - 2025-05-29

### Added
- **Initial Production Release**: Tax Scanner v2 ready for launch
- **Texas Tax Data**: 3,628 real government tax rates from Texas Comptroller
- **Geolocation Feature**: GPS-based location detection and tax lookup
- **Responsive UI**: Modern React/Next.js frontend with Tailwind CSS
- **Railway Backend**: Express API with PostgreSQL database
- **Vercel Deployment**: Production-ready frontend hosting

### Features
- State, county, and city dropdown navigation
- Real-time tax rate lookup
- Data freshness indicators
- Mobile-responsive design
- Error handling and user feedback

### Infrastructure
- PostgreSQL database with Texas Comptroller EDI data
- Express.js REST API with rate limiting
- CORS configuration for cross-origin requests
- Environment variable management
- Health check endpoints

---

## Version History Summary

- **v0.1.4**: CORS and deployment fixes
- **v0.1.3**: Build versioning system and geolocation improvements  
- **v0.1.2**: Google Maps API fixes
- **v0.1.1**: Initial CORS fixes
- **v0.1.0**: Initial production release 