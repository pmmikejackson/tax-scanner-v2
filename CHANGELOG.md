# Changelog

All notable changes to Tax Scanner v2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-05-30

### 🎯 Today's Roadmap
- **Documentation Sync**: Update changelog to reflect actual version 0.1.20
- **Deployment Verification**: Confirm all fixes from v0.1.6-0.1.17 are working in production
- **Outstanding Issues Investigation**:
  - VersionInfo component visibility on live site
  - Location detection state conversion (TX → Texas)
  - Cities dropdown returning 0 results for Rockwall County
- **Feature Enhancement Planning**: Next phase development priorities

### 🚀 **ILLINOIS STATE EXPANSION RESEARCH** ✅ COMPLETED

**Research Question:** Does Illinois provide EDI-style tax data like Texas?
**Answer:** YES! Illinois provides superior data sources to Texas.

**Illinois Data Sources Available:**
- ✅ **Machine-Readable Files**: County/Municipality + Address-specific files for developers
- ✅ **MyTax Illinois Tax Rate Finder**: Interactive API-accessible lookup tool  
- ✅ **Tax Matrix Downloads**: CSV/PDF formats with comprehensive rate breakdowns
- ✅ **Dual Rate System**: 6.25% general, 1% food/medicine (restaurant-specific benefit)
- ✅ **Quarterly Updates**: January 1 and July 1 (more frequent than Texas)
- ✅ **102 Counties Coverage**: Complete Illinois state coverage

**Implementation Complexity:** MEDIUM
- More sophisticated than Texas (dual rates, origin/destination sourcing)
- Better data availability and API access
- Restaurant-focused benefits (food rate differentiation)

**Next Steps for Illinois Integration:**
1. Update state selection dropdown to include Illinois
2. Create Illinois data importer service (similar to TaxDataImporter.ts)
3. Add dual-rate support to database schema
4. Implement destination/origin sourcing logic
5. Update frontend UI to show rate breakdowns for restaurants

## [0.1.20] - 2025-05-30 ✅ DEPLOYED

### Fixed
- **Node Engine Warnings**: Updated backend Node requirement from "18.x" to ">=18.0.0" to support Vercel's Node v22.15.1
- **Root Package Engines**: Added Node/npm engine requirements to root package.json for workspace consistency
- **ESLint Dependencies**: Fixed version conflicts by using compatible ESLint 8.57.0 instead of 9.x
- **Dependency Resolution**: Cleared npm cache and resolved ERESOLVE conflicts in backend packages

### Build & Deploy
- **Clean Build**: Successfully compiled and deployed without engine warnings
- **Documentation**: Auto-generated user guide v0.1.20 with fresh screenshots
- **Version Consistency**: All subsystems now properly aligned at v0.1.20

### Status Summary
- **Vercel Deployment**: Should now build without Node engine warnings ✅
- **Backend Compatibility**: Updated to support Node 18+ through 22+ ✅
- **Documentation**: PDF user guide updated and available ✅

## [0.1.19] - 2025-05-30 🚫 SKIPPED
*Version skipped during dependency resolution*

## [0.1.18] - 2025-05-30 ✅ DEPLOYED

### Fixed
- **VersionInfo Component Positioning**: Fixed CSS positioning from `bottom-20` to `bottom-4` and increased z-index to ensure visibility above footer
- **Component Visibility**: VersionInfo component should now be visible in bottom-right corner of all pages

### Investigation Results ✅
- **Backend Health**: Verified healthy and responsive (45k+ seconds uptime)
- **Tax Lookup API**: Working correctly (Rockwall, TX returns 8.25% total rate)
- **Cities Endpoint**: Returns 17 cities for Rockwall County including "Rockwall"
- **Geocoding API**: Working correctly (returns accurate TX coordinates)
- **Location Detection Flow**: All TX→Texas conversions are implemented and working
- **Version API**: Returns correct version information

### Status
- **Frontend**: v0.1.18 building and deploying ✅
- **Backend**: Healthy on Railway (working correctly) ✅  
- **Infrastructure**: All API endpoints responding properly ✅

## [0.1.17] - 2025-05-30 ✅ DEPLOYED

### Status
- **Frontend**: v0.1.17 deployed on Vercel ✅
- **Backend**: Healthy on Railway (45k+ seconds uptime) ✅
- **Infrastructure**: Both services communicating properly ✅

### Changes (v0.1.6 - 0.1.17)
*Note: These versions were incremented during development - detailed changes to be documented*

## [Unreleased] - 2025-01-XX

### Added
- **User Guide System**: Comprehensive user guide with friendly, conversational language
  - New `/guide` page with step-by-step instructions for all features
  - PDF generation system with downloadable user guide
  - User guide links in hero section and info section of main page
  - Covers GPS location, manual selection, understanding results, mobile usage, and troubleshooting

### Fixed
- **Location Detection Error Handling**: Improved user experience and debugging capabilities
  - Removed debug alert pop-ups that interrupted user workflow
  - Added specific error messages showing exact location that failed lookup
  - Better guidance when location detection works but tax data not found in database
  - Form auto-populates even when tax lookup fails to help manual correction

### Added (Debug Tools)
- **Location Detection Testing**: New debug tools for troubleshooting location issues
  - "Test Location Detection" button to see detected location without tax lookup
  - Location info display showing format: "Detected: Dallas, Dallas County, Texas"
  - Enhanced console logging for better debugging information

## [0.1.5] - 2025-05-29

### 🔧 Critical Bug Fixes
- **FIXED: "Route not found" errors for all tax lookups** - Frontend was sending full state names ("Texas") but backend expected state codes ("TX")
- **FIXED: Vercel deployment linking** - Resolved project linking issues that prevented deployments
- **IMPROVED: Location detection** - GPS location detection now works correctly with proper state code handling
- **IMPROVED: Manual lookup** - Dropdown selections now work with proper state code conversion

### 🎯 What's Working Now
- ✅ "Use My Current Location" button functions properly
- ✅ Manual state/county/city selection returns tax data
- ✅ Debug location detection shows accurate results
- ✅ Backend API receives correct state codes for all requests

**Note:** This was a critical infrastructure fix - all tax lookup functionality should now work as expected.

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

- **v0.1.5**: Critical infrastructure fixes
- **v0.1.4**: CORS and deployment fixes
- **v0.1.3**: Build versioning system and geolocation improvements  
- **v0.1.2**: Google Maps API fixes
- **v0.1.1**: Initial CORS fixes
- **v0.1.0**: Initial production release 