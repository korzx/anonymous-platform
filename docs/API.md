# 📡 API Documentation

Complete API reference for the Anonymous Platform.

---

## Base URL

```
Production:    https://your-domain.com/api
Development:   http://localhost:3000/api
```

All API requests are **anonymous** - no authentication required.

---

## Endpoints

### 1. POST /api/submit

**Submit anonymous content**

#### Request

```http
POST /api/submit HTTP/1.1
Content-Type: application/json

{
  "content": "I feel anxious about my future",
  "category": "feelings"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `content` | string | Yes | 10-5000 characters |
| `category` | string | Yes | feelings, fears, dreams, secrets, confessions, hopes, struggles |

#### Response (201 - Success)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success"
}
```

**Headers:**
```
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 2026-02-27T10:30:00Z
```

#### Response (400 - Bad Request)

```json
{
  "id": "",
  "status": "error",
  "message": "Content is required"
}
```

**Possible errors:**
- `"Content is required"` - Empty or missing content
- `"Invalid category"` - Category not in allowed list
- `"Submission could not be processed"` - Failed moderation

#### Response (429 - Rate Limit Exceeded)

```json
{
  "id": "",
  "status": "error",
  "message": "Rate limit exceeded. Try again at 2026-02-27T10:30:00Z"
}
```

**Headers:**
```
Retry-After: 86400
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-02-27T10:30:00Z
```

**Rate Limits:**
- 10 submissions per 24 hours (per hashed IP)
- 3 submissions per hour (per hashed IP)
- Limits reset on salt rotation (daily)

#### Response (500 - Server Error)

```json
{
  "id": "",
  "status": "error",
  "message": "Submission failed"
}
```

---

### 2. GET /api/feed

**Fetch anonymous submissions (infinite scroll)**

#### Request

```http
GET /api/feed?limit=20&cursor=2026-02-26T10:29:00Z HTTP/1.1
```

| Query | Type | Default | Max | Notes |
|-------|------|---------|-----|-------|
| `limit` | integer | 20 | 50 | Number of submissions to fetch |
| `cursor` | string | - | - | Pagination cursor (ISO timestamp) |

#### Response (200 - Success)

```json
{
  "submissions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "I feel relieved after talking to someone",
      "category": "feelings",
      "created_at": "2026-02-26T10:30:00Z",
      "reactions_count": 5
    },
    {
      "id": "8b3a5e15-c14f-4a3e-8f9c-2d8b9e5c3a1f",
      "content": "I'm scared of making the wrong decision",
      "category": "fears",
      "created_at": "2026-02-26T10:25:00Z",
      "reactions_count": 12
    }
  ],
  "cursor": "2026-02-26T10:25:00Z",
  "has_more": true
}
```

**Field Descriptions:**
- `id`: Unique UUID (not tied to user)
- `content`: Decrypted submission text
- `category`: Selected category
- `created_at`: ISO timestamp (rounded to prevent fingerprinting)
- `reactions_count`: Total anonymous reactions
- `cursor`: Next pagination cursor (for next request)
- `has_more`: Boolean - are there more submissions to load?

#### Response (200 - End of Feed)

```json
{
  "submissions": [],
  "has_more": false
}
```

**Headers:**
```
Cache-Control: max-age=60, s-maxage=60, stale-while-revalidate=120
Content-Type: application/json
```

#### Pagination Example

```typescript
// Initial load
let cursor = undefined;
const response1 = await fetch('/api/feed?limit=10');
const data1 = await response1.json();
cursor = data1.cursor;

// Load more
const response2 = await fetch(`/api/feed?limit=10&cursor=${cursor}`);
const data2 = await response2.json();
// Append data2.submissions to existing list
cursor = data2.cursor;
```

---

### 3. POST /api/react

**Add reaction to submission** (Future endpoint)

#### Request

```http
POST /api/react HTTP/1.1
Content-Type: application/json

{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "emoji": "❤️"
}
```

#### Response (201 - Success)

```json
{
  "status": "success"
}
```

#### Response (400 - Invalid Emoji)

```json
{
  "status": "error",
  "message": "Invalid emoji"
}
```

---

### 4. GET /api/health

**Health check (monitoring)**

#### Request

```http
GET /api/health HTTP/1.1
```

#### Response (200 - OK)

```json
{
  "status": "ok",
  "timestamp": "2026-02-26T10:30:00Z"
}
```

**Headers:**
```
Cache-Control: no-cache
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST submission |
| 400 | Bad Request | Invalid input |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Error Response Format

All errors follow this format:

```json
{
  "id": "",
  "status": "error",
  "message": "Human-readable error message"
}
```

**The message is generic intentionally** - prevents information leakage.

---

## Security Headers

Every response includes:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), ...
Strict-Transport-Security: max-age=31536000; ...
```

---

## Examples

### JavaScript/Fetch

```typescript
// Submit
const response = await fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'I feel happy today',
    category: 'feelings',
  }),
});

const data = await response.json();

if (response.ok) {
  console.log('Submitted:', data.id);
} else {
  console.error('Error:', data.message);
}

// Fetch feed
const feedResponse = await fetch('/api/feed?limit=10');
const feedData = await feedResponse.json();
console.log('Submissions:', feedData.submissions);
```

### cURL

```bash
# Submit
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I feel grateful",
    "category": "feelings"
  }'

# Fetch feed
curl http://localhost:3000/api/feed?limit=10

# With pagination
curl 'http://localhost:3000/api/feed?limit=10&cursor=2026-02-26T10:29:00Z'

# Health check
curl http://localhost:3000/api/health
```

### Python

```python
import requests
import json

# Submit
submission = {
    "content": "I feel anxious",
    "category": "fears"
}
response = requests.post(
    'http://localhost:3000/api/submit',
    json=submission,
    headers={'Content-Type': 'application/json'}
)
print(response.json())

# Fetch feed
feed = requests.get('http://localhost:3000/api/feed?limit=10')
print(feed.json())
```

### Testing with Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests:

```
POST http://localhost:3000/api/submit
Headers: Content-Type: application/json
Body: {
  "content": "Test submission",
  "category": "feelings"
}
```

---

## Rate Limiting Details

### Rotating IP Hash

```
Day 1:  IP 192.168.1.100 + Salt_v1 → Hash_A
Day 2:  IP 192.168.1.100 + Salt_v2 → Hash_B
Result: Hash_A ≠ Hash_B (can't correlate)
```

### Limits Per Hash (Daily)

```
10 submissions per 24 hours
3 submissions per hour
```

### Reset Behavior

- Hourly limit resets on hour boundary
- Daily limit resets on salt rotation (daily UTC)
- No user tracking - hash based only

---

## Moderation Behavior

### Content Accepted

- Length: 10-5000 characters
- No blocked keywords
- Low spam score
- Doesn't fail AI moderation

### Content Rejected

**Automatic rejection (no appeal):**
- Illegal content (violence, trafficking, etc.)
- Excessive spam patterns
- Very short (< 10 chars)
- Very long (> 5000 chars)

**Flagged (but stored):**
- Marginally inappropriate
- Low confidence harmful
- Needs human review

### Important

- Moderation is **completely anonymous**
- Users never identified
- Rejected content never stored
- No audit trail linking to users

---

## Performance

### Request Times

```
POST /api/submit:  100-200ms (includes encryption)
GET /api/feed:     50-150ms (cached)
POST /api/react:   30-100ms (lightweight)
GET /api/health:   10-50ms (instant)
```

### Caching

```
GET /api/feed:
  Browser cache: 60 seconds
  CDN cache: 120 seconds
  Stale while revalidate: 240 seconds
```

---

## Limits & Quotas

| Resource | Limit | Notes |
|----------|-------|-------|
| Submissions | 10/day per IP | Rotating hash |
| Content length | 5000 chars | Prevent abuse |
| Rate limits | 3/hour per IP | Prevent spam |
| Reaction emoji | Any (1 per sub) | Future feature |
| Feed page size | Max 50 items | Prevent scraping |

---

## Deprecation Policy

Old API versions are maintained for 3 months before removal. Notifications will be sent 30 days in advance.

Current API version: **1.0** (stable since Feb 2026)

---

## Support

**Questions?**
- Read [SECURITY.md](../docs/SECURITY.md)
- Check [README.md](../README.md)
- Review [GETTING_STARTED.md](../docs/GETTING_STARTED.md)

**Report Issues:**
- GitHub Issues
- Security vulnerabilities: security@example.com

---

**Last Updated:** February 26, 2026
