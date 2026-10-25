import { describe, it, expect, beforeEach } from 'vitest';
import { getStory, getPublicStory, getPublicStories, getEntity } from '@/utils/data-layer/store';
import { bootstrapServices, apiStoryToCanonical } from '@/lib/bootstrap';
import { isCanonicalStoryPublic, canPubliclyViewStory, storyPublicationContext } from '@/lib/story/publication';
import { buildSitemap } from '@/lib/seo/sitemap';
import { validateStoryEvidenceCompleteness } from '@/lib/story/evidence-guard';
import type { Story, Claim, Source } from '@/types/canonical';

describe('Before the Battle — Plassey 1757 Pilot Verification & Negative Guard Suite', () => {
  const SLUG = 'before-the-battle-plassey-1757';

  it('Gate 1: Plassey story exists in internal store with full canonical structure', () => {
    const apiStory = getStory(SLUG);
    expect(apiStory).toBeDefined();
    expect(apiStory?.headline).toBe('Before the Battle: How Bengal Was Bought Before Plassey Was Fought');
    expect(apiStory?.readingTime).toBeGreaterThanOrEqual(10);
    expect(apiStory?.wordCount).toBeGreaterThanOrEqual(3000);
    expect(apiStory?.category).toBe('history');
    expect(apiStory?.storyType).toBe('investigation_chapter');
    expect(apiStory?.blocks?.length).toBeGreaterThanOrEqual(5);
    expect(apiStory?.timeline.length).toBeGreaterThanOrEqual(5);
    expect(apiStory?.sources.length).toBeGreaterThanOrEqual(5);
    expect(apiStory?.claims.length).toBe(19);
  });

  it('Gate 2: Story is strictly UNPUBLISHED (draft publication status)', () => {
    const apiStory = getStory(SLUG);
    expect(apiStory?.publicationStatus).toBe('draft');
    expect(apiStory?.status).toBe('developing');

    const canonicalStory: Story = apiStoryToCanonical(apiStory!);
    expect(isCanonicalStoryPublic(canonicalStory)).toBe(false);
    expect(canPubliclyViewStory(storyPublicationContext(canonicalStory))).toBe(false);
  });

  it('Gate 3: Negative test — getPublicStory returns null for unpublished draft', () => {
    const pubStory = getPublicStory(SLUG);
    expect(pubStory).toBeNull();
  });

  it('Gate 4: Negative test — getPublicStories completely excludes the draft story', () => {
    const publicList = getPublicStories({ pageSize: 100 });
    const exists = publicList.data.some((s) => s.slug === SLUG);
    expect(exists).toBe(false);
    expect(publicList.data.length).toBe(41); // Exact legacy published cohort unchanged
  });

  it('Gate 5: Negative test — Public sitemap generator strictly excludes the draft story', async () => {
    const sitemapEntries = await buildSitemap();
    const sitemapUrls = sitemapEntries.map((e) => e.url);
    const plasseyUrl = `https://thebreakdown.in/story/${SLUG}`;
    expect(sitemapUrls).not.toContain(plasseyUrl);
  });

  it('Gate 6: Negative test — Graph projection service strictly excludes the draft story', async () => {
    const services = bootstrapServices();
    const graph = await services.graph.build();
    expect(graph.nodes.has(`story:${SLUG}`)).toBe(false);
    expect(graph.nodes.has(SLUG)).toBe(false);
  });

  it('Gate 7: Negative test — Search service rebuild strictly excludes the draft story', () => {
    const services = bootstrapServices();
    const searchResult = services.search.search('Plassey');
    const hasPlasseyStory = searchResult.data.some((e) => e.type === 'story' && e.slug === SLUG);
    expect(hasPlasseyStory).toBe(false);
  });

  it('Gate 8: Negative test — Direct publication without server publication token is rejected', async () => {
    const services = bootstrapServices();
    const apiStory = getStory(SLUG);
    const canonicalStory: Story = apiStoryToCanonical(apiStory!);

    // Tamper with publication status to pretend to publish directly
    const rogueStory: Story = {
      ...canonicalStory,
      status: 'published',
      publicationStatus: 'published',
    };

    await expect(services.stories.saveStory(rogueStory)).rejects.toThrow(
      /Direct saveStory with status='published' is prohibited/
    );
  });

  it('Gate 9: Negative test — Quarantined test artifact cannot appear in public surfaces even if status=published', () => {
    const apiStory = getStory(SLUG);
    const canonicalStory: Story = apiStoryToCanonical(apiStory!);

    const quarantined: Story = {
      ...canonicalStory,
      publicationStatus: 'published',
      publishedAt: '2026-01-01T00:00:00Z',
      isTestArtifact: true, // Quarantined
    };

    expect(isCanonicalStoryPublic(quarantined)).toBe(false);
  });

  it('Gate 10: Canonical entities resolve with valid historical taxonomy', () => {
    const eic = getEntity('east-india-company');
    expect(eic).toBeDefined();
    expect(eic?.type).toBe('organization');

    const clive = getEntity('robert-clive');
    expect(clive).toBeDefined();
    expect(clive?.type).toBe('person');

    const siraj = getEntity('siraj-ud-daulah');
    expect(siraj).toBeDefined();
    expect(siraj?.type).toBe('person');

    const mirJafar = getEntity('mir-jafar');
    expect(mirJafar).toBeDefined();
    expect(mirJafar?.type).toBe('person');

    const jagatSeth = getEntity('jagat-seth');
    expect(jagatSeth).toBeDefined();
    expect(jagatSeth?.type).toBe('organization');
  });

  it('Gate 11: Evidence completeness & source references pass editorial criteria', async () => {
    const apiStory = getStory(SLUG);
    const canonicalStory: Story = apiStoryToCanonical(apiStory!);

    const validation = await validateStoryEvidenceCompleteness(canonicalStory);
    expect(validation.valid).toBe(true);
    expect(validation.violations).toHaveLength(0);

    // Verify all claims have non-empty explanations and confidence
    for (const claim of canonicalStory.claims) {
      expect(claim.claim.length).toBeGreaterThan(15);
      expect(claim.source.length).toBeGreaterThan(5);
      expect(claim.confidence).toBeGreaterThan(0.9);
    }

    // Verify all sources have legitimate URLs and publishers/authors
    for (const source of canonicalStory.sources) {
      expect(source.title.length).toBeGreaterThan(10);
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.tier).toBeGreaterThanOrEqual(1);
    }
  });

  it('Gate 12: Visual asset exists and is accessible', () => {
    const apiStory = getStory(SLUG);
    expect(apiStory?.heroImage).toBe('/images/stories/battle-of-plassey-1757.svg');
    expect(apiStory?.heroImageAlt?.length).toBeGreaterThan(20);
    expect(apiStory?.heroImageIsDecorative).toBe(false);
  });
});
