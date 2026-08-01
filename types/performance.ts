// ── Platform Performance & Scalability Specification (Phase 18D & Phase 27A) ─────
// Immutable Performance domain interfaces under Architecture Release AR-13A.1.

export type ProjectionType =
  | 'ProblemIntelligence'
  | 'PolicyMatrix'
  | 'GlobalPrecedent'
  | 'OutcomeTracking'
  | 'EvidenceEvolution';

export type CacheState = 'WARM' | 'COLD' | 'HIT' | 'MISS' | 'EVICTED';

export type CacheTier = 'L1_MEMORY' | 'L2_DISTRIBUTED' | 'L3_PERSISTENT' | 'PROJECTION_CACHE' | 'SEARCH_CACHE' | 'METADATA_CACHE' | 'ANALYTICS_CACHE';

export type CacheInvalidationEventType = 'CLAIM_UPDATE' | 'FIX_UPDATE' | 'DATASET_REFRESH' | 'MANUAL_PURGE';

export interface PerformanceBudget {
  budgetId: string;
  budgetName: string;
  subsystem?: string;
  maxLatencyMs?: number;
  targetHitRatio?: number;
  unit?: string;
  metricName?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface CacheTierMetrics {
  tier: CacheTier;
  maxSize?: number;
  currentEntries?: number;
  itemCount?: number;
  hitCount: number;
  missCount: number;
  hitRatio: number;
  memoryUsageBytes?: number;
  ttlSeconds?: number;
}

export interface LatencyPercentiles {
  p50?: number;
  p95?: number;
  p99?: number;
  p50Ms?: number;
  p90Ms?: number;
  p95Ms?: number;
  p99Ms?: number;
}

export interface SlowOperationEvent {
  eventId: string;
  timestamp: string;
  operation?: string;
  operationName?: string;
  subsystem?: string;
  durationMs: number;
  thresholdMs: number;
  exceededByMs?: number;
  correlationId?: string;
  severity?: 'WARNING' | 'CRITICAL';
}

export interface BudgetComplianceResult {
  budgetId: string;
  budgetName?: string;
  metricName?: string;
  targetMs?: number;
  actualMs?: number;
  measuredValue?: number;
  targetValue?: number;
  isCompliant?: boolean;
  status?: 'WARNING' | 'COMPLIANT' | 'VIOLATED' | 'CRITICAL';
  variancePercentage?: number;
}

export interface CapacityTrend {
  metricName?: string;
  currentValue?: number;
  projectedValue30Days?: number;
  growthRatePercentage?: number;
  isCapacityConstrained?: boolean;
  averageThroughput?: number;
  peakThroughput?: number;
  sustainedConcurrency?: number;
  memoryUtilizationMb?: number;
  estimatedSaturationPoint?: number;
  latencyPercentiles?: LatencyPercentiles;
}

export interface PerformanceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  overallCompliance?: 'WARNING' | 'CRITICAL' | 'COMPLIANT';
  budgets?: readonly BudgetComplianceResult[];
  cacheEfficiency?: readonly CacheTierMetrics[];
  capacityTrend?: CapacityTrend;
  recentSlowOperations?: readonly SlowOperationEvent[];
  cacheTiers?: readonly CacheTierMetrics[];
  latencyPercentiles?: LatencyPercentiles;
  slowOperations?: readonly SlowOperationEvent[];
  budgetResults?: readonly BudgetComplianceResult[];
  capacityTrends?: readonly CapacityTrend[];
  overallStatus?: 'OPTIMAL' | 'DEGRADED' | 'BUDGET_EXCEEDED';
  performanceDisclaimer?: string;
}

export interface BenchmarkMetadata {
  timestamp: string;
  commitSha: string;
  nodeVersion: string;
  environment: string;
  datasetSize: number;
  projectionType: ProjectionType;
  cacheState: CacheState;
  executionDurationMicros: number;
}

export interface ProjectionBenchmarkResult {
  benchmarkId: string;
  projectionType: ProjectionType;
  buildDurationMs: number;
  cacheLookupMs: number;
  isBudgetCompliant: boolean;
  metadata: BenchmarkMetadata;
}

export interface MemoryProfileSnapshot {
  snapshotId: string;
  timestamp: string;
  canonicalObjectsBytes: number;
  projectionAllocationsBytes: number;
  cacheOccupancyBytes: number;
  temporaryAllocationsBytes: number;
  totalHeapUsedBytes: number;
}

export interface RoutePerformanceMetric {
  routePath: string;
  sloBudgetMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cacheHitRatio: number;
  isCompliant: boolean;
}

export interface PerformanceAuditReport {
  reportId: string;
  platformVersion: string;
  generatedAt: string;
  benchmarks: readonly ProjectionBenchmarkResult[];
  memorySnapshot: MemoryProfileSnapshot;
  routeMetrics: readonly RoutePerformanceMetric[];
  overallStatus: 'OPTIMAL' | 'DEGRADED' | 'BUDGET_EXCEEDED';
  performanceDisclaimer: string;
}
