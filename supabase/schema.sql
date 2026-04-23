-- supabase/schema.sql - Privacy-first database schema

-- SCHEMA DESIGN PRINCIPLES:
-- 1. NO user identification data
-- 2. Submissions stored with ONLY: id, content (encrypted), category, timestamp
-- 3. Content hashing for moderation (never for identity)
-- 4. Reaction tracking without user connection
-- 5. Moderation logs without personal data

-- ============================================
-- Submissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,
  
  -- Content (encrypted at application level)
  content TEXT NOT NULL,
  
  -- Category for filtering
  category VARCHAR(50) NOT NULL CHECK (
    category IN (
      'feelings',
      'fears',
      'dreams',
      'secrets',
      'confessions',
      'hopes',
      'struggles'
    )
  ),
  
  -- Hash of original content for moderation verification only
  -- NOT used for identity tracking
  content_hash VARCHAR(256) NOT NULL,
  
  -- Flag if content was flagged by moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance (no user ID index!)
  CONSTRAINT content_length CHECK (LENGTH(content) > 0)
);

-- Indexes
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_category ON submissions(category);
CREATE INDEX idx_submissions_is_flagged ON submissions(is_flagged);

-- ============================================
-- Submission Reactions (Completely Anonymous)
-- ============================================
CREATE TABLE IF NOT EXISTS submission_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to submission
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Emoji reaction (no user identification)
  emoji VARCHAR(10) NOT NULL,
  
  -- When reaction was added
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_emoji CHECK (LENGTH(emoji) > 0)
);

-- Indexes
CREATE INDEX idx_reactions_submission_id ON submission_reactions(submission_id);
CREATE INDEX idx_reactions_created_at ON submission_reactions(created_at);

-- ============================================
-- Comment Table (Future use)
-- ============================================
CREATE TABLE IF NOT EXISTS submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to parent submission
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Encrypted comment content
  content TEXT NOT NULL,
  
  -- No author identification
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT content_length CHECK (LENGTH(content) > 0)
);

CREATE INDEX idx_comments_submission_id ON submission_comments(submission_id);
CREATE INDEX idx_comments_created_at ON submission_comments(created_at DESC);

-- ============================================
-- Moderation Logs (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to submission being moderated
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Hash of content for verification (NOT for identity)
  content_hash VARCHAR(256) NOT NULL,
  
  -- Action taken
  action VARCHAR(50) NOT NULL CHECK (
    action IN ('approved', 'rejected', 'flagged')
  ),
  
  -- Reason for action
  reason TEXT,
  
  -- When action was taken
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT reason_required_for_rejection CHECK (
    (action != 'rejected') OR (reason IS NOT NULL)
  )
);

-- Indexes (NO user tracking)
CREATE INDEX idx_moderation_logs_timestamp ON moderation_logs(timestamp DESC);
CREATE INDEX idx_moderation_logs_action ON moderation_logs(action);

-- ============================================
-- Rate Limit Storage (Hashed IPs only)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hashed IP (NOT raw IP) with daily rotation
  hashed_ip VARCHAR(256) NOT NULL,
  
  -- Salt version for rotation verification
  salt_version INTEGER NOT NULL,
  
  -- Request timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Endpoint
  endpoint VARCHAR(255) NOT NULL,
  
  CONSTRAINT no_raw_ips CHECK (hashed_ip != '')
);

-- Indexes for cleanup
CREATE INDEX idx_rate_limit_hashed_ip ON rate_limit_logs(hashed_ip);
CREATE INDEX idx_rate_limit_timestamp ON rate_limit_logs(timestamp DESC);

-- ============================================
-- Views for Aggregations (No personal data)
-- ============================================

-- Daily submission count (privacy-safe)
CREATE OR REPLACE VIEW daily_submission_count AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS submission_count
FROM submissions
WHERE is_flagged = FALSE
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- Category distribution (privacy-safe)
CREATE OR REPLACE VIEW category_distribution AS
SELECT
  category,
  COUNT(*) AS submission_count
FROM submissions
WHERE is_flagged = FALSE
GROUP BY category
ORDER BY submission_count DESC;

-- ============================================
-- SECURITY POLICIES
-- ============================================

-- Disable Row Level Security temporarily for MVP
-- In production, implement RLS for additional security

-- ============================================
-- CLEANUP JOBS
-- ============================================

-- Note: Run these as scheduled jobs in Supabase

-- Delete rate limit logs older than 7 days
-- SELECT delete_old_rate_limits();

-- Delete moderation logs older than 90 days (for audit)
-- SELECT delete_old_moderation_logs();
