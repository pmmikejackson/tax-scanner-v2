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

## 📦 Deployment Workflows

### Frontend (Vercel)

#### For Bug Fixes / Hot Fixes
```bash
cd frontend
npm run build:deploy    # Auto-increments patch version
git add . && git commit -m "Fix: [description]" && git push
```

#### For New Features
```bash
cd frontend
npm run build:feature   # Auto-increments minor version
git add . && git commit -m "Feature: [description]" && git push
```

#### For Major Releases
```bash
cd frontend
npm run build:major     # Auto-increments major version
git add . && git commit -m "Major: [description]" && git push
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

### Version Information Available
```json
{
  "version": "0.1.1",
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
- [ ] Run tests locally
- [ ] Check linting: `npm run lint`
- [ ] Type check: `npm run type-check`
- [ ] Choose appropriate version increment
- [ ] Update comments for any new/changed code

### After Deploying
- [ ] Verify version number updated in UI
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

- **Production**: https://taxscanner-[hash]-pmmikejacksons-projects.vercel.app
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

- **0.1.1**: Added comprehensive build versioning system
- **0.1.0**: Initial deployment with location detection and tax lookup

---

*This guide is updated with each major release. Last updated: v0.1.1* 