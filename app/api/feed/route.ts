import { NextRequest, NextResponse } from 'next/server';
import { getPublicStories } from '@/utils/data-layer/store';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRssFeed(): string {
  const items = getPublicStories({ pageSize: 100 })
    .data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(
      (story) => `    <item>
      <title>${escapeXml(story.headline)}</title>
      <link>https://thebreakdown.in/story/${story.slug}</link>
      <guid isPermaLink="true">https://thebreakdown.in/story/${story.slug}</guid>
      <description>${escapeXml(story.summary)}</description>
      <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>
      <author>${escapeXml(story.author.name)}</author>
      <category>${escapeXml(story.category)}</category>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Breakdown</title>
    <link>https://thebreakdown.in</link>
    <description>Independent, data-driven journalism on Indian policy, politics, and society.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://thebreakdown.in/api/feed?format=rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://thebreakdown.in/images/og-home.jpg</url>
      <title>The Breakdown</title>
      <link>https://thebreakdown.in</link>
    </image>
${items}
  </channel>
</rss>`;
}

function buildJsonFeed() {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'The Breakdown',
    home_page_url: 'https://thebreakdown.in',
    feed_url: 'https://thebreakdown.in/api/feed?format=json',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    language: 'en-IN',
    icon: 'https://thebreakdown.in/images/og-home.jpg',
    authors: [{ name: 'The Breakdown', url: 'https://thebreakdown.in/about' }],
    items: getPublicStories({ pageSize: 100 })
      .data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map((story) => ({
        id: `https://thebreakdown.in/story/${story.slug}`,
        url: `https://thebreakdown.in/story/${story.slug}`,
        title: story.headline,
        summary: story.summary,
        date_published: story.publishedAt,
        authors: [{ name: story.author.name }],
        tags: [story.category],
      })),
  };
}

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'rss';

  if (format === 'json') {
    return NextResponse.json(buildJsonFeed(), {
      headers: { 'Content-Type': 'application/feed+json' },
    });
  }

  return new NextResponse(buildRssFeed(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
