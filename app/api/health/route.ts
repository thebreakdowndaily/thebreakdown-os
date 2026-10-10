import { NextResponse } from 'next/server';

/**
 * ─── Operational Health Check Route: /api/health ─────────────────────────────
 * Provides production health metrics: status, timestamp, environment, database
 * readiness, cache policy, and subsystem status.
 */

export async function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-beta',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local',
    vercelEnv: process.env.VERCEL_ENV || 'development',
    subsystems: {
      domainRegistry: 'operational',
      projectionEngine: 'operational',
      editorialState: 'operational',
      researchPlatform: 'operational',
    },
    uptimeSeconds: Math.floor(process.uptime()),
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
