/**
 * lib/rss/generator.ts
 *
 * Authoritative RSS 2.0 Feed Generator for The Breakdown OS.
 * Governs /rss, /feed.xml, and syndication feeds.
 *
 * Invariants:
 * 1. Strict public-only story filtering via canonical repository interface.
 * 2. Deterministic newest-first chronological sort by verified publishedAt.
 * 3. Never invent or synthesize dates for stories with missing or invalid timestamps.
 * 4. Future timestamps are rejected to prevent crawl poisoning and embargo leaks.
 * 5. Full XML entity escaping for special characters (&, <, >, ", ').
 * 6. Valid Atom self-links and canonical item permalinks (https://thebreakdown.in/story/${slug}).
 * 7. Deduplicated item stream with zero duplicate GUIDs.
 */

import { bootstrapServices } from '@/lib/bootstrap';
import type { Story } from '@/types/canonical';

export const RSS_CANONICAL_FEED_URL = 'https://thebreakdown.in/rss';
export const RSS_SITE_URL = 'https://thebreakdown.in';
export const RSS_FEED_TITLE = 'The Breakdown';
export const RSS_FEED_DESCRIPTION = 'Independent, data-driven journalism on Indian policy, politics, and society.';
export const RSS_FEED_LANGUAGE = 'en-in';

export interface RssGeneratorOptions {
  selfUrl?: string;
  pageSize?: number;
  now?: Date;
}

/**
 * Safely escapes characters for standard XML text and attribute values.
 */
export function escapeXml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validates and extracts a valid RFC 822 publication date from a story.
 * If publishedAt is missing, malformed, or in the future, returns null.
 */
export function getValidRssPubDate(
  publishedAt?: string | null,
  now: Date = new Date()
): string | null {
  if (!publishedAt) return null;
  const d = new Date(publishedAt);
  const time = d.getTime();
  if (Number.isNaN(time) || time <= 0) return null;
  if (time > now.getTime()) return null;
  return d.toUTCString();
}

/**
 * Resolves author name safely without exposing private metadata.
 */
export function getRssAuthor(story: Story): string {
  if (typeof story.author === 'string' && story.author.trim()) {
    return story.author.trim();
  }
  const authorObj = story.author as unknown;
  if (
    authorObj &&
    typeof authorObj === 'object' &&
    'name' in authorObj &&
    typeof (authorObj as { name: unknown }).name === 'string'
  ) {
    return (authorObj as { name: string }).name.trim();
  }
  return 'The Breakdown';
}

/**
 * Generates the authoritative RSS 2.0 XML string from a list of validated stories.
 */
export function buildRssXml(
  stories: Story[],
  options: RssGeneratorOptions = {}
): string {
  const selfUrl = options.selfUrl || RSS_CANONICAL_FEED_URL;
  const now = options.now || new Date();

  // Deduplicate by slug
  const seenSlugs = new Set<string>();
  const uniqueStories: Story[] = [];
  for (const s of stories) {
    if (!s || !s.slug || seenSlugs.has(s.slug)) continue;
    seenSlugs.add(s.slug);
    uniqueStories.push(s);
  }

  // Filter to stories with valid, truthful, non-future publication dates
  const eligibleStoriesWithDate: Array<{ story: Story; pubDate: string; time: number }> = [];
  for (const s of uniqueStories) {
    const pubDate = getValidRssPubDate(s.publishedAt, now);
    if (!pubDate) continue; // Skip stories with invalid or absent dates (NEVER synthesize)
    eligibleStoriesWithDate.push({
      story: s,
      pubDate,
      time: new Date(s.publishedAt).getTime(),
    });
  }

  // Sort strictly by publishedAt descending (newest first)
  eligibleStoriesWithDate.sort((a, b) => b.time - a.time);

  const itemsXml = eligibleStoriesWithDate
    .map(({ story, pubDate }) => {
      const headline = story.headline || story.title || 'Untitled';
      const link = `${RSS_SITE_URL}/story/${story.slug}`;
      const description = story.summary || '';
      const category = story.category || '';
      const author = getRssAuthor(story);

      return `    <item>
      <title>${escapeXml(headline)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(author)}</author>${category ? `\n      <category>${escapeXml(category)}</category>` : ''}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(RSS_FEED_TITLE)}</title>
    <link>${RSS_SITE_URL}</link>
    <description>${escapeXml(RSS_FEED_DESCRIPTION)}</description>
    <language>${RSS_FEED_LANGUAGE}</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${selfUrl}" rel="self" type="application/rss+xml"/>
${itemsXml ? `${itemsXml}\n` : ''}  </channel>
</rss>`;
}

/**
 * Service orchestrator: fetches public stories and generates authoritative RSS response.
 */
export async function generateAuthoritativeRssResponse(options: {
  selfUrl?: string;
  contentType?: string;
  cacheControl?: string;
} = {}): Promise<Response> {
  const services = bootstrapServices({ publicOnly: true });
  const response = await services.stories.getPublicStories({ pageSize: 100 });
  const stories = response?.data || [];

  const xml = buildRssXml(stories, {
    selfUrl: options.selfUrl || RSS_CANONICAL_FEED_URL,
  });

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': options.contentType || 'application/rss+xml; charset=utf-8',
      'Cache-Control': options.cacheControl || 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
