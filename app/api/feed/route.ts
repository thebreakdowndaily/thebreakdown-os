import { NextRequest, NextResponse } from 'next/server';

const feedStories = [
  { title: 'MGNREGA Completes 20 Years: A Data-Driven Assessment', slug: 'mgnrega-reform', summary: 'Two decades of India\'s flagship rural employment guarantee scheme.', publishedAt: '2026-06-15T10:00:00Z', author: 'The Breakdown Editorial', category: 'economy' },
  { title: 'Digital Payments in Rural India: UPI\'s Unseen Revolution', slug: 'digital-payments-boom', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', author: 'The Breakdown Editorial', category: 'technology' },
  { title: 'School Education Budget: Where Does the Money Actually Go?', slug: 'school-education-budget', summary: 'Tracing education funds from Delhi to districts.', publishedAt: '2026-06-10T14:00:00Z', author: 'The Breakdown Editorial', category: 'education' },
  { title: 'India\'s Climate Finance Gap: Needs vs. Allocation', slug: 'climate-finance-india', summary: 'Analysis of climate budget allocations.', publishedAt: '2026-06-08T11:00:00Z', author: 'The Breakdown Editorial', category: 'environment' },
  { title: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers', slug: 'pm-fasal-bima-claims', summary: 'Investigation into delayed crop insurance claims.', publishedAt: '2026-06-05T06:00:00Z', author: 'The Breakdown Editorial', category: 'policy' },
  { title: 'Anganwadi Workers: The Unpaid Backbone of ICDS', slug: 'anganwadi-worker-pay', summary: 'Examining the gap in anganwadi worker payments.', publishedAt: '2026-06-03T09:00:00Z', author: 'The Breakdown Editorial', category: 'policy' },
  { title: 'India\'s Groundwater Crisis in 5 Charts', slug: 'groundwater-depletion', summary: 'Visualizing groundwater depletion across 15 states.', publishedAt: '2026-05-28T10:00:00Z', author: 'The Breakdown Editorial', category: 'environment' },
  { title: 'How Rajasthan Cut PDS Leakage by 40% with Digitization', slug: 'fix-ration-digitization', summary: 'Lessons from Rajasthan\'s PDS digitization.', publishedAt: '2026-05-25T08:00:00Z', author: 'The Breakdown Editorial', category: 'policy' },
  { title: 'The China+1 Effect', slug: 'global-supply-chain-shift', summary: 'How global supply chains are reshaping Indian manufacturing.', publishedAt: '2026-05-20T10:00:00Z', author: 'The Breakdown Editorial', category: 'economy' },
  { title: 'Union Budget 2026: Key Allocations', slug: 'union-budget-2026-highlights', summary: 'Highlights of the Union Budget 2026-27.', publishedAt: '2026-06-01T12:00:00Z', author: 'The Breakdown Desk', category: 'economy' },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRssFeed(): string {
  const items = feedStories
    .map(
      (story) => `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>https://thebreakdown.in/story/${story.slug}</link>
      <guid isPermaLink="true">https://thebreakdown.in/story/${story.slug}</guid>
      <description>${escapeXml(story.summary)}</description>
      <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>
      <author>${escapeXml(story.author)}</author>
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
    items: feedStories.map((story) => ({
      id: `https://thebreakdown.in/story/${story.slug}`,
      url: `https://thebreakdown.in/story/${story.slug}`,
      title: story.title,
      summary: story.summary,
      date_published: story.publishedAt,
      authors: [{ name: story.author }],
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
