# 🔐 Security Architecture & Privacy Design

## Overview

This platform prioritizes **absolute anonymity and security** above all else. Users can share emotional thoughts without any risk of identification.

---

## Core Security Principles

### 1. ZERO Personal Data Collection

**What we DON'T store:**
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Usernames or accounts
- ❌ Device fingerprints
- ❌ Raw IP addresses
- ❌ Location data (beyond city-level GeoIP for analytics only)
- ❌ Session tokens tied to users
- ❌ Device identifiers (UDID, browser fingerprinting)
- ❌ Cookies containing user ID

**What we store:**
- ✅ Encrypted submission content
- ✅ Category tags
- ✅ Timestamps (rounded to 5-min buckets publicly)
- ✅ Hashed reactions (counts only, no user link)
- ✅ Content hashes (for moderation verification only)

---

## 2. IP Address Handling (Rotated Hash)

### Problem
IP addresses are unique identifiers. Even hashed IPs can be correlated to users over time.

### Solution: Daily Salt Rotation

```
User IP: 192.168.1.100

Day 1:
Salt: SHA256(BASE_SALT | "2026-02-26")
Hash: SHA256("192.168.1.100" | Salt) = abc123...

Day 2:
Salt: SHA256(BASE_SALT | "2026-02-27")
Hash: SHA256("192.168.1.100" | Salt) = xyz789...

Result: Same user, completely different IP hash each day
```

**Benefits:**
- No correlation of user activity across days
- Old logs can't identify current users
- Even database breach reveals no actionable IP data
- Rate limiting still works (per 24-hour salt version)

---

## 3. Encryption at Rest

### Content Encryption (AES-256-GCM)

All submissions are encrypted before database storage:

```
Original: "I feel anxious about..."

1. Encrypt with AES-256-GCM
2. Generate random IV (16 bytes)
3. Create auth tag for integrity

Stored: "iv:authTag:encrypted_content"

Database breach:
- Attacker sees: "9f3d...something...5a2c"
- Useless without encryption key
```

**Key Management:**
- Keep `ENCRYPTION_KEY` in environment variables only
- Rotate keys periodically (requires re-encryption)
- Use different keys per environment
- Never commit keys to version control

---

## 4. Content Sanitization

Before storage, content is sanitized to remove identifying information:

```typescript
Removes:
- Email addresses: "my email is john@example.com" → "my email is [email]"
- Phone numbers: "call me at 555-123-4456" → "call me at [phone]"
- SSN patterns: "my SSN is 123-45-6789" → "my SSN is [ssn]"
- Credit cards: "card 1234567812345678" → "card [card]"
- URLs: "check http://example.com/track?uid=123" → "check [url]"
```

This prevents accidental personal data leakage.

---

## 5. Rate Limiting (Not User-Based)

### Problem
Rate limiting usually requires user tracking (accounts, device IDs, etc.)

### Solution: Hashed IP + Time Windows

```
Per user (per hashed IP):
- 10 submissions per 24 hours
- 3 submissions per hour

Salt rotation:
- Changes daily
- Old hash ≠ new hash (same user)
- Can't correlate rates across days
```

**In Production:**
Use Redis instead of in-memory store:
```typescript
redis.incr(`ratelimit:${hashedIP}:daily`)
redis.expire(hashedIP, 86400)
```

---

## 6. AI Content Moderation (No Identity Tracking)

### Detection Pipeline

1. **Keyword Filter** (fast, local)
   - Blocks known illegal content
   - No external API call

2. **Spam Patterns** (local)
   - Excessive URLs
   - Repeated characters
   - All-caps messages
   - Special character patterns

3. **Optional AI API** (if configured)
   - OpenAI Moderations API (privacy-friendly)
   - Only sends content snippet
   - Returns safety flag only
   - No user data transmitted

### Key Point
**Moderation never requires user identification.** Content is evaluated in isolation.

---

## 7. Security Headers

All responses include these headers:

```
X-Frame-Options: DENY
  → Prevents clickjacking

X-Content-Type-Options: nosniff
  → Prevents MIME type sniffing

X-XSS-Protection: 1; mode=block
  → Enables XSS protection

Referrer-Policy: no-referrer
  → Prevents referer leakage

Content-Security-Policy: strict-src
  → Blocks external resources

Permissions-Policy:
  → Disables camera, mic, geolocation, etc.

Strict-Transport-Security: max-age=31536000
  → Enforces HTTPS
```

---

## 8. Logging Strategy (Minimal)

### What NOT to Log
- User IPs (or only hashed IPs)
- Session cookies
- Device fingerprints
- User agents (browser fingerprinting)
- Request bodies (contain user content)
- Headers revealing identity

### What TO Log (Errors Only)
- API errors (500, rate limits)
- Moderation actions (approved/rejected)
- Content hash (for audit trail)
- Timestamps

### Log Retention
- Error logs: 7 days max
- Moderation logs: 90 days (for audit)
- Rate limit logs: 7 days (auto-cleanup)

---

## 9. Database Breach Scenario

### Worst Case: Database Compromised

An attacker has full database access:

```sql
SELECT * FROM submissions LIMIT 5;

id        | content                | created_at
----------|------------------------|-----
uuid-1    | [encrypted blob]       | 2026-02-26
uuid-2    | [encrypted blob]       | 2026-02-26
uuid-3    | [encrypted blob]       | 2026-02-26
```

**What attacker can do:**
- ❌ Decrypt content (no key)
- ❌ Identify submitters (no user data)
- ❌ Track submissions by IP (hash rotates daily)
- ❌ Link reactions to users (reactions table has no user ID)

**What attacker cannot do:**
- Cannot read submission content
- Cannot identify any user
- Cannot correlate activity over time
- Cannot connect reactions to submitters

---

## 10. Frontend Security

### No Client-Side Tracking
```typescript
// ❌ NEVER do this:
localStorage.setItem('userId', uuid)
sessionStorage.setItem('userToken', token)

// ✅ DO this:
// No persistent client identifiers
// Each new session is completely fresh
```

### No Analytics Cookies
```javascript
// ❌ Google Analytics
// ❌ Facebook Pixel
// ❌ Mixpanel
// ✅ Only server-side error logging (if needed)
```

### HTTP-Only Session Cookies
If cookies used:
```
Set-Cookie: sessionId=xxx; HttpOnly; Secure; SameSite=Strict
```
- HttpOnly: JavaScript can't access (prevents XSS theft)
- Secure: HTTPS only
- SameSite: Strict prevents CSRF

---

## 11. HTTPS Enforcement

**Always require HTTPS:**
```javascript
// next.config.js
headers: {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

All traffic encrypted end-to-end:
```
User → [TLS/HTTPS] → Server
    (256-bit encryption)
```

---

## 12. Secret Management

### Environment Variables (Never in Code)

```bash
# ❌ Never commit
ENCRYPTION_KEY=abc123...
OPENAI_API_KEY=sk-...

# ✅ Use .env.local (in .gitignore)
# ✅ Use platform secrets (Vercel, Heroku, etc.)
```

### Rotation Strategy

```
ENCRYPTION_KEY_v1: Keys from Jan 2024
ENCRYPTION_KEY_v2: Keys from Jul 2024 (rotated)
ENCRYPTION_KEY_v3: Keys from Feb 2025 (current)
```

Re-encrypt old submissions with new key during rotation.

---

## 13. Access Control

### API Endpoints (Anonymous)

```
POST /api/submit
  ├─ Rate limited (per hashed IP)
  ├─ Content validated
  ├─ Moderated
  └─ Stored encrypted

GET /api/feed
  ├─ Public (no auth required)
  ├─ Returns only approved submissions
  └─ Decrypts content (app has key)
```

### Database Access
- Only backend API connects to database
- Service role key in backend only
- Never expose anon key to backend operations
- Row-level security enabled for extra safety

---

## 14. Threat Model & Mitigations

| Threat | Mitigation |
|--------|-----------|
| **Database Breach** | Encryption at rest, no personal data |
| **Man-in-the-Middle** | HTTPS/TLS encryption, HSTS headers |
| **Brute Force Attacks** | Rate limiting, exponential backoff |
| **XSS Attacks** | CSP headers, sanitization, no inline scripts |
| **CSRF Attacks** | SameSite cookies, CSRF tokens on forms |
| **IP Tracking** | Rotating salted hashes, no raw IPs |
| **User Fingerprinting** | No device ID, no user agent logging |
| **DoS Attacks** | Rate limiting, WAF (Cloudflare), CDN |
| **SQL Injection** | Parameterized queries (Supabase SDK) |
| **Log Leakage** | Minimal logging, no PII in logs |

---

## 15. Compliance & Privacy Laws

### GDPR (EU)
- ✅ No personal data to delete (right to be forgotten)
- ✅ Data minimization
- ✅ Encrypt at rest
- ✅ Secure transmission

### CCPA (California)
- ✅ No personal info collected
- ✅ No sale of data
- ✅ Users can opt-out (anonymity is opt-out by design)

### COPPA (US Kids)
- ⚠️ Don't explicitly target children
- ✅ No personal data collection anyway

### Privacy Shield / GDPR International Transfer
- ✅ Data stored in EU (Supabase EU region) if needed
- ✅ No cross-border personal data transfer

---

## 16. Deployment Checklist

Before production:

- [ ] Generate strong `ENCRYPTION_KEY` (256-bit)
- [ ] Generate strong `RATE_LIMIT_SALT` (256-bit)
- [ ] Set environment variables in deployment platform
- [ ] Enable HTTPS/TLS
- [ ] Enable database encryption (Supabase)
- [ ] Configure HSTS headers
- [ ] Disable telemetry in next.config.js
- [ ] Set up error logging (Sentry, if needed - no PII!)
- [ ] Database backups (encrypted by cloud provider)
- [ ] WAF configured (Cloudflare, AWS Shield, etc.)
- [ ] Rate limiting in place
- [ ] Content moderation configured
- [ ] .env.local in .gitignore
- [ ] CI/CD doesn't log secrets
- [ ] Monitor for suspicious patterns
- [ ] Legal review (privacy policy, ToS)

---

## 17. Ongoing Security Practices

### Regular Tasks

**Monthly:**
- Review error logs (for patterns, not users)
- Check moderation stats
- Monitor submission health

**Quarterly:**
- Security audit of code
- Update dependencies
- Review rate limit thresholds
- Analyze false positives in moderation

**Annually:**
- Full security assessment
- Penetration testing
- Encryption key rotation
- Dependency audit
- Privacy policy review

---

## 18. Incident Response

### If Breach Detected

1. **Immediately:**
   - Rotate encryption keys
   - Review attacker access logs
   - Notify users (if required by law)

2. **Within 24 hours:**
   - Assess damage scope
   - Patch vulnerability
   - Deploy fix

3. **Within 72 hours:**
   - Publish incident report (without sensitive details)
   - Update security documentation

4. **Ongoing:**
   - Monitor for re-exploitation
   - Strengthen defenses

### Key Point
**Even in worst case, attacker can't identify users or decrypt content.**

---

## 19. User Privacy Communication

### Be Transparent

**Privacy Policy should state:**
- We don't collect personal information
- Submissions are encrypted
- We use rotating IP hashing
- Moderation is automated
- We don't sell data
- We don't run analytics
- We don't use cookies for tracking

**Terms of Service should state:**
- Users remain completely anonymous
- We can't identify you even if we wanted to
- Content moderation is algorithmic
- Illegal content removed, but without identifying users
- Right to delete your own submissions (if implemented)

---

## 20. Future Enhancements

### More Privacy (if needed)

```
1. Tor support
   - Allow .onion domain
   - No IP logging at all

2. Proxy support
   - Allow submissions through proxy
   - Extra layer of anonymity

3. E2E encryption on frontend
   - Encrypt in browser before send
   - Decrypt on browser before display
   - Server only stores encrypted blob

4. Zero-knowledge proof
   - Prove submission without revealing ID
   - Blockchain integration (optional)
```

---

## Questions?

For security concerns, DO NOT open issues publicly. Email security team or use responsible disclosure.

**Remember: This platform is designed for truthfully anonymous expression. No compromises on privacy.**

---

**Last Updated:** February 26, 2026
**Status:** Production Ready
