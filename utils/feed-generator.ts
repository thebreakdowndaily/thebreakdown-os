/**
 * THE BREAKDOWN — Feed Generator
 *
 * Generates RSS 2.0, JSON Feed v1.1, and Atom feed formats.
 */

import type { StoryJSON } from './types';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRssFeed(
  stories: StoryJSON[],
  meta: { title: string; description: string; url: string; language?: string }
): string {
  const items = stories
    .map((story) => {
      const pubDate = new Date(story.publishedAt).toUTCString();
      const link = `${meta.url}/story/${story.slug}`;
      return `  <item>
    <title>${escapeXml(story.headline)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(story.summary)}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <category>${escapeXml(story.category)}</category>
    <author>${escapeXml(story.author.name)}</author>
    ${story.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('\n    ')}
    ${story.heroImage ? `<enclosure url="${escapeXml(story.heroImage)}" type="image/jpeg" />` : ''}
  </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${escapeXml(meta.url)}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${meta.language || 'en'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(meta.url)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function generateJsonFeed(
  stories: StoryJSON[],
  meta: { title: string; description: string; url: string; feedUrl: string }
): string {
  const items = stories.map((story) => ({
    id: `${meta.url}/story/${story.slug}`,
    url: `${meta.url}/story/${story.slug}`,
    title: story.headline,
    content_text: story.summary,
    date_published: story.publishedAt,
    date_modified: story.updatedAt,
    summary: story.summary,
    image: story.heroImage,
    tags: story.tags,
    authors: [
      {
        name: story.author.name,
        url: story.author.url,
        avatar: story.author.avatar,
      },
    ],
    _category: story.category,
    _reading_time: story.readingTime,
    _evidence_score: story.evidenceScore,
  }));

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: meta.title,
    home_page_url: meta.url,
    feed_url: meta.feedUrl,
    description: meta.description,
    language: 'en',
    items,
  };

  return JSON.stringify(feed, null, 2);
}

export function generateAtomFeed(
  stories: StoryJSON[],
  meta: { title: string; description: string; url: string }
): string {
  const entries = stories
    .map((story) => {
      const updated = new Date(story.updatedAt).toISOString();
      const published = new Date(story.publishedAt).toISOString();
      const link = `${meta.url}/story/${story.slug}`;
      return `  <entry>
    <title>${escapeXml(story.headline)}</title>
    <link href="${escapeXml(link)}" rel="alternate"/>
    <id>${escapeXml(link)}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${escapeXml(story.summary)}</summary>
    <author>
      <name>${escapeXml(story.author.name)}</name>
    </author>
    <category term="${escapeXml(story.category)}"/>
    ${story.tags.map((t) => `<category term="${escapeXml(t)}"/>`).join('\n    ')}
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(meta.title)}</title>
  <subtitle>${escapeXml(meta.description)}</subtitle>
  <link href="${escapeXml(meta.url)}" rel="alternate"/>
  <link href="${escapeXml(meta.url)}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${escapeXml(meta.url)}</id>
  <updated>${new Date().toISOString()}</updated>
${entries}
</feed>`;
}
