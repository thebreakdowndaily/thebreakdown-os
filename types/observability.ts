// ── Platform Observability & Intelligence Specification (Phase 21A) ──────────
// Immutable Observability domain interfaces.

export type SpanStatus = 'OK' | 'ERROR' | 'TIMEOUT';
export type AnomalySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface DistributedTraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  subsystem: string;
  operation: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: SpanStatus;
  attributes: Record<string, string | number | boolean>;
}

export interface SystemAnomalyAlert {
  alertId: string;
  subsystem: string;
  metricName: string;
  observedValue: number;
  expectedBaseline: number;
  severity: AnomalySeverity;
  detectedTime: string;
}

export interface CapacityForecast {
  metricName: string;
  currentUtilizationPercent: number;
  expectedUtilizationPercent: number;
  confidencePercent: number;
  forecastWindowHours: number;
  modelVersion: string;
}

export interface DecomposableReliabilityScore {
  overallScore: number; // 0 to 100
  deploymentSuccessScore: number;
  sloComplianceScore: number;
  latencyStabilityScore: number;
  errorRateStabilityScore: number;
  rollbackFrequencyScore: number;
}

export interface OperationalRecommendation {
  recommendationId: string;
  title: string;
  modelVersion: string;
  ruleSetVersion: string;
  confidenceScore: number; // 0.0 to 1.0
  affectedSubsystems: readonly string[];
  triggeringMetrics: readonly string[];
  evidenceReferences: readonly string[];
  rationale: string;
  suggestedAction: string;
}

export interface PlatformObservabilityProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  systemHealthScore: number; // 0 to 100
  traceSpans: readonly DistributedTraceSpan[];
  anomalyAlerts: readonly SystemAnomalyAlert[];
  capacityForecasts: readonly CapacityForecast[];
  reliabilityScore: DecomposableReliabilityScore;
  recommendations: readonly OperationalRecommendation[];
}
