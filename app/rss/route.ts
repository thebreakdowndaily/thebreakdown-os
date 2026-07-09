import { getStories } from '@/utils/data-layer/store';

export const dynamic = 'force-static';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const { data: stories } = getStories({ pageSize: 20, sort: 'publishedAt', order: 'desc' });
  const items = stories.map((s) => `
    <item>
      <title>${escapeXml(s.headline)}</title>
      <link>https://thebreakdown.in/story/${s.slug}</link>
      <description>${escapeXml(s.summary)}</description>
      <pubDate>${new Date(s.publishedAt).toUTCString()}</pubDate>
      <guid>https://thebreakdown.in/story/${s.slug}</guid>
      <category>${escapeXml(s.category)}</category>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Breakdown</title>
    <link>https://thebreakdown.in</link>
    <description>Independent, data-driven journalism on Indian policy, politics, and society.</description>
    <language>en-in</language>
    <atom:link href="https://thebreakdown.in/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
