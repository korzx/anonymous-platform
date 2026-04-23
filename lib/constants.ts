// lib/constants.ts - Security and Configuration Constants

/**
 * SECURITY PARAMETERS
 * These define the privacy and security posture of the platform
 */

export const SECURITY = {
  // Rate limiting parameters
  RATE_LIMIT: {
    // Per 24-hour period
    REQUESTS_PER_DAY: 10,
    REQUESTS_PER_HOUR: 3,
    // Salt rotation frequency (milliseconds)
    SALT_ROTATION_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Encryption
  ENCRYPTION: {
    // Algorithm for at-rest encryption
    ALGORITHM: 'aes-256-gcm',
    // Key derivation
    KEY_SIZE: 32, // 256 bits
  },

  // Logging
  LOGGING: {
    // Never log these fields
    BLACKLIST_FIELDS: [
      'ip_address',
      'user_agent',
      'cookies',
      'session_id',
      'device_id',
      'email',
      'phone',
      'location',
    ],
    // Maximum log retention (days)
    RETENTION_DAYS: 7,
  },

  // Content validation
  CONTENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 5000,
    // Remove sensitive patterns
    PATTERNS_TO_STRIP: [
      /email:?\s*[^\s@]+@[^\s]+/gi,
      /phone:?\s*[\d\s\-\+\(\)]{10,}/gi,
      /ssn:?\s*\d{3}-\d{2}-\d{4}/gi,
      /credit.?card:?\s*\d{13,19}/gi,
    ],
  },

  // IP handling
  IP_HANDLING: {
    // Use GeoIP only at city level, never coordinates
    GEOIP_PRECISION: 'city',
    // Hash function
    HASH_ALGORITHM: 'sha256',
  },

  // Session/Cookie security
  COOKIES: {
    // No user-identifying cookies
    SECURE: true,
    HTTP_ONLY: true,
    SAME_SITE: 'Strict',
    MAX_AGE: 24 * 60 * 60, // 24 hours
  },

  // CORS
  CORS: {
    // Strict origin requirement
    ALLOWED_ORIGINS: [
      // Add production domain only
      // process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ],
  },
};

export const CATEGORIES = [
  'feelings',
  'fears',
  'dreams',
  'secrets',
  'confessions',
  'hopes',
  'struggles',
] as const;

export const MODERATION = {
  // Keywords that trigger automatic rejection
  BLOCKED_KEYWORDS: [
    // Violence
    'kill', 'murder', 'harm', 'violence',
    // Illegal
    'illegal', 'trafficking', 'drug',
    // Abuse
    'abuse', 'rape', 'assault',
  ],
  // Confidence threshold for AI moderation
  CONFIDENCE_THRESHOLD: 0.7,
  // If moderation service fails, be strict
  FAIL_SAFE_MODE: 'strict',
};
