import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type {
  EditorialReadiness,
  VerificationStatus,
} from '@/lib/intel/verification';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// + docs/intelligence/roadmap.md (Part 14 — Editorial Intelligence; verification handoff)
// Canonical types for the Story Builder & Editorial Production System.
//
// The Story Builder owns editorial workflow, story planning, story metadata, the publication
// package, and editorial structure. It never owns evidence, research, predictions, verification,
// scoring, or Mission Control — every reference points to a certified engine output. A Story
// Draft owns metadata only; the brief, outline, source panel, readiness, and impact are derived
// projections over the certified engines, never duplicated content.

/** Ten-state editorial status model. Transitions are explicit — see status.ts. */
export type StoryStatus =
  | 'idea'
  | 'planned'
  | 'researching'
  | 'verification_required'
  | 'verification_complete'
  | 'drafting'
  | 'editorial_review'
  | 'ready_for_publication'
  | 'published'
  | 'archived';

export const STORY_STATUSES: readonly StoryStatus[] = [
  'idea',
  'planned',
  'researching',
  'verification_required',
  'verification_complete',
  'drafting',
  'editorial_review',
  'ready_for_publication',
  'published',
  'archived',
];

export type StoryStatusCounts = Record<StoryStatus, number>;

export type StoryType =
  | 'investigation'
  | 'analysis'
  | 'explainer'
  | 'profile'
  | 'news_story';

export type StoryAuditAction = 'created' | 'status_transition' | 'editor_assigned' | 'note';

/** Append-only audit entry. Entries are immutable once written. */
export interface StoryAuditEntry {
  id: string;
  storyId: string;
  at: string;
  actorId: string;
  actorName: string;
  action: StoryAuditAction;
  from?: StoryStatus;
  to?: StoryStatus;
  note?: string;
}

export interface StoryActor {
  id: string;
  name: string;
}

export type StoryEditorialPriorityTier = 'critical' | 'high' | 'medium' | 'low';

export type StoryReadinessState =
  | 'ready'
  | 'blocked'
  | 'needs_research'
  | 'needs_verification'
  | 'needs_field_reporting'
  | 'needs_editorial_review'
  | 'published'
  | 'archived';

export interface StoryEditorialBlocker {
  label: string;
  detail: string;
}

export interface StoryEditorialReadiness {
  state: StoryReadinessState;
  canPublish: boolean;
  blockers: StoryEditorialBlocker[];
  requiredActions: string[];
  confidence: ConfidenceTier;
  verificationStatus: VerificationStatus | null;
  verificationScore: number | null;
}

export type StorySourceDomain =
  | 'evidence_graph'
  | 'research_kb'
  | 'verification_workspace'
  | 'prediction_engine'
  | 'scenario_engine'
  | 'toolkit';

export interface StorySourcePanelEntry {
  domain: StorySourceDomain;
  label: string;
  source: string;
  confidence: ConfidenceTier;
  coverage: number;
  lastUpdated: string;
  evidenceCount: number;
  detail: string;
}

export type StoryImpactDimensionKey =
  | 'public_interest'
  | 'editorial_priority'
  | 'investigation_priority'
  | 'research_depth'
  | 'evidence_strength'
  | 'verification_completion'
  | 'institutional_trust'
  | 'story_confidence';

export interface StoryImpactDimension {
  key: StoryImpactDimensionKey;
  label: string;
  value: number;
  confidence: ConfidenceTier;
  weight: number;
  contribution: number;
  inputs: string[];
  limitation: string;
  source: string;
}

export interface StoryImpact {
  overall: number;
  dimensions: StoryImpactDimension[];
  weightsApplied: Array<{ key: StoryImpactDimensionKey; label: string; weight: number }>;
  calculationVersion: string;
  limitations: string[];
}

export interface StoryOutlineItem {
  text: string;
  basis: string;
  source: string;
}

export interface StoryOutlineBlock {
  id: string;
  title: string;
  items: StoryOutlineItem[];
}

export type StoryBriefSectionKey =
  | 'executive_summary'
  | 'why_it_matters'
  | 'key_findings'
  | 'editorial_importance'
  | 'primary_evidence'
  | 'research_summary'
  | 'prediction_summary'
  | 'scenario_implications'
  | 'known_limitations'
  | 'data_gaps'
  | 'recommended_publication_timing';

export interface StoryBriefSection {
  key: StoryBriefSectionKey;
  title: string;
  items: Array<{ text: string; source: string }>;
}

export interface StoryBrief {
  executiveSummary: string;
  whyItMatters: string[];
  keyFindings: string[];
  editorialImportance: string;
  primaryEvidence: string[];
  researchSummary: string[];
  predictionSummary: string;
  scenarioImplications: string[];
  knownLimitations: string[];
  dataGaps: string[];
  confidence: ConfidenceTier;
  recommendedPublicationTiming: string;
  sections: StoryBriefSection[];
}

export interface StoryReference {
  id: string;
  label: string;
  count: number;
  source: string;
}

export interface StoryReferenceSet {
  evidence: StoryReference[];
  verification: StoryReference[];
  research: StoryReference[];
  prediction: StoryReference[];
  scenario: StoryReference[];
  toolkit: StoryReference[];
}

export interface StoryLinkedConstituency {
  id: string;
  name: string;
  acNumber: number;
  district: string;
  region: string;
  currentMlaParty: string;
  predictedWinner: string;
  winnerProbability: number;
}

export interface StoryDraft {
  id: string;
  constituencyId: string;
  constituencyName: string;
  acNumber: number;
  district: string;
  region: string;
  headline: string;
  slug: string;
  storyType: StoryType;
  status: StoryStatus;
  linkedConstituency: StoryLinkedConstituency;
  references: StoryReferenceSet;
  editorialPriority: number;
  priorityTier: StoryEditorialPriorityTier;
  ipi: number;
  confidence: ConfidenceTier;
  readiness: StoryEditorialReadiness;
  brief: StoryBrief;
  outline: StoryOutlineBlock[];
  impact: StoryImpact;
  sourcePanel: StorySourcePanelEntry[];
  editor?: StoryActor;
  assignedAt?: string;
  notes: string[];
  version: number;
  lastTransition?: { at: string; by?: string; from?: StoryStatus; to: StoryStatus };
  audit: StoryAuditEntry[];
  created: string;
  updatedAt: string;
  source: string;
}

export interface StoryDraftSummary {
  id: string;
  constituencyId: string;
  constituencyName: string;
  headline: string;
  storyType: StoryType;
  status: StoryStatus;
  readinessState: StoryReadinessState;
  editorialPriority: number;
  priorityTier: StoryEditorialPriorityTier;
  ipi: number;
  confidence: ConfidenceTier;
  updatedAt: string;
}

export interface StoryOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  totalDrafts: number;
  statusCounts: StoryStatusCounts;
  readyToDraft: number;
  blocked: number;
  awaitingVerification: number;
  highImpactOpportunities: number;
  publishedCount: number;
  stories: StoryDraftSummary[];
  limitations: string[];
  storeNote: string;
}

/** Mission Control projection — computed by the Executive Intelligence Service from the Story Service. */
export interface StoryExecutiveSummary {
  generatedAt: string;
  totalDrafts: number;
  readyToDraft: number;
  blocked: number;
  awaitingVerification: number;
  highImpactOpportunities: number;
  publishedCount: number;
  statusCounts: StoryStatusCounts;
  recentActivity: Array<{ storyId: string; headline: string; at: string; actorName: string; action: string }>;
  persistence: 'none';
  note: string;
}

export type StoryTransitionResult =
  | { success: true; status: StoryStatus }
  | { success: false; error: string };

export interface StoryPackageMetadata {
  id: string;
  headline: string;
  slug: string;
  storyType: StoryType;
  status: StoryStatus;
  constituencyId: string;
  constituencyName: string;
  editorialPriority: number;
  priorityTier: StoryEditorialPriorityTier;
  confidence: ConfidenceTier;
  version: number;
  created: string;
  updated: string;
  source: string;
}

export interface StoryPackage {
  format: 'story-package-v1';
  metadata: StoryPackageMetadata;
  brief: StoryBrief;
  outline: StoryOutlineBlock[];
  references: StoryReferenceSet;
  readiness: StoryEditorialReadiness;
  impact: StoryImpact;
  sourcePanel: StorySourcePanelEntry[];
  generatedAt: string;
}

export type { EditorialReadiness, VerificationStatus };
