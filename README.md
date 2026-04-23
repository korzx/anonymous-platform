# 🌙 Anonymous Emotional Expression Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)
[![Security: Privacy First](https://img.shields.io/badge/Security-Privacy%20First-brightgreen)](docs/SECURITY.md)

A **completely privacy-first platform** for sharing emotions anonymously, without accounts, tracking, or any personal data collection.

> **"What is something you feel but cannot tell anyone?"**

---

## 🔐 Privacy First

This platform is built with **security and anonymity as the core** principles:

- ✅ **No sign-up** - Share instantly
- ✅ **Zero tracking** - No cookies, analytics, or fingerprinting
- ✅ **Encrypted** - Content encrypted at rest (AES-256-GCM)
- ✅ **Truly anonymous** - No IP logging, rotating hashed IPs
- ✅ **No personal data** - Impossible to identify users
- ✅ **Safe content** - AI moderation but completely anonymous
- ✅ **Open source** - Audit the code yourself

---

## 📋 Features

### MVP (Current)
- Anonymous submission form (text only)
- Infinite scroll feed
- Category tags (feelings, fears, dreams, secrets, etc.)
- Anonymous reactions (emojis)
- AI content moderation (spam & abuse detection)
- Rate limiting (rotating hash-based)
- Encryption at rest

### Future
- Anonymous comments
- Keyword-based feed filtering
- Dark mode
- Accessibility improvements
- Mobile app
- ...

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Minimal CSS (no frameworks for privacy)

**Backend:**
- Next.js API Routes
- Node.js runtime

**Database:**
- Supabase (PostgreSQL)
- Encrypted at source level

**Security:**
- AES-256-GCM encryption
- Rotating salted IP hashes (no raw IPs)
- Content sanitization
- AI moderation pipeline

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 2. Clone & Install

```bash
cd anonymous-platform
npm install
```

### 3. Create `.env.local`

Copy from `.env.example` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate encryption key (256-bit base64):
# openssl rand -base64 32
ENCRYPTION_KEY=your-base64-encoded-key

# Generate rate limit salt (256-bit hex):
# openssl rand -hex 32
RATE_LIMIT_SALT_INITIAL=your-hex-salt

# Optional: OpenAI for advanced moderation
OPENAI_API_KEY=sk-...
```

### 4. Supabase Setup

```bash
# 1. Create Supabase project at supabase.com
# 2. Go to SQL Editor
# 3. Create new query
# 4. Paste contents of supabase/schema.sql
# 5. Run
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🔐 Security Implementation

### Encryption

```typescript
import { encryptContent, decryptContent } from '@/lib/crypto';

// At submission
const encrypted = encryptContent(userContent);
// Stored: "iv:authTag:ciphertext"

// At retrieval
const decrypted = decryptContent(dbContent);
```

### Rate Limiting (Hashed IP)

```typescript
import { checkRateLimit, hashIP } from '@/lib/rate-limit';

// Daily salt rotation prevents IP correlation
const { allowed, remaining } = checkRateLimit(request);
```

### Content Moderation

```typescript
import { moderateContent } from '@/lib/ai-moderation';

const decision = await moderateContent(userContent);
// { status: 'approved' | 'rejected' | 'flagged', reason?: string }
```

---

## 📁 Project Structure

```
anonymous-platform/
├── app/
│   ├── api/
│   │   ├── submit/route.ts       # POST endpoint
│   │   ├── feed/route.ts         # GET infinite scroll
│   │   └── health/route.ts       # Health check
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main UI
│   └── globals.css               # Global styles
├── components/
│   ├── AnonymousForm.tsx         # Submission form
│   ├── Feed.tsx                  # Infinite feed
│   ├── SubmissionCard.tsx        # Single post
│   └── Loading.tsx               # Loading state
├── lib/
│   ├── constants.ts              # Security config
│   ├── crypto.ts                 # Encryption utils
│   ├── rate-limit.ts             # IP hashing & limits
│   ├── ai-moderation.ts          # Content safety
│   └── db.ts                     # Database client
├── types/
│   └── index.ts                  # TypeScript types
├── supabase/
│   └── schema.sql                # Database schema
├── docs/
│   └── SECURITY.md               # Security architecture
└── .env.example                  # Environment template
```

---

## 🧪 Testing

### Rate Limiting
```bash
# Test with curl (same "IP" per request):
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/submit \
    -H "Content-Type: application/json" \
    -d '{"content":"test content", "category":"feelings"}'
done
# Should see: 429 Too Many Requests after 10th request
```

### Encryption
```typescript
// In a test file
import { encryptContent, decryptContent } from '@/lib/crypto';

const original = "Secret message";
const encrypted = encryptContent(original);
const decrypted = decryptContent(encrypted);

expect(decrypted).toBe(original);
expect(encrypted).not.toContain("Secret"); // Never visible
```

---

## 📊 Database Design

### Submissions Table
```sql
id (UUID)              -- Random, not tied to user
content (encrypted)    -- AES-256-GCM encrypted
category              -- feelings | fears | dreams | etc.
content_hash          -- For moderation only
is_flagged            -- True if needs review
created_at            -- Timestamp
```

### Key Feature: NO USER TABLE
There is no users table. No sessions. No accounts. Truly anonymous.

### Reactions Table
```sql
submission_id (UUID)  -- Which post (not who)
emoji (string)        -- Reaction emoji
created_at           -- When
```

---

## 🛡️ Security Features

### Rotating IP Hash (Novel Approach)
```
February 26:  IP 192.168.1.100 → Hash: abc123... (stored)
February 27:  IP 192.168.1.100 → Hash: xyz789... (stored)

Result: Same user, completely different hash
Can't correlate user across days!
```

### Content Sanitization
Before storage, removes:
- ❌ Email addresses → `[email]`
- ❌ Phone numbers → `[phone]`
- ❌ SSN patterns → `[ssn]`
- ❌ URLs → `[url]`

### Moderation Pipeline
1. Keyword filter (local)
2. Spam patterns (local)
3. Optional AI (if API configured)

All anonymous, no user tracking.

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel: vercel.com
# 3. Set environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - ENCRYPTION_KEY
#    - RATE_LIMIT_SALT_INITIAL
#    - OPENAI_API_KEY (optional)

# 4. Deploy
vercel --prod
```

### Other Platforms

- **Netlify** (similar to Vercel)
- **Heroku** (add PostgreSQL addon)
- **DigitalOcean** (App Platform or VM)
- **AWS** (Lambda + RDS)

All work, just ensure:
- HTTPS enabled
- Environment variables configured
- Database accessible from app
- Security headers in place (already in next.config.js)

---

## 🔗 API Endpoints

### POST /api/submit
**Anonymous submission**

Request:
```json
{
  "content": "I feel...",
  "category": "feelings"
}
```

Response (201):
```json
{
  "id": "uuid-123",
  "status": "success"
}
```

Rate Limited: 10/day per IP (rotating hash)

### GET /api/feed?limit=20&cursor=...
**Fetch anonymous feed**

Response (200):
```json
{
  "submissions": [
    {
      "id": "uuid-1",
      "content": "I feel anxious...",
      "category": "feelings",
      "created_at": "2026-02-26T10:30:00Z",
      "reactions_count": 5
    }
  ],
  "cursor": "2026-02-26T10:29:00Z",
  "has_more": true
}
```

### GET /api/health
**Health check**

Response (200):
```json
{
  "status": "ok",
  "timestamp": "2026-02-26T10:30:00Z"
}
```

---

## 🐛 Troubleshooting

### "Encryption key error"
```bash
# Generate new key:
openssl rand -base64 32
# Add to .env.local as ENCRYPTION_KEY
```

### "Supabase connection error"
- Check NEXT_PUBLIC_SUPABASE_URL
- Verify Service Role Key has database access
- Ensure schema.sql was run correctly

### "Rate limiting not working"
- Verify RATE_LIMIT_SALT_INITIAL is set
- Check client sends requests from same IP
- Works differently if behind proxy (use X-Forwarded-For)

### "Moderation blocking everything"
- Check ai-moderation.ts logic
- Verify MODERATION.BLOCKED_KEYWORDS
- If using OpenAI, check API key validity
- Try with ENABLE_MODERATIONS=false temporarily

---

## 📚 Documentation

- **[SECURITY.md](./docs/SECURITY.md)** - Full security architecture
- **[.env.example](./.env.example)** - Configuration template
- **[supabase/schema.sql](./supabase/schema.sql)** - Database schema

---

## 🤝 Contributing

We'd love your help! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Pull request process
- Security considerations

**Security Vulnerabilities:**
If you discover a security vulnerability, please email with details instead of opening a public issue.

**Bug Reports & Features:**
Open [GitHub Issues](../../issues) for bugs and feature requests.

---

## 📄 License

MIT - Open source, use freely with attribution.

---

## ⚖️ Legal

### Privacy Policy
We don't collect personal data. No legal, regulatory, or ethical requirements are violated. Users remain completely anonymous.

### Terms of Service
Users assume responsibility for their submissions. Illegal content is moderated (but no user identification occurs). We reserve the right to remove harmful submissions.

### Disclaimer
This platform is designed for emotional safety. We're not a replacement for mental health services. If you're in crisis, please contact:

- **US:** 988 Suicide & Crisis Lifeline
- **EU:** Befrienders International
- **Your country:** [Local crisis support]

---

## 🎯 Philosophy

**This platform is built on a simple belief:**

Everyone deserves a safe space to express their true feelings without judgment or identification. Privacy is not about hiding wrongdoing—it's about dignity, safety, and freedom.

No compromises. No tracking. No exceptions.

---

**Last Updated:** February 26, 2026
**Version:** 1.0.0-MVP
**Status:** Ready for Development
