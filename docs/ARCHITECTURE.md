# 🏗️ Architecture Overview

Visual representation of the Anonymous Platform architecture.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Web Interface                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Submit     │  │    Feed       │  │  Reactions   │   │  │
│  │  │    Form      │  │  (Infinite)   │  │   (Emojis)   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕                                    │
│                        HTTPS/TLS                                 │
│                    (End-to-End Encrypted)                        │
└─────────────────────────────────────────────────────────────────┘
                            ↕↕↕
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS BACKEND                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   API ENDPOINTS                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ POST/submit  │  │  GET/feed    │  │ GET/health   │   │  │
│  │  │  (Rate Limit)│  │ (Paginated)  │  │ (Monitor)    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                SECURITY LAYER                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Rate      │  │Encryption│  │Moderation│  │Sanitize  │  │  │
│  │  │Limit      │  │AES-256   │  │ (AI/KW) │  │ (PII)    │  │  │
│  │  │(IP Hash)  │  │          │  │         │  │          │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               DATABASE CLIENT                             │  │
│  │         (Supabase SDK / PostgreSQL)                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕↕↕
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 PostgreSQL Database                       │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  ┌─────────────┐  ┌─────────────┐ ┌─────────────┐     │  │
│  │  │ Submissions │  │ Reactions   │ │Moderation   │     │  │
│  │  │ (encrypted) │  │ (anonymous) │ │ Logs        │     │  │
│  │  └─────────────┘  └─────────────┘ └─────────────┘     │  │
│  │                                                        │  │
│  │  No user IDs • Hashed IPs only • Content encrypted  │  │
│  │  No session tracking • No device fingerprints        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Security & Compliance                       │  │
│  │  ✓ Automatic backups  ✓ Encryption at rest          │  │
│  │  ✓ SOC 2 Compliance  ✓ GDPR Ready                   │  │
│  │  ✓ DDoS Protection   ✓ Auto-scaling                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Anonymous Submission

```
1. USER SUBMITS
   ┌─────────────────────────────────┐
   │ "I feel anxious about my career"│
   │  Category: fears                │
   └─────────────────────────────────┘
                 ↓

2. RATE LIMIT CHECK
   ┌─────────────────────────────────┐
   │ Extract client IP                │
   │ Hash IP with daily salt          │
   │ Check: 10/day limit met?         │
   │ ✓ PASS: 9 remaining              │
   └─────────────────────────────────┘
                 ↓

3. CONTENT VALIDATION
   ┌─────────────────────────────────┐
   │ Check length: 10-5000 chars? ✓  │
   │ Validate category? ✓             │
   │ Format JSON? ✓                   │
   └─────────────────────────────────┘
                 ↓

4. SANITIZATION
   ┌─────────────────────────────────┐
   │ Remove emails: none              │
   │ Remove phones: none              │
   │ Remove SSN: none                 │
   │ Remove URLs: none                │
   │ ✓ Content clean                  │
   └─────────────────────────────────┘
                 ↓

5. MODERATION CHECK
   ┌─────────────────────────────────┐
   │ Keyword filter: ✓ pass           │
   │ Spam patterns: ✓ pass            │
   │ AI check (if configured):        │
   │   OpenAI API: ✓ safe             │
   │ ✓ APPROVED                        │
   └─────────────────────────────────┘
                 ↓

6. ENCRYPTION
   ┌─────────────────────────────────┐
   │ Generate random IV (16 bytes)    │
   │ AES-256-GCM encrypt content      │
   │ Create auth tag                  │
   │ Format: iv:tag:ciphertext        │
   │ Result: [encrypted blob]         │
   └─────────────────────────────────┘
                 ↓

7. DATABASE STORAGE
   ┌─────────────────────────────────┐
   │ INSERT INTO submissions:         │
   │ - id: uuid-random                │
   │ - content: [encrypted blob]      │
   │ - category: "fears"              │
   │ - content_hash: "abc123..."      │
   │ - is_flagged: false              │
   │ - created_at: now                │
   └─────────────────────────────────┘
                 ↓

8. RESPONSE
   ┌──────────────────────────────────┐
   │ {                                │
   │   "id": "uuid-123",              │
   │   "status": "success"            │
   │ }                                │
   │                                  │
   │ Headers:                         │
   │ X-RateLimit-Remaining: 9         │
   │ X-RateLimit-Reset: tomorrow      │
   └──────────────────────────────────┘

📌 KEY POINT: No personal data stored anywhere.
   Even database owner can't identify the user.
```

---

## Data Flow: View Feed (Infinite Scroll)

```
1. REQUEST FEED
   ┌────────────────────────────┐
   │ GET /api/feed?limit=10     │
   │ &cursor=2026-02-26T10:00Z  │
   └────────────────────────────┘
              ↓

2. DATABASE QUERY
   ┌────────────────────────────┐
   │ SELECT * FROM submissions  │
   │ WHERE is_flagged = FALSE   │
   │ ORDER BY created_at DESC   │
   │ LIMIT 11                   │
   └────────────────────────────┘
              ↓

3. FETCH REACTIONS
   ┌────────────────────────────┐
   │ For each submission ID:    │
   │ COUNT emojis in reactions  │
   │ (completely anonymous)     │
   └────────────────────────────┘
              ↓

4. DECRYPT CONTENT
   ┌────────────────────────────┐
   │ For each submission:       │
   │ Extract: iv:tag:cipher     │
   │ AES-256-GCM decrypt        │
   │ Verify auth tag            │
   │ Output: plain text         │
   └────────────────────────────┘
              ↓

5. FORMAT RESPONSE
   ┌────────────────────────────┐
   │ {                          │
   │   "submissions": [         │
   │     {                      │
   │       "id": "uuid-1",      │
   │       "content": "I feel...|
   │       "category": "fears", │
   │       "created_at": "...", │
   │       "reactions_count": 5 │
   │     },                     │
   │     ...                    │
   │   ],                       │
   │   "cursor": "next-time",   │
   │   "has_more": true         │
   │ }                          │
   └────────────────────────────┘
              ↓

6. CACHE & RESPONSE
   ┌────────────────────────────┐
   │ Cache-Control: 60s         │
   │ Send JSON                  │
   │ ✓ Client receives data     │
   └────────────────────────────┘

📌 KEY POINT: Each load is fresh.
   No user tracking. No correlation possible.
```

---

## Security Layers (Defense in Depth)

```
Layer 1: NETWORK
┌─────────────────────────────────┐
│ HTTPS/TLS Encryption            │
│ CDN DDoS Protection             │
│ Web Application Firewall        │
│ Rate Limiting at edge           │
└─────────────────────────────────┘

Layer 2: APPLICATION
┌─────────────────────────────────┐
│ Content Validation              │
│ Input Sanitization              │
│ SQL Injection Prevention         │
│ XSS Protection (CSP)            │
│ CSRF Token Validation           │
└─────────────────────────────────┘

Layer 3: BUSINESS LOGIC
┌─────────────────────────────────┐
│ Rate Limiting (rotating hash)   │
│ Content Moderation (AI + KW)    │
│ PII Sanitization                │
│ Permission Checks               │
└─────────────────────────────────┘

Layer 4: DATA
┌─────────────────────────────────┐
│ AES-256-GCM Encryption          │
│ Encrypted at Rest               │
│ Hashed IPs (not raw)            │
│ No session tokens with ID       │
└─────────────────────────────────┘

Layer 5: INFRASTRUCTURE
┌─────────────────────────────────┐
│ Supabase Security               │
│ Database Encryption             │
│ Automated Backups               │
│ Audit Logging                   │
└─────────────────────────────────┘

📌 Result: Multiple layers.
   Breach at one layer ≠ total compromise.
```

---

## IP Address Protection (Rotating Hash)

```
THE PROBLEM
───────────
Raw IP addresses = user identifier
Even hashed IPs can be correlated over time
Attacker could: track user across sessions

THE SOLUTION: DAILY SALT ROTATION
──────────────────────────────────

Day 1 (February 26):
├─ Base Salt: "superSecretSalt123"
├─ Daily Date: "2026-02-26"
├─ Combined: "superSecretSalt123|2026-02-26"
├─ Daily Salt = SHA256(combined)
├─ User IP: 192.168.1.100
├─ Hash: SHA256("192.168.1.100|daily_salt_v1")
└─ Result: abc123def456...
     → STORED IN RATE_LIMIT_LOGS

Day 2 (February 27):
├─ Base Salt: "superSecretSalt123" (same)
├─ Daily Date: "2026-02-27" (different!)
├─ Combined: "superSecretSalt123|2026-02-27"
├─ Daily Salt = SHA256(combined)
├─ User IP: 192.168.1.100 (same user)
├─ Hash: SHA256("192.168.1.100|daily_salt_v2")
└─ Result: xyz789abc456...
     → COMPLETELY DIFFERENT!

RESULT FOR ATTACKER
───────────────────
Attacker sees:
  Feb 26: Hash abc123... (10 submissions)
  Feb 27: Hash xyz789... (2 submissions)

Can attacker correlate same user?
❌ NO!  Different hashes look like different IPs
❌ NO!  Old hash can't be verified with new salt
❌ NO!  Even with database, can't prove identity

BONUS: HISTORICAL LOGS BECOME USELESS
─────────────────────────────────────
After 7 days:  Old logs deleted (auto-cleanup)
After 30 days: No correlation data left
After 365 days: Salt completely rotated

📌 Result: Users can't be tracked even across days.
   Perfect anonymity without user accounts.
```

---

## Encryption Pipeline

```
BEFORE ENCRYPTION (User Writes)
────────────────────────────────
"I feel scared about my health"

                 ↓

STEP 1: GENERATE RANDOM IV
────────────────────────────
Random bytes (16): 0x1a 0x2b 0x3c 0x4d ...
Purpose: Ensure same content = different ciphertext

                 ↓

STEP 2: AES-256-GCM ENCRYPT
─────────────────────────────
Input:
  - Plaintext: "I feel scared about my health"
  - Key: 256-bit encryption key
  - IV: Random bytes from step 1
  - Algorithm: AES (Advanced Encryption Standard)
  - Mode: GCM (Galois/Counter Mode) - AUTHENTICATED

Output:
  - Ciphertext: 0x9f 0x3d 0x2c ... (50+ bytes)

                 ↓

STEP 3: CREATE AUTHENTICATION TAG
──────────────────────────────────
Tag (16 bytes): Verifies data hasn't been tampered
Purpose: Detect if attacker modified ciphertext

                 ↓

STEP 4: FORMAT FOR STORAGE
────────────────────────────
Format: "iv:authTag:ciphertext"
Example: "1a2b3c4d...:f0e9d8c7...:9f3d2c1b..."

                 ↓

DATABASE STORAGE
─────────────────
Stored as TEXT in submissions.content
Example raw data:
"1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d:f0e9d8c7b6a5..." (truncated)

📌 KEY PROPERTY
───────────────
Database owner sees only:
  - Random-looking hex string
  - No hint it's content
  - No way to decrypt without key
  - In .env.local, not in database

DECRYPTION (When Viewing Feed)
───────────────────────────────
1. Retrieve from DB: "1a2b...:f0e9...:9f3d..."
2. Split into parts: iv | authTag | ciphertext
3. Verify authTag (detect tampering)
4. AES-256-GCM decrypt with key
5. Output: "I feel scared about my health"

Final: User sees original text in browser
       But database only has encrypted blob

📌 CONCLUSION
─────────────
✓ Content encrypted at rest
✓ Only app (with key) can decrypt
✓ Database compromise ≠ content leak
✓ Should rotate key every 365 days
```

---

## Database Schema (No User Data)

```
PUBLIC SCHEMA (Anonymous Data)
===============================

TABLE: submissions
├─ id (UUID)              ← Random, not user ID
├─ content (TEXT)         ← AES-256 encrypted
├─ category (VARCHAR)     ← feelings|fears|dreams|secrets|...
├─ content_hash (VARCHAR) ← SHA256 (for moderation audit only)
├─ is_flagged (BOOLEAN)   ← True if needs review
├─ created_at (TIMESTAMP) ← When posted
└─ INDEXES: created_at (for feed), category (for filtering)

TABLE: submission_reactions
├─ id (UUID)              ← Random reaction ID
├─ submission_id (UUID)   ← Which submission (not who liked)
├─ emoji (VARCHAR)        ← ❤️ 💭 🙏 etc.
├─ created_at (TIMESTAMP) ← When reacted
└─ ⚠️  IMPORTANT: No user_id column!

TABLE: moderation_logs
├─ id (UUID)
├─ submission_id (UUID)
├─ content_hash (VARCHAR) ← Audit trail (not tracking)
├─ action (VARCHAR)       ← approved|rejected|flagged
├─ reason (TEXT)          ← Why it was flagged
└─ timestamp (TIMESTAMP)

TABLE: rate_limit_logs
├─ id (UUID)
├─ hashed_ip (VARCHAR)    ← Hash, not raw IP!
├─ salt_version (INTEGER) ← For daily rotation
├─ timestamp (TIMESTAMP)
└─ endpoint (VARCHAR)


WHAT'S MISSING (INTENTIONALLY)
═════════════════════════════

❌ users table             (no accounts)
❌ user_id column anywhere (no identity)
❌ email addresses         (no contact)
❌ phone numbers           (no contact)
❌ device_id               (no fingerprinting)
❌ session table          (no tracking)
❌ auth_tokens            (no sessions)
❌ raw_ip_address         (only hashed)
❌ user_agent             (no fingerprinting)
❌ browser_fingerprint    (no fingerprinting)
❌ location data          (privacy)
❌ any PII               (privacy by design)

RESULT: GDPR/CCPA COMPLIANT
────────────────────────────
✓ No personal data to delete
✓ Data minimization principle
✓ Encrypted by default
✓ Anonymity by design
✓ No right-to-be-forgotten burden
```

---

## Security Checklist (Pre-Deployment)

```
ENCRYPTION
──────────
☐ ENCRYPTION_KEY generated: openssl rand -base64 32
☐ ENCRYPTION_KEY is 32 bytes (256 bits) ✓
☐ ENCRYPTION_KEY in .env.local (NOT in code)
☐ ENCRYPTION_KEY different per environment
☐ Encryption key rotation plan documented
☐ Backup encryption keys stored securely

RATE LIMITING
─────────────
☐ RATE_LIMIT_SALT generated: openssl rand -hex 32
☐ SALT_ROTATION_INTERVAL = 24 hours
☐ Rate limits: 10/day, 3/hour (or adjusted)
☐ Tests show rate limiting working
☐ Salt rotation automatic in code

CONTENT MODERATION
───────────────────
☐ AI moderation enabled (or keyword-only)
☐ OPENAI_API_KEY configured (if using AI)
☐ Moderation logs not storing PII
☐ Rejected content never stored
☐ False positive rate acceptable

HTTPS/TLS
─────────
☐ SSL certificate obtained (Let's Encrypt)
☐ HTTPS enforced (redirect http → https)
☐ HSTS header enabled (Strict-Transport-Security)
☐ TLS 1.2+ only (no TLS 1.0/1.1)
☐ SSL certificate auto-renewal configured

SECURITY HEADERS
────────────────
☐ X-Frame-Options: DENY
☐ X-Content-Type-Options: nosniff
☐ X-XSS-Protection: 1; mode=block
☐ Referrer-Policy: no-referrer
☐ Content-Security-Policy configured
☐ Permissions-Policy restricts sensors

LOGGING
───────
☐ No PII in logs (no emails, phones, IPs)
☐ No request bodies logged
☐ No session tokens logged
☐ Error logs enabled
☐ Log retention: 7 days max
☐ Moderation logs: 90 days max

DATABASE
────────
☐ Supabase schema.sql executed
☐ All tables created (submissions, reactions, etc.)
☐ No users table (intentional)
☐ Database encryption enabled
☐ Automated backups configured (daily)
☐ Backup retention policy documented
☐ Database accessible only from app

ENVIRONMENT VARIABLES
──────────────────────
☐ .env.local exists (NOT committed)
☐ .env.example exists (template)
☐ .gitignore has .env.local
☐ All required variables set
☐ NODE_ENV=production
☐ DISABLE_ANALYTICS=true
☐ ENABLE_REQUEST_LOGS=false

DEPLOYMENT
──────────
☐ Deployment platform chosen (Vercel/Netlify/Self-hosted)
☐ Environment variables configured in platform
☐ Application builds without errors
☐ Application starts without errors
☐ API endpoints respond (health check)
☐ Submission works end-to-end
☐ Feed displays submissions
☐ HTTPS works
☐ Security headers present

MONITORING
──────────
☐ Error logging configured
☐ Uptime monitoring configured (pingdom, uptime robot)
☐ Alert thresholds set (error rate >1%)
☐ Database monitoring enabled
☐ Rate limiting dashboard (optional)
☐ Alerts configured (email, SMS, Slack)

TESTING
───────
☐ Manual submission test
☐ Manual feed load test
☐ Rate limiting test (>10 submissions)
☐ Browser console no errors
☐ Mobile responsive test
☐ Security header test: curl -I https://...
☐ SSL test: https://www.sslshopper.com/ssl-checker.html
☐ API response time acceptable (<500ms)

DOCUMENTATION
──────────────
☐ Privacy policy written
☐ Terms of service reviewed
☐ Security documentation updated
☐ API documentation complete
☐ Deployment guide followed
☐ Incident response plan documented
☐ Contact info for security issues documented

LEGAL
─────
☐ Privacy policy on website
☐ Terms of service on website
☐ GDPR compliance documented
☐ CCPA compliance documented (if applicable)
☐ Data retention policy documented
☐ Crisis support resources linked
☐ Responsible disclosure policy documented
```

---

**Last Updated:** February 26, 2026

For more details, see [SECURITY.md](SECURITY.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
