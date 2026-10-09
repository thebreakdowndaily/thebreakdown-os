export type CoverageState =
  | 'NONE'
  | 'CANDIDATE'
  | 'PARTIAL'
  | 'ACTIVE'
  | 'STRONG'
  | 'BLIND';

export type CoverageGapType =
  | 'NO_PRIMARY_SOURCE'
  | 'SECONDARY_ONLY'
  | 'UNCOVERED_BEAT'
  | 'ALL_SOURCES_FAILING'
  | 'STALE_COVERAGE'
  | 'BLIND_SPOT'
  | 'HIGH_MISS_RATE';

export interface CoverageGap {
  geographyId: string;
  geographyName: string;
  gapType: CoverageGapType;
  details: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  remedyRecommendation: string;
}

export interface GeographicUnitCoverage {
  nodeId: string;
  name: string;
  level: string;
  totalCandidates: number;
  approvedSources: number;
  activeSources: number;
  healthySources: number;
  staleSources: number;
  failingSources: number;
  primarySources: number;
  secondarySources: number;
  coveredBeats: string[];
  missingBeats: string[];
  coverageState: CoverageState;
}

export interface GeographicCoverageReport {
  timestamp: string;
  countryCode: string;
  totalGeographicUnits: number;
  strongCoverageCount: number;
  activeCoverageCount: number;
  partialCoverageCount: number;
  blindCoverageCount: number;
  units: GeographicUnitCoverage[];
  detectedGaps: CoverageGap[];
}

export interface SourceValueDimensions {
  sourceId: string;
  sourceName: string;
  authorityWeight: number;       // 0.0 - 1.0 based on official/primary class
  coverageUniqueness: number;     // 0.0 - 1.0 (1.0 = only sensor for district/beat)
  eventYield: number;             // number of verified events/clusters originated
  changeFrequencyScore: number;   // active rate vs inert rate
  failureRate: number;            // 0.0 - 1.0 failure ratio
  meanLatencyMs: number | null;   // detection latency
  verificationContribution: number; // primary confirmations provided
  duplicateContribution: number;  // 0.0 - 1.0 (1.0 = 100% wire syndicated reposts)
}
