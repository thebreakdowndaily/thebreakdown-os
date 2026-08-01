/**
 * ─── The Breakdown OS — Editorial Operating System (EOS) Canonical Types ─────
 * RELEASE-4 domain model for the newsroom: dossiers, story packets, fact-check
 * console, assignment board, discovery, collections, citation, publishing.
 *
 * Extends the canonical backbone (types/canonical.ts, EditorialStage machine).
 * Evidence-spine mandate: every claim carries a verification status; publication
 * is blocked until unresolved claims are editor-approved.
 */

export type NewsroomStage =
  | 'assigned'
  | 'research'
  | 'writing'
  | 'fact_check'
  | 'editorial_review'
  | 'scheduled'
  | 'published'
  | 'archived';

export type VerificationStatus =
  | 'Verified'
  | 'Partially Verified'
  | 'Needs Verification'
  | 'Unsupported';

export type ClaimCategory =
  | 'MLA name'
  | 'MP name'
  | 'Election result'
  | 'Vote margin'
  | 'Party name'
  | 'Date'
  | 'Political DNA'
  | 'Representation status'
  | 'Administrative detail'
  | 'Development detail';

export interface ProvenanceRef {
  authority: string;
  source: string;
  quality: string;
}

export interface NewsroomClaim {
  id: string;
  storyId: string;
  text: string;
  category: ClaimCategory;
  constituencyId: string;
  canonicalField: string;
  assertedValue: string;
  canonicalValue: string;
  status: VerificationStatus;
  blocking: boolean;
  provenance: ProvenanceRef;
  basis?: string;
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
}

export interface DossierEvidence {
  id: string;
  dossierId: string;
  constituencyId: string;
  field: string;
  value: string;
  excerpt: string;
  provenance: ProvenanceRef;
  capturedAt: string;
}

export interface DossierNote {
  id: string;
  dossierId: string;
  authorId: string;
  body: string;
  mentions: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ResearchDossier {
  id: string;
  title: string;
  constituencyIds: string[];
  researchQuestions: string[];
  evidence: DossierEvidence[];
  notes: DossierNote[];
  status: 'open' | 'in_progress' | 'packet_ready' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface StoryPacketFact {
  id: string;
  label: string;
  value: string;
  canonicalField: string;
  provenance: ProvenanceRef;
}

export interface StoryPacketSection {
  id: string;
  heading: string;
  content: string[];
  canonicalFields: string[];
}

export interface StoryPacket {
  id: string;
  storyId: string;
  constituencyId: string;
  headline: string;
  dek: string;
  sections: StoryPacketSection[];
  facts: StoryPacketFact[];
  generatedAt: string;
}

export interface Correction {
  id: string;
  storyId: string;
  version: number;
  description: string;
  reason: string;
  createdAt: string;
}

export interface NewsroomStory {
  id: string;
  title: string;
  slug: string;
  stage: NewsroomStage;
  constituencyId: string;
  dossierId?: string;
  discoverySignal: string;
  packet?: StoryPacket;
  claims: NewsroomClaim[];
  blockingIssues: string[];
  reporters: string[];
  editor?: string;
  factChecker?: string;
  deadline?: string;
  scheduledFor?: string;
  tags: string[];
  version: number;
  corrections: Correction[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface FactCheckReport {
  storyId: string;
  checkedAt: string;
  checkedBy: string;
  claims: NewsroomClaim[];
  blockingIssues: string[];
  passed: boolean;
}

export interface EditorialAssignment {
  id: string;
  storyId: string;
  title: string;
  stage: NewsroomStage;
  reporters: string[];
  editor?: string;
  deadline?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export type DiscoveryCategory =
  | 'electoral'
  | 'representation'
  | 'sociology'
  | 'development'
  | 'governance'
  | 'infrastructure';

export interface DiscoveryOpportunity {
  id: string;
  title: string;
  category: DiscoveryCategory;
  constituencyId: string;
  description: string;
  evidence: string[];
  priority: number;
  signal: string;
}

export interface EditorialCollection {
  id: string;
  name: string;
  description: string;
  rule: string;
  signal: string;
  constituencyIds: string[];
}

export interface InlineCitation {
  id: string;
  claimId: string;
  text: string;
  citation: string;
}

export interface AppendixEntry {
  id: string;
  claim: string;
  evidence: string;
  source: string;
}

export interface SourceListEntry {
  id: string;
  source: string;
  authority: string;
  dataset: string;
}

export interface DossierCitation {
  dossierId: string;
  title: string;
  citation: string;
}

export interface CitationBundle {
  storyId: string;
  inlineCitations: InlineCitation[];
  evidenceAppendix: AppendixEntry[];
  sourceList: SourceListEntry[];
  dossierCitations: DossierCitation[];
}

export interface NewsroomMetrics {
  totalStories: number;
  published: number;
  inWorkflow: number;
  blockedStories: number;
  averageResearchTimeHours: number;
  verificationRate: number;
  averageTurnaroundHours: number;
  correctionsIssued: number;
  evidenceDensity: number;
  sourceDiversity: number;
  stageDistribution: Record<string, number>;
}

export type CollaborationActivityType =
  | 'note'
  | 'comment'
  | 'review_request'
  | 'mention'
  | 'transition'
  | 'correction'
  | 'publication';

export interface CollaborationActivity {
  id: string;
  storyId: string;
  actorId: string;
  type: CollaborationActivityType;
  body: string;
  createdAt: string;
}

export interface KnowledgeCaptureRecord {
  id: string;
  storyId: string;
  constituencyId: string;
  entities: string[];
  issues: string[];
  sources: string[];
  capturedAt: string;
}

export interface EosTransitionResult {
  success: boolean;
  story?: NewsroomStory;
  error?: string;
  activity?: CollaborationActivity;
}
