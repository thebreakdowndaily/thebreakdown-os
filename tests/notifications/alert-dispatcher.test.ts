/**
 * ─── Phase 4B-1 Outbound Notification Dispatcher Test Suite ─────────────────
 *
 * Governing Document: .planning/PHASE-4B-1-OUTBOUND-NOTIFICATION-DISPATCH.md
 * Requirements: 22-point test matrix covering P0 signals, M4 source health,
 * idempotency, deduplication, recovery, SSRF defenses, HMAC signing, replay protection,
 * failure isolation, and retry backoff.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AlertDispatcher,
  WebhookTransport,
  signWebhookPayload,
  verifyWebhookSignature,
} from '../../services/notifications';
import type {
  AlertCandidate,
  NotificationTransport,
  NotificationDeliveryResult,
} from '../../services/notifications/types';
import { RadarSourceHealthMonitor } from '../../services/radar/source-health';
import type { RadarSourceAlert } from '../../services/radar/types';
import type { NewsroomSignal } from '../../types/newsroom-intelligence';

describe('Phase 4B-1: Outbound Notification & Alert Dispatcher', () => {
  let dispatcher: AlertDispatcher;
  let mockTransport: NotificationTransport;
  let dispatchedCandidates: AlertCandidate[];

  beforeEach(() => {
    dispatchedCandidates = [];
    mockTransport = {
      name: 'mock-transport',
      dispatch: vi.fn(async (candidate: AlertCandidate): Promise<NotificationDeliveryResult> => {
        dispatchedCandidates.push(candidate);
        return {
          success: true,
          destination: 'https://webhook.internal-test.org/alerts',
          statusCode: 200,
          deliveryId: 'del-mock-123',
          durationMs: 12,
          retryCount: 0,
          dryRun: false,
          timestamp: new Date().toISOString(),
        };
      }),
    };

    dispatcher = new AlertDispatcher({ transports: [mockTransport] });
  });

  // ── 1. Eligible P0 Alert Dispatch ──────────────────────────────────────────
  it('1. dispatches eligible P0 breaking signals to transport', async () => {
    const mockP0Signal: NewsroomSignal = {
      id: 'sig-p0-test-001',
      clusterId: 'cluster-p0-1',
      title: 'Breaking: Major Regulatory Policy Order Issued',
      summary: 'Central authority issued immediate gazette notification.',
      firstDetectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lifecycleState: 'active',
      priority: 'P0',
      scores: {
        composite: 92,
        velocity: 88,
        corroboration: 95,
        authority: 90,
        unverifiedRisk: 10,
        contradictionRisk: 5,
        sourceDiversity: 80,
        confidence: 94,
        uncertainty: 6,
        evidenceStrength: 92,
        historicalWeight: 80,
      },
      explanation: {
        summary: 'High-velocity breaking regulatory event with authoritative backing.',
        primaryFactors: ['Tier 1 source', 'High velocity'],
      },
      observationCount: 3,
      independentSourceCount: 3,
      primarySourceCount: 1,
      keyEntities: ['RBI', 'Ministry of Finance'],
      keyClaims: ['Immediate interest rate adjustment'],
      contradictionIds: [],
      version: 1,
    };

    const candidate = dispatcher.mapSignalToCandidate(mockP0Signal);
    expect(candidate.eventType).toBe('P0_BREAKING_SIGNAL');
    expect(candidate.severity).toBe('critical');

    const results = await dispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(true);
    expect(dispatchedCandidates.length).toBe(1);
    expect(dispatchedCandidates[0].alertId).toBe('sig-p0-test-001');
  });

  // ── 2. Eligible Source-Health Failure Dispatch ──────────────────────────────
  it('2. dispatches eligible source-health failure alert to transport', async () => {
    const alert: RadarSourceAlert = {
      id: 'alert-dd-news-HTTP_ERROR-101',
      sourceId: 'src-dd-news',
      sourceName: 'Doordarshan News',
      severity: 'error',
      currentState: 'failing',
      failureClass: 'HTTP_ERROR',
      consecutiveFailures: 4,
      consecutiveEmptyRuns: 0,
      lastHttpStatus: 503,
      expectedCadenceMinutes: 30,
      observedDelayMinutes: 120,
      message: 'Remote feed returned 503 Service Unavailable',
      recommendedAction: 'Inspect upstream server reachability.',
      detectedAt: new Date().toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-dd-news:HTTP_ERROR',
    };

    const candidate = dispatcher.mapSourceAlertToCandidate(alert);
    expect(candidate.eventType).toBe('SOURCE_HEALTH_FAILURE');
    expect(candidate.severity).toBe('error');

    const results = await dispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(true);
    expect(dispatchedCandidates.length).toBe(1);
    expect(dispatchedCandidates[0].sourceId).toBe('src-dd-news');
  });

  // ── 3. Eligible Recovery Dispatch ──────────────────────────────────────────
  it('3. dispatches recovery notification when previously failed source recovers', async () => {
    // First, deliver initial failure
    const failureAlert: RadarSourceAlert = {
      id: 'alert-pib-HTTP_ERROR-201',
      sourceId: 'src-pib',
      sourceName: 'Press Information Bureau',
      severity: 'warning',
      currentState: 'degraded',
      failureClass: 'HTTP_ERROR',
      consecutiveFailures: 2,
      consecutiveEmptyRuns: 0,
      expectedCadenceMinutes: 15,
      observedDelayMinutes: 30,
      message: 'Network timeout',
      recommendedAction: 'Check gateway.',
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-pib:HTTP_ERROR',
    };

    await dispatcher.dispatchCandidate(dispatcher.mapSourceAlertToCandidate(failureAlert));
    expect(dispatchedCandidates.length).toBe(1);

    // Now deliver recovery
    const recoveryAlert: RadarSourceAlert = {
      ...failureAlert,
      currentState: 'healthy',
      resolvedAt: new Date().toISOString(),
      message: 'Resolved: Source recovered operational status with 5 artifacts.',
    };

    const recoveryCandidate = dispatcher.mapSourceAlertToCandidate(recoveryAlert);
    expect(recoveryCandidate.eventType).toBe('SOURCE_HEALTH_RECOVERY');

    const results = await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(results[0].success).toBe(true);
    expect(dispatchedCandidates.length).toBe(2);
    expect(dispatchedCandidates[1].eventType).toBe('SOURCE_HEALTH_RECOVERY');
  });

  // ── 4. Non-Eligible Quiet Feed → No Dispatch ───────────────────────────────
  it('4. suppresses dispatch for healthy quiet feeds under threshold', async () => {
    const quietAlert: RadarSourceAlert = {
      id: 'alert-air-QUIET-301',
      sourceId: 'src-air',
      sourceName: 'All India Radio',
      severity: 'info',
      currentState: 'healthy', // Under empty threshold = healthy
      failureClass: 'EMPTY_FEED_ANOMALY',
      consecutiveFailures: 0,
      consecutiveEmptyRuns: 1, // Below anomaly threshold (3)
      expectedCadenceMinutes: 60,
      observedDelayMinutes: 60,
      message: 'Quiet period: 1 empty fetch',
      recommendedAction: 'None',
      detectedAt: new Date().toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-air:EMPTY_FEED_ANOMALY',
    };

    const candidate = dispatcher.mapSourceAlertToCandidate(quietAlert);
    const results = await dispatcher.dispatchCandidate(candidate);

    expect(dispatchedCandidates.length).toBe(0);
    expect(results[0].destination).toBe('suppressed_by_deduplication');
  });

  // ── 5. Duplicate Alert → No Duplicate Delivery ─────────────────────────────
  it('5. suppresses duplicate delivery for identical active alert candidate', async () => {
    const alert: RadarSourceAlert = {
      id: 'alert-dup-001',
      sourceId: 'src-dup',
      severity: 'error',
      currentState: 'failing',
      failureClass: 'DNS_NETWORK_ERROR',
      consecutiveFailures: 3,
      consecutiveEmptyRuns: 0,
      expectedCadenceMinutes: 30,
      observedDelayMinutes: 90,
      message: 'DNS lookup failure',
      recommendedAction: 'Check nameserver',
      detectedAt: new Date().toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-dup:DNS_NETWORK_ERROR',
    };

    const candidate = dispatcher.mapSourceAlertToCandidate(alert);

    // Call 1: Should deliver
    const res1 = await dispatcher.dispatchCandidate(candidate);
    expect(res1[0].success).toBe(true);
    expect(dispatchedCandidates.length).toBe(1);

    // Call 2: Should suppress duplicate
    const res2 = await dispatcher.dispatchCandidate(candidate);
    expect(res2[0].destination).toBe('suppressed_by_deduplication');
    expect(dispatchedCandidates.length).toBe(1); // Still 1!
  });

  // ── 6. Repeated Cron Execution → Deduplicated ──────────────────────────────
  it('6. deduplicates delivery across repeated cron execution cycles', async () => {
    const monitor = new RadarSourceHealthMonitor();
    monitor.recordFailure('src-cron-test', 500, 'Server 500 error');

    // Cron Cycle 1: First poll detects failure
    await dispatcher.dispatchPipelineAlerts(monitor);
    expect(dispatchedCandidates.length).toBe(1);

    // Cron Cycle 2: Second poll runs 5 minutes later with same active failure
    await dispatcher.dispatchPipelineAlerts(monitor);
    expect(dispatchedCandidates.length).toBe(1); // Deduplicated!

    // Cron Cycle 3: Third poll runs 10 minutes later with same active failure
    await dispatcher.dispatchPipelineAlerts(monitor);
    expect(dispatchedCandidates.length).toBe(1); // Still deduplicated!
  });

  // ── 7. New Incident → New Delivery ─────────────────────────────────────────
  it('7. dispatches new delivery when a distinct incident occurs', async () => {
    const monitor = new RadarSourceHealthMonitor();
    monitor.recordFailure('src-a', 500, 'Error on Source A');
    await dispatcher.dispatchPipelineAlerts(monitor);
    expect(dispatchedCandidates.length).toBe(1);

    // A different source fails
    monitor.recordFailure('src-b', 502, 'Bad gateway on Source B');
    await dispatcher.dispatchPipelineAlerts(monitor);
    expect(dispatchedCandidates.length).toBe(2);
    expect(dispatchedCandidates[1].sourceId).toBe('src-b');
  });

  // ── 8. Transport Success ───────────────────────────────────────────────────
  it('8. WebhookTransport delivers successfully when remote endpoint responds 200', async () => {
    const mockFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
    })) as unknown as typeof fetch;

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/v1/webhook',
      signingSecret: 'sec-secret-12345',
      enabled: true,
      dryRun: false,
      fetchFn: mockFetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-8',
      sourceId: 'src-8',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Source down',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.retryCount).toBe(0);
  });

  // ── 9. Transport Failure ───────────────────────────────────────────────────
  it('9. WebhookTransport handles terminal 4xx client errors without infinite retries', async () => {
    const mockFetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })) as unknown as typeof fetch;

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/v1/webhook',
      signingSecret: 'sec-secret-12345',
      enabled: true,
      dryRun: false,
      maxRetries: 3,
      fetchFn: mockFetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-9',
      sourceId: 'src-9',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Source down',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain('Terminal client error HTTP 401');
    expect(mockFetch).toHaveBeenCalledTimes(1); // Terminal, no retry on 401
  });

  // ── 10. Retry / Backoff Behavior ───────────────────────────────────────────
  it('10. WebhookTransport retries transient 500 failures with backoff', async () => {
    let callCount = 0;
    const mockFetch = vi.fn(async () => {
      callCount++;
      if (callCount < 2) {
        return { ok: false, status: 503, statusText: 'Service Unavailable' };
      }
      return { ok: true, status: 200, statusText: 'OK' };
    }) as unknown as typeof fetch;

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/v1/webhook',
      enabled: true,
      dryRun: false,
      maxRetries: 3,
      initialBackoffMs: 10,
      fetchFn: mockFetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-10',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Temporary glitch',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.retryCount).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // ── 11. Retry Exhaustion ───────────────────────────────────────────────────
  it('11. WebhookTransport reports failure after exhausting maxRetries on persistent 500', async () => {
    const mockFetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })) as unknown as typeof fetch;

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/v1/webhook',
      enabled: true,
      dryRun: false,
      maxRetries: 3,
      initialBackoffMs: 5,
      fetchFn: mockFetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-11',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Persistent server crash',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Retry exhaustion after 3 attempts');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  // ── 12. Dry-Run Mode ───────────────────────────────────────────────────────
  it('12. dry-run mode simulates successful delivery without network fetch', async () => {
    const mockFetch = vi.fn();

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/v1/webhook',
      enabled: true,
      dryRun: true, // Dry run active
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-12',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Dry run check',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── 13. Disabled Destination → No External Call ───────────────────────────
  it('13. disabled configuration suppresses delivery with informative reason', async () => {
    const mockFetch = vi.fn();

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/v1/webhook',
      enabled: false, // Disabled
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'P0_BREAKING_SIGNAL',
      alertId: 'alt-13',
      severity: 'critical',
      currentState: 'active',
      detectedAt: new Date().toISOString(),
      message: 'Disabled test',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(false);
    expect(result.error).toContain('disabled by configuration');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── 14. Malformed Configuration ────────────────────────────────────────────
  it('14. handles missing or unconfigured webhook URL gracefully', async () => {
    const transport = new WebhookTransport({
      webhookUrl: '', // Missing
      enabled: true,
      dryRun: false,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-14',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Malformed URL test',
    };

    const result = await transport.dispatch(candidate);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing destination webhook URL');
  });

  // ── 15. SSRF / Unsafe Destination Rejection ────────────────────────────────
  it('15. rejects private IP, localhost, and cloud metadata SSRF destinations', async () => {
    const unsafeUrls = [
      'http://localhost:8080/hook',
      'http://127.0.0.1:3000/webhook',
      'http://169.254.169.254/latest/meta-data',
      'http://10.0.0.5/internal/alert',
      'http://192.168.1.1/router',
      'http://service.internal/webhook',
      'file:///etc/passwd',
    ];

    for (const url of unsafeUrls) {
      const transport = new WebhookTransport({
        webhookUrl: url,
        enabled: true,
        dryRun: false,
      });

      const candidate: AlertCandidate = {
        eventType: 'SOURCE_HEALTH_FAILURE',
        alertId: `alt-ssrf-${url}`,
        severity: 'critical',
        currentState: 'failing',
        detectedAt: new Date().toISOString(),
        message: 'SSRF attack test',
      };

      const result = await transport.dispatch(candidate);
      expect(result.success).toBe(false);
      expect(result.error).toContain('SSRF rejected destination URL');
    }
  });

  // ── 16. Signed Payload Verification ────────────────────────────────────────
  it('16. HMAC-SHA256 signature creates valid verifiable signature header', () => {
    const payload = JSON.stringify({ event: 'P0_BREAKING_SIGNAL', id: 'test-16' });
    const secret = 'super-secret-hmac-key';
    const now = Math.floor(Date.now() / 1000);

    const signature = signWebhookPayload(payload, secret, now);
    const header = `t=${now},v1=${signature}`;

    const verification = verifyWebhookSignature(payload, header, secret, 300, now);
    expect(verification.valid).toBe(true);
  });

  // ── 17. Replay Protection ──────────────────────────────────────────────────
  it('17. verifyWebhookSignature rejects signatures outside the replay window', () => {
    const payload = JSON.stringify({ event: 'P0_BREAKING_SIGNAL' });
    const secret = 'super-secret-hmac-key';
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago (> 300s)

    const signature = signWebhookPayload(payload, secret, expiredTimestamp);
    const header = `t=${expiredTimestamp},v1=${signature}`;

    const verification = verifyWebhookSignature(payload, header, secret, 300);
    expect(verification.valid).toBe(false);
    expect(verification.reason).toContain('Timestamp outside tolerance window');
  });

  // ── 18. Secret Non-Leakage ─────────────────────────────────────────────────
  it('18. delivery results and errors never leak webhook signing secrets or auth headers', async () => {
    const secret = 'top-secret-private-signing-key-999';
    const mockFetch = vi.fn(async () => {
      throw new Error('Connection reset by remote host');
    }) as unknown as typeof fetch;

    const transport = new WebhookTransport({
      webhookUrl: 'https://api.external-monitoring.org/webhook',
      signingSecret: secret,
      enabled: true,
      dryRun: false,
      fetchFn: mockFetch,
    });

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-18',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Secret test',
    };

    const result = await transport.dispatch(candidate);
    const resultString = JSON.stringify(result);

    expect(resultString).not.toContain(secret);
    expect(resultString).not.toContain('X-Breakdown-Signature');
  });

  // ── 19. Newsroom Ingestion Continues When Notification Fails ───────────────
  it('19. source health monitor and ingestion succeed even when transport crashes', async () => {
    const failingTransport: NotificationTransport = {
      name: 'broken-transport',
      dispatch: vi.fn(async () => {
        throw new Error('Fatal socket network timeout in notification service');
      }),
    };

    const isolatedDispatcher = new AlertDispatcher({ transports: [failingTransport] });
    const monitor = new RadarSourceHealthMonitor();

    // 1. Record failure in monitor
    monitor.recordFailure('src-fail-19', 500, 'HTTP 500 on source');
    expect(monitor.getHealth('src-fail-19').status).toBe('degraded');

    // 2. Dispatch alerts through failing transport
    const dispatchResults = await isolatedDispatcher.dispatchPipelineAlerts(monitor);

    // 3. Confirm dispatcher returned failure gracefully without throwing
    expect(dispatchResults.length).toBe(1);
    expect(dispatchResults[0].success).toBe(false);

    // 4. Confirm source health state remained completely intact and unmodified
    expect(monitor.getHealth('src-fail-19').status).toBe('degraded');
    expect(monitor.getHealth('src-fail-19').totalFailures).toBe(1);
  });

  // ── 20. Publication Workflow Remains Unaffected ─────────────────────────────
  it('20. notification candidate payload contains zero authority to publish stories', () => {
    const mockSignal: NewsroomSignal = {
      id: 'sig-pub-20',
      clusterId: 'cluster-20',
      title: 'Major Story Under Verification',
      summary: 'Story requires human fact check.',
      firstDetectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lifecycleState: 'investigating',
      priority: 'P0',
      scores: {
        composite: 90, velocity: 80, corroboration: 90, authority: 90,
        unverifiedRisk: 10, contradictionRisk: 0, sourceDiversity: 80,
        confidence: 90, uncertainty: 10, evidenceStrength: 90, historicalWeight: 80,
      },
      explanation: { summary: 'P0 event', primaryFactors: [] },
      observationCount: 2,
      independentSourceCount: 2,
      primarySourceCount: 1,
      keyEntities: [],
      keyClaims: [],
      contradictionIds: [],
      version: 1,
    };

    const candidate = dispatcher.mapSignalToCandidate(mockSignal);
    const candidateJson = JSON.stringify(candidate);

    expect(candidateJson).not.toContain('PUBLISH');
    expect(candidateJson).not.toContain('published');
    expect(candidateJson).not.toContain('authorId');
    expect(candidateJson).not.toContain('authToken');
  });

  // ── 21. Concurrent Dispatch Attempts ───────────────────────────────────────
  it('21. prevents duplicate deliveries during concurrent dispatch invocations', async () => {
    let transportInvocations = 0;
    const slowTransport: NotificationTransport = {
      name: 'slow-transport',
      dispatch: vi.fn(async () => {
        transportInvocations++;
        await new Promise((r) => setTimeout(r, 50));
        return {
          success: true,
          destination: 'https://test-concurrency.org/hook',
          durationMs: 50,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        };
      }),
    };

    const concurrentDispatcher = new AlertDispatcher({ transports: [slowTransport] });
    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alt-concurrent-21',
      sourceId: 'src-concurrent',
      failureClass: 'HTTP_ERROR',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Concurrent test',
    };

    // Trigger two concurrent dispatches for identical incident
    const [res1, res2] = await Promise.all([
      concurrentDispatcher.dispatchCandidate(candidate),
      concurrentDispatcher.dispatchCandidate(candidate),
    ]);

    expect(transportInvocations).toBe(1); // Only delivered once!
    const suppressed = res1.concat(res2).find((r) => r.destination.includes('suppressed'));
    expect(suppressed).toBeDefined();
  });

  // ── 22. Recovery Notification Deduplication ────────────────────────────────
  it('22. delivers recovery notification exactly once across multiple checks', async () => {
    const recoveryCandidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_RECOVERY',
      alertId: 'alt-rec-22',
      sourceId: 'src-rec',
      failureClass: 'HTTP_ERROR',
      severity: 'info',
      currentState: 'healthy',
      detectedAt: new Date().toISOString(),
      message: 'Source recovered',
    };

    // First simulate prior failure
    const failureCandidate: AlertCandidate = {
      ...recoveryCandidate,
      eventType: 'SOURCE_HEALTH_FAILURE',
      currentState: 'failing',
    };
    await dispatcher.dispatchCandidate(failureCandidate);
    expect(dispatchedCandidates.length).toBe(1);

    // Call Recovery 1: Delivers
    const rec1 = await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(rec1[0].success).toBe(true);
    expect(dispatchedCandidates.length).toBe(2);

    // Call Recovery 2: Deduplicated suppression
    const rec2 = await dispatcher.dispatchCandidate(recoveryCandidate);
    expect(rec2[0].destination).toBe('suppressed_by_deduplication');
    expect(dispatchedCandidates.length).toBe(2); // Still 2!
  });

  // ── 23. End-to-End Integration Test (M4 Alert → Dispatcher → Transport) ─────
  it('23. (Integration) M4 Alert flows through Dispatcher to Transport without altering M4 health state', async () => {
    const healthMonitor = new RadarSourceHealthMonitor();

    // 1. Induce an HTTP 500 failure on an official source
    healthMonitor.recordFailure('src-dd-india', 500, '500 Server Error');
    const healthBefore = healthMonitor.getHealth('src-dd-india');
    expect(healthBefore.status).toBe('degraded');
    expect(healthBefore.totalFailures).toBe(1);

    // 2. Dispatch through dispatcher with local mock transport
    const dispatchResults = await dispatcher.dispatchPipelineAlerts(healthMonitor);
    expect(dispatchResults.length).toBe(1);
    expect(dispatchResults[0].success).toBe(true);

    // 3. Verify health monitor state is 100% unaltered by notification delivery
    const healthAfter = healthMonitor.getHealth('src-dd-india');
    expect(healthAfter.status).toBe(healthBefore.status);
    expect(healthAfter.totalFailures).toBe(healthBefore.totalFailures);
    expect(healthAfter.consecutiveFailures).toBe(healthBefore.consecutiveFailures);
  });
});
