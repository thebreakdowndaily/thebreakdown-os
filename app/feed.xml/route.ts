import { bootstrapServices } from '@/services/bootstrap';

export async function GET() {
  const services = await bootstrapServices();
  const publicStoriesResponse = await services.stories.getPublicStories({ pageSize: 100 });
  const publicStories = publicStoriesResponse.data || [];

  let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Breakdown</title>
    <link>https://thebreakdown.in</link>
    <description>The Breakdown Knowledge Platform</description>
`;

  for (const story of publicStories) {
    const storyLink = `https://thebreakdown.in/story/${story.slug}`;
    const pubDate = new Date(story.publishedAt || new Date()).toUTCString();
    feed += `    <item>
      <title><![CDATA[${story.title || story.headline}]]></title>
      <link>${storyLink}</link>
      <description><![CDATA[${story.summary || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid>${storyLink}</guid>
    </item>
`;
  }

  feed += `  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
