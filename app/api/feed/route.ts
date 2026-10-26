import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildRssXml, getRssAuthor } from '@/lib/rss/generator';
import type { Story } from '@/types/canonical';

function buildJsonFeed(stories: Story[]) {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'The Breakdown',
    home_page_url: 'https://thebreakdown.in',
    feed_url: 'https://thebreakdown.in/api/feed?format=json',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    language: 'en-IN',
    icon: 'https://thebreakdown.in/images/og-home.jpg',
    authors: [{ name: 'The Breakdown', url: 'https://thebreakdown.in/about' }],
    items: stories.map((story) => ({
      id: `https://thebreakdown.in/story/${story.slug}`,
      url: `https://thebreakdown.in/story/${story.slug}`,
      title: story.headline,
      summary: story.summary,
      date_published: story.publishedAt,
      authors: [{ name: getRssAuthor(story) }],
      tags: story.category ? [story.category] : [],
    })),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'rss';

  const services = bootstrapServices({ publicOnly: true });
  const { data: stories } = await services.stories.getPublicStories({ pageSize: 100 });
  const sortedStories = [...stories].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (format === 'json') {
    return NextResponse.json(buildJsonFeed(sortedStories), {
      headers: {
        'Content-Type': 'application/feed+json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  const xml = buildRssXml(sortedStories, {
    selfUrl: 'https://thebreakdown.in/api/feed?format=rss',
  });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
