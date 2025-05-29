# Tax Scanner - Synology NAS Self-Hosting Guide

## 🏠 Complete Self-Hosting Setup for Synology NAS

### Prerequisites

1. **Synology NAS** with DSM 7.0+
2. **Container Manager** package installed
3. **Web Station** package installed
4. **Router** with port forwarding capabilities
5. **Domain name** or Synology DDNS setup

### Step 1: Prepare Your Synology NAS

#### Install Required Packages
1. Open **Package Center**
2. Install **Container Manager** (Docker)
3. Install **Web Station**
4. Install **DNS Server** (optional, for local DNS)

#### Enable SSH (Optional)
1. Go to **Control Panel** → **Terminal & SNMP**
2. Enable **SSH service**

### Step 2: Setup DDNS and SSL

#### Configure DDNS
1. Go to **Control Panel** → **External Access** → **DDNS**
2. Add a new DDNS service (recommend Synology DDNS)
3. Create hostname like: `taxscanner.synology.me`

#### Setup SSL Certificate
1. Go to **Control Panel** → **Security** → **Certificate**
2. Add new certificate with **Let's Encrypt**
3. Use your DDNS domain

### Step 3: Network Configuration

#### Port Forwarding on Router
Forward these ports to your Synology NAS:
- **80** (HTTP) → Synology Port 80
- **443** (HTTPS) → Synology Port 443
- **3000** (Frontend) → Synology Port 3000
- **3001** (Backend API) → Synology Port 3001

#### Synology Firewall
1. Go to **Control Panel** → **Security** → **Firewall**
2. Allow ports: 80, 443, 3000, 3001

### Step 4: Deploy Tax Scanner

#### Upload Project Files
1. Copy entire project to `/volume1/docker/taxscanner/`
2. Use File Station or SCP

#### Configure Environment
1. Copy `synology.env.example` to `.env`
2. Update with your settings:
```bash
DB_PASSWORD=your_secure_password
GOOGLE_MAPS_API_KEY=your_api_key
FRONTEND_URL=https://taxscanner.synology.me
BACKEND_URL=https://taxscanner.synology.me/api
```

#### Deploy with Container Manager
1. Open **Container Manager**
2. Go to **Project** tab
3. Click **Create**
4. Choose **Create docker-compose.yml**
5. Upload your `docker-compose.yml`
6. Set project path: `/volume1/docker/taxscanner`
7. Click **Next** and **Done**

### Step 5: Setup Reverse Proxy

#### Configure Web Station Reverse Proxy
1. Open **Web Station**
2. Go to **Web Service Portal**
3. Create new portal:
   - **Portal type**: Virtual Host
   - **Hostname**: `taxscanner.synology.me`
   - **Port**: HTTPS 443
   - **Document root**: Not needed
4. Go to **Reverse Proxy** tab
5. Add rules:

**Frontend Rule:**
- Source: `taxscanner.synology.me`
- Port: 443
- Destination: `localhost`
- Port: 3000

**API Rule:**
- Source: `taxscanner.synology.me/api/*`
- Port: 443
- Destination: `localhost`
- Port: 3001

### Step 6: Database Initialization

#### Setup Database
1. SSH into your Synology (optional) or use Container Manager terminal
2. Connect to PostgreSQL container:
```bash
docker exec -it taxscanner-db psql -U taxscanner -d taxscanner
```
3. Run migrations:
```bash
docker exec -it taxscanner-backend npx prisma migrate deploy
```
4. Import tax data:
```bash
docker exec -it taxscanner-backend npm run import-data
```

### Step 7: Testing & Monitoring

#### Test Your Deployment
1. Visit: `https://taxscanner.synology.me`
2. Test all functionality:
   - State/County/City selection
   - Location detection
   - Tax rate lookup

#### Monitor with Container Manager
1. Check container health in **Container Manager**
2. View logs for troubleshooting
3. Monitor resource usage

### Step 8: Backup Strategy

#### Database Backups
Create automatic PostgreSQL backups:
```bash
# Add to Synology Task Scheduler
docker exec taxscanner-db pg_dump -U taxscanner taxscanner > /volume1/backups/taxscanner-$(date +%Y%m%d).sql
```

#### Container Backups
- Export container configurations
- Backup `/volume1/docker/taxscanner/` folder

### Maintenance

#### Update Application
1. Pull latest code
2. Rebuild containers:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Monitor Logs
```bash
docker-compose logs -f
```

### Security Best Practices

1. **Change default passwords**
2. **Enable 2FA on Synology**
3. **Regular security updates**
4. **Monitor access logs**
5. **Use strong SSL certificates**
6. **Restrict admin access**

### Troubleshooting

#### Common Issues
- **502 Bad Gateway**: Check container health
- **SSL Errors**: Verify certificate configuration
- **Database Connection**: Check PostgreSQL container
- **API Errors**: Review backend logs

#### Log Locations
- Container logs: Container Manager → Logs
- Web Station logs: `/var/log/nginx/`
- System logs: **Log Center**

### Benefits of Self-Hosting

✅ **Complete control** over your data
✅ **No monthly cloud costs**
✅ **Customizable** to your needs
✅ **Enhanced privacy**
✅ **Local network performance**
✅ **Offline capability**

### Support

For issues with self-hosting setup, check:
1. Container Manager logs
2. Synology community forums
3. Project GitHub issues 