/**
 * ─── Bounded Projection Context: Story ───────────────────────────────────────
 * Frontend View Model Contract for Public Article Surfaces.
 * Consumed strictly by app/(public)/stories/[slug] & StoryShell components.
 */

import { EvidenceHierarchyTier } from '@/types/canonical';

export interface SourceViewModel {
  id?: string;
  title: string;
  url: string;
  accessedAt: string;
  tierBadge: string; // e.g. "Tier 1: Primary Archival"
  archiveHash?: string;
}

export interface ClaimViewModel {
  id: string;
  claim: string;
  evidenceTier?: EvidenceHierarchyTier | string;
  confidenceScore: number;
  verificationStatus: 'verified' | 'strong' | 'moderate' | 'unverified';
  sourceTitle?: string;
  sourceUrl?: string;
}

export interface TimelineNodeViewModel {
  id?: string;
  date: string;
  title: string;
  description: string;
}

export interface ProjectedEntityViewModel {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
}

export interface NarrativeBlocksViewModel {
  whatHappened: string;
  whyItMatters: string;
  whatCausedIt?: string;
  whatChanged?: string;
  whatHappensNext?: string;
  whatEvidenceExists?: string;
  whatToExploreNext?: string;
}

export interface EvidenceDrawerViewModel {
  totalClaimsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  claims: ClaimViewModel[];
  sources: SourceViewModel[];
  lastAuditDate?: string;
}

export interface StorySEOViewModel {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  publishedTime: string;
}

export interface StoryViewModel {
  id: string;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  heroImage: string;
  author: string;
  category: string;
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  
  // Mandatory 7 Narrative Blocks
  narrativeBlocks: NarrativeBlocksViewModel;
  
  // Progressive Disclosure Evidence Drawer
  evidenceDrawer: EvidenceDrawerViewModel;
  
  // Projected Relational Data
  timelineNodes: TimelineNodeViewModel[];
  projectedEntities: ProjectedEntityViewModel[];
  
  // SEO & OpenGraph Metadata
  seo: StorySEOViewModel;
}
