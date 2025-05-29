# Deployment Guide

## Recommended Architecture

Based on your experience with Docker deployment issues, here's a secure and maintainable architecture:

### Frontend Deployment (Vercel - Recommended)

1. **Deploy to Vercel** (Best for Next.js):
   ```bash
   cd frontend
   vercel
   ```

2. **Environment Variables** (Set in Vercel dashboard):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
   NEXT_PUBLIC_ENABLE_GEOLOCATION=true
   ```

### Backend Deployment Options

#### Option 1: Railway (Recommended)
- ✅ Easy PostgreSQL setup
- ✅ Automatic deployments from Git
- ✅ Built-in environment management
- ✅ No Docker complexity

1. Connect your GitHub repo to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

#### Option 2: Render
- ✅ Free tier available
- ✅ PostgreSQL included
- ✅ Simple deployment

#### Option 3: Google Cloud Run (Advanced)
- ✅ Serverless containers
- ✅ Pay per use
- ⚠️ Requires more setup

### Database

#### Recommended: Managed PostgreSQL

1. **Railway PostgreSQL** (if using Railway backend)
2. **Supabase** (Free tier, great for development)
3. **AWS RDS** (Production grade)
4. **Google Cloud SQL** (If using GCP)

### Environment Setup

#### Backend (.env)
```bash
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
GOOGLE_MAPS_API_KEY=your_api_key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
```

## Security Best Practices

### 1. API Key Management
- Use different Google Maps API keys for development/production
- Restrict API keys by domain/IP
- Set usage quotas

### 2. Database Security
- Use connection pooling
- Enable SSL connections
- Regular backups

### 3. Rate Limiting
- Implemented in the backend
- Consider Cloudflare for additional protection

### 4. CORS Configuration
- Whitelist only your frontend domain
- No wildcards in production

## Deployment Steps

### 1. Initial Setup

```bash
# Clone and setup
git clone your-repo
cd tax-scanner-v2

# Install dependencies
npm run install:all

# Setup environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local
```

### 2. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 3. Deploy Backend

1. Push to GitHub
2. Connect to Railway/Render
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

### 4. Deploy Frontend

1. Update API URL in environment
2. Deploy to Vercel
3. Set environment variables
4. Test deployment

## Monitoring and Maintenance

### 1. Health Checks
- Backend: `GET /health`
- Monitor database connections
- Set up alerts

### 2. Data Updates
- Manual refresh: `POST /api/tax/refresh`
- Consider scheduled updates with cron jobs
- Monitor data freshness

### 3. Backup Strategy
- Database: Automated daily backups
- Code: Git repository
- Environment variables: Secure vault

## Troubleshooting

### Common Issues

1. **Google API Hanging**
   - Check API key restrictions
   - Verify quotas
   - Use timeouts in axios calls

2. **CORS Errors**
   - Verify CORS_ORIGIN setting
   - Check frontend domain configuration

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check connection limits
   - Use connection pooling

### Debug Commands

```bash
# Check backend health
curl https://your-backend.railway.app/health

# Test API endpoint
curl https://your-backend.railway.app/api/tax/lookup?state=TX&county=harris&city=houston

# View logs
railway logs # (if using Railway)
```

## Performance Optimization

1. **Caching**
   - Redis for frequent lookups
   - CDN for static assets

2. **Database**
   - Index on state/county/city lookups
   - Connection pooling

3. **Frontend**
   - Next.js static generation
   - Image optimization
   - Code splitting 