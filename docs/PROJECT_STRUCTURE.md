# 📁 Complete Project Structure

This document shows every file in the anonymous platform project with descriptions.

---

## Project Tree

```
anonymous-platform/
├── 📄 ROOT FILES
│   ├── package.json                 Dependencies & scripts
│   ├── tsconfig.json               TypeScript configuration
│   ├── next.config.js              Next.js config (security headers)
│   ├── middleware.ts               Security middleware
│   ├── .eslintrc.json              Code quality rules
│   ├── .gitignore                  Don't commit these files
│   ├── .env.example                Environment template (no secrets)
│   ├── .env.local.example          Detailed env template with descriptions
│   ├── README.md                   Project overview & features
│   ├── QUICKSTART.md               ⭐ Start here - Step-by-step setup
│   └── LICENSE                     MIT License
│
├── 📂 app/                          Next.js App Router
│   ├── layout.tsx                  Root layout (HTML structure)
│   ├── page.tsx                    Main page (/ route)
│   ├── page.module.css             Main page styling
│   ├── globals.css                 Global styles
│   ├── robots.txt                  Search engine policy (no indexing)
│   │
│   └── 📂 api/                     API Endpoints (backend)
│       ├── 📂 submit/
│       │   └── route.ts            POST /api/submit (anonymous submission)
│       │
│       ├── 📂 feed/
│       │   └── route.ts            GET /api/feed (infinite scroll)
│       │
│       └── 📂 health/
│           └── route.ts            GET /api/health (monitoring)
│
├── 📂 components/                   React Components (UI)
│   ├── AnonymousForm.tsx           Submission form component
│   ├── AnonymousForm.module.css    Form styling
│   ├── Feed.tsx                    Infinite scroll feed
│   ├── Feed.module.css             Feed styling
│   ├── SubmissionCard.tsx          Individual post component
│   ├── SubmissionCard.module.css   Card styling
│   ├── Loading.tsx                 Loading spinner
│   └── Loading.module.css          Loading styling
│
├── 📂 lib/                          Utilities & Business Logic
│   ├── constants.ts                Security configuration & constants
│   ├── crypto.ts                   🔐 AES-256-GCM encryption functions
│   ├── rate-limit.ts               🔐 IP hashing & rate limiting (rotating salt)
│   ├── ai-moderation.ts            🤖 Content moderation pipeline
│   └── db.ts                       Database operations (Supabase)
│
├── 📂 types/                        TypeScript Type Definitions
│   └── index.ts                    All types (Submission, FeedResponse, etc.)
│
├── 📂 supabase/                     Database
│   └── schema.sql                  🗄️  Complete PostgreSQL schema
│
├── 📂 public/                       Static Assets
│   └── robots.txt                  Prevents search engine indexing
│
└── 📂 docs/                         📚 Documentation
    ├── SECURITY.md                 ⭐ CRITICAL: Security architecture
    ├── ARCHITECTURE.md             System design & data flow diagrams
    ├── DEPLOYMENT.md               🚀 Deploy to production guide
    ├── GETTING_STARTED.md          Step-by-step setup (detailed)
    ├── API.md                      API endpoint reference
    └── SUMMARY.md                  Project overview & quick reference
```

---

## File Descriptions

### 🎯 START HERE
1. **[QUICKSTART.md](../QUICKSTART.md)** (5-10 min read)
   - Fast setup checklist
   - Step-by-step instructions
   - Troubleshooting

2. **[README.md](../README.md)** (10 min read)
   - Project features
   - Privacy principles
   - Quick start

### 📚 DOCUMENTATION

#### Security & Architecture
- **[SECURITY.md](SECURITY.md)** (30 min read) ⭐ MOST IMPORTANT
  - Privacy architecture explained
  - IP hashing with rotating salt
  - Encryption pipeline
  - Threat model & mitigations
  - Security checklist

- **[ARCHITECTURE.md](ARCHITECTURE.md)** (15 min read)
  - System diagrams (ASCII art)
  - Data flow visualization
  - Security layers
  - Database schema explained

#### Operations & Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** (20 min read)
  - Deploy to Vercel (easiest)
  - Deploy to Netlify
  - Deploy to Heroku
  - Self-hosted on DigitalOcean
  - SSL/TLS setup
  - Monitoring configuration

- **[GETTING_STARTED.md](GETTING_STARTED.md)** (30 min read)
  - Detailed local setup
  - Key generation
  - Supabase configuration
  - Testing procedures
  - Common issues & fixes

#### API Reference
- **[API.md](API.md)** (15 min read)
  - POST /api/submit
  - GET /api/feed
  - POST /api/react (future)
  - GET /api/health
  - Error handling
  - Code examples

#### Overview
- **[SUMMARY.md](SUMMARY.md)** (15 min read)
  - Features & roadmap
  - Configuration reference
  - Testing checklist
  - Performance metrics

---

## Source Code Organization

### 🔐 Security Layer (`lib/`)

**[lib/constants.ts](../lib/constants.ts)**
```typescript
// Security configuration
RATE_LIMIT: { REQUESTS_PER_DAY: 10, REQUESTS_PER_HOUR: 3 }
ENCRYPTION: { ALGORITHM: 'aes-256-gcm', KEY_SIZE: 32 }
CONTENT: { MIN_LENGTH: 10, MAX_LENGTH: 5000 }
MODERATION: { BLOCKED_KEYWORDS: [...], CONFIDENCE_THRESHOLD: 0.7 }
```

**[lib/crypto.ts](../lib/crypto.ts)** - Core Privacy Functions
- `encryptContent()` - AES-256-GCM encryption
- `decryptContent()` - Decrypt submissions
- `hashContent()` - Create content hash for moderation
- `sanitizeContent()` - Remove PII (emails, phones, URLs)
- `generateUUID()` - Random anonymous ID

**[lib/rate-limit.ts](../lib/rate-limit.ts)** - Novel IP Protection
- `hashIP()` - Hash with rotating daily salt
- `extractIP()` - Get client IP (handles proxies)
- `checkRateLimit()` - Enforce 10/day per IP
- Rotating salt prevents IP correlation across days

**[lib/ai-moderation.ts](../lib/ai-moderation.ts)** - Content Safety
- `moderateContent()` - Multi-stage moderation
- Local keyword filter (fast)
- Spam pattern detection
- Optional OpenAI API integration
- No user identification

**[lib/db.ts](../lib/db.ts)** - Database Operations
- `storeSubmission()` - Insert encrypted content
- `getSubmissionsFeed()` - Paginated retrieval
- `logModerationEvent()` - Audit trail
- `addReaction()` - Anonymous reactions

### 🎨 Frontend Components (`components/`)

**[components/AnonymousForm.tsx](../components/AnonymousForm.tsx)**
- Textarea input (10-5000 chars)
- Category selector dropdown
- Character counter
- Submit button with loading state
- Error display

**[components/Feed.tsx](../components/Feed.tsx)**
- Infinite scroll (Intersection Observer)
- Lazy loads 10 items at a time
- Pagination cursor support
- Loading states
- Empty state

**[components/SubmissionCard.tsx](../components/SubmissionCard.tsx)**
- Displays single submission
- Shows category & timestamp
- Emoji reaction buttons (6 options)
- Text formatting (preserves line breaks)

### 🌐 API Routes (`app/api/`)

**[app/api/submit/route.ts](../app/api/submit/route.ts)** - POST Endpoint
1. Rate limit check (hashed IP)
2. Content validation
3. Sanitization (remove PII)
4. Moderation check
5. Encryption (AES-256-GCM)
6. Database storage
7. Return submission ID

**[app/api/feed/route.ts](../app/api/feed/route.ts)** - GET Endpoint
1. Parse pagination cursor
2. Query database
3. Fetch reaction counts
4. Decrypt submissions
5. Format response
6. Return with cache headers

**[app/api/health/route.ts](../app/api/health/route.ts)** - Monitor Endpoint
- Returns: `{ status: 'ok', timestamp }`
- Used for uptime monitoring

### 📱 UI Pages (`app/`)

**[app/layout.tsx](../app/layout.tsx)**
- HTML structure
- Meta tags (no tracking)
- Referrer policy: no-referrer

**[app/page.tsx](../app/page.tsx)**
- Main interface
- Two columns: Form + Feed
- Success message display
- Responsive responsive design

### 🎨 Styling

**[app/globals.css](../app/globals.css)**
- Global styles
- Remove autofill fingerprinting
- Dark mode support
- Accessibility features

**[app/page.module.css](../app/page.module.css)**
- Main layout
- Header styling
- Grid columns (responsive)

**[components/*.module.css](../components/)**
- Component-scoped styles
- Button states
- Form inputs
- Card design

### ⚙️ Configuration

**[next.config.js](../next.config.js)**
- Security headers
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- Disabled telemetry

**[middleware.ts](../middleware.ts)**
- Request-level security headers
- Applies to all responses

**[tsconfig.json](../tsconfig.json)**
- Strict type checking
- Path aliases (@/)
- Modern JavaScript target

**[package.json](../package.json)**
- Dependencies (Next.js, TypeScript, Supabase)
- Scripts (dev, build, start)
- Version & metadata

### 📦 Database

**[supabase/schema.sql](../supabase/schema.sql)** - PostgreSQL Schema
```sql
submissions         -- Encrypted content
reactions           -- Anonymous reactions
comments            -- Future feature
moderation_logs     -- Audit trail (no PII)
rate_limit_logs     -- Hashed IPs only
```

### 📋 Type Definitions

**[types/index.ts](../types/index.ts)**
```typescript
SubmissionCategory  -- Union of categories
AnonymousSubmission -- Response type
FeedResponse        -- Paginated feed
SubmitResponse      -- POST response
RateLimitInfo       -- Rate limit info
ModerationResult    -- Moderation decision
SecurityContext     -- Hash & salt info
```

### 🔐 Environment

**[.env.example](../.env.example)**
- Public template
- No values filled in

**[.env.local.example](../.env.local.example)**
- Detailed template with descriptions
- Safe to commit
- Shows what each variable does

**[.gitignore](../.gitignore)**
- Never commit .env.local ✓
- Never commit node_modules ✓
- Never commit .next/ build ✓
- Never commit encryption keys ✓

---

## File Statistics

| Category | Files | Lines of Code | Purpose |
|----------|-------|----------------|---------|
| Configuration | 7 | 200 | Setup & build |
| Documentation | 6 | 3,500+ | Guides & reference |
| API Routes | 3 | 350 | Backend endpoints |
| Components | 7 | 400 | User interface |
| Libraries | 5 | 1,200 | Business logic |
| Types | 1 | 60 | Type definitions |
| Styles | 7 | 600 | Visual design |
| Database | 1 | 250 | Schema |
| **TOTAL** | **37** | **6,500+** | Complete platform |

---

## Reading Order (Recommended)

1. **Day 1 - Setup & Understanding**
   - [ ] [QUICKSTART.md](QUICKSTART.md) - Get running locally
   - [ ] [README.md](../README.md) - Understand features
   - [ ] [SUMMARY.md](SUMMARY.md) - Overview of everything

2. **Day 2 - Deep Dive**
   - [ ] [SECURITY.md](SECURITY.md) - How privacy works
   - [ ] [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [ ] Browse `lib/*.ts` - Implementation details

3. **Day 3 - Ready for Production**
   - [ ] [DEPLOYMENT.md](DEPLOYMENT.md) - Choose hosting
   - [ ] [API.md](API.md) - API reference
   - [ ] Deploy to Vercel/Netlify

---

## Development Tips

### Add New Feature
1. Create component in `components/`
2. Create API endpoint in `app/api/`
3. Update types in `types/index.ts`
4. Add to database if needed
5. Test locally
6. Commit & push

### Debug Issue
1. Check terminal for errors
2. Check browser console (F12)
3. Check Network tab (API calls)
4. Add console.log for debugging
5. Check lib files for security operations

### Customize
- Colors: Edit `app/globals.css`
- Limits: Edit `lib/constants.ts`
- Categories: Edit `types/index.ts`
- Copy limits: Edit `.env.local`

---

## Important Files to Protect

🔴 **NEVER commit to Git:**
- `.env.local` - Contains encryption key!
- Private keys
- API secrets

🟢 **ALWAYS commit to Git:**
- Source code
- Configuration templates (`.env.example`)
- Documentation
- Schema files

---

## Quick Navigation

**Want to understand:**
- Privacy? → Read [SECURITY.md](SECURITY.md)
- How it works? → Read [ARCHITECTURE.md](ARCHITECTURE.md)
- How to deploy? → Read [DEPLOYMENT.md](DEPLOYMENT.md)
- API details? → Read [API.md](API.md)
- How to set up? → Read [GETTING_STARTED.md](GETTING_STARTED.md)

**Want to modify:**
- Encryption → Edit `lib/crypto.ts`
- Rate limiting → Edit `lib/rate-limit.ts`
- Moderation → Edit `lib/ai-moderation.ts`
- Form → Edit `components/AnonymousForm.tsx`
- Feed → Edit `components/Feed.tsx`
- Styles → Edit `*.module.css` files

---

**Total Project Size:** ~50 MB (including node_modules)
**Without node_modules:** ~200 KB
**Build Size:** ~2 MB
**Time to Deploy:** 5-60 minutes (depending on platform)

---

**Last Updated:** February 26, 2026
**Version:** 1.0.0-MVP
**Status:** ✅ Complete & Ready
