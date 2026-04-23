// lib/rate-limit.ts - Privacy-preserving rate limiting
import crypto from 'crypto';
import { SECURITY } from './constants';

/**
 * Generate a rotating salt for IP hashing
 * Salt changes every 24 hours to prevent IP correlation
 */
function generateDailySalt(): string {
  // Get today's date in UTC
  const dateString = new Date().toISOString().split('T')[0];
  
  // Create a base salt from environment
  const baseSalt = process.env.RATE_LIMIT_SALT_INITIAL || 'fallback-salt';
  
  // Combine with date for daily rotation
  const combined = `${baseSalt}|${dateString}`;
  
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Hash IP address with rotating salt
 * This ensures:
 * 1. Real IPs never stored
 * 2. Hash changes daily so old hashes can't be correlated
 * 3. Same IP on different days = different hash
 */
export function hashIP(ipAddress: string): {
  hashed: string;
  salt_version: number;
} {
  const salt = generateDailySalt();
  const hash = crypto
    .createHash('sha256')
    .update(`${ipAddress}|${salt}`)
    .digest('hex');
  
  return {
    hashed: hash,
    salt_version: getSaltVersion(),
  };
}

/**
 * Get current salt version (based on day number)
 */
function getSaltVersion(): number {
  const epoch = new Date('2024-01-01').getTime();
  const today = new Date().getTime();
  return Math.floor((today - epoch) / (24 * 60 * 60 * 1000));
}

/**
 * Extract clean IP from request headers
 * Handles proxies, load balancers, etc.
 */
export function extractIP(request: Request): string {
  // Check various headers (X-Forwarded-For, CF-Connecting-IP, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIP = request.headers.get('cf-connecting-ip');
  const realIP = request.headers.get('x-real-ip');
  
  // Take the first IP from X-Forwarded-For (original client)
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (clientIP) return clientIP;
  if (realIP) return realIP;
  
  // Fallback (should not happen in production)
  return '0.0.0.0';
}

/**
 * In-memory rate limit store (for demonstration)
 * In production, use Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<
    string,
    {
      attempts: number;
      hourly_attempts: number;
      reset_time: number;
      hourly_reset: number;
      salt_version: number;
    }
  > = new Map();

  check(hashedIP: string, saltVersion: number): {
    allowed: boolean;
    remaining: number;
    reset_at: string;
  } {
    const now = Date.now();
    const entry = this.store.get(hashedIP) || {
      attempts: 0,
      hourly_attempts: 0,
      reset_time: now + 24 * 60 * 60 * 1000,
      hourly_reset: now + 60 * 60 * 1000,
      salt_version: saltVersion,
    };

    // Reset daily counter if salt version changed
    if (entry.salt_version !== saltVersion) {
      entry.attempts = 0;
      entry.reset_time = now + 24 * 60 * 60 * 1000;
      entry.salt_version = saltVersion;
    }

    // Reset hourly counter if period passed
    if (now > entry.hourly_reset) {
      entry.hourly_attempts = 0;
      entry.hourly_reset = now + 60 * 60 * 1000;
    }

    // Check limits
    const dailyExceeded = entry.attempts >= SECURITY.RATE_LIMIT.REQUESTS_PER_DAY;
    const hourlyExceeded = entry.hourly_attempts >= SECURITY.RATE_LIMIT.REQUESTS_PER_HOUR;

    if (dailyExceeded || hourlyExceeded) {
      this.store.set(hashedIP, entry);
      return {
        allowed: false,
        remaining: Math.max(0, SECURITY.RATE_LIMIT.REQUESTS_PER_DAY - entry.attempts),
        reset_at: new Date(entry.reset_time).toISOString(),
      };
    }

    // Increment counters
    entry.attempts++;
    entry.hourly_attempts++;
    this.store.set(hashedIP, entry);

    return {
      allowed: true,
      remaining: Math.max(0, SECURITY.RATE_LIMIT.REQUESTS_PER_DAY - entry.attempts),
      reset_at: new Date(entry.reset_time).toISOString(),
    };
  }

  // Cleanup old entries (run periodically)
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.reset_time + 24 * 60 * 60 * 1000) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const rateLimitStore = new RateLimitStore();

/**
 * Main rate limiting check
 */
export function checkRateLimit(
  request: Request
): {
  allowed: boolean;
  remaining: number;
  reset_at: string;
} {
  const ip = extractIP(request);
  const { hashed, salt_version } = hashIP(ip);
  
  const result = rateLimitStore.check(hashed, salt_version);
  
  return result;
}

// Cleanup old entries every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    rateLimitStore.cleanup();
  }, 60 * 60 * 1000);
}
