// lib/db.ts - Privacy-preserving database client

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Store anonymous submission in database
 * Content is encrypted before storage
 */
export async function storeSubmission(data: {
  id: string;
  content: string; // Already encrypted by caller
  category: string;
  content_hash: string;
  is_flagged: boolean;
}) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('submissions')
    .insert([
      {
        id: data.id,
        content: data.content,
        category: data.category,
        content_hash: data.content_hash,
        is_flagged: data.is_flagged,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Failed to store submission:', error);
    throw new Error('Failed to store submission');
  }
}

/**
 * Retrieve submissions for feed (paginated, anonymous)
 */
export async function getSubmissionsFeed(options: {
  limit: number;
  cursor?: string;
}) {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('submissions')
    .select('id, content, category, created_at, reactions_count')
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .limit(options.limit);

  if (options.cursor) {
    query = query.lt('created_at', options.cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch feed:', error);
    throw new Error('Failed to fetch submissions');
  }

  return data || [];
}

/**
 * Log submission for moderation review (NO personal data)
 */
export async function logModerationEvent(data: {
  submission_id: string;
  content_hash: string;
  action: 'approved' | 'rejected' | 'flagged';
  reason?: string;
}) {
  const supabase = getSupabaseClient();

  // Only log the action and reason, never personal data
  const { error } = await supabase
    .from('moderation_logs')
    .insert([
      {
        submission_id: data.submission_id,
        content_hash: data.content_hash,
        action: data.action,
        reason: data.reason,
        timestamp: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Failed to log moderation event:', error);
    // Don't throw - logging failure shouldn't break submission
  }
}

/**
 * Increment reaction count for a submission
 */
export async function addReaction(
  submissionId: string,
  emoji: string
) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('submission_reactions')
    .insert([
      {
        submission_id: submissionId,
        emoji: emoji,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Failed to add reaction:', error);
    throw new Error('Failed to add reaction');
  }
}

/**
 * Get reaction counts for submissions
 */
export async function getReactionCounts(submissionIds: string[]) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('submission_reactions')
    .select('submission_id, emoji')
    .in('submission_id', submissionIds);

  if (error) {
    console.error('Failed to fetch reactions:', error);
    return {};
  }

  // Aggregate counts by submission
  const counts: Record<string, Record<string, number>> = {};

  data?.forEach((row: { submission_id: string; emoji: string }) => {
    if (!counts[row.submission_id]) {
      counts[row.submission_id] = {};
    }
    counts[row.submission_id][row.emoji] =
      (counts[row.submission_id][row.emoji] || 0) + 1;
  });

  return counts;
}
