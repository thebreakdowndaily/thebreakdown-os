/**
 * ─── Research Intelligence — Source Adapter Interface ────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Source adapters bridge the research pipeline to real or deterministic
 * discovery surfaces. Each adapter is explicit about its capabilities:
 *   - discover  → answer a ResearchQuery with source candidates
 *   - fetch     → retrieve + normalize a source's full text as a document
 *
 * Discovery ≠ evidence: adapters return candidates with a relevanceScore; the
 * pipeline classifies (SourceClass), deduplicates, and later corroborates.
 */

import type {
  ResearchAdapterCapability,
  ResearchDocumentFormat,
  ResearchQuery,
  ResearchSourceClass,
  ResearchSourceType,
  TopicEntity,
} from '@/types/research-intelligence';

export interface DiscoveredSourceItem {
  url: string;
  title: string;
  snippet?: string;
  publisher?: string;
  publishedAt?: string;
  sourceType: ResearchSourceType;
  sourceClass: ResearchSourceClass;
  adapter: string;
  relevanceScore: number;
}

export interface DiscoveryResult {
  adapter: string;
  queryText: string;
  items: DiscoveredSourceItem[];
  errors: string[];
}

export interface FetchResult {
  url: string;
  title?: string;
  text: string;
  format: ResearchDocumentFormat;
  publishedAt?: string;
  publisher?: string;
  etag?: string;
  lastModified?: string;
  contentType?: string;
}

/** Context passed to adapters so they can stay pure + injectable in tests. */
export interface AdapterContext {
  entities: TopicEntity[];
  fetcher: (url: string) => Promise<{ ok: boolean; text(): Promise<string>; status?: number; headers?: Record<string, string> }>;
  now: () => Date;
  maxResults?: number;
}

export interface ResearchSourceAdapter {
  id: string;
  capabilities: readonly ResearchAdapterCapability[];
  /** Discover candidate sources for a query. Returns candidates, not verdicts. */
  discover(query: ResearchQuery, ctx: AdapterContext): Promise<DiscoveryResult>;
  /** Fetch the full text of a source for document extraction. */
  fetch(url: string, ctx: AdapterContext): Promise<FetchResult>;
}
