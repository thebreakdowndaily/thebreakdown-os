// ── Platform Global Implementation Precedents Specification (Phase 25B) ────────
// Immutable Global Precedent domain interfaces.

export type RegionCategory =
  | 'SOUTH_ASIA'
  | 'MIDDLE_EAST'
  | 'EUROPE'
  | 'NORTH_AMERICA'
  | 'LATIN_AMERICA'
  | 'SUB_SAHARAN_AFRICA'
  | 'EAST_ASIA';

export interface PrecedentChronologyEvent {
  eventId: string;
  year: number;
  title: string;
  description: string;
}

export interface ObservedOutcome {
  outcomeId: string;
  metricTitle: string;
  observedResult: string;
  supportingEvidenceTitle: string;
  attributionLimitation: string;
}

export interface ContextualApplicabilityConstraint {
  designedFor: readonly string[];
  lessComparableTo: readonly string[];
  requiredPrerequisites: readonly string[];
}

export interface PrecedentJurisdictionNode {
  precedentId: string;
  slug: string;
  jurisdictionName: string;
  region: RegionCategory;
  implementationYearRange: string;
  contextSummary: string;
  contextSimilarityScore: number; // 0 to 100
  comparableCharacteristics: readonly string[];
  majorDifferences: readonly string[];
  chronology: readonly PrecedentChronologyEvent[];
  observedOutcomes: readonly ObservedOutcome[];
  applicabilityConstraints: ContextualApplicabilityConstraint;
  relatedProblemSlugs: readonly string[];
  relatedFixIds: readonly string[];
}

export interface GlobalPrecedentProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  problemSlug?: string;
  precedentCount: number;
  precedents: readonly PrecedentJurisdictionNode[];
  descriptiveDisclaimer: string;
}
