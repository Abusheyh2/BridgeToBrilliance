# Production Server Deployment Guide

This guide helps you deploy Bridge to Brilliance as a production website on any server.

## Prerequisites

- Node.js 18+ installed
- A server with at least 512MB RAM (2GB+ recommended)
- A database (Supabase already configured)
- A domain name (optional but recommended)

## Quick Start - Production Build

### 1. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

### 2. Start Production Server

```bash
npm start
```

The app will run on `http://0.0.0.0:3000` (accessible from any IP on your network).

### 3. Set Environment Variables

Create `.env.production.local`:
```bash
cp .env.production.example .env.production.local
```

Fill in your production credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Server Deployment Options

### Option 1: Linux Server (Recommended)

**On Ubuntu/Debian:**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone/upload your codebase
cd /var/www/btb-site
npm install
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "btb" -- start
pm2 save
pm2 startup
```

**Using systemd service:**

Create `/etc/systemd/system/btb-site.service`:
```ini
[Unit]
Description=Bridge to Brilliance Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/btb-site
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable btb-site
sudo systemctl start btb-site
```

### Option 2: Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  btb-site:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

Then:
```bash
docker compose up -d
```

### Option 3: Vercel (Recommended for Next.js)

Vercel is specifically optimized for Next.js:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.production.local`
5. Deploy

Cost: Free tier available, paid plans for custom domains.

### Option 4: Railway / Render / Fly.io

These platforms offer easy Next.js hosting:
- **Railway**: Simple GitHub integration, $5/month minimum
- **Render**: Free tier available
- **Fly.io**: Global deployment, free tier

## Performance Optimizations Enabled

✅ **Image Optimization** - Automatic AVIF/WebP conversion
✅ **Compression** - Automatic Gzip compression
✅ **Security Headers** - CORS, CSP, X-Frame-Options
✅ **Caching** - Static assets cached for 1 year
✅ **Strict Type Checking** - Production-grade TypeScript
✅ **Source Map Removal** - Smaller bundle size, better security
✅ **Modern JavaScript** - ES2020 target for better performance

## Accessing Your Server

### From Local Network
```
http://<your-server-ip>:3000
```

### From Internet (with port forwarding)
1. Enable port forwarding on your router (forward port 3000 to your server)
2. Get your public IP: `curl ifconfig.me`
3. Share: `http://<your-public-ip>:3000`

### With Reverse Proxy (Nginx/Apache)

**Nginx example** (`/etc/nginx/sites-enabled/btb`):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### Check if server is running
```bash
curl http://localhost:3000
```

### Monitor with PM2
```bash
pm2 logs btb
pm2 status
```

### System monitoring
```bash
top
df -h
free -h
```

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it (if needed)
kill -9 <PID>
```

### Build fails
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Cannot access from other machine

1. Check firewall:
   ```bash
   sudo ufw allow 3000
   ```

2. Verify server is listening:
   ```bash
   netstat -an | grep 3000
   ```

3. Test connection:
   ```bash
   telnet <server-ip> 3000
   ```

## SSL/TLS (HTTPS)

For production, always use HTTPS:

**Using Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

Update your Nginx config to use the certificates.

## Production Checklist

- [ ] Environment variables configured (`.env.production.local`)
- [ ] Production build tested locally (`npm run build && npm start`)
- [ ] Database migrations run on production
- [ ] Security headers enabled (already done in next.config.ts)
- [ ] SSL/TLS certificate installed
- [ ] Process manager (PM2 or systemd) configured
- [ ] Monitoring and logging set up
- [ ] Firewall rules configured
- [ ] Backups scheduled

## Performance Tips

1. **Use CDN** for static assets (Cloudflare, AWS CloudFront)
2. **Enable gzip** compression (already enabled)
3. **Set up caching headers** (already configured)
4. **Use database connection pooling** for high traffic
5. **Monitor performance** with tools like New Relic or Sentry
6. **Use analytics** to understand user behavior

## Getting Help

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Server-specific help via your hosting provider
