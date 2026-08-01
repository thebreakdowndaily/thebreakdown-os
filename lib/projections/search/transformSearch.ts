/**
 * ─── Bounded Projection Transformer: Search ──────────────────────────────────
 * Converts raw search match objects into clean SearchViewModel projections.
 */

import type { Story, Topic, Claim } from '@/types/canonical';
import type { SearchViewModel, SearchResultItemViewModel } from './SearchViewModel';

export function transformSearchToViewModel(
  query: string,
  stories: Story[] = [],
  topics: Topic[] = [],
  claims: Claim[] = []
): SearchViewModel {
  const storyResults: SearchResultItemViewModel[] = stories.map((s) => ({
    id: s.id,
    kind: 'story',
    title: s.title,
    slug: s.slug,
    snippet: s.summary,
    category: s.category || 'Analysis',
    publishedAt: s.publishedAt,
  }));

  const topicResults: SearchResultItemViewModel[] = topics.map((t) => ({
    id: t.id,
    kind: 'topic',
    title: t.name,
    slug: t.slug,
    snippet: t.description,
    category: 'Topic Hub',
  }));

  const claimResults: SearchResultItemViewModel[] = claims.map((c) => ({
    id: c.id,
    kind: 'claim',
    title: `Verified Claim: ${c.claim.slice(0, 60)}...`,
    slug: `claim-${c.id}`,
    snippet: `${c.claim} (Source: ${c.source})`,
    verificationBadge: c.status === 'verified' ? 'Verified Primary Evidence' : 'Under Review',
  }));

  const results = [...storyResults, ...topicResults, ...claimResults];

  return {
    query,
    totalMatchesCount: results.length,
    results,
    suggestedTopics: topics.slice(0, 3).map((t) => ({ name: t.name, slug: t.slug })),
  };
}
