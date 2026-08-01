/**
 * Operational Metrics Types — Phase 17B
 *
 * Pure read-only types for the Platform Operations & Observability layer.
 * No canonical schema mutations. No editorial workflow types.
 * All projections are derived from existing platform services.
 */

// ── Metric Source ─────────────────────────────────────────────────────────

export type MetricSource = 'measured' | 'estimated' | 'unavailable';

// ── Platform Information ──────────────────────────────────────────────────

export interface PlatformInformation {
  version: string;
  buildId: string;
  environment: 'production' | 'development' | 'test';
  generatedAt: string;
}

// ── Platform Health ───────────────────────────────────────────────────────

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
}

export interface PlatformHealth {
  uptime: string;
  services: ServiceHealth[];
  routesHealthy: number;
  routesTotal: number;
  activeAlerts: number;
  criticalAlerts: number;
}

// ── Publication Analytics ─────────────────────────────────────────────────

export interface PopularObject {
  title: string;
  type: 'story' | 'topic' | 'entity' | 'fix' | 'investigation';
  views: number;
}

export interface PublicationAnalytics {
  publishedStories: number;
  publishedTopics: number;
  publishedEntities: number;
  publishedInvestigations: number;
  publishedFixes: number;
  popularObjects: PopularObject[];
  searchQueryCount: number;
}

// ── Search Observability ─────────────────────────────────────────────────

export interface SearchTerm {
  query: string;
  count: number;
}

export interface SearchObservability {
  totalQueries: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  zeroResultRate: number;
  topTerms: SearchTerm[];
  topFilters: string[];
  topCategories: string[];
}

// ── Accessibility Metrics ─────────────────────────────────────────────────

export interface AccessibilityMetrics {
  wcagCompliance: 'AA' | 'partial' | 'none';
  keyboardNavigation: 'full' | 'partial' | 'none';
  ariaLandmarkCoverage: number;
  colorContrastVerified: boolean;
  readerModeAccessible: boolean;
}

// ── Performance Metrics ───────────────────────────────────────────────────

export interface CoreWebVital {
  value: number;
  unit: 's' | 'ms';
  rating: 'good' | 'needs-improvement' | 'poor';
  source: MetricSource;
}

export interface PerformanceMetrics {
  largestContentfulPaint: CoreWebVital;
  interactionToNextPaint: CoreWebVital;
  cumulativeLayoutShift: CoreWebVital;
  staticGenerationTimeMs: number;
  cacheHitRatio: number;
}

// ── Reliability Metrics ───────────────────────────────────────────────────

export interface ReliabilityAvailability {
  routesHealthy: number;
  routesTotal: number;
}

export interface ReliabilityIntegrity {
  brokenLinks: number;
  metadataFailures: number;
}

export interface ReliabilityFailures {
  runtimeExceptions: number;
  searchFailures: number;
  citationExportFailures: number;
}

export interface EventBusMetrics {
  published: number;
  consumed: number;
  dropped: number;
  queueUtilisation: number;
  oldestEventAge: string;
}

export interface ReliabilityMetrics {
  availability: ReliabilityAvailability;
  integrity: ReliabilityIntegrity;
  failures: ReliabilityFailures;
  eventBus: EventBusMetrics;
}

// ── Operations Projection (Composed) ─────────────────────────────────────

export interface OperationsProjection {
  version: string;
  generatedAt: string;
  buildId: string;
  environment: 'production' | 'development' | 'test';
  platformInformation: PlatformInformation;
  platformHealth: PlatformHealth;
  publicationAnalytics: PublicationAnalytics;
  searchObservability: SearchObservability;
  accessibilityMetrics: AccessibilityMetrics;
  performanceMetrics: PerformanceMetrics;
  reliabilityMetrics: ReliabilityMetrics;
}
