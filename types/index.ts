// types/index.ts - Privacy-preserving type definitions

export type SubmissionCategory = 
  | 'feelings'
  | 'fears'
  | 'dreams'
  | 'secrets'
  | 'confessions'
  | 'hopes'
  | 'struggles';

export interface AnonymousSubmission {
  id: string; // UUID - not tied to user
  content: string; // Encrypted at rest
  category: SubmissionCategory;
  created_at: string; // ISO timestamp
  reactions_count?: number;
  content_hash?: string; // For moderation verification, NOT for identity
}

export interface FeedResponse {
  submissions: AnonymousSubmission[];
  cursor?: string; // For pagination
  has_more: boolean;
}

export interface SubmitResponse {
  id: string;
  status: 'success' | 'error';
  message?: string;
}

export interface RateLimitInfo {
  hashed_ip: string; // Never raw IP
  remaining_requests: number;
  reset_at: string;
}

export interface ModerationResult {
  is_safe: boolean;
  reason?: string;
  categories?: string[];
  confidence?: number;
}

export interface SecurityContext {
  hashed_ip: string;
  salt_version: number;
  timestamp: number;
}
