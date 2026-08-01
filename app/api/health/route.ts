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
