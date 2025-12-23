# Lead Engine OS - DigitalOcean Deployment Guide

**Prepared for:** MyTasker  
**Target Environment:** Kiasu/DigitalOcean Server  
**Application:** Lead Engine OS (Node.js + React)  
**Date:** December 15, 2025

---

## Overview

This guide provides step-by-step instructions for deploying Lead Engine OS to a DigitalOcean droplet. The application is a full-stack Node.js application with a React frontend, requiring Node.js 20+, a MySQL-compatible database, and SSL termination.

---

## Prerequisites

Before starting deployment, ensure the following are available:

| Requirement | Details |
|-------------|---------|
| DigitalOcean Droplet | Ubuntu 22.04 LTS, minimum 2GB RAM |
| Domain | `leadengineos.com` (or subdomain) |
| SSL Certificate | Let's Encrypt (automated via Certbot) |
| Database | MySQL 8.0+ or TiDB Cloud |
| Node.js | v20.x or v22.x |
| PM2 | Process manager for Node.js |

---

## Step 1: Server Preparation

### 1.1 Connect to Server

```bash
ssh root@YOUR_DROPLET_IP
```

### 1.2 Create Application User

```bash
# Create non-root user for the application
adduser leadengineos
usermod -aG sudo leadengineos

# Switch to new user
su - leadengineos
```

### 1.3 Install Node.js

```bash
# Install Node.js 22.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v22.x.x
npm --version

# Install pnpm globally
sudo npm install -g pnpm
```

### 1.4 Install PM2

```bash
sudo npm install -g pm2
```

### 1.5 Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## Step 2: Application Deployment

### 2.1 Create Application Directory

```bash
sudo mkdir -p /var/www/leadengineos
sudo chown leadengineos:leadengineos /var/www/leadengineos
cd /var/www/leadengineos
```

### 2.2 Upload Application Files

Transfer the application zip file to the server:

```bash
# From your local machine
scp leadengineos-complete.zip leadengineos@YOUR_DROPLET_IP:/var/www/leadengineos/
```

Then on the server:

```bash
cd /var/www/leadengineos
unzip leadengineos-complete.zip
```

### 2.3 Install Dependencies

```bash
cd /var/www/leadengineos
pnpm install --frozen-lockfile
```

### 2.4 Build Production Assets

```bash
pnpm build
```

---

## Step 3: Environment Configuration

### 3.1 Create Environment File

Create `/var/www/leadengineos/.env` with the following variables:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database (TiDB Cloud or MySQL)
DATABASE_URL=mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=your-secure-random-string-minimum-32-characters
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Information
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name

# Admin API (for remote management)
ADMIN_API_KEY=your-secure-admin-api-key-minimum-32-characters

# RevenueCat (Billing)
REVENUECAT_API_KEY=your-revenuecat-api-key
REVENUECAT_WEBHOOK_SECRET=your-revenuecat-webhook-secret

# WordPress Credential Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### 3.2 Secure the Environment File

```bash
chmod 600 /var/www/leadengineos/.env
```

---

## Step 4: Database Setup

### 4.1 Push Database Schema

```bash
cd /var/www/leadengineos
pnpm db:push
```

This command creates all required tables in your database.

### 4.2 Verify Database Connection

```bash
# Test the connection
node -e "require('./server/db.js').getDb().then(db => console.log(db ? 'Connected' : 'Failed'))"
```

---

## Step 5: PM2 Process Management

### 5.1 Create PM2 Ecosystem File

Create `/var/www/leadengineos/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'leadengineos',
    script: 'node',
    args: 'dist/server/_core/index.js',
    cwd: '/var/www/leadengineos',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/leadengineos/error.log',
    out_file: '/var/log/leadengineos/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 5.2 Create Log Directory

```bash
sudo mkdir -p /var/log/leadengineos
sudo chown leadengineos:leadengineos /var/log/leadengineos
```

### 5.3 Start Application

```bash
cd /var/www/leadengineos
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5.4 Verify Application is Running

```bash
pm2 status
curl http://localhost:3000/api/health
```

---

## Step 6: Nginx Configuration

### 6.1 Create Nginx Site Configuration

Create `/etc/nginx/sites-available/leadengineos`:

```nginx
server {
    listen 80;
    server_name leadengineos.com www.leadengineos.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name leadengineos.com www.leadengineos.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/leadengineos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/leadengineos.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    
    # Static files
    location /assets {
        alias /var/www/leadengineos/dist/client/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
    
    # All other routes (SPA fallback)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/leadengineos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: SSL Certificate (Let's Encrypt)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain Certificate

```bash
sudo certbot --nginx -d leadengineos.com -d www.leadengineos.com
```

Follow the prompts to complete SSL setup. Certbot will automatically configure Nginx.

### 7.3 Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## Step 8: Firewall Configuration

### 8.1 Configure UFW

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Step 9: Post-Deployment Verification

### 9.1 Health Check

```bash
curl https://leadengineos.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T...",
  "database": "connected",
  "version": "1.0.0"
}
```

### 9.2 Admin API Test

```bash
curl -H "X-Admin-API-Key: YOUR_ADMIN_API_KEY" https://leadengineos.com/api/admin/health
```

### 9.3 Frontend Test

Open `https://leadengineos.com` in a browser and verify:
- Home page loads correctly
- Navigation works
- Login/OAuth flow works
- Dashboard accessible after login

---

## Step 10: Ongoing Maintenance

### 10.1 View Logs

```bash
# Application logs
pm2 logs leadengineos

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 10.2 Restart Application

```bash
pm2 restart leadengineos
```

### 10.3 Update Application

```bash
cd /var/www/leadengineos

# Stop application
pm2 stop leadengineos

# Backup current version
cp -r dist dist.backup

# Upload new files and rebuild
pnpm install --frozen-lockfile
pnpm build

# Run database migrations if needed
pnpm db:push

# Restart application
pm2 restart leadengineos
```

### 10.4 Rollback

```bash
cd /var/www/leadengineos
pm2 stop leadengineos
rm -rf dist
mv dist.backup dist
pm2 restart leadengineos
```

---

## Admin API Reference

The Admin API allows remote management of the application. All endpoints require the `X-Admin-API-Key` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/health` | GET | Health check with database status |
| `/api/admin/tenants` | GET | List all tenants |
| `/api/admin/tenants/:id` | GET | Get tenant by ID |
| `/api/admin/tenants/:id/status` | PUT | Update tenant status |
| `/api/admin/blog` | POST | Create blog post |
| `/api/admin/blog/:id` | PUT | Update blog post |
| `/api/admin/blog/:id` | DELETE | Delete blog post |
| `/api/admin/cache/clear` | POST | Clear application cache |
| `/api/admin/config` | GET | Get current configuration |
| `/api/admin/config` | PUT | Update configuration |

---

## Troubleshooting

### Application Won't Start

1. Check PM2 logs: `pm2 logs leadengineos`
2. Verify environment file exists: `ls -la /var/www/leadengineos/.env`
3. Check Node.js version: `node --version`
4. Verify build completed: `ls -la /var/www/leadengineos/dist`

### Database Connection Failed

1. Verify DATABASE_URL in `.env`
2. Check database is accessible: `mysql -h HOST -u USER -p`
3. Ensure SSL is enabled for TiDB Cloud

### 502 Bad Gateway

1. Check if application is running: `pm2 status`
2. Verify port 3000 is listening: `netstat -tlnp | grep 3000`
3. Check Nginx configuration: `sudo nginx -t`

### SSL Certificate Issues

1. Renew certificate: `sudo certbot renew`
2. Check certificate expiry: `sudo certbot certificates`
3. Verify Nginx SSL config: `sudo nginx -t`

---

## Security Checklist

Before going live, verify:

- [ ] `.env` file has restrictive permissions (600)
- [ ] `ADMIN_API_KEY` is set to a strong random value
- [ ] `JWT_SECRET` is set to a strong random value
- [ ] `REVENUECAT_WEBHOOK_SECRET` is configured
- [ ] Firewall only allows ports 22, 80, 443
- [ ] SSL certificate is valid and auto-renewal works
- [ ] Application logs are being written
- [ ] Database backups are configured

---

## Contact

For deployment issues, contact the development team or refer to the project documentation.
