/**
 * ─── Research Intelligence — RSS Adapter ─────────────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Real-network adapter: discovers sources from configured RSS/Atom feeds and
 * fetches article text. Mirrors the pib-adapter conventions (injectable
 * fetcher, bounded retries, XMLParser from fast-xml-parser) so tests can
 * exercise it fully offline.
 *
 * Adapter philosophy: discovery returns candidates with a relevance score; the
 * pipeline classifies, deduplicates and corroborates. Network failures are
 * surfaced (fetch errors) — never silently swallowed into fabricated content.
 */

import { XMLParser } from 'fast-xml-parser';
import type {
  AdapterContext,
  DiscoveryResult,
  FetchResult,
  ResearchSourceAdapter,
} from './interface';
import type { ResearchSourceClass, ResearchSourceType } from '@/types/research-intelligence';
import { propositionKey } from '@/lib/intel/research/normalization';

export interface RssFeedConfig {
  url: string;
  publisher: string;
  sourceType: ResearchSourceType;
  sourceClass: ResearchSourceClass;
}

export interface RssAdapterOptions {
  feeds?: RssFeedConfig[];
  retries?: number;
  retryDelayMs?: number;
}

export interface RssFeedItem {
  url: string;
  title: string;
  snippet?: string;
  publishedAt?: string;
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFeed(xml: string): RssFeedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    trimValues: true,
  });
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: unknown } };
    feed?: { entry?: unknown };
  };
  const items: RssFeedItem[] = [];

  const rssItems = parsed.rss?.channel?.item;
  if (rssItems) {
    const list = Array.isArray(rssItems) ? rssItems : [rssItems];
    for (const raw of list) {
      const item = raw as Record<string, unknown>;
      const url = typeof item.link === 'string' ? item.link : '';
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      if (!url || !title) continue;
      const rawPub = typeof item.pubDate === 'string' ? item.pubDate : '';
      const publishedAt = rawPub ? new Date(rawPub).toISOString() : undefined;
      const snippet =
        typeof item.description === 'string' ? stripHtml(item.description).slice(0, 300) : undefined;
      items.push({ url, title, snippet, publishedAt });
    }
  }

  const atomEntries = parsed.feed?.entry;
  if (atomEntries) {
    const list = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
    for (const raw of list) {
      const entry = raw as Record<string, unknown>;
      const link = entry.link;
      const url =
        typeof link === 'string'
          ? link
          : typeof link === 'object' && link
            ? (link as { '@_href'?: string })['@_href'] ?? ''
            : '';
      const titleNode = entry.title;
      const title =
        typeof titleNode === 'string'
          ? titleNode.trim()
          : typeof titleNode === 'object' && titleNode
            ? String((titleNode as { '#text'?: string })['#text'] ?? '')
            : '';
      if (!url || !title) continue;
      const rawPub = typeof entry.updated === 'string' ? entry.updated : '';
      const publishedAt = rawPub ? new Date(rawPub).toISOString() : undefined;
      items.push({ url, title, publishedAt });
    }
  }

  return items;
}

/** Strip scripts/styles/boilerplate from HTML for document text extraction. */
export function htmlToText(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100_000);
}

function tokenMatch(queryText: string, haystack: string): boolean {
  const queryTokens = propositionKey(queryText).split(' ').filter((t) => t.length > 2);
  const h = propositionKey(haystack);
  return queryTokens.length === 0 || queryTokens.some((t) => h.includes(t));
}

export class RssAdapter implements ResearchSourceAdapter {
  readonly id = 'rss';
  readonly capabilities = ['discover', 'fetch'] as const;
  private readonly feeds: RssFeedConfig[];
  private readonly retries: number;
  private readonly retryDelayMs: number;

  constructor(options: RssAdapterOptions = {}) {
    this.feeds = options.feeds ?? [];
    this.retries = options.retries ?? 1;
    this.retryDelayMs = options.retryDelayMs ?? 500;
  }

  async discover(query: { text: string }, ctx: AdapterContext): Promise<DiscoveryResult> {
    const errors: string[] = [];
    const items: Array<{
      url: string;
      title: string;
      snippet?: string;
      publisher: string;
      publishedAt?: string;
      sourceType: ResearchSourceType;
      sourceClass: ResearchSourceClass;
      relevance: number;
    }> = [];

    for (const feed of this.feeds) {
      let ok = false;
      for (let attempt = 0; attempt <= this.retries; attempt += 1) {
        try {
          const response = await ctx.fetcher(feed.url);
          if (!response.ok) throw new Error(`feed ${feed.url} returned status ${response.status ?? 'unknown'}`);
          const xml = await response.text();
          for (const item of parseFeed(xml)) {
            const haystack = `${item.title} ${item.snippet ?? ''} ${feed.publisher}`;
            if (!tokenMatch(query.text, haystack)) continue;
            items.push({
              url: item.url,
              title: item.title,
              snippet: item.snippet,
              publisher: feed.publisher,
              publishedAt: item.publishedAt,
              sourceType: feed.sourceType,
              sourceClass: feed.sourceClass,
              relevance: 0.6,
            });
          }
          ok = true;
          break;
        } catch (err) {
          if (attempt >= this.retries) {
            errors.push(
              `rss:${feed.url}: ${err instanceof Error ? err.message : String(err)}`
            );
          } else {
            await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
          }
        }
      }
      if (!ok) errors.push(`rss:${feed.url}: unreachable after retries`);
    }

    const maxResults = ctx.maxResults ?? 10;
    return {
      adapter: this.id,
      queryText: query.text,
      items: items
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults)
        .map(({ relevance, ...item }) => ({
          ...item,
          adapter: this.id,
          relevanceScore: relevance,
        })),
      errors,
    };
  }

  async fetch(url: string, ctx: AdapterContext): Promise<FetchResult> {
    const response = await ctx.fetcher(url);
    if (!response.ok) {
      throw new Error(`RssAdapter: fetch ${url} returned status ${response.status ?? 'unknown'}`);
    }
    const raw = await response.text();
    return {
      url,
      title: undefined,
      text: htmlToText(raw),
      format: 'HTML',
      contentType: 'text/html',
    };
  }
}
