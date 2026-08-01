/**
 * ─── Bounded Projection Context: Search ─────────────────────────────────────
 * Frontend View Model Contract for Knowledge Search Queries.
 * Returns structured narrative context cards instead of raw database rows.
 */

export interface SearchResultItemViewModel {
  id: string;
  kind: 'story' | 'topic' | 'timeline' | 'claim';
  title: string;
  slug: string;
  snippet: string;
  category?: string;
  verificationBadge?: string;
  publishedAt?: string;
}

export interface SearchViewModel {
  query: string;
  totalMatchesCount: number;
  results: SearchResultItemViewModel[];
  suggestedTopics: Array<{ name: string; slug: string }>;
}
