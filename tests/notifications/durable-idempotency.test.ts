/**
 * ─── Phase 4B-1A: Durable Notification Idempotency Tests ─────────────────────
 *
 * Governing Document: .planning/PHASE-4B-1A-DURABLE-NOTIFICATION-IDEMPOTENCY.md
 * Operating Doctrine: AGENTS.md (Operational Observability & Durability)
 *
 * Rigorous multi-instance, cross-worker, crash-safety, and concurrency verification
 * demonstrating that the durable delivery ledger guarantees:
 *   same incident + same event + same destination -> exactly one delivery identity
 * across:
 *   - repeated cron runs
 *   - concurrent serverless executions
 *   - process restarts / cold starts
 *   - simulated worker crashes & lease expiry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AlertDispatcher,
  MemoryDurableDeliveryStore,
  WebhookTransport,
  type AlertCandidate,
  type NotificationDeliveryResult,
} from '@/services/notifications';

describe('Phase 4B-1A — Durable Notification Idempotency', () => {
  let sharedStore: MemoryDurableDeliveryStore;

  beforeEach(() => {
    sharedStore = new MemoryDurableDeliveryStore();
  });

  const sampleCandidate: AlertCandidate = {
    eventType: 'SOURCE_HEALTH_FAILURE',
    alertId: 'alert-pib-001',
    sourceId: 'src-pib',
    sourceName: 'Press Information Bureau',
    severity: 'error',
    currentState: 'failing',
    failureClass: 'HTTP_503_SERVICE_UNAVAILABLE',
    detectedAt: '2026-10-02T12:00:00.000Z',
    message: 'PIB source returning HTTP 503 for 5 consecutive runs',
    recommendedAction: 'Verify remote endpoint accessibility',
    metrics: { consecutiveFailures: 5, httpStatus: 503 },
  };

  it('1. Multi-instance race condition: 2 concurrent workers deliver exactly once', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 20));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    // Simulate Worker A (Instance 1) and Worker B (Instance 2)
    // They are separate Vercel instances with their own heap, sharing only L2 durable store
    const instanceA = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const instanceB = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    // Run both workers simultaneously
    const [resA, resB] = await Promise.all([
      instanceA.dispatchCandidate(sampleCandidate),
      instanceB.dispatchCandidate(sampleCandidate),
    ]);

    // Exactly 1 winner and 1 suppressed
    const allResults = [...resA, ...resB];
    const delivered = allResults.filter(
      (r) => r.success && !r.error?.includes('Suppressed') && !r.dryRun
    );
    const suppressed = allResults.filter((r) => r.error?.includes('Suppressed by durable store'));

    expect(delivered.length).toBe(1);
    expect(suppressed.length).toBe(1);
    expect(mockFetchCalls).toBe(1);

    // Verify stored record
    const record = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://test-listener.internal.test/alerts'
    );
    expect(record).not.toBeNull();
    expect(record?.status).toBe('DELIVERED');
    expect(record?.attemptCount).toBe(1);
  });

  it('2. Process restart / cold start: Instance 2 suppresses already-delivered incident', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    // Instance 1 boots, delivers, and terminates
    const instance1 = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const res1 = await instance1.dispatchCandidate(sampleCandidate);
    expect(res1[0].success).toBe(true);
    expect(mockFetchCalls).toBe(1);

    // Instance 1 dies. Instance 2 starts cold (no in-memory state!)
    const instance2 = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    // Instance 2 receives same candidate in next cron cycle
    const res2 = await instance2.dispatchCandidate(sampleCandidate);
    expect(res2[0].success).toBe(true);
    expect(res2[0].error).toContain('Suppressed by durable store: ALREADY_DELIVERED');
    expect(mockFetchCalls).toBe(1); // No second HTTP request
  });

  it('3. Worker crash mid-delivery: active lease blocks, expired lease allows reclaim', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    // Worker 1 claims with a short 100ms lease, then "crashes" before completing
    const claim1 = await sharedStore.claimDelivery(
      sampleCandidate,
      'https://test-listener.internal.test/alerts',
      100 // 100ms lease
    );
    expect(claim1.claimed).toBe(true);
    expect(claim1.reason).toBe('NEW_CLAIM');

    // Worker 2 attempts delivery at T+20ms (lease is still active)
    const instance2 = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const res2 = await instance2.dispatchCandidate(sampleCandidate);
    expect(res2[0].error).toContain('Suppressed by durable store: CONCURRENT_IN_FLIGHT');
    expect(mockFetchCalls).toBe(0);

    // Wait for lease to expire (120ms > 100ms)
    await new Promise((r) => setTimeout(r, 120));

    // Worker 3 attempts delivery at T+140ms: lease expired!
    const instance3 = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const res3 = await instance3.dispatchCandidate(sampleCandidate);
    expect(res3[0].success).toBe(true);
    expect(mockFetchCalls).toBe(1);

    // Verify record state shows lease was reclaimed and completed
    const record = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://test-listener.internal.test/alerts'
    );
    expect(record?.status).toBe('DELIVERED');
    expect(record?.attemptCount).toBe(2); // 1st claim + 1 reclaim
  });

  it('4. Recovery notification protocol: single-fire delivery after failure, suppressed without failure', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const dispatcher = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const recoveryCandidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_RECOVERY',
      alertId: 'alert-rec-pib-001',
      sourceId: 'src-pib',
      sourceName: 'Press Information Bureau',
      severity: 'info',
      currentState: 'healthy',
      failureClass: 'HTTP_503_SERVICE_UNAVAILABLE',
      detectedAt: '2026-10-02T12:30:00.000Z',
      message: 'PIB source recovered to healthy state',
    };

    // Step A: Recovery without prior failure is rejected
    const resA = await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(resA[0].error).toContain('Suppressed by durable store: RECOVERY_NOT_APPLICABLE');
    expect(mockFetchCalls).toBe(0);

    // Step B: Deliver failure first
    await dispatcher.dispatchCandidate(sampleCandidate);
    expect(mockFetchCalls).toBe(1);

    // Step C: First recovery candidate is delivered
    const resC = await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(resC[0].success).toBe(true);
    expect(resC[0].error).toBeUndefined();
    expect(mockFetchCalls).toBe(2);

    // Step D: Subsequent recovery candidate in next poll is suppressed
    const resD = await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(resD[0].error).toContain('Suppressed by durable store: ALREADY_DELIVERED');
    expect(mockFetchCalls).toBe(2); // No 3rd call
  });

  it('5. Multi-cycle incident transitions: source recovers, then fails again in new cycle', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const dispatcher = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    // 1. Initial Failure
    await dispatcher.dispatchCandidate(sampleCandidate);
    expect(mockFetchCalls).toBe(1);

    // 2. Recovery
    const recoveryCandidate: AlertCandidate = {
      ...sampleCandidate,
      eventType: 'SOURCE_HEALTH_RECOVERY',
      alertId: 'alert-rec-001',
      currentState: 'healthy',
    };
    await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(mockFetchCalls).toBe(2);

    // 3. New Failure in subsequent cycle with new alertId
    const newFailureCandidate: AlertCandidate = {
      ...sampleCandidate,
      alertId: 'alert-pib-002', // New occurrence
      detectedAt: '2026-10-02T14:00:00.000Z',
    };

    const res3 = await dispatcher.dispatchCandidate(newFailureCandidate);
    expect(res3[0].success).toBe(true);
    expect(res3[0].error).toBeUndefined();
    expect(mockFetchCalls).toBe(3);

    // Verify record was updated to new incident cycle
    const record = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://test-listener.internal.test/alerts'
    );
    expect(record?.alertId).toBe('alert-pib-002');
    expect(record?.status).toBe('DELIVERED');
  });

  it('6. High concurrency: 10 parallel instances compete for single P0 breaking signal', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      await new Promise((r) => setTimeout(r, 15));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const p0Candidate: AlertCandidate = {
      eventType: 'P0_BREAKING_SIGNAL',
      alertId: 'sig-breaking-monetary-policy-99',
      severity: 'critical',
      currentState: 'active',
      detectedAt: '2026-10-02T13:00:00.000Z',
      message: 'RBI announces emergency repo rate revision',
    };

    // Instantiate 10 separate dispatchers sharing the durable store
    const instances = Array.from({ length: 10 }, () =>
      new AlertDispatcher({
        durableStore: sharedStore,
        transports: [
          new WebhookTransport({
            webhookUrl: 'https://test-listener.internal.test/alerts',
            enabled: true,
            dryRun: false,
            fetchFn: mockFetch as unknown as typeof fetch,
          }),
        ],
      })
    );

    // Launch all 10 simultaneously
    const results = await Promise.all(instances.map((inst) => inst.dispatchCandidate(p0Candidate)));
    const flattened = results.flat();

    const delivered = flattened.filter(
      (r) => r.success && !r.error?.includes('Suppressed') && !r.dryRun
    );
    const suppressed = flattened.filter((r) => r.error?.includes('Suppressed by durable store'));

    expect(delivered.length).toBe(1);
    expect(suppressed.length).toBe(9);
    expect(mockFetchCalls).toBe(1);
  });

  it('7. Transient failure & retry: failed delivery allows subsequent worker to retry', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({ error: 'Gateway Timeout' }), { status: 504 });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const dispatcher = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          maxRetries: 0, // Fail immediately for test clarity
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    // Run 1: Fails with 504
    const res1 = await dispatcher.dispatchCandidate(sampleCandidate);
    expect(res1[0].success).toBe(false);
    expect(callCount).toBe(1);

    // Verify durable record is in RETRYABLE state
    const record1 = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://test-listener.internal.test/alerts'
    );
    expect(record1?.status).toBe('RETRYABLE');

    // Run 2: Cold restart instance retries and succeeds
    const instance2 = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const res2 = await instance2.dispatchCandidate(sampleCandidate);
    expect(res2[0].success).toBe(true);
    expect(callCount).toBe(2);

    const record2 = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://test-listener.internal.test/alerts'
    );
    expect(record2?.status).toBe('DELIVERED');
    expect(record2?.attemptCount).toBe(2);
  });

  it('8. Multi-destination independence: two distinct webhooks claim independently', async () => {
    const calls: string[] = [];
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      calls.push(url);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const dispatcher = new AlertDispatcher({
      durableStore: sharedStore,
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://ops-team.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
        new WebhookTransport({
          webhookUrl: 'https://pager-system.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    const res = await dispatcher.dispatchCandidate(sampleCandidate);
    expect(res.length).toBe(2);
    expect(res[0].success).toBe(true);
    expect(res[1].success).toBe(true);
    expect(calls).toContain('https://ops-team.internal.test/alerts');
    expect(calls).toContain('https://pager-system.internal.test/alerts');

    // Verify two discrete records in durable store
    const rec1 = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://ops-team.internal.test/alerts'
    );
    const rec2 = await sharedStore.getDeliveryRecord(
      'src-pib:HTTP_503_SERVICE_UNAVAILABLE',
      'SOURCE_HEALTH_FAILURE',
      'https://pager-system.internal.test/alerts'
    );
    expect(rec1?.status).toBe('DELIVERED');
    expect(rec2?.status).toBe('DELIVERED');
    expect(rec1?.id).not.toBe(rec2?.id);
  });

  it('9. Fallback when durable store is omitted: maintains backward compatibility with in-memory map', async () => {
    let mockFetchCalls = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      mockFetchCalls++;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    // AlertDispatcher without durableStore
    const legacyDispatcher = new AlertDispatcher({
      transports: [
        new WebhookTransport({
          webhookUrl: 'https://test-listener.internal.test/alerts',
          enabled: true,
          dryRun: false,
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ],
    });

    // First call succeeds
    const res1 = await legacyDispatcher.dispatchCandidate(sampleCandidate);
    expect(res1[0].success).toBe(true);
    expect(mockFetchCalls).toBe(1);

    // Duplicate call in same process is suppressed by in-memory deduplication
    const res2 = await legacyDispatcher.dispatchCandidate(sampleCandidate);
    expect(res2[0].destination).toBe('suppressed_by_deduplication');
    expect(mockFetchCalls).toBe(1);
  });
});
