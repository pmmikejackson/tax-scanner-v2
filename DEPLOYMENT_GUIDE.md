# Tax Scanner v2 - Deployment Guide

## 🚀 Build Versioning System

The application now uses automatic version management to track deployments and make debugging easier.

### Version Display
- **Location**: Bottom-right corner of all pages
- **Information Shown**: 
  - Version number (e.g., v0.1.1)
  - Build timestamp
  - Environment (DEVELOPMENT/PRODUCTION)
  - Git commit hash
  - Vercel region (when deployed)

### Build Commands

| Command | Version Increment | Use Case |
|---------|------------------|----------|
| `npm run build:deploy` | Patch (0.1.0 → 0.1.1) | Bug fixes, small updates |
| `npm run build:feature` | Minor (0.1.0 → 0.2.0) | New features |
| `npm run build:major` | Major (0.1.0 → 1.0.0) | Breaking changes |

### Manual Version Control

```bash
# Increment version only (no build)
npm run version:patch   # 0.1.0 → 0.1.1
npm run version:minor   # 0.1.0 → 0.2.0  
npm run version:major   # 0.1.0 → 1.0.0

# Build without version increment
npm run build
```

## 📋 Release Notes & Changelog

### Automatic Changelog Updates
- **CHANGELOG.md**: Automatically updated during builds with deployment timestamps
- **Release Notes**: Comprehensive tracking of all changes, fixes, and features
- **Version History**: Complete record of what changed in each version

### Before Each Release
1. **Update CHANGELOG.md**: Add new version section with:
   - **Added**: New features and enhancements
   - **Fixed**: Bug fixes and corrections
   - **Changed**: Updates to existing functionality
   - **Infrastructure**: Deployment and configuration changes

2. **Use Release Template**: Reference `RELEASE_NOTES_TEMPLATE.md` for consistent formatting

### Example Changelog Entry
```markdown
## [0.1.5] - 2025-05-29

### Added
- **Feature Name**: Description of new functionality

### Fixed
- **Bug Fix**: Description of what was resolved

### Infrastructure
- **Deployment**: Configuration or infrastructure changes
```

## 📦 Deployment Workflows

### Frontend (Vercel)

#### For Bug Fixes / Hot Fixes
```bash
cd frontend

# 1. Update CHANGELOG.md with fix details
# 2. Build and deploy
npm run build:deploy    # Auto-increments patch version
git add . && git commit -m "Fix: [description] - v0.1.x" && git push
```

#### For New Features
```bash
cd frontend

# 1. Update CHANGELOG.md with feature details  
# 2. Build and deploy
npm run build:feature   # Auto-increments minor version
git add . && git commit -m "Feature: [description] - v0.x.0" && git push
```

#### For Major Releases
```bash
cd frontend

# 1. Update CHANGELOG.md with breaking changes
# 2. Build and deploy
npm run build:major     # Auto-increments major version
git add . && git commit -m "Major: [description] - vx.0.0" && git push
```

### Backend (Railway)

Backend deploys automatically on git push to main branch.

To increment backend version:
```bash
cd backend
npm version patch|minor|major
git add . && git commit -m "Backend: [description]" && git push
```

## 🔍 Version Tracking

### Check Current Deployed Version
1. **UI**: Look at bottom-right corner of any page
2. **API**: GET `/api/version` for detailed info
3. **Logs**: Build output shows version during deployment
4. **Changelog**: Check CHANGELOG.md for complete version history

### Version Information Available
```json
{
  "version": "0.1.4",
  "buildTime": "2025-05-29T21:18:22.077Z",
  "environment": "production",
  "git": {
    "commit": "4e99eadb",
    "branch": "main"
  },
  "platform": {
    "vercel": true,
    "region": "iad1"
  }
}
```

## 🚦 Deployment Checklist

### Before Deploying
- [ ] **Update CHANGELOG.md** with changes for this version
- [ ] Run tests locally
- [ ] Check linting: `npm run lint`
- [ ] Type check: `npm run type-check`
- [ ] Choose appropriate version increment
- [ ] Update comments for any new/changed code

### After Deploying
- [ ] Verify version number updated in UI
- [ ] **Check CHANGELOG.md** was updated with deployment timestamp
- [ ] Check functionality works as expected
- [ ] Monitor logs for any errors
- [ ] Update team on deployment status

## 🔧 Troubleshooting Deployments

### Version Not Updating
- Check that `npm run build:deploy` was used (not just `npm run build`)
- Verify package.json version field was updated
- Clear browser cache to see new version

### Build Failures
- Check build logs for specific errors
- Verify all dependencies are installed
- Test build locally first: `npm run build`

### Vercel Deployment Issues
- Check Vercel dashboard for deployment status
- Verify environment variables are set correctly
- Check function logs for runtime errors

## 📊 Environment URLs

- **Production**: https://taxscanner.vercel.app
- **Backend API**: https://tax-scanner-v2-production.up.railway.app
- **Local Development**: http://localhost:3000

## 🔐 Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `BUILD_TIME`: Set automatically during build
- `VERCEL_GIT_COMMIT_SHA`: Set automatically by Vercel
- `VERCEL_GIT_COMMIT_REF`: Set automatically by Vercel

### Backend (Railway)
- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_MAPS_API_KEY`: For geocoding functionality
- `PORT`: Set automatically by Railway

## 📈 Version History

See `CHANGELOG.md` for complete version history and detailed release notes.

Recent versions:
- **0.1.4**: CORS and deployment fixes
- **0.1.3**: Build versioning system and geolocation improvements
- **0.1.2**: Google Maps API fixes  
- **0.1.1**: Initial CORS fixes
- **0.1.0**: Initial production release

---

*This guide is updated with each major release. Last updated: v0.1.4* 