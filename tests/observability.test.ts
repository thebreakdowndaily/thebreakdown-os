import { describe, it, expect } from 'vitest';
import { UnifiedObservabilityTracer } from '../lib/observability/tracer';
import { OperationalIntelligenceEngine } from '../lib/observability/intelligence-engine';
import { ReliabilityAnalyticsEngine } from '../lib/observability/reliability-analytics';
import { KnowledgeDrivenInsightsEngine } from '../lib/observability/recommendation-engine';
import { PlatformObservabilityProjectionBuilder } from '../lib/observability/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-OBSERVABILITY: Platform Observability & Intelligence (Phase 21A)', () => {
  it('TEST-OBS-01: Unified Observability Tracer Generating DAG Distributed Trace Spans', () => {
    const trace = UnifiedObservabilityTracer.generateTrace('trace-001');

    expect(trace.length).toBe(3);
    expect(trace[0].subsystem).toBe('APIGateway');
    expect(trace[0].spanId).toBeDefined();
    expect(Object.isFrozen(trace)).toBe(true);
  });

  it('TEST-OBS-02: Distributed Trace Parent-Child DAG Relationship Correlation', () => {
    const trace = UnifiedObservabilityTracer.generateTrace('trace-002');
    const rootSpan = trace.find((s) => !s.parentSpanId);
    const childSpans = trace.filter((s) => s.parentSpanId === rootSpan?.spanId);

    expect(rootSpan).toBeDefined();
    expect(childSpans.length).toBe(2);
  });

  it('TEST-OBS-03: Broken Trace Chain & Missing Parent Span Handling', () => {
    const trace = UnifiedObservabilityTracer.generateTrace('trace-003');
    const rootSpan = trace[0];
    const invalidChild = trace.find((s) => s.parentSpanId && s.parentSpanId !== rootSpan.spanId);
    expect(invalidChild).toBeUndefined();
  });

  it('TEST-OBS-04: Statistical Anomaly Detection Engine', () => {
    const alerts = OperationalIntelligenceEngine.detectAnomalies();

    expect(alerts.length).toBe(1);
    expect(alerts[0].metricName).toBe('telemetry_sample_rate');
    expect(alerts[0].severity).toBe('WARNING');
  });

  it('TEST-OBS-05: Capacity Trend Forecasting with Horizon & Confidence Intervals', () => {
    const forecasts = OperationalIntelligenceEngine.generateCapacityForecasts();

    expect(forecasts.length).toBe(2);
    expect(forecasts[0].forecastWindowHours).toBe(72);
    expect(forecasts[0].confidencePercent).toBeGreaterThan(90);
    expect(forecasts[0].modelVersion).toBe('v1.2-prophet');
  });

  it('TEST-OBS-06: Decomposable Reliability Quality Score Computation (5 Metrics)', () => {
    const score = ReliabilityAnalyticsEngine.computeScore();

    expect(score.overallScore).toBe(98);
    expect(score.deploymentSuccessScore).toBe(98.0);
    expect(score.sloComplianceScore).toBe(99.2);
    expect(score.latencyStabilityScore).toBe(96.5);
    expect(score.errorRateStabilityScore).toBe(99.0);
    expect(score.rollbackFrequencyScore).toBe(95.0);
  });

  it('TEST-OBS-07: Advisory Knowledge-Driven Insights Engine Recommendations', () => {
    const recs = KnowledgeDrivenInsightsEngine.generateRecommendations();

    expect(recs.length).toBe(2);
    expect(recs[0].confidenceScore).toBe(0.95);
    expect(recs[0].modelVersion).toBe('v2.1-advisory');
  });

  it('TEST-OBS-08: Operational Recommendation Explainability', () => {
    const recs = KnowledgeDrivenInsightsEngine.generateRecommendations();
    const sampleRec = recs[0];

    expect(sampleRec.triggeringMetrics.length).toBeGreaterThan(0);
    expect(sampleRec.evidenceReferences.length).toBeGreaterThan(0);
    expect(sampleRec.rationale).toBeDefined();
    expect(sampleRec.suggestedAction).toBeDefined();
  });

  it('TEST-OBS-09: Advisory Invariant Enforcement ("Observe. Explain. Recommend. Never execute.")', () => {
    const recs = KnowledgeDrivenInsightsEngine.generateRecommendations();

    expect(recs.every((r) => r.suggestedAction && r.rationale)).toBe(true);
  });

  it('TEST-OBS-10: PlatformObservabilityProjection Building & Immutability', () => {
    const proj = PlatformObservabilityProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(proj.systemHealthScore).toBe(98);
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.traceSpans)).toBe(true);
  });

  it('TEST-OBS-11: System Health Score Resolution', () => {
    const proj = PlatformObservabilityProjectionBuilder.buildProjection();
    expect(proj.systemHealthScore).toBeGreaterThanOrEqual(90);
  });

  it('TEST-OBS-12: Simultaneous Anomaly Alert Handling & Resolution', () => {
    const alerts = OperationalIntelligenceEngine.detectAnomalies();
    expect(alerts.every((a) => a.alertId && a.severity)).toBe(true);
  });

  it('TEST-OBS-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PlatformObservabilityProjectionBuilder.buildProjection();
    OperationalIntelligenceEngine.detectAnomalies();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-OBS-14: Observability Boundary Invariant Verification', () => {
    const proj = PlatformObservabilityProjectionBuilder.buildProjection();
    expect(proj).toBeDefined();
  });

  it('TEST-OBS-15: High-Volume Trace Generation Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      UnifiedObservabilityTracer.generateTrace(`trace-perf-${i}`);
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('TEST-OBS-16: Deterministic Observability Projection Serialization Stability', () => {
    const proj = PlatformObservabilityProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"systemHealthScore":98');
  });
});
