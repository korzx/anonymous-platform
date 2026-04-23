# 🚀 Getting Started Guide

Complete step-by-step guide to get the anonymous platform running locally.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** - Download from nodejs.org
- **npm or yarn** - Comes with Node.js
- **Git** - For version control
- **Supabase account** - Free tier works great (supabase.com)
- **Text editor** - VS Code recommended

### Verify Installation

```bash
node --version    # Should be 18+
npm --version     # Should be 8+
git --version     # Any recent version
```

---

## Step 1: Clone the Repository

```bash
# If you don't have it yet, create the project folder
cd ~/Desktop
mkdir anonymous-platform
cd anonymous-platform

# Download the project files
git clone https://github.com/YOUR_USERNAME/anonymous-platform.git .
# Or if local development:
# Just ensure you have all the files in this directory
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- Next.js (React framework)
- TypeScript (type safety)
- Supabase client
- Encryption libraries

Wait for installation to complete (~2-3 minutes).

---

## Step 3: Generate Security Keys

You need to generate cryptographic keys for encryption and rate limiting.

### 3.1 Generate Encryption Key (256-bit)

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[System.Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Minimum 0 -Maximum 256)})) | Out-String

# Or use online generator (NOT for production):
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.html
```

Save the output (looks like: `abcd123/xyz+456def=`)

### 3.2 Generate Rate Limit Salt (256-bit hex)

```bash
# On macOS/Linux:
openssl rand -hex 32

# On Windows (PowerShell):
-join (1..64 | ForEach-Object {'{0:x}' -f (Get-Random -Minimum 0 -Maximum 16)})
```

Save the output (looks like: `a1b2c3d4...`)

---

## Step 4: Create Environment File

Create `.env.local` in the project root:

```bash
# Windows/macOS/Linux - all systems
# Use VS Code or any text editor to create file:
# File → New File → Save As → .env.local
```

Copy this template and fill in YOUR values:

```env
# Supabase Configuration
# Get these from supabase.com → Your Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (copy from Supabase)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (copy from Supabase, keep SECRET!)

# Encryption Key (from Step 3.1)
ENCRYPTION_KEY=abcd123/xyz+456def=

# Rate Limit Salt (from Step 3.2)
RATE_LIMIT_SALT_INITIAL=a1b2c3d4...

# Optional: AI Moderation (skip for now)
OPENAI_API_KEY=

# Environment
NODE_ENV=development
NEXT_PUBLIC_LOG_LEVEL=debug

# Features
ENABLE_REACTIONS=true
ENABLE_FEED=true
```

**⚠️ IMPORTANT:** `.env.local` is in `.gitignore` - never commit it!

---

## Step 5: Setup Supabase Database

### 5.1 Create Supabase Project

1. Go to **supabase.com**
2. Sign up (free)
3. Create new project:
   - **Name:** anonymous-platform
   - **Password:** Strong password (auto-generated)
   - **Region:** Choose closest to you (or EU for privacy)
4. Wait for project to initialize (~1 minute)

### 5.2 Get Supabase Credentials

1. Go to your project
2. Click **Settings** (bottom left)
3. Click **API**
4. Copy these values to `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 5.3 Create Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase/schema.sql` from the project
4. Copy entire contents
5. Paste into Supabase query editor
6. Click **Run** (top right)
7. Wait for success message

Verify tables created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show:
- submissions
- submission_reactions
- submission_comments
- moderation_logs
- rate_limit_logs

---

## Step 6: Run Development Server

```bash
npm run dev
```

You should see:
```
   ▲ Next.js 14.0.0
   - Local:        http://localhost:3000
   ✓ Ready in 1234ms
```

**Open browser:** http://localhost:3000

---

## Step 7: Test the Platform

### 7.1 Submit Content

1. In browser at http://localhost:3000
2. Type in text area: "I feel happy today"
3. Select category: "feelings"
4. Click **Submit Anonymously**
5. Should see: "✓ Anonymous submission sent"

### 7.2 View Feed

1. Scroll down
2. Should see your submission in the feed
3. Try adding emoji reactions

### 7.3 Test Rate Limiting

1. Try submitting 15 times rapidly
2. After ~10 submissions, get rate limit error
3. Wait 24 hours (in code: only on salt rotation)

---

## Troubleshooting

### Error: "Module not found"
```bash
npm install
npm run dev
```

### Error: "Cannot find .env.local"
- Create .env.local file in project root
- Add all required environment variables
- Restart dev server

### Error: "Supabase connection failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Go to Supabase dashboard → check project online
- Click **Settings** → **API** → verify keys

### Error: "ENCRYPTION_KEY must be 32 bytes"
```bash
# Generate new key (exactly 32 bytes)
openssl rand -base64 32
# Change .env.local ENCRYPTION_KEY value
# Restart dev server
```

### Error: "Database tables not found"
- Go to Supabase SQL Editor
- Run `supabase/schema.sql` again
- Check for errors in execution

### Submissions not appearing in feed
1. Check browser console (F12) for errors
2. Check terminal for error messages
3. Verify database schema created correctly
4. Try Google Chrome dev tools → Network tab

---

## Project Structure

Quick reference:

```
anonymous-platform/
├── app/                    # Next.js app (main code)
│   ├── api/               # Backend API endpoints
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Global layout
│   └── globals.css        # Global styles
├── lib/                   # Utilities
│   ├── crypto.ts          # Encryption functions
│   ├── rate-limit.ts      # Rate limiting logic
│   ├── ai-moderation.ts   # Content moderation
│   ├── db.ts              # Database functions
│   └── constants.ts       # Security settings
├── components/            # React components
│   ├── AnonymousForm.tsx  # Submission form
│   ├── Feed.tsx           # Feed component
│   └── SubmissionCard.tsx # Single post card
├── types/                 # TypeScript types
├── supabase/             # Database
│   └── schema.sql        # Database structure
├── docs/                 # Documentation
├── .env.example          # Environment template
├── .env.local            # YOUR variables (not committed)
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── next.config.js        # Next.js config
```

---

## Common Tasks

### Add New Feature

1. Create component in `components/`
2. Create API endpoint in `app/api/`
3. Update types in `types/index.ts`
4. Import in page.tsx
5. Test locally
6. Deploy

### Fix Bug

1. Identify error (check console or terminals)
2. Find relevant file
3. Add debug logging
4. Restart dev server
5. Verify fix
6. Remove debug logging
7. Commit to git

### Update Dependencies

```bash
npm outdated          # See outdated packages
npm update            # Update to latest
npm install package@latest  # Install specific version
npm audit fix         # Fix security issues
```

---

## Development Tips

### Use VS Code
Recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier** (code formatter)
- **TypeScript Vue Plugin**
- **Thunder Client** (API testing)

### Debug with Console
```typescript
console.log('Debug info:', variable);
console.error('Error occurred:', error);
console.table(array); // Pretty print arrays
```

### Use Browser DevTools
- **F12** to open
- **Console** tab for errors
- **Network** tab to see API calls
- **Application** tab to see storage

### Test API Endpoints
```bash
# Using curl
curl -X GET http://localhost:3000/api/health

# Using Thunder Client (VS Code Extension)
# Or Postman (separate app)
```

---

## Next Steps

### After Setup:

1. **Read Documentation**
   - [SECURITY.md](../docs/SECURITY.md) - Security architecture
   - [DEPLOYMENT.md](../docs/DEPLOYMENT.md) - Deploy to production
   - [README.md](../README.md) - Full project info

2. **Explore Code**
   - Read `app/api/submit/route.ts` (understand submission flow)
   - Read `lib/rate-limit.ts` (understand privacy approach)
   - Read `lib/crypto.ts` (understand encryption)

3. **Customize**
   - Add your privacy policy
   - Modify terms of service
   - Add branding/logo
   - Adjust rate limits
   - Configure moderation

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel (5 minutes)
   - Configure custom domain
   - Monitor in production

---

## Getting Help

### Documentation
- [Project README](../README.md)
- [Security Architecture](../docs/SECURITY.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Community
- GitHub Issues
- Stack Overflow
- Next.js Discord
- Supabase Discord

---

## Celebrate! 🎉

You now have a fully functional anonymous emotional expression platform!

- ✅ Submissions encrypted
- ✅ IP addresses hashed (rotating)
- ✅ Rate limiting (no user tracking)
- ✅ Content moderation
- ✅ Infinite scroll feed
- ✅ Anonymous reactions

**Ready to deploy?** → See [DEPLOYMENT.md](../docs/DEPLOYMENT.md)

---

**Last Updated:** February 26, 2026
**Status:** Ready for Development
