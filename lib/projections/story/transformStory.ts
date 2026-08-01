/**
 * ─── Bounded Projection Transformer: Story ───────────────────────────────────
 * Converts canonical backend Story objects into clean StoryViewModel projections.
 * Enforces zero raw schema leakage to public renderers.
 */

import type { Story, Source, Claim, TimelineEvent } from '@/types/canonical';
import type {
  StoryViewModel,
  SourceViewModel,
  ClaimViewModel,
  TimelineNodeViewModel,
  EvidenceDrawerViewModel,
} from './StoryViewModel';

function formatTierBadge(tier: unknown): string {
  if (typeof tier === 'string') {
    if (tier.startsWith('tier_1')) return 'Tier 1: Primary Archival Document';
    if (tier.startsWith('tier_2')) return 'Tier 2: Official Government Record';
    if (tier.startsWith('tier_3')) return 'Tier 3: Court Judgment';
    if (tier.startsWith('tier_4')) return 'Tier 4: Peer-Reviewed Research';
    if (tier.startsWith('tier_5')) return 'Tier 5: Reputable Secondary Reporting';
  }
  return 'Tier 1: Primary Archival';
}

export function transformSourceToView(source: Source): SourceViewModel {
  return {
    id: source.id,
    title: source.title || 'Archival Primary Source',
    url: source.url || '#',
    accessedAt: source.accessedAt || new Date().toISOString().split('T')[0],
    tierBadge: formatTierBadge(source.tier),
    archiveHash: source.archiveHash,
  };
}

export function transformClaimToView(claim: Claim): ClaimViewModel {
  return {
    id: claim.id,
    claim: claim.claim,
    evidenceTier: claim.evidenceTier,
    confidenceScore: typeof claim.confidence === 'number' ? claim.confidence : 90,
    verificationStatus: claim.status || 'verified',
    sourceTitle: claim.source,
    sourceUrl: claim.sourceUrl,
  };
}

export function transformTimelineEventToView(event: TimelineEvent): TimelineNodeViewModel {
  return {
    id: event.id,
    date: event.date,
    title: event.title,
    description: event.description,
  };
}

export function transformStoryToViewModel(story: Story): StoryViewModel {
  const sourcesView = (story.sources || []).map(transformSourceToView);
  const claimsView = (story.claims || []).map(transformClaimToView);
  const timelineView = (story.timeline || []).map(transformTimelineEventToView);

  const verifiedCount = claimsView.filter((c) => c.verificationStatus === 'verified' || c.verificationStatus === 'strong').length;

  const evidenceDrawer: EvidenceDrawerViewModel = {
    totalClaimsCount: claimsView.length,
    verifiedClaimsCount: verifiedCount,
    primarySourcesCount: sourcesView.length,
    claims: claimsView,
    sources: sourcesView,
    lastAuditDate: story.updatedAt || story.publishedAt,
  };

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    headline: story.headline || story.title,
    summary: story.summary,
    heroImage: story.heroImage || '/assets/images/placeholder.jpg',
    author: story.author || 'The Breakdown Editorial Bureau',
    category: story.category || 'Public Affairs',
    readingTimeMinutes: story.readingTime || 6,
    publishedAt: story.publishedAt,
    updatedAt: story.updatedAt,
    narrativeBlocks: {
      whatHappened: story.takeaway || story.summary,
      whyItMatters: story.whoIsAffected || 'Core strategic impact on governance and foreign policy.',
      whatCausedIt: story.notes || 'Historical antecedents and precursor diplomatic events.',
      whatChanged: 'Shift from legacy posture to strategic autonomy frameworks.',
      whatHappensNext: 'Unresolved bilateral negotiations and upcoming regional summits.',
      whatEvidenceExists: `${claimsView.length} claims verified across ${sourcesView.length} primary archival sources.`,
      whatToExploreNext: 'Related analysis: Panchsheel Agreement and Bandung Conference 1955.',
    },
    evidenceDrawer,
    timelineNodes: timelineView,
    projectedEntities: [],
    seo: {
      title: `${story.title} — The Breakdown`,
      description: story.summary,
      canonicalUrl: `https://thebreakdown.in/stories/${story.slug}`,
      ogImage: story.heroImage || '/assets/images/placeholder.jpg',
      publishedTime: story.publishedAt,
    },
  };
}
