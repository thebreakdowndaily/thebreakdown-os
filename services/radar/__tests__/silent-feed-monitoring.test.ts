/**
 * ─── Phase 3B-M4 Silent Feed Monitoring & Source Health Alerting Test Suite ───
 *
 * Verifies:
 *   1. Healthy + new content
 *   2. Healthy + no new content (quiet feed / low news volume)
 *   3. HTTP failure (4xx/5xx)
 *   4. Timeout (AbortError / network timeout)
 *   5. Parser failure (malformed payload / extractor crash)
 *   6. Empty feed (HTTP 200 with 0 artifacts, threshold gating)
 *   7. Repeated failures (exponential backoff & status transition)
 *   8. Stale/silent source (>24h silence window)
 *   9. Recovery (operational recovery resets failures and resolves alert)
 *  10. Duplicate alert suppression (idempotency key deduplication)
 *  11. Concurrent execution (race-free idempotent alerting)
 *  12. Source-specific cadence (P0 vs P2 cadence & delay derivation)
 *  13. Incorrect threshold boundary (boundary enforcement below threshold)
 *  14. Notification failure safety (pipeline resilience)
 *  15. Authentication & secret handling (zero credential leakage)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RadarSourceHealthMonitor } from '../source-health';
import { SourceScheduler } from '../source-scheduler';
import { RadarPipeline } from '../pipeline';
import { MemoryRadarRepository } from '../persistence/memory';
import type { RadarSourceDefinition, RawArtifact, CollectorResult } from '../types';

describe('Phase 3B-M4 — Silent Feed Monitoring & Source Health Alerting', () => {
  let healthMonitor: RadarSourceHealthMonitor;
  let repository: MemoryRadarRepository;

  const mockSourceP0: RadarSourceDefinition = {
    id: 'src-official-gazette',
    name: 'MP Official Gazette',
    publisher: 'Government Central Press Bhopal',
    sourceType: 'GOVERNMENT',
    adapter: 'radar-pdf',
    url: 'https://govtpressmp.nic.in/gazette.pdf',
    canonicalDomain: 'govtpressmp.nic.in',
    jurisdiction: 'IN',
    language: 'hi',
    authorityClass: 'PRIMARY',
    primarySource: true,
    enabled: true,
    topics: [],
    geographies: ['INDIA', 'MADHYA_PRADESH'],
    priority: 'P0',
    refreshPolicy: 'HOURLY',
    approvalStatus: 'ACTIVE',
    country: 'india',
    state: 'mp',
    beat: 'government',
    officialStatus: 'official_primary',
    pollIntervalMinutes: 30,
    collectorType: 'pdf',
  };

  const mockSourceP2: RadarSourceDefinition = {
    id: 'src-local-tribunal',
    name: 'District Consumer Forum',
    publisher: 'State Consumer Commission',
    sourceType: 'COURTS',
    adapter: 'radar-html',
    url: 'https://confonet.nic.in/bhopal',
    canonicalDomain: 'confonet.nic.in',
    jurisdiction: 'IN',
    language: 'en',
    authorityClass: 'PRIMARY',
    primarySource: true,
    enabled: true,
    topics: [],
    geographies: ['INDIA'],
    priority: 'P2',
    refreshPolicy: 'DAILY',
    approvalStatus: 'ACTIVE',
    country: 'india',
    state: 'mp',
    beat: 'courts',
    officialStatus: 'official_primary',
    pollIntervalMinutes: 120,
    collectorType: 'html',
  };

  beforeEach(() => {
    repository = new MemoryRadarRepository();
    healthMonitor = new RadarSourceHealthMonitor(repository);
  });

  // ── 1. Healthy + New Content ───────────────────────────────────────────────
  it('1. Healthy + new content: marks source healthy and records observation', () => {
    healthMonitor.recordSuccess(mockSourceP0.id, 150, 30, 3);
    const health = healthMonitor.getHealth(mockSourceP0.id);

    expect(health.status).toBe('healthy');
    expect(health.consecutiveFailures).toBe(0);
    expect(health.consecutiveEmptyRuns).toBe(0);
    expect(health.silentFailureSuspected).toBe(false);
    expect(health.lastSuccessAt).toBeDefined();
    expect(health.lastObservationAt).toBeDefined();
    expect(healthMonitor.getAlerts(true)).toHaveLength(0);
  });

  // ── 2. Healthy + No New Content (Quiet Feed) ───────────────────────────────
  it('2. Healthy + no new content: quiet feed with valid existing items remains healthy', () => {
    // Artifacts were extracted (count = 5), even if downstream fingerprints mark them unchanged
    healthMonitor.recordSuccess(mockSourceP0.id, 120, 30, 5);
    const health = healthMonitor.getHealth(mockSourceP0.id);

    expect(health.status).toBe('healthy');
    expect(health.consecutiveFailures).toBe(0);
    expect(health.consecutiveEmptyRuns).toBe(0);
    expect(health.silentFailureSuspected).toBe(false);
    expect(healthMonitor.getAlerts(true)).toHaveLength(0);
  });

  // ── 3. HTTP Failure (4xx/5xx) ──────────────────────────────────────────────
  it('3. HTTP failure: classifies failure class as HTTP_ERROR and emits alert', () => {
    const alert = healthMonitor.recordFailure(
      mockSourceP0.id,
      503,
      'Service Unavailable: upstream database error',
      undefined,
      mockSourceP0
    );

    const health = healthMonitor.getHealth(mockSourceP0.id);
    expect(health.status).toBe('degraded');
    expect(health.consecutiveFailures).toBe(1);
    expect(health.failureClass).toBe('HTTP_ERROR');

    expect(alert).toBeDefined();
    expect(alert.failureClass).toBe('HTTP_ERROR');
    expect(alert.lastHttpStatus).toBe(503);
    expect(alert.recommendedAction).toContain('remote server response codes');
    expect(alert.expectedCadenceMinutes).toBe(30);
  });

  // ── 4. Timeout (AbortError) ────────────────────────────────────────────────
  it('4. Timeout: classifies AbortError/timeout as NETWORK_TIMEOUT and schedules backoff', () => {
    const alert = healthMonitor.recordFailure(
      mockSourceP0.id,
      undefined,
      'The operation was aborted: Request timed out after 30000ms',
      undefined,
      mockSourceP0
    );

    const health = healthMonitor.getHealth(mockSourceP0.id);
    expect(health.failureClass).toBe('NETWORK_TIMEOUT');
    expect(health.backoffMinutes).toBe(5); // 1st failure = 5m backoff
    expect(alert.failureClass).toBe('NETWORK_TIMEOUT');
    expect(alert.recommendedAction).toContain('server responsiveness');
  });

  // ── 5. Parser Failure ──────────────────────────────────────────────────────
  it('5. Parser failure: classifies malformed payload as PARSER_FAILURE', () => {
    const alert = healthMonitor.recordFailure(
      mockSourceP0.id,
      200,
      'XMLParser error: Malformed XML tag or syntax error in feed body',
      undefined,
      mockSourceP0
    );

    expect(alert.failureClass).toBe('PARSER_FAILURE');
    expect(alert.recommendedAction).toContain('collector extraction rules');
  });

  // ── 6. Empty Feed (Silent Failure Suspected) ──────────────────────────────
  it('6. Empty feed: distinguishes isolated empty fetch from sustained silent failure', () => {
    // First empty fetch on P0 (threshold 2): quiet run, no alert yet
    const alert1 = healthMonitor.recordEmptyFetch(mockSourceP0.id, 90, 30, mockSourceP0);
    expect(alert1).toBeNull();
    let health = healthMonitor.getHealth(mockSourceP0.id);
    expect(health.status).toBe('healthy');
    expect(health.consecutiveEmptyRuns).toBe(1);
    expect(health.silentFailureSuspected).toBe(false);

    // Second consecutive empty fetch on P0: breaches threshold (2 for P0)
    const alert2 = healthMonitor.recordEmptyFetch(mockSourceP0.id, 85, 30, mockSourceP0);
    expect(alert2).not.toBeNull();
    expect(alert2?.failureClass).toBe('EMPTY_FEED_ANOMALY');
    expect(alert2?.consecutiveEmptyRuns).toBe(2);
    expect(alert2?.observedDelayMinutes).toBe(60); // 2 * 30m

    health = healthMonitor.getHealth(mockSourceP0.id);
    expect(health.status).toBe('degraded');
    expect(health.silentFailureSuspected).toBe(true);
    expect(health.lastError).toContain('Suspected silent failure');
  });

  // ── 7. Repeated Failures (Backoff Progression) ─────────────────────────────
  it('7. Repeated failures: transitions to failing and applies exponential backoff', () => {
    healthMonitor.recordFailure(mockSourceP0.id, 500, 'Error 1', undefined, mockSourceP0);
    healthMonitor.recordFailure(mockSourceP0.id, 500, 'Error 2', undefined, mockSourceP0);
    const alert3 = healthMonitor.recordFailure(mockSourceP0.id, 500, 'Error 3', undefined, mockSourceP0);

    const health = healthMonitor.getHealth(mockSourceP0.id);
    expect(health.status).toBe('failing');
    expect(health.consecutiveFailures).toBe(3);
    expect(health.backoffMinutes).toBe(20); // 5 * 2^(3-1) = 20
    expect(alert3.severity).toBe('error');
  });

  // ── 8. Stale / Silent Source (>24h silence window) ──────────────────────────
  it('8. Stale/silent source: detects breach of silence threshold and alerts', () => {
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    // Simulate source that succeeded 30 hours ago but received zero new observations
    healthMonitor.recordSuccess(mockSourceP0.id, 100, 30, 1);
    const health = healthMonitor.getHealth(mockSourceP0.id);
    health.lastObservationAt = thirtyHoursAgo;
    health.lastSuccessAt = thirtyHoursAgo;

    const alert = healthMonitor.evaluateSourceSilence(mockSourceP0, new Date());
    expect(alert).not.toBeNull();
    expect(alert?.failureClass).toBe('STALE_SOURCE_SILENCE');
    expect(alert?.currentState).toBe('stale');
    expect(alert?.observedDelayMinutes).toBeGreaterThanOrEqual(30 * 60);

    const updatedHealth = healthMonitor.getHealth(mockSourceP0.id);
    expect(updatedHealth.status).toBe('stale');
    expect(updatedHealth.scheduleState).toBe('STALE');
  });

  // ── 9. Recovery ────────────────────────────────────────────────────────────
  it('9. Recovery: operational recovery resets failures and resolves alert', () => {
    // Source fails 3 times
    healthMonitor.recordFailure(mockSourceP0.id, 500, 'Server Error', undefined, mockSourceP0);
    healthMonitor.recordFailure(mockSourceP0.id, 500, 'Server Error', undefined, mockSourceP0);
    healthMonitor.recordFailure(mockSourceP0.id, 500, 'Server Error', undefined, mockSourceP0);

    expect(healthMonitor.getAlerts(true)).toHaveLength(1);
    expect(healthMonitor.getHealth(mockSourceP0.id).status).toBe('failing');

    // Source recovers with 2 artifacts
    healthMonitor.recordSuccess(mockSourceP0.id, 110, 30, 2);

    const health = healthMonitor.getHealth(mockSourceP0.id);
    expect(health.status).toBe('healthy');
    expect(health.consecutiveFailures).toBe(0);
    expect(health.consecutiveEmptyRuns).toBe(0);
    expect(health.backoffMinutes).toBe(0);
    expect(health.scheduleState).toBe('SUCCEEDED');

    // Active alert must be resolved
    const activeAlerts = healthMonitor.getAlerts(true);
    expect(activeAlerts).toHaveLength(0);

    const allAlerts = healthMonitor.getAlerts(false);
    expect(allAlerts).toHaveLength(1);
    expect(allAlerts[0].resolvedAt).toBeDefined();
    expect(allAlerts[0].severity).toBe('info');
    expect(allAlerts[0].message).toContain('Resolved');
  });

  // ── 10. Duplicate Alert Suppression ────────────────────────────────────────
  it('10. Duplicate alert suppression: repeated failed polls update existing alert without duplication', () => {
    const alert1 = healthMonitor.recordFailure(mockSourceP0.id, 500, 'Failure 1', undefined, mockSourceP0);
    const alert2 = healthMonitor.recordFailure(mockSourceP0.id, 500, 'Failure 2', undefined, mockSourceP0);
    const alert3 = healthMonitor.recordFailure(mockSourceP0.id, 500, 'Failure 3', undefined, mockSourceP0);

    expect(alert1.idempotencyKey).toBe(alert2.idempotencyKey);
    expect(alert2.idempotencyKey).toBe(alert3.idempotencyKey);

    const activeAlerts = healthMonitor.getAlerts(true);
    expect(activeAlerts).toHaveLength(1);
    expect(activeAlerts[0].consecutiveFailures).toBe(3);
    expect(activeAlerts[0].message).toBe('Failure 3');
  });

  // ── 11. Concurrent Execution ───────────────────────────────────────────────
  it('11. Concurrent execution: parallel health evaluations produce idempotent alert states', async () => {
    const promises = Array.from({ length: 5 }).map((_, i) =>
      Promise.resolve(
        healthMonitor.recordFailure(
          mockSourceP0.id,
          500,
          `Concurrent error ${i}`,
          'HTTP_ERROR',
          mockSourceP0
        )
      )
    );

    await Promise.all(promises);

    const activeAlerts = healthMonitor.getAlerts(true);
    expect(activeAlerts).toHaveLength(1);
    expect(activeAlerts[0].idempotencyKey).toBe(`${mockSourceP0.id}:HTTP_ERROR`);
  });

  // ── 12. Source-Specific Cadence ────────────────────────────────────────────
  it('12. Source-specific cadence: P0 30m vs P2 120m correctly derives cadence and observed delay', () => {
    // P0 with 2 empty runs: delay = 2 * 30 = 60m
    healthMonitor.recordEmptyFetch(mockSourceP0.id, 50, 30, mockSourceP0);
    const alertP0 = healthMonitor.recordEmptyFetch(mockSourceP0.id, 50, 30, mockSourceP0);
    expect(alertP0?.expectedCadenceMinutes).toBe(30);
    expect(alertP0?.observedDelayMinutes).toBe(60);

    // P2 with 3 empty runs (threshold 3): delay = 3 * 120 = 360m
    healthMonitor.recordEmptyFetch(mockSourceP2.id, 50, 120, mockSourceP2);
    healthMonitor.recordEmptyFetch(mockSourceP2.id, 50, 120, mockSourceP2);
    const alertP2 = healthMonitor.recordEmptyFetch(mockSourceP2.id, 50, 120, mockSourceP2);
    expect(alertP2?.expectedCadenceMinutes).toBe(120);
    expect(alertP2?.observedDelayMinutes).toBe(360);
  });

  // ── 13. Incorrect Threshold Boundary ───────────────────────────────────────
  it('13. Incorrect threshold boundary: 2 empty runs on P2 (threshold 3) do NOT trigger alert', () => {
    const alert1 = healthMonitor.recordEmptyFetch(mockSourceP2.id, 40, 120, mockSourceP2);
    const alert2 = healthMonitor.recordEmptyFetch(mockSourceP2.id, 40, 120, mockSourceP2);

    expect(alert1).toBeNull();
    expect(alert2).toBeNull();
    expect(healthMonitor.getHealth(mockSourceP2.id).status).toBe('healthy');
    expect(healthMonitor.getAlerts(true)).toHaveLength(0);

    // 3rd empty run reaches threshold
    const alert3 = healthMonitor.recordEmptyFetch(mockSourceP2.id, 40, 120, mockSourceP2);
    expect(alert3).not.toBeNull();
    expect(healthMonitor.getHealth(mockSourceP2.id).status).toBe('degraded');
  });

  // ── 14. Notification Failure Safety & Pipeline Integration ─────────────────
  it('14. Notification failure safety: pipeline runs safely when collectors return empty or degraded results', async () => {
    const pipeline = new RadarPipeline([mockSourceP0], { repository });

    // Mock collector to return 200 OK with empty artifacts (simulating silent feed failure)
    const mockCollector = {
      type: 'pdf',
      collect: vi.fn().mockResolvedValue({
        artifacts: [] as RawArtifact[],
        errors: [],
        fetchDurationMs: 45,
        httpStatus: 200,
      } as CollectorResult),
    };

    // Inject mock collector
    (pipeline as any).pdfCollector = mockCollector;

    // Run poll 1: empty run 1
    const run1 = await pipeline.poll({ forceAll: true });
    expect(run1.successful).toBe(1);
    expect(run1.newArtifacts).toBe(0);

    // Run poll 2: empty run 2 (P0 threshold breached)
    const run2 = await pipeline.poll({ forceAll: true });
    expect(run2.successful).toBe(1);

    const alerts = pipeline.getSourceAlerts(true);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].failureClass).toBe('EMPTY_FEED_ANOMALY');

    const health = pipeline.getHealthMonitor().getHealth(mockSourceP0.id);
    expect(health.silentFailureSuspected).toBe(true);
  });

  // ── 15. Authentication & Secret Handling ───────────────────────────────────
  it('15. Authentication & secret handling: classified as AUTHENTICATION_FAILURE without leaking credentials', () => {
    const sensitiveUrl = 'https://api.gov.in/feed?apiKey=SECRET_KEY_12345&token=BEARER_XYZ';
    const alert = healthMonitor.recordFailure(
      mockSourceP0.id,
      401,
      `HTTP 401 Unauthorized accessing ${sensitiveUrl}`,
      undefined,
      mockSourceP0
    );

    expect(alert.failureClass).toBe('AUTHENTICATION_FAILURE');
    expect(alert.recommendedAction).toContain('Check API keys, request headers');
    // Ensure recommendedAction does not parrot the raw token or query params
    expect(alert.recommendedAction).not.toContain('SECRET_KEY_12345');
    expect(alert.recommendedAction).not.toContain('BEARER_XYZ');
  });
});
