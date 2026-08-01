// ── Platform Outcome Tracking & Implementation Metrics Specification (Phase 26A) ─────
// Immutable Outcome Tracking domain interfaces.

export type TemporalResolution = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'MULTI_YEAR' | 'EVENT_BASED';

export type MetricTrendDirection = 'IMPROVING' | 'STABLE' | 'DEGRADED' | 'UNCERTAIN';

export interface MetricDataPoint {
  pointId: string;
  timestamp: string;
  label: string;
  value: number;
  unit: string;
  confidenceLowerBound?: number;
  confidenceUpperBound?: number;
  evidenceSourceTitle: string;
}

export interface ImplementationRevisionMarker {
  revisionId: string;
  revisionDate: string;
  title: string;
  description: string;
  officialNotificationTitle: string;
  observedPostChangeNote: string;
}

export interface LongitudinalMetricNode {
  metricId: string;
  metricTitle: string;
  resolution: TemporalResolution;
  baselineValue: number;
  currentValue: number;
  unit: string;
  trend: MetricTrendDirection;
  trendReason: string;
  attributionLimitation: string;
  timeSeries: readonly MetricDataPoint[];
  revisions: readonly ImplementationRevisionMarker[];
  relatedProblemSlugs: readonly string[];
  relatedFixIds: readonly string[];
}

export interface OutcomeTrackingProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  problemSlug?: string;
  metricCount: number;
  metrics: readonly LongitudinalMetricNode[];
  descriptiveDisclaimer: string;
}
