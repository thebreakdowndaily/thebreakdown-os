import { generateAuthoritativeRssResponse, RSS_CANONICAL_FEED_URL } from '@/lib/rss/generator';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  return generateAuthoritativeRssResponse({
    selfUrl: RSS_CANONICAL_FEED_URL,
    contentType: 'application/rss+xml; charset=utf-8',
    cacheControl: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  });
}
