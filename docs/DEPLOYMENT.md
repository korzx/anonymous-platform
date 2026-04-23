# 🚀 Deployment Guide

This guide covers deploying the Anonymous Platform to production with full privacy and security practices.

---

## Pre-Deployment Checklist

Before deploying to production, complete these steps:

- [ ] Encryption key generated and stored securely
- [ ] Rate limit salt generated
- [ ] Database schema created in Supabase
- [ ] All environment variables configured
- [ ] HTTPS/TLS certificate obtained
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Content moderation configured
- [ ] Error logging configured (without PII)
- [ ] Database backups configured
- [ ] WAF/DDoS protection enabled
- [ ] Privacy policy written and published
- [ ] Terms of Service reviewed

---

## Option 1: Vercel (Recommended)

Vercel is the recommended platform because:
- Automatic HTTPS
- Built-in security headers support
- Serverless (scales automatically)
- Easy environment variable management
- CDN included

### Steps

1. **Create GitHub Repository**
```bash
git init
git add .
git commit -m "Initial commit: anonymous platform"
git remote add origin https://github.com/YOUR_USERNAME/anonymous-platform.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to vercel.com
   - Sign up with GitHub
   - Import project
   - Select `anonymous-platform` repository

3. **Configure Environment Variables**
   In Vercel project settings → Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ENCRYPTION_KEY=your-base64-32-byte-key
   RATE_LIMIT_SALT_INITIAL=your-hex-32-byte-salt
   OPENAI_API_KEY=sk-... (optional)
   NODE_ENV=production
   ENABLE_REQUEST_LOGS=false
   DISABLE_ANALYTICS=true
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Custom Domain** (optional)
   - Add domain in Vercel settings
   - Update DNS records
   - SSL certificate auto-generated

### Security Configuration

Vercel automatically applies:
- ✅ HTTPS (automatic)
- ✅ Security headers (from next.config.js)
- ✅ DDoS protection
- ✅ Rate limiting per IP (Vercel's limits)

---

## Option 2: Netlify

Similar to Vercel, Netlify also works well.

### Steps

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to netlify.com
   - Connect GitHub account
   - Select repository
   - Configure build:
     ```
     Build command: npm run build
     Publish directory: .next
     ```

3. **Set Environment Variables**
   Settings → Build & Deploy → Environment:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ENCRYPTION_KEY=...
   RATE_LIMIT_SALT_INITIAL=...
   ```

4. **Deploy**
   - Automatic on push to main
   - Or manual: `netlify deploy --prod`

---

## Option 3: Heroku

For traditional container deployment.

### Steps

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:basic
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NEXT_PUBLIC_SUPABASE_URL=...
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=...
   heroku config:set ENCRYPTION_KEY=...
   heroku config:set RATE_LIMIT_SALT_INITIAL=...
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Monitor**
   ```bash
   heroku logs --tail
   ```

---

## Option 4: DigitalOcean App Platform

For managed application hosting.

### Steps

1. **Create DigitalOcean Account** & connect GitHub

2. **Create App**
   - Choose repository
   - Select `anonymous-platform`
   - Specify build command: `npm run build`
   - Specify run command: `npm start`

3. **Configure Environment**
   - Add environment variables (same as above)
   - Enable HTTPS (automatic)

4. **Deploy**
   - Choose resource plan (Standard: $12/month)
   - Create app

---

## Option 5: Self-Hosted (Advanced)

For maximum control (requires DevOps knowledge).

### Prerequisites
- Ubuntu/Debian server
- Node.js 18+
- PostgreSQL or managed Supabase
- SSL certificate (Let's Encrypt)

### Steps

1. **Install Dependencies**
   ```bash
   sudo apt update && sudo apt upgrade
   sudo apt install nodejs npm postgresql
   sudo npm install -g pm2
   ```

2. **Clone & Setup**
   ```bash
   git clone https://github.com/YOUR_USER/anonymous-platform.git
   cd anonymous-platform
   npm install
   npm run build
   ```

3. **Create `.env.production.local`**
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ENCRYPTION_KEY=...
   RATE_LIMIT_SALT_INITIAL=...
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "anonymous-platform" -- start
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # Strong SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           
           # Security headers
           add_header X-Frame-Options "DENY";
           add_header X-Content-Type-Options "nosniff";
           add_header X-XSS-Protection "1; mode=block";
           add_header Referrer-Policy "no-referrer";
           add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
       }
   }
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d your-domain.com
   # Auto-renewal runs via cron
   ```

7. **Enable UFW Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

## Database Setup (All Platforms)

### Create Supabase Project

1. Go to supabase.com
2. Create new project
3. Choose region (EU for GDPR)
4. Get credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` from Settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` from API Keys
   - `SUPABASE_SERVICE_ROLE_KEY` from API Keys

### Run Schema

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire `supabase/schema.sql`
4. Paste and execute

Verify tables created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should see:
- `submissions`
- `submission_reactions`
- `moderation_logs`
- `rate_limit_logs`

### Enable Backups

Supabase Settings → Database → Backups:
- Enable daily backups
- Keep 7-day retention
- Backups encrypted automatically

---

## SSL/TLS Certificate

### For Vercel/Netlify
✅ Automatic - nothing to do

### For Self-Hosted
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal (runs automatically)
sudo systemctl enable certbot.timer
```

**Verify:**
```bash
# Check certificate
sudo openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text

# Test SSL
curl -v https://your-domain.com/api/health
```

---

## Monitoring & Logging

### Application Monitoring

Option 1: **Sentry** (Error tracking)
```bash
npm install @sentry/nextjs
```

In `next.config.js`:
```javascript
const withSentry = require('@sentry/nextjs/withSentry');

module.exports = withSentry({
  // your config
}, {
  org: 'your-org',
  project: 'your-project',
});
```

Note: Configure Sentry to NOT capture PII

Option 2: **Datadog** (Infrastructure monitoring)
- Monitor uptime
- Track API response times
- Alert on errors

Option 3: **Cloud Native Alternatives**
- Vercel Analytics
- Netlify Functions monitoring

### Log Aggregation

**Important:** NEVER log personal data!

Only log:
- ✅ Error messages
- ✅ Moderation decisions (no content)
- ✅ API response times
- ✅ Database query errors

NOT:
- ❌ Request bodies
- ❌ User IPs
- ❌ Cookies
- ❌ Session data

---

## Performance Optimization

### Database Queries

Use indexes (already in schema.sql):
```sql
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_category ON submissions(category);
```

### CDN Caching

```javascript
// next.config.js
async headers() {
  return [{
    source: '/api/feed',
    headers: [{
      key: 'Cache-Control',
      value: 'max-age=60, s-maxage=120, stale-while-revalidate=240'
    }]
  }];
}
```

### Image Optimization
```typescript
// Use Next.js Image component (if images needed)
import Image from 'next/image';
<Image src="..." width={100} height={100} />
```

---

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Test health check
curl https://your-domain.com/api/health

# Test submission
curl -X POST https://your-domain.com/api/submit \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","category":"feelings"}'

# Test feed
curl https://your-domain.com/api/feed
```

### 2. Security Verification

```bash
# Check security headers
curl -I https://your-domain.com

# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000

# Test SSL/TLS
curl -I --tlsv1.2 https://your-domain.com
```

### 3. Database Verification

```sql
-- Check submissions table
SELECT COUNT(*) FROM submissions;

-- Check moderation logs
SELECT * FROM moderation_logs ORDER BY timestamp DESC LIMIT 10;

-- Check rate limits
SELECT COUNT(*) FROM rate_limit_logs WHERE timestamp > NOW() - INTERVAL '1 day';
```

### 4. Monitor First Hour

- Watch error logs
- Check response times
- Verify rate limiting
- Monitor database connections
- Check error rates (should be 0%)

---

## Scaling for Growth

### When You Get Popular

**Database:**
- Upgrade Supabase tier
- Enable read replicas
- Configure connection pooling

**Backend:**
- Use Next.js revalidation for caching
- Consider background job queue (for moderation)
- Rate limit adjustments

**Frontend:**
- Enable Next.js image optimization
- Use ISR (Incremental Static Regeneration)
- Optimize CSS/JS

**Infrastructure:**
- Enable CDN caching
- Use WAF (Cloudflare, AWS Shield)
- Consider auto-scaling

---

## Maintenance

### Weekly
- [ ] Check error logs
- [ ] Monitor database size
- [ ] Verify backups running

### Monthly
- [ ] Review moderation stats
- [ ] Check security alerts
- [ ] Update dependencies (`npm audit`)

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Database maintenance
- [ ] Cost optimization

### Annually
- [ ] Penetration testing
- [ ] Full security review
- [ ] Architecture assessment
- [ ] Encryption key rotation

---

## Disaster Recovery

### Database Backup & Restore

```bash
# Supabase handles backups automatically
# Manual backup:
pg_dump -h db.your-project.supabase.co \
  -U postgres your_db > backup.sql

# Restore:
psql -h db.new-project.supabase.co \
  -U postgres your_db < backup.sql
```

### Encryption Key Rotation

When rotating `ENCRYPTION_KEY`:
1. Create new key in environment
2. Deploy new version with both old + new keys
3. Re-encrypt database records
4. Remove old key
5. Deploy again

---

## Troubleshooting

### App Won't Start
```bash
# Check logs
npm run build
npm start

# Verify environment variables
echo $ENCRYPTION_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Database Connection Error
```bash
# Test connection
psql -h db.your-project.supabase.co -U postgres

# Check credentials
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Slow Feed Response
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM submissions 
WHERE is_flagged = FALSE 
ORDER BY created_at DESC LIMIT 20;

-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_submissions_created_at 
  ON submissions(created_at DESC);
```

---

## Support

- **Deployment Issues:** Check platform documentation
- **Database Issues:** Supabase docs + PostgreSQL docs
- **Security Issues:** See SECURITY.md

---

**Last Updated:** February 26, 2026
