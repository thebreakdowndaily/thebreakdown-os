// ── Shared Standard Types for Phase 14B Derived Editorial Intelligence ─────────

export type IntelligenceSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface DerivedReference {
  targetId: string;
  targetType: 'FIX' | 'STORY' | 'CLAIM' | 'SOURCE' | 'ENTITY' | 'DATASET' | 'LAW' | 'POLICY';
  label: string;
}

export interface EditorialInsight {
  id: string;
  category: 'COMPLETENESS' | 'DIVERSITY' | 'MATURITY' | 'DEPENDENCY' | 'READINESS' | 'CONFIDENCE' | 'QUESTION';
  severity: IntelligenceSeverity;
  confidence: number; // 0.0 - 1.0
  title: string;
  explanation: string;
  supportingReferences: DerivedReference[];
}

export interface KnowledgeGap {
  id: string;
  type: 'ORPHAN_CLAIM' | 'UNSUPPORTED_FIX' | 'MISSING_DATASET' | 'OUTDATED_LEGISLATION' | 'STALE_CONTENT' | 'WEAK_CHAIN';
  severity: IntelligenceSeverity;
  title: string;
  description: string;
  affectedObjectId: string;
  recommendedAction: string;
  supportingReferences: DerivedReference[];
}

export interface ConflictItem {
  id: string;
  conflictType: 'CONTRADICTORY_CLAIM' | 'DATASET_MISMATCH' | 'SUPERSEDED_LEGISLATION' | 'COMPETING_RECOMMENDATION' | 'GRADE_INCOMPATIBILITY';
  severity: IntelligenceSeverity;
  description: string;
  objectIdA: string;
  objectIdB: string;
  supportingReferences: DerivedReference[];
}

export interface ConflictReport {
  generatedAt: string;
  conflictsCount: number;
  criticalConflictsCount: number;
  conflicts: ConflictItem[];
}

export interface EditorialDashboardData {
  verificationBacklogCount: number;
  evidenceHealthIndex: number; // 0 - 100
  reviewQueueCount: number;
  publicationReadinessScore: number; // 0 - 100
  staleContentCount: number;
  unresolvedConflictsCount: number;
  topInsights: EditorialInsight[];
  topGaps: KnowledgeGap[];
  topConflicts: ConflictItem[];
}

export interface ResearchRecommendation {
  id: string;
  category: 'RELATED_READING' | 'MISSING_EVIDENCE' | 'RECOMMENDED_EXPERT' | 'RELATED_INVESTIGATION' | 'RELATED_FIX' | 'RELEVANT_LEGISLATION';
  title: string;
  rationale: string;
  targetId: string;
  targetType: string;
}
