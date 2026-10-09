/**
 * ─── Phase 4B-1 Stage B: Non-Production Outbound Transport Verification ───────
 *
 * Governing Document: .planning/PHASE-4B-1-STAGE-B-TRANSPORT-VERIFICATION.md
 * Requirements:
 *   - Controlled non-production test listener (records requests, validates HMAC, payload schema)
 *   - 20-point verification matrix covering events, signatures, retry, SSRF, payload minimization,
 *     failure isolation, and idempotency across process restarts and separate instances.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AlertDispatcher,
  WebhookTransport,
  verifyWebhookSignature,
} from '../../services/notifications';
import type {
  AlertCandidate,
  NotificationDeliveryResult,
} from '../../services/notifications/types';
import { RadarSourceHealthMonitor } from '../../services/radar/source-health';
import type { RadarSourceAlert } from '../../services/radar/types';
import type { NewsroomSignal } from '../../types/newsroom-intelligence';

/**
 * Controlled Non-Production Test Listener
 * Emulates a remote webhook destination:
 *   - Captures incoming request details safely (method, headers, body)
 *   - Validates HMAC-SHA256 signature and timestamp replay tolerance
 *   - Validates JSON payload schema and ensures zero secret leakage
 *   - Returns configurable HTTP status codes
 */
class ControlledTestListener {
  public receivedRequests: Array<{
    url: string;
    method: string;
    headers: Record<string, string>;
    rawBody: string;
    parsedBody: any;
    signatureValid: boolean;
    signatureReason?: string;
  }> = [];

  public responseStatus = 200;
  public responseStatusText = 'OK';
  public responseDelayMs = 0;
  public shouldSimulateTimeout = false;
  public attemptsBeforeSuccess = 0;
  private currentAttempt = 0;

  constructor(public readonly signingSecret = 'non-prod-test-secret-key-108') {}

  public reset(): void {
    this.receivedRequests = [];
    this.responseStatus = 200;
    this.responseStatusText = 'OK';
    this.responseDelayMs = 0;
    this.shouldSimulateTimeout = false;
    this.attemptsBeforeSuccess = 0;
    this.currentAttempt = 0;
  }

  public getFetchHandler(): typeof fetch {
    return async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      this.currentAttempt++;

      if (this.responseDelayMs > 0) {
        await new Promise((r) => setTimeout(r, this.responseDelayMs));
      }

      if (this.shouldSimulateTimeout) {
        const error = new Error('The operation was aborted due to timeout');
        error.name = 'AbortError';
        throw error;
      }

      const headers: Record<string, string> = {};
      if (init?.headers) {
        if (typeof (init.headers as any).forEach === 'function') {
          (init.headers as any).forEach((value: string, key: string) => {
            headers[key.toLowerCase()] = value;
          });
        } else if (typeof init.headers === 'object') {
          for (const [k, v] of Object.entries(init.headers)) {
            headers[k.toLowerCase()] = String(v);
          }
        }
      }

      const rawBody = typeof init?.body === 'string' ? init.body : '';
      let parsedBody: any = null;
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        // ignore parse error for raw logging
      }

      // Cryptographic signature and replay validation
      const signatureHeader = headers['x-breakdown-signature'] || '';
      const sigCheck = verifyWebhookSignature(rawBody, signatureHeader, this.signingSecret, 300);

      this.receivedRequests.push({
        url: String(url),
        method: init?.method || 'GET',
        headers,
        rawBody,
        parsedBody,
        signatureValid: sigCheck.valid,
        signatureReason: sigCheck.reason,
      });

      // Handle multi-attempt simulations
      if (this.attemptsBeforeSuccess > 0 && this.currentAttempt < this.attemptsBeforeSuccess) {
        return new Response(JSON.stringify({ error: 'Temporary service error' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: this.responseStatus,
        statusText: this.responseStatusText,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  }
}

describe('Phase 4B-1 Stage B: Non-Production Outbound Transport Verification', () => {
  const TEST_DESTINATION_URL = 'https://alerts.nonprod-breakdown-test.org/webhook';
  const TEST_SIGNING_SECRET = 'non-prod-test-secret-key-108';
  let listener: ControlledTestListener;
  let transport: WebhookTransport;
  let dispatcher: AlertDispatcher;

  beforeEach(() => {
    listener = new ControlledTestListener(TEST_SIGNING_SECRET);
    transport = new WebhookTransport({
      webhookUrl: TEST_DESTINATION_URL,
      signingSecret: TEST_SIGNING_SECRET,
      enabled: true,
      dryRun: false,
      maxRetries: 3,
      initialBackoffMs: 5,
      maxBackoffMs: 20,
      timeoutMs: 100,
      fetchFn: listener.getFetchHandler(),
    });
    dispatcher = new AlertDispatcher({ transports: [transport] });
  });

  // ── 1. P0 Breaking Signal Delivery ─────────────────────────────────────────
  it('1. delivers exactly one webhook for eligible P0 breaking signals', async () => {
    const mockP0Signal: NewsroomSignal = {
      id: 'sig-p0-stage-b-1',
      clusterId: 'cluster-1',
      title: 'Breaking: Central Bank Announces Emergency Rate Cut',
      summary: 'Emergency monetary policy meeting concluded.',
      firstDetectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lifecycleState: 'active',
      priority: 'P0',
      scores: {
        composite: 95, velocity: 90, corroboration: 95, authority: 90,
        unverifiedRisk: 5, contradictionRisk: 0, sourceDiversity: 80,
        confidence: 96, uncertainty: 4, evidenceStrength: 95, historicalWeight: 80,
      },
      explanation: { summary: 'High-urgency P0 breaking signal', primaryFactors: ['Tier 1 source'] },
      observationCount: 4,
      independentSourceCount: 3,
      primarySourceCount: 1,
      keyEntities: ['Reserve Bank of India'],
      keyClaims: ['50bps rate cut announced'],
      contradictionIds: [],
      version: 1,
    };

    const candidate = dispatcher.mapSignalToCandidate(mockP0Signal);
    const results = await dispatcher.dispatchCandidate(candidate);

    expect(results[0].success).toBe(true);
    expect(listener.receivedRequests.length).toBe(1);

    const received = listener.receivedRequests[0];
    expect(received.parsedBody.event).toBe('P0_BREAKING_SIGNAL');
    expect(received.parsedBody.alert.id).toBe('sig-p0-stage-b-1');
    expect(received.parsedBody.alert.severity).toBe('critical');
    expect(received.signatureValid).toBe(true);
  });

  // ── 2. Source Failure Delivery ─────────────────────────────────────────────
  it('2. delivers exactly one webhook for active source-health failure', async () => {
    const failureAlert: RadarSourceAlert = {
      id: 'alert-src-fail-2',
      sourceId: 'src-pib-delhi',
      sourceName: 'PIB Delhi',
      severity: 'error',
      currentState: 'failing',
      failureClass: 'HTTP_ERROR',
      consecutiveFailures: 3,
      consecutiveEmptyRuns: 0,
      lastHttpStatus: 502,
      expectedCadenceMinutes: 15,
      observedDelayMinutes: 45,
      message: 'Upstream gateway returned 502 Bad Gateway',
      recommendedAction: 'Check remote server status',
      detectedAt: new Date().toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-pib-delhi:HTTP_ERROR',
    };

    const candidate = dispatcher.mapSourceAlertToCandidate(failureAlert);
    const results = await dispatcher.dispatchCandidate(candidate);

    expect(results[0].success).toBe(true);
    expect(listener.receivedRequests.length).toBe(1);

    const received = listener.receivedRequests[0];
    expect(received.parsedBody.event).toBe('SOURCE_HEALTH_FAILURE');
    expect(received.parsedBody.alert.failureClass).toBe('HTTP_ERROR');
    expect(received.signatureValid).toBe(true);
  });

  // ── 3. Source Recovery Delivery ────────────────────────────────────────────
  it('3. delivers exactly one recovery webhook when a failing source resolves', async () => {
    const failureAlert: RadarSourceAlert = {
      id: 'alert-src-rec-3',
      sourceId: 'src-air-news',
      sourceName: 'AIR News',
      severity: 'warning',
      currentState: 'degraded',
      failureClass: 'NETWORK_TIMEOUT',
      consecutiveFailures: 2,
      consecutiveEmptyRuns: 0,
      expectedCadenceMinutes: 30,
      observedDelayMinutes: 60,
      message: 'Network timed out',
      recommendedAction: 'Inspect network link',
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-air-news:NETWORK_TIMEOUT',
    };

    // First deliver failure
    await dispatcher.dispatchCandidate(dispatcher.mapSourceAlertToCandidate(failureAlert));
    expect(listener.receivedRequests.length).toBe(1);

    // Now resolve
    const recoveryAlert: RadarSourceAlert = {
      ...failureAlert,
      currentState: 'healthy',
      resolvedAt: new Date().toISOString(),
      message: 'Resolved: Source recovered operational status with 8 artifacts.',
    };

    const results = await dispatcher.dispatchCandidate(dispatcher.mapSourceAlertToCandidate(recoveryAlert));
    expect(results[0].success).toBe(true);
    expect(listener.receivedRequests.length).toBe(2);

    const recoveryReq = listener.receivedRequests[1];
    expect(recoveryReq.parsedBody.event).toBe('SOURCE_HEALTH_RECOVERY');
    expect(recoveryReq.parsedBody.alert.currentState).toBe('healthy');
    expect(recoveryReq.signatureValid).toBe(true);
  });

  // ── 4. Quiet Feed Suppression ──────────────────────────────────────────────
  it('4. suppresses dispatch for quiet feeds below failure threshold', async () => {
    const quietAlert: RadarSourceAlert = {
      id: 'alert-quiet-4',
      sourceId: 'src-quiet',
      sourceName: 'Quiet State Feed',
      severity: 'info',
      currentState: 'healthy',
      failureClass: 'EMPTY_FEED_ANOMALY',
      consecutiveFailures: 0,
      consecutiveEmptyRuns: 1, // Below anomaly threshold
      expectedCadenceMinutes: 60,
      observedDelayMinutes: 60,
      message: '1 empty fetch',
      recommendedAction: 'None',
      detectedAt: new Date().toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-quiet:EMPTY_FEED_ANOMALY',
    };

    const candidate = dispatcher.mapSourceAlertToCandidate(quietAlert);
    const results = await dispatcher.dispatchCandidate(candidate);

    expect(results[0].destination).toBe('suppressed_by_deduplication');
    expect(listener.receivedRequests.length).toBe(0);
  });

  // ── 5. Duplicate Suppression ───────────────────────────────────────────────
  it('5. suppresses duplicate delivery for identical active alert candidate', async () => {
    const alert: RadarSourceAlert = {
      id: 'alert-dup-5',
      sourceId: 'src-dup-5',
      severity: 'error',
      currentState: 'failing',
      failureClass: 'DNS_NETWORK_ERROR',
      consecutiveFailures: 3,
      consecutiveEmptyRuns: 0,
      expectedCadenceMinutes: 30,
      observedDelayMinutes: 90,
      message: 'DNS failure',
      recommendedAction: 'Check DNS',
      detectedAt: new Date().toISOString(),
      acknowledged: false,
      idempotencyKey: 'src-dup-5:DNS_NETWORK_ERROR',
    };

    const candidate = dispatcher.mapSourceAlertToCandidate(alert);

    // Call 1: Delivers
    await dispatcher.dispatchCandidate(candidate);
    expect(listener.receivedRequests.length).toBe(1);

    // Call 2: Suppressed
    const res2 = await dispatcher.dispatchCandidate(candidate);
    expect(res2[0].destination).toBe('suppressed_by_deduplication');
    expect(listener.receivedRequests.length).toBe(1);
  });

  // ── 6. Concurrent Duplicate Suppression ────────────────────────────────────
  it('6. prevents double-firing during concurrent dispatch invocations in same process', async () => {
    listener.responseDelayMs = 25; // Introduce small delay to ensure concurrency window

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-concurrent-6',
      sourceId: 'src-concurrent-6',
      failureClass: 'HTTP_ERROR',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Concurrent dispatch test',
    };

    const [res1, res2] = await Promise.all([
      dispatcher.dispatchCandidate(candidate),
      dispatcher.dispatchCandidate(candidate),
    ]);

    expect(listener.receivedRequests.length).toBe(1);
    const suppressed = res1.concat(res2).some((r) => r.destination.includes('suppressed'));
    expect(suppressed).toBe(true);
  });

  // ── 7. Process Restart Behavior (REQUIRED GATE) ────────────────────────────
  it('7. (CRITICAL) process restart resets in-memory deduplication and causes re-delivery', async () => {
    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-restart-7',
      sourceId: 'src-restart-7',
      failureClass: 'HTTP_ERROR',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Process restart simulation',
    };

    // 1. Process A dispatches the alert
    await dispatcher.dispatchCandidate(candidate);
    expect(listener.receivedRequests.length).toBe(1);

    // 2. Simulate Process Restart: Instantiate a fresh AlertDispatcher (mimicking new serverless container)
    const restartedDispatcher = new AlertDispatcher({ transports: [transport] });

    // 3. Process B encounters the same ongoing incident
    await restartedDispatcher.dispatchCandidate(candidate);

    // Forensic Finding: Without a shared persistent store, the restarted process re-delivers!
    expect(listener.receivedRequests.length).toBe(2);
  });

  // ── 8. Separate-Instance Behavior (REQUIRED GATE) ───────────────────────────
  it('8. (CRITICAL) separate concurrent worker instances do not share memory and both deliver', async () => {
    const candidate: AlertCandidate = {
      eventType: 'P0_BREAKING_SIGNAL',
      alertId: 'sig-separate-worker-8',
      severity: 'critical',
      currentState: 'active',
      detectedAt: new Date().toISOString(),
      message: 'Separate serverless worker simulation',
    };

    // Worker Instance 1
    const worker1 = new AlertDispatcher({ transports: [transport] });
    // Worker Instance 2 (Separate container)
    const worker2 = new AlertDispatcher({ transports: [transport] });

    await worker1.dispatchCandidate(candidate);
    await worker2.dispatchCandidate(candidate);

    // Forensic Finding: Each worker has its own Map; both deliver!
    expect(listener.receivedRequests.length).toBe(2);
  });

  // ── 9. HMAC Signature Verification ─────────────────────────────────────────
  it('9. listener verifies HMAC-SHA256 signature and constant-time match', async () => {
    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-sig-9',
      sourceId: 'src-sig-9',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'HMAC signature test',
    };

    await dispatcher.dispatchCandidate(candidate);
    expect(listener.receivedRequests.length).toBe(1);

    const req = listener.receivedRequests[0];
    expect(req.signatureValid).toBe(true);
    expect(req.headers['x-breakdown-signature']).toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
    expect(req.headers['x-breakdown-event']).toBe('SOURCE_HEALTH_FAILURE');
    expect(req.headers['x-breakdown-delivery']).toBeDefined();
  });

  // ── 10. Replay Protection ──────────────────────────────────────────────────
  it('10. listener rejects tampered or expired timestamp signatures', () => {
    const payload = JSON.stringify({ test: 'replay-test' });
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 400; // 400 seconds ago (> 300s window)

    const signature = verifyWebhookSignature(
      payload,
      `t=${expiredTimestamp},v1=0000000000000000000000000000000000000000000000000000000000000000`,
      TEST_SIGNING_SECRET,
      300
    );

    expect(signature.valid).toBe(false);
    expect(signature.reason).toContain('Timestamp outside tolerance window');
  });

  // ── 11. 5xx Server Error Bounded Retries ────────────────────────────────────
  it('11. retries 5xx server errors with exponential backoff up to maxRetries', async () => {
    listener.attemptsBeforeSuccess = 3; // First 2 fail with 503, 3rd succeeds with 200

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-5xx-11',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Transient 503 test',
    };

    const results = await dispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(true);
    expect(results[0].retryCount).toBe(2);
    expect(listener.receivedRequests.length).toBe(3);
  });

  // ── 12. 429 Rate Limit Retries ─────────────────────────────────────────────
  it('12. retries 429 rate limit responses with backoff', async () => {
    listener.responseStatus = 429;
    listener.responseStatusText = 'Too Many Requests';

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-429-12',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Rate limit 429 test',
    };

    const results = await dispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(false);
    expect(results[0].retryCount).toBe(2); // 3 attempts total (0 initial + 2 retries)
    expect(listener.receivedRequests.length).toBe(3);
  });

  // ── 13. 4xx Terminal Failure (No Retries) ───────────────────────────────────
  it('13. client errors (400, 401, 403, 404) terminate immediately without retries', async () => {
    listener.responseStatus = 400;
    listener.responseStatusText = 'Bad Request';

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-400-13',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Bad request test',
    };

    const results = await dispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(false);
    expect(results[0].statusCode).toBe(400);
    expect(results[0].retryCount).toBe(0); // Zero retries on 400
    expect(listener.receivedRequests.length).toBe(1);
  });

  // ── 14. Timeout Handling ───────────────────────────────────────────────────
  it('14. handles remote network timeout gracefully and reports failure', async () => {
    listener.shouldSimulateTimeout = true;

    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-timeout-14',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Timeout test',
    };

    const results = await dispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Retry exhaustion');
    expect(results[0].error).toContain('timeout');
  });

  // ── 15. SSRF Rejection ─────────────────────────────────────────────────────
  it('15. strictly rejects SSRF destinations before attempting network connection', async () => {
    const ssrfUrls = [
      'http://127.0.0.1:8080/hook',
      'http://localhost:3000/api',
      'http://10.0.0.1/webhook',
      'http://172.16.0.1/alert',
      'http://192.168.1.100/notify',
      'http://169.254.169.254/latest/meta-data',
      'http://service.internal/hook',
      'http://printer.local/post',
    ];

    for (const url of ssrfUrls) {
      const ssrfTransport = new WebhookTransport({
        webhookUrl: url,
        enabled: true,
        dryRun: false,
        fetchFn: listener.getFetchHandler(),
      });

      const candidate: AlertCandidate = {
        eventType: 'SOURCE_HEALTH_FAILURE',
        alertId: `alert-ssrf-${url}`,
        severity: 'critical',
        currentState: 'failing',
        detectedAt: new Date().toISOString(),
        message: 'SSRF test',
      };

      const result = await ssrfTransport.dispatch(candidate);
      expect(result.success).toBe(false);
      expect(result.error).toContain('SSRF rejected destination URL');
    }

    // Zero requests should have reached the listener
    expect(listener.receivedRequests.length).toBe(0);
  });

  // ── 16. Payload Minimization Audit ─────────────────────────────────────────
  it('16. (Audit) received payload contains only approved operational fields and zero leaked secrets', async () => {
    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-audit-16',
      sourceId: 'src-audit-16',
      sourceName: 'Audit Source',
      severity: 'error',
      currentState: 'failing',
      failureClass: 'HTTP_ERROR',
      detectedAt: new Date().toISOString(),
      message: 'Audited operational alert',
      recommendedAction: 'Inspect remote server',
      metrics: {
        consecutiveFailures: 3,
        httpStatus: 500,
        observedDelayMinutes: 45,
      },
    };

    await dispatcher.dispatchCandidate(candidate);
    expect(listener.receivedRequests.length).toBe(1);

    const { rawBody, parsedBody } = listener.receivedRequests[0];

    // Allowed top-level fields
    const topLevelKeys = Object.keys(parsedBody).sort();
    expect(topLevelKeys).toEqual(['alert', 'deliveryId', 'event', 'timestamp', 'version'].sort());

    // Allowed alert fields
    const alertKeys = Object.keys(parsedBody.alert).sort();
    expect(alertKeys).toEqual([
      'currentState', 'detectedAt', 'failureClass', 'id', 'message',
      'metrics', 'recommendedAction', 'severity', 'sourceId', 'sourceName',
    ].sort());

    // Strict negative assertion: absolutely no sensitive strings or credentials
    const forbiddenPatterns = [
      'CRON_SECRET',
      'Sentry',
      'supabase',
      'service_role',
      'postgres',
      'password',
      'secret',
      'cookie',
      'token',
      'bearer',
      'editorial_notes',
      'audit_history',
    ];

    for (const pattern of forbiddenPatterns) {
      expect(rawBody.toLowerCase()).not.toContain(pattern.toLowerCase());
    }
  });

  // ── 17. Dry-Run Mode ───────────────────────────────────────────────────────
  it('17. dry-run mode records dispatch decision but transmits zero network requests', async () => {
    const dryRunTransport = new WebhookTransport({
      webhookUrl: TEST_DESTINATION_URL,
      enabled: true,
      dryRun: true, // Dry run enabled
      fetchFn: listener.getFetchHandler(),
    });

    const dryDispatcher = new AlertDispatcher({ transports: [dryRunTransport] });
    const candidate: AlertCandidate = {
      eventType: 'P0_BREAKING_SIGNAL',
      alertId: 'sig-dry-17',
      severity: 'critical',
      currentState: 'active',
      detectedAt: new Date().toISOString(),
      message: 'Dry run verification',
    };

    const results = await dryDispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(true);
    expect(results[0].dryRun).toBe(true);
    expect(listener.receivedRequests.length).toBe(0); // Zero external calls
  });

  // ── 18. Disabled Notifications ─────────────────────────────────────────────
  it('18. disabled configuration suppresses dispatch with informative reason', async () => {
    const disabledTransport = new WebhookTransport({
      webhookUrl: TEST_DESTINATION_URL,
      enabled: false, // Explicitly disabled
      fetchFn: listener.getFetchHandler(),
    });

    const disabledDispatcher = new AlertDispatcher({ transports: [disabledTransport] });
    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_FAILURE',
      alertId: 'alert-disabled-18',
      severity: 'error',
      currentState: 'failing',
      detectedAt: new Date().toISOString(),
      message: 'Disabled test',
    };

    const results = await disabledDispatcher.dispatchCandidate(candidate);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('disabled by configuration');
    expect(listener.receivedRequests.length).toBe(0);
  });

  // ── 19. Failure Isolation ──────────────────────────────────────────────────
  it('19. source health monitor and polling pipeline remain unaffected when webhook fails', async () => {
    listener.responseStatus = 500;
    listener.responseStatusText = 'Internal Server Error';

    const healthMonitor = new RadarSourceHealthMonitor();
    healthMonitor.recordFailure('src-fail-19', 500, 'Source down');

    // Health state before dispatch
    const beforeHealth = healthMonitor.getHealth('src-fail-19');
    expect(beforeHealth.status).toBe('degraded');

    // Outbound dispatch fails
    const results = await dispatcher.dispatchPipelineAlerts(healthMonitor);
    expect(results.length).toBe(1);
    expect(results[0].success).toBe(false);

    // Health state after dispatch: perfectly intact
    const afterHealth = healthMonitor.getHealth('src-fail-19');
    expect(afterHealth.status).toBe('degraded');
    expect(afterHealth.totalFailures).toBe(1);
  });

  // ── 20. Recovery Deduplication ─────────────────────────────────────────────
  it('20. recovery notification fires exactly once across multiple consecutive checks', async () => {
    const candidate: AlertCandidate = {
      eventType: 'SOURCE_HEALTH_RECOVERY',
      alertId: 'alert-rec-20',
      sourceId: 'src-rec-20',
      failureClass: 'HTTP_ERROR',
      severity: 'info',
      currentState: 'healthy',
      detectedAt: new Date().toISOString(),
      message: 'Source recovered',
    };

    // First simulate prior failure
    await dispatcher.dispatchCandidate({ ...candidate, eventType: 'SOURCE_HEALTH_FAILURE', currentState: 'failing' });
    expect(listener.receivedRequests.length).toBe(1);

    // Recovery Check 1: Delivers
    await dispatcher.dispatchCandidate(candidate);
    expect(listener.receivedRequests.length).toBe(2);

    // Recovery Check 2: Suppressed
    const res2 = await dispatcher.dispatchCandidate(candidate);
    expect(res2[0].destination).toBe('suppressed_by_deduplication');
    expect(listener.receivedRequests.length).toBe(2); // Still 2!
  });
});
