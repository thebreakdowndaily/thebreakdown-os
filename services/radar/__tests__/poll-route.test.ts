import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/v2/radar/poll/route';
import { RadarPipeline } from '@/services/radar/pipeline';

describe('/api/v2/radar/poll Scheduled Endpoint', () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-radar-cron-secret-12345';
    vi.spyOn(RadarPipeline.prototype, 'poll').mockResolvedValue({
      id: 'mock-run-123',
      runId: 'mock-run-123',
      generatedAt: new Date().toISOString(),
      cycleDurationMs: 120,
      sourcesConsidered: 17,
      sourcesPolled: 6,
      successful: 6,
      failed: 0,
      newArtifacts: 2,
      changedArtifacts: 1,
      unchanged: 3,
      eventsOrSignalsCreated: 3,
      status: 'completed',
      medianDetectionLatencyMs: 1500,
      p90DetectionLatencyMs: 3000,
      sourceFailureRate: 0,
      duplicateRate: 0.5,
    });
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnv;
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
      method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('unauthorized');
  });

  it('rejects requests with invalid secret', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
      method: 'POST',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects GET requests using query-string secret with 401 to prevent URL token leakage', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll?secret=test-radar-cron-secret-12345', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('unauthorized');
  });

  it('authenticates with Bearer token and returns operational telemetry schema', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-radar-cron-secret-12345',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.runId).toBe('mock-run-123');
    expect(typeof body.sourcesConsidered).toBe('number');
    expect(typeof body.sourcesPolled).toBe('number');
    expect(typeof body.successful).toBe('number');
    expect(typeof body.failed).toBe('number');
    expect(typeof body.newArtifacts).toBe('number');
    expect(typeof body.changedArtifacts).toBe('number');
    expect(typeof body.unchanged).toBe('number');
    expect(typeof body.eventsOrSignalsCreated).toBe('number');
    expect(typeof body.durationMs).toBe('number');
  });

  it('accepts GET requests with Bearer token', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
      method: 'GET',
      headers: {
        authorization: 'Bearer test-radar-cron-secret-12345',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.runId).toBe('mock-run-123');
    expect(body.status).toBe('completed');
  });

  it('accepts Vercel cron invocation with x-vercel-cron header and matching bearer token', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
      method: 'GET',
      headers: {
        'x-vercel-cron': '1',
        authorization: 'Bearer test-radar-cron-secret-12345',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.runId).toBe('mock-run-123');
  });

  it('returns 409 Conflict when concurrency lock is held', async () => {
    vi.spyOn(RadarPipeline.prototype, 'poll').mockResolvedValueOnce({
      id: 'conflict-run',
      runId: 'conflict-run',
      generatedAt: new Date().toISOString(),
      cycleDurationMs: 5,
      sourcesConsidered: 17,
      sourcesPolled: 0,
      successful: 0,
      failed: 0,
      newArtifacts: 0,
      changedArtifacts: 0,
      unchanged: 0,
      eventsOrSignalsCreated: 0,
      status: 'failed',
      error: 'Concurrency lock radar:poll:global held by another worker',
      medianDetectionLatencyMs: null,
      p90DetectionLatencyMs: null,
      sourceFailureRate: 0,
      duplicateRate: 0,
    });

    const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-radar-cron-secret-12345',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.status).toBe('failed');
    expect(body.error).toContain('Concurrency lock');
  });
});
