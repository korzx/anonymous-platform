// app/api/health/route.ts - Minimal health check

import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * 
 * Returns service status
 * Minimal information to prevent information leakage
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      },
    }
  );
}
