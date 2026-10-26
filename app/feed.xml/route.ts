import { generateAuthoritativeRssResponse } from '@/lib/rss/generator';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  return generateAuthoritativeRssResponse({
    selfUrl: 'https://thebreakdown.in/feed.xml',
    contentType: 'application/xml',
    cacheControl: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  });
}
