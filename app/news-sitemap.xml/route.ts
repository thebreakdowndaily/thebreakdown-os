/**
 * app/news-sitemap.xml/route.ts
 * Google News Sitemap — separate from the standard sitemap.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 2 — News Sitemap)
 *   - docs/aeo-geo/02-technical-seo-audit.md
 *   - https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 *
 * Requirements:
 *   - Only articles published within the last 2 days (48 hours)
 *   - Must use <news:news> namespace
 *   - Must include publication name, language, title, publication_date
 *   - Must NOT include URLs that are not accessible to crawlers
 *   - Must NOT include noindex pages
 *
 * Implementation note: Next.js native sitemap() does not support the
 * Google News XML namespace. This route returns raw XML.
 */

import { getPublicStories } from '@/utils/data-layer/store';

const SITE_URL = 'https://thebreakdown.in';
const PUBLICATION_NAME = 'The Breakdown';
const PUBLICATION_LANGUAGE = 'en';

/** 48 hours in milliseconds — Google News only indexes recent stories. */
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function GET(): Promise<Response> {
  const now = Date.now();
  const cutoff = new Date(now - NEWS_WINDOW_MS);

  // Fetch published stories from the data layer
  // getPublicStories returns seed data; in production this should be a live DB query.
  const allStories = getPublicStories({ pageSize: 200 }).data;

  // Filter to only stories published within the news window
  const recentStories = allStories.filter((story) => {
    const publishedAt = story.publishedAt ? new Date(story.publishedAt) : null;
    return publishedAt && publishedAt >= cutoff;
  });

  const entries = recentStories
    .map((story) => {
      const loc = `${SITE_URL}/story/${story.slug}`;
      const pubDate = story.publishedAt;
      // Truncate headline to 110 chars (Google News recommendation)
      const title = story.headline.replace(/[<>&'"]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] ?? c)
      ).slice(0, 110);

      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>${PUBLICATION_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Revalidate every 15 minutes — news freshness is time-critical
      'Cache-Control': 'public, max-age=900, s-maxage=900',
    },
  });
}
