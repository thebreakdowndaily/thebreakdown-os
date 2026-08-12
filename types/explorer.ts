// types/explorer.ts
// Sprint 5A — Canonical Result Contract for Knowledge Explorer Surface
// Governing Docs: Editorial Constitution v1.1, RXS Search Specification (docs/rxs/screens/search.md)

import type { VerificationState, EvidenceHierarchyTier, EntityKind } from './canonical';

export type DiscoveryMode =
  | 'all'
  | 'topic'
  | 'collection'
  | 'timeline'
  | 'thinker'
  | 'country'
  | 'organization'
  | 'document'
  | 'claim'
  | 'evidence'
  | 'investigation'
  | 'story'
  | 'learning_path';

export type ExplorerResultType =
  | 'story'
  | 'claim'
  | 'source'
  | 'entity'
  | 'timeline'
  | 'topic'
  | 'collection'
  | 'evidence'
  | 'correction';

export interface TrustPresentation {
  label: string;
  icon: 'verified' | 'partial' | 'developing' | 'disputed' | 'corrected';
}

export interface BaseResult {
  id: string;
  type: ExplorerResultType;
  title: string;
  summary: string;
  href: string;
  matchReasons: string[];
}

export interface StoryResult extends BaseResult {
  type: 'story';
  readingTime: number;
  verificationState?: VerificationState; // Exact canonical type from types/canonical.ts
  trustPresentation?: TrustPresentation;
  correctionState?: 'none' | 'corrected' | 'disputed';
}

export interface ClaimResult extends BaseResult {
  type: 'claim';
  claimStatus: 'verified' | 'strong' | 'moderate' | 'unverified' | 'disputed'; // Authoritative Claim.status
  storyTitle?: string;
  evidenceCount: number;
  trustPresentation?: TrustPresentation;
}

export interface SourceResult extends BaseResult {
  type: 'source';
  publisher?: string;
  url: string;
  tierLabel: string;
  citationCount: number;
}

export interface EntityResult extends BaseResult {
  type: 'entity';
  entityType: EntityKind;
  storyCount: number;
}

export interface TimelineResult extends BaseResult {
  type: 'timeline';
  eventCount: number;
}

export interface TopicResult extends BaseResult {
  type: 'topic';
  storyCount: number;
}

export interface CollectionResult extends BaseResult {
  type: 'collection';
  volumeCount: number;
}

export interface EvidenceResult extends BaseResult {
  type: 'evidence';
  claimId: string;
  sourceId?: string;
  sourceUrl?: string;
  hierarchyTier?: EvidenceHierarchyTier; // Exact canonical type from types/canonical.ts
  confidenceScore?: number;
}

export interface CorrectionResult extends BaseResult {
  type: 'correction';
  storyTitle: string;
  versionLabel: string;
  category: string;
  explanation: string;
}

export type KnowledgeExplorerResultItem =
  | StoryResult
  | ClaimResult
  | SourceResult
  | EntityResult
  | TimelineResult
  | TopicResult
  | CollectionResult
  | EvidenceResult
  | CorrectionResult;

export interface ExplorerQueryParams {
  q: string;
  mode?: DiscoveryMode;
  type?: ExplorerResultType;
  page?: number;
  pageSize?: number;
}

export interface ExplorerSearchResponse {
  data: KnowledgeExplorerResultItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    mode: DiscoveryMode;
    typeCounts: Record<string, number>;
  };
}
