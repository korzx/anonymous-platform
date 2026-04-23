// lib/crypto.ts - Encryption utilities for at-rest data protection

import crypto from 'crypto';

/**
 * Encrypt content before storing in database
 * Uses AES-256-GCM for authenticated encryption
 */
export function encryptContent(content: string): string {
  const encryptionKey = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

  let encrypted = cipher.update(content, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv + authTag + encrypted (all hex encoded)
  return [iv.toString('hex'), authTag.toString('hex'), encrypted].join(':');
}

/**
 * Decrypt content from database
 */
export function decryptContent(encryptedData: string): string {
  try {
    const encryptionKey = getEncryptionKey();
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt content');
  }
}

/**
 * Hash content for moderation/validation (never for identity)
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate a random UUID (not tied to any user)
 */
export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex').match(/.{1,2}/g)?.join('-') || '';
}

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.ENCRYPTION_KEY;

  if (!keyBase64) {
    throw new Error(
      'ENCRYPTION_KEY environment variable not set. Generate with: openssl rand -base64 32'
    );
  }

  const key = Buffer.from(keyBase64, 'base64');

  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 bytes (256 bits), got ${key.length} bytes`);
  }

  return key;
}

/**
 * Sanitize content to remove potential identifying information
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;

  // Remove email addresses
  sanitized = sanitized.replace(/[^\s@]+@[^\s]+/g, '[email]');

  // Remove phone numbers
  sanitized = sanitized.replace(/[\d\s\-\+\(\)]{10,}/g, '[phone]');

  // Remove SSN pattern
  sanitized = sanitized.replace(/\d{3}-\d{2}-\d{4}/g, '[ssn]');

  // Remove credit card numbers
  sanitized = sanitized.replace(/\d{13,19}/g, '[card]');

  // Remove URLs (could contain tracking)
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[url]');

  return sanitized;
}
