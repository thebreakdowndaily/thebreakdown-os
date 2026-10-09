/**
 * Wave 1 — Public-Critical Surfaces Observable Parity & Safety Tests
 *
 * Tests the 7 migrated public surfaces:
 * 1. /stories (Stories listing)
 * 2. /story/[slug] (Story detail resolution)
 * 3. /sitemap.xml (Public sitemap)
 * 4. /news-sitemap.xml (Google News sitemap)
 * 5. /rss (RSS feed)
 * 6. /topics (Topics directory)
 * 7. /entities (Entities directory)
 *
 * Asserts:
 * - Public-only filtering preserved
 * - Quarantine preserved
 * - 0 draft stories exposed
 * - 0 duplicate URLs in sitemap
 */

import { describe, it, expect } from 'vitest';
import { bootstrapServices } from '@/lib/bootstrap';
import sitemap from '@/app/sitemap';
import { GET as getNewsSitemap } from '@/app/news-sitemap.xml/route';
import { GET as getRss } from '@/app/rss/route';
import { resolveStory } from '@/lib/story/resolver';
import { isCanonicalStoryPublic } from '@/lib/story/publication';

describe('Wave 1: Public-Critical Surfaces Verification', () => {
  const services = bootstrapServices({ publicOnly: true });

  it('1. Stories Listing (/stories): returns 41 public stories with valid publication status', async () => {
    const res = await services.stories.getPublicStories({ pageSize: 100 });
    expect(res.data.length).toBe(41);
    expect(res.meta.total).toBe(41);

    // Assert every returned story passes the public publication predicate
    for (const story of res.data) {
      expect(isCanonicalStoryPublic(story)).toBe(true);
      expect(story.isTestArtifact).toBeFalsy();
    }
  });

  it('2. Topics Directory (/topics): returns 15 canonical topics', async () => {
    const allServices = bootstrapServices();
    const res = await allServices.topics.getTopics({ pageSize: 100 });
    expect(res.data.length).toBe(15);
    expect(res.meta.total).toBe(15);

    const slugs = res.data.map(t => t.slug);
    expect(slugs).toContain('economy');
    expect(slugs).toContain('policy');
    expect(slugs).toContain('technology');
  });

  it('3. Entities Directory (/entities): returns 42 unique canonical entities without duplicates', async () => {
    const allServices = bootstrapServices();
    const res = await allServices.entities.getEntities({ pageSize: 50 });
    expect(res.data.length).toBe(42);

    // Verify 0 duplicate slugs
    const slugSet = new Set(res.data.map(e => e.slug));
    expect(slugSet.size).toBe(42);

    // Verify subtypes present (including country, organization)
    const types = new Set(res.data.map(e => e.type));
    expect(types.has('organization')).toBe(true);
    expect(types.has('country')).toBe(true);
  });

  it('4. Sitemap (/sitemap.xml): generates 136 canonical unique URLs with 0 duplicates', async () => {
    const entries = await sitemap();
    expect(entries.length).toBe(136);

    const urls = entries.map(e => e.url);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(entries.length); // 0 duplicates

    const storyUrls = entries.filter(e => e.url.includes('/story/'));
    const topicUrls = entries.filter(e => e.url.includes('/topic/'));
    const entityUrls = entries.filter(e => e.url.includes('/entity/'));
    const fixUrls = entries.filter(e => e.url.includes('/fix/'));

    expect(storyUrls.length).toBe(41);
    expect(topicUrls.length).toBe(15);
    expect(entityUrls.length).toBe(42);
    expect(fixUrls.length).toBe(6);
  });

  it('5. News Sitemap (/news-sitemap.xml): returns valid XML and excludes expired/drafts', async () => {
    const res = await getNewsSitemap();
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    const locCount = (xml.match(/<loc>/g) || []).length;
    expect(locCount).toBe(0); // 0 stories published within 48h
  });

  it('6. RSS Feed (/rss): returns valid RSS 2.0 XML with 41 public items', async () => {
    const res = await getRss();
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<rss version="2.0"');
    const itemCount = (xml.match(/<item>/g) || []).length;
    expect(itemCount).toBe(41);
  });

  it('7. Story Detail (/story/[slug]): resolves legacy story with topics and entities', async () => {
    const resolution = await resolveStory('mgnrega-reform');
    expect(resolution.type).toBe('legacy_story');
    if (resolution.type === 'legacy_story') {
      expect(resolution.canonicalStory.slug).toBe('mgnrega-reform');
      expect(isCanonicalStoryPublic(resolution.canonicalStory)).toBe(true);
      expect(resolution.candidateTimelineEvents.length).toBeGreaterThan(0);
    }
  });
});
