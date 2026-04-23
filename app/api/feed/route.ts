// app/api/feed/route.ts - Anonymous feed endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionsFeed, getReactionCounts } from '@/lib/db';
import { decryptContent } from '@/lib/crypto';
import { FeedResponse, AnonymousSubmission } from '@/types';

/**
 * GET /api/feed?limit=20&cursor=...
 * 
 * Returns anonymous submissions for infinite scroll
 * 
 * Query params:
 * - limit: number of submissions (default 20, max 50)
 * - cursor: optional timestamp cursor for pagination
 * 
 * Response:
 * {
 *   "submissions": [...],
 *   "cursor": "optional next cursor",
 *   "has_more": boolean
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse<FeedResponse>> {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    let limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor') || undefined;

    // Validate limit (prevent abuse)
    if (limit < 1 || limit > 50) {
      limit = 20;
    }

    // Fetch submissions from database
    // +1 to check if there are more
    const dbSubmissions = await getSubmissionsFeed({
      limit: limit + 1,
      cursor: cursor,
    });

    const hasMore = dbSubmissions.length > limit;
    const submissions = dbSubmissions.slice(0, limit);

    // Get reaction counts for all submissions
    const submissionIds = submissions.map((s: any) => s.id);
    const reactionCounts = await getReactionCounts(submissionIds);

    // Decrypt and format submissions
    const formattedSubmissions: AnonymousSubmission[] = submissions.map((sub: any) => {
      let decryptedContent = '';
      try {
        decryptedContent = decryptContent(sub.content);
      } catch (error) {
        console.error('[SECURITY] Decryption failed for submission:', sub.id);
        decryptedContent = '[Content unavailable]';
      }

      const reactions = reactionCounts[sub.id] || {};
      const reactionsCount = Object.values(reactions).reduce((a: number, b: number) => a + b, 0);

      return {
        id: sub.id,
        content: decryptedContent,
        category: sub.category,
        created_at: sub.created_at,
        reactions_count: reactionsCount,
      };
    });

    // Prepare response
    const response: FeedResponse = {
      submissions: formattedSubmissions,
      has_more: hasMore,
    };

    if (hasMore && submissions.length > 0) {
      response.cursor = submissions[submissions.length - 1].created_at;
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=60, s-maxage=60, stale-while-revalidate=120',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[SECURITY] Feed error:', error);

    return NextResponse.json(
      {
        submissions: [],
        has_more: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Disable POST and other methods
 */
export function POST() {
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
