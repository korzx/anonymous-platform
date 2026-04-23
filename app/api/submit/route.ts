// app/api/submit/route.ts - Anonymous submission endpoint

import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rate-limit';
import { encryptContent, generateUUID, sanitizeContent } from '@/lib/crypto';
import { moderateContent } from '@/lib/ai-moderation';
import { storeSubmission, logModerationEvent } from '@/lib/db';
import { SubmitResponse } from '@/types';

/**
 * POST /api/submit
 * Submit anonymous content
 * 
 * Request body:
 * {
 *   "content": "string",
 *   "category": "feelings" | "fears" | "dreams" | "secrets" | "confessions" | "hopes" | "struggles"
 * }
 * 
 * Response:
 * {
 *   "id": "uuid",
 *   "status": "success" | "error",
 *   "message": "optional error message"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<SubmitResponse>> {
  try {
    // ========== SECURITY CHECK 1: Rate Limiting ==========
    const rateLimitResult = checkRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          id: '',
          status: 'error',
          message: `Rate limit exceeded. Try again at ${rateLimitResult.reset_at}`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': new Date(rateLimitResult.reset_at).valueOf().toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset_at,
          },
        }
      );
    }

    // ========== SECURITY CHECK 2: Validate Request ==========
    let body: { content?: string; category?: string };
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          id: '',
          status: 'error',
          message: 'Invalid JSON',
        },
        { status: 400 }
      );
    }

    const { content, category } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        {
          id: '',
          status: 'error',
          message: 'Content is required',
        },
        { status: 400 }
      );
    }

    // Validate category
    if (
      !category ||
      typeof category !== 'string' ||
      !CATEGORIES.includes(category as any)
    ) {
      return NextResponse.json(
        {
          id: '',
          status: 'error',
          message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // ========== SECURITY CHECK 3: Sanitize Content ==========
    const sanitized = sanitizeContent(content.trim());

    // ========== SECURITY CHECK 4: Content Moderation ==========
    const moderationDecision = await moderateContent(sanitized);

    if (moderationDecision.status === 'rejected') {
      // Return generic error (don't reveal moderation reasons)
      return NextResponse.json(
        {
          id: '',
          status: 'error',
          message: 'Submission could not be processed',
        },
        { status: 400 }
      );
    }

    // ========== SECURITY CHECK 5: Encrypt Content ==========
    const encryptedContent = encryptContent(sanitized);
    
    // ========== GENERATE ANONYMOUS ID ==========
    const submissionId = generateUUID();

    // ========== STORE IN DATABASE ==========
    await storeSubmission({
      id: submissionId,
      content: encryptedContent,
      category,
      content_hash: moderationDecision.content_hash,
      is_flagged: moderationDecision.status === 'flagged',
    });

    // ========== LOG MODERATION EVENT ==========
    await logModerationEvent({
      submission_id: submissionId,
      content_hash: moderationDecision.content_hash,
      action: moderationDecision.status,
      reason: moderationDecision.reason,
    });

    // ========== RETURN SUCCESS (Minimal Info) ==========
    return NextResponse.json(
      {
        id: submissionId,
        status: 'success',
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset_at,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[SECURITY] Submission error:', error);

    // Return generic error (never reveal internal details)
    return NextResponse.json(
      {
        id: '',
        status: 'error',
        message: 'Submission failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Disable all other HTTP methods
 */
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
