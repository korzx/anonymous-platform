// lib/ai-moderation.ts - Content moderation without identity tracking

import { MODERATION, SECURITY } from './constants';
import { hashContent } from './crypto';

export type ModerationStatus = 'approved' | 'rejected' | 'flagged';

export interface ModerationDecision {
  status: ModerationStatus;
  reason?: string;
  confidence?: number;
  content_hash: string; // For audit, not identity
}

/**
 * Local keyword-based moderation (no external API calls)
 * This runs first as a fast filter
 */
async function checkKeywords(content: string): Promise<{
  flagged: boolean;
  reason?: string;
}> {
  const lowerContent = content.toLowerCase();

  for (const keyword of MODERATION.BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      return {
        flagged: true,
        reason: `Contains prohibited keyword: ${keyword}`,
      };
    }
  }

  return { flagged: false };
}

/**
 * Analyze content structure for spam patterns
 */
async function checkSpamPatterns(content: string): Promise<{
  is_spam: boolean;
  reason?: string;
}> {
  // Check for excessive URLs
  const urlCount = (content.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) {
    return {
      is_spam: true,
      reason: 'Excessive URLs',
    };
  }

  // Check for repeated characters (e.g., "aaaaaaa")
  if (/(.)\1{9,}/.test(content)) {
    return {
      is_spam: true,
      reason: 'Repetitive character pattern',
    };
  }

  // Check for all caps (but allow SOME)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 20) {
    return {
      is_spam: true,
      reason: 'Excessive capitalization',
    };
  }

  // Check for excessive special characters
  const specialRatio = (content.match(/[!@#$%^&*]{2,}/g) || []).length / content.length;
  if (specialRatio > 0.3) {
    return {
      is_spam: true,
      reason: 'Excessive special characters',
    };
  }

  return { is_spam: false };
}

/**
 * Optional: Call external AI moderation API
 * Only if you have OpenAI or similar API key
 */
async function checkWithAIAPI(content: string): Promise<{
  is_safe: boolean;
  confidence: number;
  reason?: string;
}> {
  // Skip if no API key configured
  if (!process.env.OPENAI_API_KEY) {
    return {
      is_safe: true,
      confidence: 0.5, // Unknown confidence
    };
  }

  try {
    // Example using OpenAI Moderations API
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content.substring(0, 1000), // Truncate to avoid excessive costs
      }),
    });

    if (!response.ok) {
      // If AI moderation fails, be conservative
      console.error('AI moderation API error:', response.statusText);
      return {
        is_safe: MODERATION.FAIL_SAFE_MODE === 'strict' ? false : true,
        confidence: 0,
        reason: 'Moderation service unavailable',
      };
    }

    type ModerationResponse = {
      results: Array<{
        flagged: boolean;
        categories: Record<string, boolean>;
        category_scores: Record<string, number>;
      }>;
    };

    const data = (await response.json()) as ModerationResponse;
    const result = data.results[0];

    if (!result) {
      return {
        is_safe: true,
        confidence: 0,
      };
    }

    // Get the highest category score
    const maxScore = Math.max(...Object.values(result.category_scores));

    return {
      is_safe: !result.flagged,
      confidence: maxScore,
      reason: result.flagged
        ? Object.entries(result.categories)
            .filter(([_, flagged]) => flagged)
            .map(([category]) => category)
            .join(', ')
        : undefined,
    };
  } catch (error) {
    console.error('AI moderation error:', error);
    return {
      is_safe: MODERATION.FAIL_SAFE_MODE === 'strict' ? false : true,
      confidence: 0,
      reason: 'Moderation check failed',
    };
  }
}

/**
 * Main moderation function
 * Runs content through multiple filters
 */
export async function moderateContent(content: string): Promise<ModerationDecision> {
  const contentHash = hashContent(content);

  // Step 1: Check length
  if (content.length < SECURITY.CONTENT.MIN_LENGTH) {
    return {
      status: 'rejected',
      reason: `Content too short (minimum ${SECURITY.CONTENT.MIN_LENGTH} characters)`,
      content_hash: contentHash,
    };
  }

  if (content.length > SECURITY.CONTENT.MAX_LENGTH) {
    return {
      status: 'rejected',
      reason: `Content too long (maximum ${SECURITY.CONTENT.MAX_LENGTH} characters)`,
      content_hash: contentHash,
    };
  }

  // Step 2: Check keywords
  const keywordCheck = await checkKeywords(content);
  if (keywordCheck.flagged) {
    return {
      status: 'rejected',
      reason: keywordCheck.reason,
      content_hash: contentHash,
    };
  }

  // Step 3: Check spam patterns
  const spamCheck = await checkSpamPatterns(content);
  if (spamCheck.is_spam) {
    return {
      status: 'rejected',
      reason: spamCheck.reason,
      content_hash: contentHash,
    };
  }

  // Step 4: Optional AI moderation
  const aiCheck = await checkWithAIAPI(content);
  if (!aiCheck.is_safe && aiCheck.confidence >= MODERATION.CONFIDENCE_THRESHOLD) {
    return {
      status: 'flagged',
      reason: aiCheck.reason,
      confidence: aiCheck.confidence,
      content_hash: contentHash,
    };
  }

  // Passed all checks
  return {
    status: 'approved',
    content_hash: contentHash,
  };
}
