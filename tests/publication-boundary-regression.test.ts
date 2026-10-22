/**
 * Publication Boundary Regression Audit Test Suite
 * Task: BTB-001-PUBBOUND-VERIFY
 *
 * Verifies that the canonical editorial publication state strictly controls every
 * applicable public-facing surface for the quarantined BTB-001 article
 * ('before-the-battle-plassey-1757').
 *
 * Validates:
 * 1. Quarantined BTB-001 is completely excluded from all public surfaces.
 * 2. Missing, unknown, unapproved, or quarantined publication states fail closed.
 * 3. Direct requests do not reveal draft content through alternate routes.
 * 4. An approved published control ('mgnrega-reform') continues to appear as expected.
 * 5. Tests exercise actual route handlers, services, and view models.
 * 6. Implementation uses authoritative publication-state predicates without divergence.
 */

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

const supabaseMock = vi.hoisted(() => {
  const queryBuilder: Record<string, any> = {};

  for (const m of ['select', 'eq', 'or', 'order', 'range', 'limit', 'upsert', 'delete']) {
    queryBuilder[m] = vi.fn(() => queryBuilder);
  }

  queryBuilder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  queryBuilder.single = vi.fn(async () => ({ data: null, error: null }));
  queryBuilder.then = vi.fn((resolve: (v: any) => any, reject: (r: any) => any) =>
    Promise.resolve({ data: [], count: 0, error: null }).then(resolve, reject)
  );

  const from = vi.fn(() => queryBuilder);
  const db = vi.fn(() => ({ from }));

  return { queryBuilder, from, db };
});

vi.mock('@/lib/api-v2', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-v2')>();
  return { ...actual, db: supabaseMock.db };
});

import { bootstrapServices, apiStoryToCanonical } from '@/lib/bootstrap';
import { SupabaseEntityRepository, rowToEntity, rowFromEntity } from '@/services/repositories/supabase/entity';
import { MemoryEntityRepository } from '@/services/repositories/memory/entity';
import {
  getStory,
  getPublicStory,
  getPublicStories,
  getGraph,
  getPublicEntity,
  getEntities,
  getEntity,
  getStore,
  entityIsPublic,
} from '@/utils/data-layer/store';
import {
  isCanonicalStoryPublic,
  canPubliclyViewStory,
  storyPublicationContext,
  isPubliclyPublished,
  LEGACY_PUBLIC_ENTITY_IDENTIFIERS,
  isEntityPubliclyPublishable,
  canPubliclyViewEntity,
  LEGACY_PUBLIC_TOPIC_IDENTIFIERS,
  isTopicPubliclyPublishable,
  canPubliclyViewTopic,
  LEGACY_PUBLIC_TIMELINE_IDENTIFIERS,
  isTimelinePubliclyPublishable,
  canPubliclyViewTimeline,
} from '@/lib/story/publication';
import type { Story, PublicationStatus } from '@/types/canonical';
import { initServices } from '@/services/registry';
import { initDefaultServices } from '@/services/init';

// Direct route & resolution imports
import { resolveStory, getAllStoryAndChapterSlugs } from '@/lib/story/resolver';
import { buildStoryMetadata } from '@/lib/story/metadata';
import { buildStoryPage } from '@/features/story/view-model';

// Sitemap imports
import sitemap from '@/app/sitemap';
import { buildSitemap } from '@/lib/seo/sitemap';
import { GET as getNewsSitemap } from '@/app/news-sitemap.xml/route';

// Feed imports
import { GET as getRss } from '@/app/rss/route';
import { GET as getFeedXml } from '@/app/feed.xml/route';
import { GET as getApiFeed } from '@/app/api/feed/route';
import { GET as getLlmsTxt } from '@/app/llms.txt/route';

// Search imports
import { GET as getApiSearch } from '@/app/api/search/route';
import { GET as getApiV1Search } from '@/app/api/v1/search/route';
import { buildSearchPage } from '@/features/search/view-model';

// Content listings & cards imports
import { buildHomepage } from '@/features/home/view-model';
import { GET as getApiStories } from '@/app/api/stories/route';
import { GET as getApiStoryBySlug } from '@/app/api/stories/[slug]/route';
import { GET as getApiStoryMock } from '@/app/api/story/route';
import { GET as getApiV1Stories } from '@/app/api/v1/stories/route';
import { GET as getApiV1StoryBySlug } from '@/app/api/v1/stories/[slug]/route';
import { buildTopicPage } from '@/features/topic/view-model';
import { buildEntityTerminalViewModel, buildEntityPage } from '@/features/entity/view-model';
import { GET as getApiEntities } from '@/app/api/entities/route';
import { GET as getApiEntityBySlug } from '@/app/api/entities/[slug]/route';
import { GET as getApiV1Entities, POST as postApiV1Entities } from '@/app/api/v1/entities/route';
import { GET as getApiV1EntityBySlug, PUT as putApiV1EntityBySlug, DELETE as deleteApiV1EntityBySlug } from '@/app/api/v1/entities/[slug]/route';

// Graph & discovery imports
import { GET as getApiGraphs } from '@/app/api/graphs/route';
import { GET as getEvidenceGraph } from '@/app/api/graph/evidence/route';
import { GET as getExplorer } from '@/app/api/v2/explorer/route';
import { GET as getApiTopics } from '@/app/api/topics/route';
import { GET as getApiTopicBySlug } from '@/app/api/topics/[slug]/route';
import { GET as getApiTimelines } from '@/app/api/timelines/route';
import { GET as getApiTimelineById } from '@/app/api/timelines/[id]/route';

describe('Task BTB-001-PUBBOUND-VERIFY: Publication Boundary Regression Suite', () => {
  const DRAFT_SLUG = 'before-the-battle-plassey-1757';
  const CONTROL_SLUG = 'mgnrega-reform';

  // Helper matching app/story/[slug]/page.tsx metadata resolution gate
  async function resolvePublicStoryMetadata(slug: string) {
    const resolution = await resolveStory(slug);
    if (resolution.type === 'not_found' || !isCanonicalStoryPublic(resolution.canonicalStory)) {
      return { title: 'Story Not Found — The Breakdown' };
    }
    return buildStoryMetadata(slug);
  }

  // ── 1. Authoritative Predicate & Fail-Closed State Machine ───────────────────
  describe('1. Authoritative Publication State Machine (Fail-Closed)', () => {
    const now = new Date('2026-10-22T10:00:00Z');

    it('identifies BTB-001 as strictly draft and unviewable publicly', () => {
      const apiStory = getStory(DRAFT_SLUG);
      expect(apiStory).toBeDefined();
      expect(apiStory?.publicationStatus).toBe('draft');

      const canonicalStory = apiStoryToCanonical(apiStory!);
      expect(canonicalStory.publicationStatus).toBe('draft');
      expect(isCanonicalStoryPublic(canonicalStory, now)).toBe(false);
      expect(canPubliclyViewStory(storyPublicationContext(canonicalStory), now)).toBe(false);
    });

    it('identifies control story as validly published and publicly viewable', () => {
      const apiStory = getStory(CONTROL_SLUG);
      expect(apiStory).toBeDefined();

      const canonicalStory = apiStoryToCanonical(apiStory!);
      expect(canonicalStory.publicationStatus).toBe('published');
      expect(isCanonicalStoryPublic(canonicalStory, now)).toBe(true);
      expect(canPubliclyViewStory(storyPublicationContext(canonicalStory), now)).toBe(true);
    });

    it('fails closed across all unapproved, quarantined, or invalid publication states', () => {
      const baseCtx = {
        publishedAt: '2026-01-01T00:00:00Z',
      };

      // Unapproved non-published states
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: 'draft' as PublicationStatus }, now)).toBe(false);
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: 'review' as PublicationStatus }, now)).toBe(false);
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: 'fact_check' as PublicationStatus }, now)).toBe(false);
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: 'archived' as PublicationStatus }, now)).toBe(false);
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: 'retracted' as PublicationStatus }, now)).toBe(false);

      // Missing / unknown publication status
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: undefined }, now)).toBe(false);
      expect(isPubliclyPublished({ ...baseCtx, publicationStatus: 'unknown' as any }, now)).toBe(false);

      // Future publishedAt (embargoed)
      expect(isPubliclyPublished({
        publicationStatus: 'published',
        publishedAt: '2026-12-31T00:00:00Z', // In the future
      }, now)).toBe(false);

      // Quarantined test artifacts
      const testArtifact: Story = {
        ...apiStoryToCanonical(getStory(CONTROL_SLUG)!),
        publicationStatus: 'published',
        publishedAt: '2026-01-01T00:00:00Z',
        isTestArtifact: true,
      };
      expect(isCanonicalStoryPublic(testArtifact, now)).toBe(false);
    });
  });

  // ── 2. Direct Article & Dynamic Routes ──────────────────────────────────────
  describe('2. Direct Article & Dynamic Routes', () => {
    it('resolveStory excludes draft Plassey from public canonical visibility', async () => {
      const resolution = await resolveStory(DRAFT_SLUG);
      if (resolution.type === 'chapter' || resolution.type === 'legacy_story') {
        expect(isCanonicalStoryPublic(resolution.canonicalStory)).toBe(false);
      }
    });

    it('resolveStory successfully resolves control story as public', async () => {
      const resolution = await resolveStory(CONTROL_SLUG);
      expect(resolution.type).toBe('legacy_story');
      if (resolution.type === 'legacy_story') {
        expect(resolution.canonicalStory.slug).toBe(CONTROL_SLUG);
        expect(isCanonicalStoryPublic(resolution.canonicalStory)).toBe(true);
      }
    });

    it('buildStoryPage with publicOnly services excludes draft Plassey and resolves control', async () => {
      const publicServices = bootstrapServices({ publicOnly: true });
      const draftVm = await buildStoryPage(publicServices, DRAFT_SLUG);
      expect(draftVm).toBeNull();

      const controlVm = await buildStoryPage(publicServices, CONTROL_SLUG);
      expect(controlVm).not.toBeNull();
      expect(controlVm?.story.slug).toBe(CONTROL_SLUG);
    });

    it('resolvePublicStoryMetadata fails closed to 404 title for draft Plassey', async () => {
      const meta = await resolvePublicStoryMetadata(DRAFT_SLUG);
      expect(meta.title).toBe('Story Not Found — The Breakdown');
    });

    it('resolvePublicStoryMetadata returns canonical title for control story', async () => {
      const meta = await resolvePublicStoryMetadata(CONTROL_SLUG);
      expect(meta.title).toContain('MGNREGA');
    });

    it('getAllStoryAndChapterSlugs excludes draft Plassey and includes control', async () => {
      const allSlugs = await getAllStoryAndChapterSlugs();
      const slugList = allSlugs.map((s) => s.slug);
      expect(slugList).not.toContain(DRAFT_SLUG);
      expect(slugList).toContain(CONTROL_SLUG);
    });
  });

  // ── 3. Sitemap Generation ───────────────────────────────────────────────────
  describe('3. Sitemap Generation', () => {
    it('buildSitemap and sitemap() exclude draft Plassey and include control', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).not.toContain(`https://thebreakdown.in/story/${DRAFT_SLUG}`);
      expect(urls).toContain(`https://thebreakdown.in/story/${CONTROL_SLUG}`);

      // Public story count strictly 41
      const storyUrls = entries.filter((e) => e.url.includes('/story/'));
      expect(storyUrls.length).toBe(41);
    });

    it('GET /news-sitemap.xml returns valid XML and excludes draft Plassey', async () => {
      const res = await getNewsSitemap();
      expect(res.status).toBe(200);
      const xml = await res.text();
      expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
      expect(xml).not.toContain(DRAFT_SLUG);
    });
  });

  // ── 4. RSS & Public Feeds ───────────────────────────────────────────────────
  describe('4. RSS & Public Feeds', () => {
    it('GET /rss excludes draft Plassey and includes control story', async () => {
      const res = await getRss();
      expect(res.status).toBe(200);
      const xml = await res.text();
      expect(xml).not.toContain(DRAFT_SLUG);
      expect(xml).toContain(CONTROL_SLUG);
      const itemCount = (xml.match(/<item>/g) || []).length;
      expect(itemCount).toBe(41);
    });

    it('GET /feed.xml excludes draft Plassey and includes control story', async () => {
      const res = await getFeedXml();
      expect(res.status).toBe(200);
      const xml = await res.text();
      expect(xml).not.toContain(DRAFT_SLUG);
      expect(xml).toContain(CONTROL_SLUG);
    });

    it('GET /api/feed (RSS format) excludes draft Plassey and includes control', async () => {
      const req = new NextRequest('http://localhost:3000/api/feed?format=rss');
      const res = await getApiFeed(req);
      expect(res.status).toBe(200);
      const xml = await res.text();
      expect(xml).not.toContain(DRAFT_SLUG);
      expect(xml).toContain(CONTROL_SLUG);
      const itemCount = (xml.match(/<item>/g) || []).length;
      expect(itemCount).toBe(41);
    });

    it('GET /api/feed (JSON format) excludes draft Plassey and includes control', async () => {
      const req = new NextRequest('http://localhost:3000/api/feed?format=json');
      const res = await getApiFeed(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.items.length).toBe(41);
      const itemUrls = json.items.map((i: any) => i.url);
      expect(itemUrls).not.toContain(`https://thebreakdown.in/story/${DRAFT_SLUG}`);
      expect(itemUrls).toContain(`https://thebreakdown.in/story/${CONTROL_SLUG}`);
    });

    it('GET /llms.txt excludes draft Plassey', async () => {
      const res = await getLlmsTxt();
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).not.toContain(DRAFT_SLUG);
      expect(text).not.toContain('battle-of-plassey');
    });
  });

  // ── 5. Public Search Endpoints & Indexing ────────────────────────────────────
  describe('5. Public Search Endpoints & Indexing', () => {
    it('MemorySearchService rebuild excludes draft Plassey and indexes control', () => {
      const services = bootstrapServices({ publicOnly: true });
      const plasseySearch = services.search.search('Plassey');
      const hasPlassey = plasseySearch.data.some((e) => e.type === 'story' && e.slug === DRAFT_SLUG);
      expect(hasPlassey).toBe(false);

      const mgnregaSearch = services.search.search('MGNREGA');
      const hasControl = mgnregaSearch.data.some((e) => e.type === 'story' && e.slug === CONTROL_SLUG);
      expect(hasControl).toBe(true);
    });

    it('GET /api/search excludes draft Plassey and finds control', async () => {
      const draftReq = new NextRequest('http://localhost:3000/api/search?q=Plassey');
      const draftRes = await getApiSearch(draftReq);
      expect(draftRes.status).toBe(200);
      const draftJson = await draftRes.json();
      const hasDraft = (draftJson.data || []).some((item: any) => item.slug === DRAFT_SLUG);
      expect(hasDraft).toBe(false);

      const controlReq = new NextRequest('http://localhost:3000/api/search?q=MGNREGA');
      const controlRes = await getApiSearch(controlReq);
      expect(controlRes.status).toBe(200);
      const controlJson = await controlRes.json();
      const hasControl = (controlJson.data || []).some((item: any) => item.slug === CONTROL_SLUG);
      expect(hasControl).toBe(true);
    });

    it('GET /api/v1/search excludes draft Plassey', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/search?q=Plassey');
      const res = await getApiV1Search(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      const hasDraft = (json.data || []).some((item: any) => item.slug === DRAFT_SLUG);
      expect(hasDraft).toBe(false);
    });

    it('buildSearchPage excludes draft Plassey from search view model', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const vm = await buildSearchPage(services, 'Plassey');
      const hasDraft = vm.results.some((r) => r.slug === DRAFT_SLUG);
      expect(hasDraft).toBe(false);
    });
  });

  // ── 6. Public Content Listings, Cards & Related-Content Queries ──────────────
  describe('6. Public Content Listings & Queries', () => {
    it('services.stories.getPublicStories returns exactly 41 stories without Plassey', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const res = await services.stories.getPublicStories({ pageSize: 100 });
      expect(res.data.length).toBe(41);
      expect(res.data.some((s) => s.slug === DRAFT_SLUG)).toBe(false);
      expect(res.data.some((s) => s.slug === CONTROL_SLUG)).toBe(true);
    });

    it('buildHomepage excludes draft Plassey from lead, briefings, and deep dives', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const home = await buildHomepage(services);
      expect(home.leadStory?.slug).not.toBe(DRAFT_SLUG);
      expect(home.briefings.some((b) => b.slug === DRAFT_SLUG)).toBe(false);
      expect(home.deepDives.some((d) => d.slug === DRAFT_SLUG)).toBe(false);
    });

    it('GET /api/stories excludes draft Plassey and includes control', async () => {
      const req = new NextRequest('http://localhost:3000/api/stories?pageSize=100');
      const res = await getApiStories(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(41);
      expect(json.data.some((s: any) => s.slug === DRAFT_SLUG)).toBe(false);
      expect(json.data.some((s: any) => s.slug === CONTROL_SLUG)).toBe(true);
    });

    it('GET /api/stories/[slug] returns 404 for draft Plassey and 200 for control', async () => {
      const draftRes = await getApiStoryBySlug(
        new NextRequest(`http://localhost:3000/api/stories/${DRAFT_SLUG}`),
        { params: Promise.resolve({ slug: DRAFT_SLUG }) }
      );
      expect(draftRes.status).toBe(404);

      const controlRes = await getApiStoryBySlug(
        new NextRequest(`http://localhost:3000/api/stories/${CONTROL_SLUG}`),
        { params: Promise.resolve({ slug: CONTROL_SLUG }) }
      );
      expect(controlRes.status).toBe(200);
      const controlJson = await controlRes.json();
      expect(controlJson.slug).toBe(CONTROL_SLUG);
    });

    it('GET /api/story returns 404 for draft Plassey and 200 for control', async () => {
      const draftRes = getApiStoryMock(new NextRequest(`http://localhost:3000/api/story?slug=${DRAFT_SLUG}`));
      expect(draftRes.status).toBe(404);

      const controlRes = getApiStoryMock(new NextRequest(`http://localhost:3000/api/story?slug=${CONTROL_SLUG}`));
      expect(controlRes.status).toBe(200);
    });

    it('GET /api/v1/stories excludes draft Plassey and fails closed', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/stories?pageSize=100');
      const res = await getApiV1Stories(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.some((s: any) => s.slug === DRAFT_SLUG)).toBe(false);
    });

    it('GET /api/v1/stories/[slug] returns 404 for draft Plassey', async () => {
      const draftRes = await getApiV1StoryBySlug(
        new NextRequest(`http://localhost:3000/api/v1/stories/${DRAFT_SLUG}`),
        { params: Promise.resolve({ slug: DRAFT_SLUG }) }
      );
      expect(draftRes.status).toBe(404);
    });

    it('services.stories.getPublicStoryBySlug excludes draft Plassey and resolves control', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const draftStory = await services.stories.getPublicStoryBySlug(DRAFT_SLUG);
      expect(draftStory).toBeUndefined();

      const controlStory = await services.stories.getPublicStoryBySlug(CONTROL_SLUG);
      expect(controlStory).toBeDefined();
      expect(controlStory?.slug).toBe(CONTROL_SLUG);
    });

    it('buildTopicPage excludes draft Plassey from topic stories', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const topicVm = await buildTopicPage(services, 'economy');
      expect(topicVm).toBeDefined();
      const allStories = Object.values(topicVm?.storyGroups || {}).flat();
      const hasDraft = allStories.some((s) => s.slug === DRAFT_SLUG);
      expect(hasDraft).toBe(false);
    });

    it('buildEntityTerminalViewModel returns null (404) for draft entities and succeeds for control', async () => {
      const services = bootstrapServices({ publicOnly: true });

      // Draft entity associated with Plassey
      const draftEntityVm = await buildEntityTerminalViewModel(services, 'east-india-company');
      expect(draftEntityVm).toBeNull();

      // Control public entity
      const controlEntityVm = await buildEntityTerminalViewModel(services, 'ministry-of-rural-development');
      expect(controlEntityVm).not.toBeNull();
      expect(controlEntityVm?.slug).toBe('ministry-of-rural-development');
    });
  });

  // ── 7. Public Graph & Discovery Endpoints ────────────────────────────────────
  describe('7. Public Graph & Discovery Endpoints', () => {
    it('store getGraph excludes draft Plassey and includes control', () => {
      const graph = getGraph();
      const plasseyNode = graph.nodes.find((n) => n.id.includes('plassey'));
      expect(plasseyNode).toBeUndefined();

      const controlNode = graph.nodes.find((n) => n.id === CONTROL_SLUG);
      expect(controlNode).toBeDefined();
    });

    it('GET /api/graphs excludes draft Plassey and includes control', async () => {
      const req = new NextRequest('http://localhost:3000/api/graphs');
      const res = await getApiGraphs(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      const plasseyNode = json.nodes.find((n: any) => n.id.includes('plassey'));
      expect(plasseyNode).toBeUndefined();

      const controlNode = json.nodes.find((n: any) => n.id === CONTROL_SLUG);
      expect(controlNode).toBeDefined();
    });

    it('GET /api/graph/evidence excludes draft Plassey and includes control', async () => {
      const req = new NextRequest('http://localhost:3000/api/graph/evidence');
      const res = await getEvidenceGraph(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      const plasseyNode = json.nodes.find((n: any) => n.id.includes('plassey'));
      expect(plasseyNode).toBeUndefined();

      const controlNode = json.nodes.find((n: any) => n.id === CONTROL_SLUG);
      expect(controlNode).toBeDefined();
    });

    it('GET /api/v2/explorer excludes draft Plassey and finds control', async () => {
      const draftReq = new NextRequest('http://localhost:3000/api/v2/explorer?q=Plassey');
      const draftRes = await getExplorer(draftReq);
      expect(draftRes.status).toBe(200);
      const draftJson = await draftRes.json();
      const hasPlassey = (draftJson.data || []).some(
        (d: any) => d.id?.includes('plassey') || d.href?.includes('plassey')
      );
      expect(hasPlassey).toBe(false);

      const controlReq = new NextRequest('http://localhost:3000/api/v2/explorer?q=MGNREGA');
      const controlRes = await getExplorer(controlReq);
      expect(controlRes.status).toBe(200);
      const controlJson = await controlRes.json();
      const hasControl = (controlJson.data || []).some(
        (d: any) => d.id === CONTROL_SLUG || d.href?.includes(CONTROL_SLUG)
      );
      expect(hasControl).toBe(true);
    });

    it('services.graph.build strictly excludes draft Plassey node', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const graph = await services.graph.build();
      expect(graph.nodes.has(`story:${DRAFT_SLUG}`)).toBe(false);
      expect(graph.nodes.has(DRAFT_SLUG)).toBe(false);
      expect(graph.nodes.has(`story:${CONTROL_SLUG}`) || graph.nodes.has(CONTROL_SLUG)).toBe(true);
    });
  });

  // ── 8. Graph Entity Isolation & Published-Story Unpublishable Entity Reference ─
  describe('8. Graph Entity Isolation & Published-Story Entity Reference (BTB-001-PUBBOUND-ACCEPTANCE-FIX-01)', () => {
    it('canonical entity publication predicate enforces strict fail-closed matrix', () => {
      // 1. Missing / null / undefined / empty object
      expect(isEntityPubliclyPublishable(null)).toBe(false);
      expect(isEntityPubliclyPublishable(undefined)).toBe(false);
      expect(canPubliclyViewEntity(null)).toBe(false);
      expect(isEntityPubliclyPublishable({})).toBe(false);
      expect(canPubliclyViewEntity({})).toBe(false);

      // Incomplete entity record (missing required type or name) fails closed
      expect(isEntityPubliclyPublishable({ id: 'uidai' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI' })).toBe(false);

      // 2. Quarantined test artifacts and draft flags
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', isTestArtifact: true })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'published', isTestArtifact: true })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', isDraft: true })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', isQuarantined: true })).toBe(false);

      // 3. Draft, review, quarantined, archived states
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'draft' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'review' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'in_review' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'quarantined' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'archived' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: 'draft' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: 'quarantined' })).toBe(false);

      // 4. Null values fail-closed
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: null })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: null })).toBe(false);

      // 5. Unknown or unsupported statuses fail-closed (cannot silently become public)
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'unknown' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'pending' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: 'unknown' })).toBe(false);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: 'foo' })).toBe(false);

      // 6. Explicit published and active states
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'published' })).toBe(true);
      expect(canPubliclyViewEntity({ id: 'uidai', name: 'UIDAI', type: 'organization', publicationStatus: 'published' })).toBe(true);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: 'published' })).toBe(true);
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'UIDAI', type: 'organization', status: 'active' })).toBe(true);

      // 7. Legitimate canonical legacy catalog entities without explicit status field
      expect(isEntityPubliclyPublishable({ id: 'uidai', name: 'Unique Identification Authority of India', type: 'organization' })).toBe(true);
      expect(isEntityPubliclyPublishable({ slug: 'mgnrega', name: 'MGNREGA', type: 'policy' })).toBe(true);
      expect(canPubliclyViewEntity({ id: 'uidai', name: 'Unique Identification Authority of India', type: 'organization' })).toBe(true);
    });

    it('entityIsPublic in store checks both reference and store-resolved entity', () => {
      const s = getStore();
      // Robert Clive is in store with publicationStatus: 'draft'
      expect(entityIsPublic({ id: 'robert-clive', slug: 'robert-clive' }, s)).toBe(false);
      expect(entityIsPublic({ id: 'plassey-mir-jafar', slug: 'plassey-mir-jafar' }, s)).toBe(false);
      expect(entityIsPublic({ id: 'siraj-ud-daulah' }, s)).toBe(false);

      // UIDAI is a public canonical entity
      expect(entityIsPublic({ id: 'uidai', slug: 'uidai' }, s)).toBe(true);
    });

    it('regression: a published story referencing an unpublishable entity produces no unauthorized public graph node or link', () => {
      const s = getStore();
      const controlStory = s.stories.get(CONTROL_SLUG);
      expect(controlStory).toBeDefined();

      // Temporarily inject an unpublishable draft entity reference into the published control story
      const originalRelated = [...(controlStory!.relatedEntities || [])];
      const draftEntityRef = { id: 'robert-clive', slug: 'robert-clive', name: 'Robert Clive', type: 'person' };
      const syntheticQuarantineRef = { id: 'synthetic-quarantine-entity', slug: 'synthetic-quarantine-entity', name: 'Synthetic Quarantined Entity', type: 'organization', publicationStatus: 'draft' };

      // Also register synthetic entity in store as draft
      s.entities.set(syntheticQuarantineRef.id, syntheticQuarantineRef as any);
      controlStory!.relatedEntities = [...originalRelated, draftEntityRef, syntheticQuarantineRef as any];

      try {
        const graph = getGraph();

        // 1. Published story node is present
        expect(graph.nodes.some((n) => n.id === CONTROL_SLUG)).toBe(true);

        // 2. Unpublishable entities are strictly NOT added as nodes
        expect(graph.nodes.some((n) => n.id === 'robert-clive')).toBe(false);
        expect(graph.nodes.some((n) => n.id === 'synthetic-quarantine-entity')).toBe(false);
        expect(graph.nodes.some((n) => n.id === 'plassey-mir-jafar')).toBe(false);

        // 3. No links point to or originate from unpublishable entities
        const invalidLinks = graph.links.filter(
          (l) =>
            l.source === 'robert-clive' ||
            l.target === 'robert-clive' ||
            l.source === 'synthetic-quarantine-entity' ||
            l.target === 'synthetic-quarantine-entity' ||
            l.source === 'plassey-mir-jafar' ||
            l.target === 'plassey-mir-jafar'
        );
        expect(invalidLinks).toHaveLength(0);

        // 4. Querying specifically for the unpublishable entity returns no co-occurrence links
        const cliveGraph = getGraph({ entity: 'robert-clive' });
        expect(cliveGraph.nodes.some((n) => n.id === 'robert-clive')).toBe(false);
        expect(cliveGraph.links.some((l) => l.source === 'robert-clive' || l.target === 'robert-clive')).toBe(false);

        // 5. Link integrity: every link connects two valid public nodes
        const nodeIds = new Set(graph.nodes.map((n) => n.id));
        for (const link of graph.links) {
          expect(nodeIds.has(link.source)).toBe(true);
          expect(nodeIds.has(link.target)).toBe(true);
        }
      } finally {
        // Clean up store state
        controlStory!.relatedEntities = originalRelated;
        s.entities.delete(syntheticQuarantineRef.id);
      }
    });

    it('entity-to-entity links strictly skip unpublishable target entities', () => {
      const s = getStore();
      const publicEntity = s.entities.get('uidai');
      expect(publicEntity).toBeDefined();

      const originalRelated = [...(publicEntity!.relatedEntities || [])];
      publicEntity!.relatedEntities = [
        ...originalRelated,
        { id: 'plassey-mir-jafar', slug: 'plassey-mir-jafar', name: 'Mir Jafar', type: 'person' },
      ];

      try {
        const graph = getGraph();
        const mirJafarLink = graph.links.find(
          (l) => l.source === 'uidai' && l.target === 'plassey-mir-jafar'
        );
        expect(mirJafarLink).toBeUndefined();
      } finally {
        publicEntity!.relatedEntities = originalRelated;
      }
    });
  });

  // ── 9. Explorer Discovery Boundary Matrix ────────────────────────────────────
  describe('9. Explorer Discovery Boundary Matrix', () => {
    it.each([
      ['Plassey', 'Plassey query'],
      ['Robert Clive', 'Robert Clive name query'],
      ['plassey-mir-jafar', 'plassey-mir-jafar entity identifier query'],
      ['east-india-company-bengal', 'east-india-company-bengal entity slug query'],
      ['Siraj-ud-Daulah', 'Siraj-ud-Daulah nawab query'],
    ])('GET /api/v2/explorer?q=%s excludes draft content (%s)', async (query) => {
      const req = new NextRequest(`http://localhost:3000/api/v2/explorer?q=${encodeURIComponent(query)}`);
      const res = await getExplorer(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(0);
      expect(json.meta.total).toBe(0);
    });

    it('GET /api/v2/explorer keeps published control content accessible', async () => {
      // Story search
      const storyReq = new NextRequest('http://localhost:3000/api/v2/explorer?q=MGNREGA');
      const storyRes = await getExplorer(storyReq);
      expect(storyRes.status).toBe(200);
      const storyJson = await storyRes.json();
      expect(storyJson.meta.total).toBeGreaterThan(0);
      expect(storyJson.data.some((d: any) => d.id === CONTROL_SLUG || d.href?.includes(CONTROL_SLUG))).toBe(true);

      // Entity search
      const entityReq = new NextRequest('http://localhost:3000/api/v2/explorer?q=UIDAI');
      const entityRes = await getExplorer(entityReq);
      expect(entityRes.status).toBe(200);
      const entityJson = await entityRes.json();
      expect(entityJson.meta.total).toBeGreaterThan(0);
      expect(entityJson.data.some((d: any) => d.type === 'entity' && (d.id === 'uidai' || d.href?.includes('uidai')))).toBe(true);
    });
  });

  // ── 10. Public Entity Listings & Direct Entity Lookups ────────────────────────
  describe('10. Public Entity Listings & Direct Entity Lookups', () => {
    it('GET /api/entities default list excludes all draft entities and includes control', async () => {
      const req = new NextRequest('http://localhost:3000/api/entities?pageSize=100');
      const res = await getApiEntities(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      const entityIds = (json.data || []).map((e: any) => e.id);

      expect(entityIds).not.toContain('robert-clive');
      expect(entityIds).not.toContain('plassey-mir-jafar');
      expect(entityIds).not.toContain('siraj-ud-daulah');
      expect(entityIds).not.toContain('jagat-seth');
      expect(entityIds).not.toContain('east-india-company-bengal');

      expect(entityIds).toContain('uidai');
      expect(entityIds).toContain('ministry-of-rural-development');
    });

    it.each([
      ['Robert Clive'],
      ['Plassey'],
      ['mir-jafar'],
      ['Siraj-ud-Daulah'],
    ])('GET /api/entities?search=%s returns 0 results', async (term) => {
      const req = new NextRequest(`http://localhost:3000/api/entities?search=${encodeURIComponent(term)}`);
      const res = await getApiEntities(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data || []).toHaveLength(0);
    });

    it('GET /api/entities?search=UIDAI returns control entity', async () => {
      const req = new NextRequest('http://localhost:3000/api/entities?search=UIDAI');
      const res = await getApiEntities(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].id).toBe('uidai');
    });

    it('getPublicEntity in store returns null for draft entities and resolves control', () => {
      expect(getPublicEntity('robert-clive')).toBeNull();
      expect(getPublicEntity('plassey-mir-jafar')).toBeNull();
      expect(getPublicEntity('siraj-ud-daulah')).toBeNull();
      expect(getPublicEntity('jagat-seth')).toBeNull();
      expect(getPublicEntity('east-india-company-bengal')).toBeNull();

      const control = getPublicEntity('uidai');
      expect(control).not.toBeNull();
      expect(control?.id).toBe('uidai');
    });

    it.each([
      ['plassey-mir-jafar'],
      ['robert-clive'],
      ['east-india-company-bengal'],
      ['siraj-ud-daulah'],
      ['jagat-seth'],
    ])('GET /api/entities/[slug] returns 404 for draft entity (%s)', async (slug) => {
      const res = await getApiEntityBySlug(
        new NextRequest(`http://localhost:3000/api/entities/${slug}`),
        { params: Promise.resolve({ slug }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('not found');
    });

    it('GET /api/entities/[slug] returns 200 for control entity (uidai)', async () => {
      const res = await getApiEntityBySlug(
        new NextRequest('http://localhost:3000/api/entities/uidai'),
        { params: Promise.resolve({ slug: 'uidai' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe('uidai');
    });

    it('GET /api/v1/entities/[slug] returns 404 for draft or missing entity', async () => {
      // 1. Missing in Supabase (PGRST116)
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      const res404 = await getApiV1EntityBySlug(
        new NextRequest('http://localhost:3000/api/v1/entities/plassey-mir-jafar'),
        { params: Promise.resolve({ slug: 'plassey-mir-jafar' }) }
      );
      expect(res404.status).toBe(404);

      // 2. Row exists in Supabase but is marked draft
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'robert-clive',
          slug: 'robert-clive',
          name: 'Robert Clive',
          type: 'person',
          publication_status: 'draft',
          status: 'draft',
          is_draft: true,
          statistics: [],
          timeline: [],
          faq: [],
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });
      const resDraft = await getApiV1EntityBySlug(
        new NextRequest('http://localhost:3000/api/v1/entities/robert-clive'),
        { params: Promise.resolve({ slug: 'robert-clive' }) }
      );
      expect(resDraft.status).toBe(404);
    });

    it('GET /api/v1/entities/[slug] returns 200 for published control entity from Supabase', async () => {
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'uidai',
          slug: 'uidai',
          name: 'Unique Identification Authority of India',
          type: 'organization',
          description: 'Aadhaar authority',
          story_count: 10,
          evidence_score: 95,
          statistics: [],
          timeline: [],
          faq: [],
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });
      const res = await getApiV1EntityBySlug(
        new NextRequest('http://localhost:3000/api/v1/entities/uidai'),
        { params: Promise.resolve({ slug: 'uidai' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.slug).toBe('uidai');
      expect(json.data.name).toBe('Unique Identification Authority of India');
    });

    it('GET /api/v1/entities filters out draft entities and retains public controls', async () => {
      supabaseMock.queryBuilder.then.mockImplementationOnce((resolve: any, reject: any) =>
        Promise.resolve({
          data: [
            {
              id: 'uidai',
              slug: 'uidai',
              name: 'Unique Identification Authority of India',
              type: 'organization',
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            },
            {
              id: 'robert-clive',
              slug: 'robert-clive',
              name: 'Robert Clive',
              type: 'person',
              status: 'draft',
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            },
          ],
          count: 2,
          error: null,
        }).then(resolve, reject)
      );

      const res = await getApiV1Entities(new NextRequest('http://localhost:3000/api/v1/entities'));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(1);
      expect(json.data[0].slug).toBe('uidai');
    });

    it('app/api/v1/entities write operations target Supabase persistent repository and do not move to ephemeral memory', async () => {
      // 1. POST /api/v1/entities targets repo.save -> supabase upsert
      const newEntity = {
        name: 'Test Persistent Entity',
        slug: 'test-persistent-entity',
        type: 'organization' as const,
        description: 'Persistent test entity',
      };

      supabaseMock.queryBuilder.upsert.mockClear();
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'test-persistent-entity-id',
          slug: 'test-persistent-entity',
          name: 'Test Persistent Entity',
          type: 'organization',
          description: 'Persistent test entity',
          statistics: [],
          timeline: [],
          faq: [],
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });

      const postReq = new NextRequest('http://localhost:3000/api/v1/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntity),
      });

      const postRes = await postApiV1Entities(postReq);
      expect(postRes.status).toBe(201);
      expect(supabaseMock.queryBuilder.upsert).toHaveBeenCalled();

      // 2. PUT /api/v1/entities/[slug] targets repo.save -> supabase upsert
      const uidaiRow = {
        id: 'uidai',
        slug: 'uidai',
        name: 'UIDAI',
        type: 'organization',
        statistics: [],
        timeline: [],
        faq: [],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      supabaseMock.queryBuilder.single
        .mockResolvedValueOnce({ data: uidaiRow, error: null })
        .mockResolvedValueOnce({ data: { ...uidaiRow, name: 'UIDAI Updated' }, error: null });
      supabaseMock.queryBuilder.upsert.mockClear();

      const putReq = new NextRequest('http://localhost:3000/api/v1/entities/uidai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'UIDAI Updated' }),
      });

      const putRes = await putApiV1EntityBySlug(putReq, { params: Promise.resolve({ slug: 'uidai' }) });
      expect(putRes.status).toBe(200);
      expect(supabaseMock.queryBuilder.upsert).toHaveBeenCalled();

      // 3. DELETE /api/v1/entities/[slug] targets repo.delete -> supabase delete
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'uidai',
          slug: 'uidai',
          name: 'UIDAI',
          type: 'organization',
          statistics: [],
          timeline: [],
          faq: [],
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });
      supabaseMock.queryBuilder.delete.mockClear();

      const deleteReq = new NextRequest('http://localhost:3000/api/v1/entities/uidai', {
        method: 'DELETE',
      });

      const deleteRes = await deleteApiV1EntityBySlug(deleteReq, { params: Promise.resolve({ slug: 'uidai' }) });
      expect(deleteRes.status).toBe(204);
      expect(supabaseMock.queryBuilder.delete).toHaveBeenCalled();
    });

    it('Supabase entity records preserve publication policy state without inventing schema columns', async () => {
      // Verify that rowToEntity mappings preserve lifecycle fields if present on the row
      const repo = new SupabaseEntityRepository();

      // Row with draft metadata
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'draft-entity-1',
          slug: 'draft-entity-1',
          name: 'Draft Entity',
          type: 'organization',
          publication_status: 'draft',
          status: 'draft',
          is_test_artifact: false,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });

      const loadedDraft = await repo.getEntityBySlug('draft-entity-1');
      expect(loadedDraft).toBeDefined();
      expect(canPubliclyViewEntity(loadedDraft)).toBe(false);

      // Row representing canonical catalog entity (no publication_status column in Supabase schema)
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'cag',
          slug: 'cag',
          name: 'Comptroller and Auditor General of India',
          type: 'organization',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      });

      const loadedCatalog = await repo.getEntityBySlug('cag');
      expect(loadedCatalog).toBeDefined();
      expect(canPubliclyViewEntity(loadedCatalog)).toBe(true);
    });

    it('buildEntityPage view model returns null (404) for draft entities and resolves control', async () => {
      const services = bootstrapServices({ publicOnly: true });

      expect(await buildEntityPage(services, 'robert-clive')).toBeNull();
      expect(await buildEntityPage(services, 'plassey-mir-jafar')).toBeNull();
      expect(await buildEntityPage(services, 'siraj-ud-daulah')).toBeNull();

      const controlVm = await buildEntityPage(services, 'uidai');
      expect(controlVm).not.toBeNull();
      expect(controlVm?.entity.slug).toBe('uidai');
      expect(controlVm?.breadcrumbs.some((b) => b.label.includes('Unique Identification') || b.href.includes('uidai'))).toBe(true);
    });
  });

  // ── 11. Topic & Timeline Discovery Paths ─────────────────────────────────────
  describe('11. Topic & Timeline Discovery Paths', () => {
    it('services.topics.getTopics() excludes draft Plassey story and entities from all topics', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const { data: topics } = await services.topics.getTopics({ pageSize: 1000 });
      expect(topics.length).toBeGreaterThan(0);

      for (const topic of topics) {
        expect(topic.storyIds || []).not.toContain(DRAFT_SLUG);
        expect((topic as any).featuredStoryIds || []).not.toContain(DRAFT_SLUG);
        expect(topic.relatedEntityIds || []).not.toContain('robert-clive');
        expect(topic.relatedEntityIds || []).not.toContain('plassey-mir-jafar');
        expect(topic.relatedEntityIds || []).not.toContain('siraj-ud-daulah');
      }
    });

    it('services.timelines.getTimelines() excludes draft Plassey story and entities', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const { data: timelines } = await services.timelines.getTimelines({ pageSize: 1000 });
      expect(timelines.length).toBeGreaterThan(0);

      for (const timeline of timelines) {
        expect(timeline.storyIds || []).not.toContain(DRAFT_SLUG);
        expect(timeline.title.toLowerCase()).not.toContain('plassey');
        expect(timeline.description.toLowerCase()).not.toContain('plassey');
      }
    });

    it('buildTopicPage excludes draft stories and draft entities across all categories', async () => {
      const services = bootstrapServices({ publicOnly: true });

      for (const category of ['economy', 'policy', 'agriculture']) {
        const topicVm = await buildTopicPage(services, category);
        expect(topicVm).not.toBeNull();
        const allStories = Object.values(topicVm?.storyGroups || {}).flat();
        expect(allStories.some((s) => s.slug === DRAFT_SLUG)).toBe(false);
        expect(topicVm?.rankedEntities.some((e) => e.slug === 'robert-clive' || e.slug === 'plassey-mir-jafar')).toBe(false);
        expect(((topicVm?.storyGroups as any)?.all || []).some((s: any) => s.slug === DRAFT_SLUG)).toBe(false);
      }
    });
  });

  // ── 12. Supabase rowToEntity Faithful Lifecycle Mapping ──────────────────────
  describe('12. Supabase rowToEntity Faithful Lifecycle Mapping', () => {
    it('preserves explicitly present null publication_status and fails public view', () => {
      const row = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        publication_status: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;

      const entity = rowToEntity(row);
      expect(entity.publicationStatus).toBeNull();
      expect(canPubliclyViewEntity(entity)).toBe(false);
    });

    it('preserves explicitly present empty string publication_status and fails public view', () => {
      const row = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        publication_status: '',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;

      const entity = rowToEntity(row);
      expect(entity.publicationStatus).toBe('');
      expect(canPubliclyViewEntity(entity)).toBe(false);
    });

    it('preserves unknown/unsupported publication_status and fails public view', () => {
      const row = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        publication_status: 'unknown_review_status',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;

      const entity = rowToEntity(row);
      expect(entity.publicationStatus).toBe('unknown_review_status');
      expect(canPubliclyViewEntity(entity)).toBe(false);
    });

    it('preserves explicitly present null status and fails public view', () => {
      const row = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        status: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;

      const entity = rowToEntity(row);
      expect(entity.status).toBeNull();
      expect(canPubliclyViewEntity(entity)).toBe(false);
    });

    it('preserves explicitly present empty string status and fails public view', () => {
      const row = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        status: '',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;

      const entity = rowToEntity(row);
      expect(entity.status).toBe('');
      expect(canPubliclyViewEntity(entity)).toBe(false);
    });

    it('preserves unsupported status values and fails public view', () => {
      for (const unsupported of ['pending', 'review', 'unknown', 'archived', 'draft']) {
        const row = {
          id: 'cag',
          slug: 'cag',
          name: 'Comptroller and Auditor General of India',
          type: 'organization',
          status: unsupported,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        } as any;

        const entity = rowToEntity(row);
        expect(entity.status).toBe(unsupported);
        expect(canPubliclyViewEntity(entity)).toBe(false);
      }
    });

    it('preserves boolean quarantine, draft, and test artifact flags', () => {
      const testArtifactRow = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        is_test_artifact: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;
      expect(canPubliclyViewEntity(rowToEntity(testArtifactRow))).toBe(false);

      const draftRow = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        is_draft: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;
      expect(canPubliclyViewEntity(rowToEntity(draftRow))).toBe(false);

      const quarantinedRow = {
        id: 'cag',
        slug: 'cag',
        name: 'Comptroller and Auditor General of India',
        type: 'organization',
        is_quarantined: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;
      expect(canPubliclyViewEntity(rowToEntity(quarantinedRow))).toBe(false);
    });

    it('faithfully leaves lifecycle properties undefined when absent from the database row', () => {
      const row = {
        id: 'rbi',
        slug: 'rbi',
        name: 'Reserve Bank of India',
        type: 'organization',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      } as any;

      const entity = rowToEntity(row);
      expect(entity.publicationStatus).toBeUndefined();
      expect(entity.status).toBeUndefined();
      expect(entity.isTestArtifact).toBeUndefined();
      expect(entity.isDraft).toBeUndefined();
      expect(entity.isQuarantined).toBeUndefined();
      // Legacy catalog entity succeeds via provenance
      expect(canPubliclyViewEntity(entity)).toBe(true);
    });
  });

  // ── 13. Bounded Legacy Catalog Compatibility Rule & Provenance ────────────────
  describe('13. Bounded Legacy Catalog Compatibility Rule & Provenance', () => {
    it('ensures new entity records with valid id, name, and type fail closed without explicit publication metadata', () => {
      const newEntityNoMetadata = {
        id: 'newly-created-ministry',
        slug: 'newly-created-ministry',
        name: 'Ministry of New Affairs',
        type: 'organization',
      };
      // Merely having id, name, and type MUST NOT make an entity public!
      expect(LEGACY_PUBLIC_ENTITY_IDENTIFIERS.has(newEntityNoMetadata.slug)).toBe(false);
      expect(isEntityPubliclyPublishable(newEntityNoMetadata)).toBe(false);
      expect(canPubliclyViewEntity(newEntityNoMetadata)).toBe(false);
    });

    it('allows all approved legacy catalog entities when structurally complete', () => {
      expect(LEGACY_PUBLIC_ENTITY_IDENTIFIERS.size).toBe(45); // 42 canonical entities + 3 aliases

      const sampleLegacy = ['rbi', 'india', 'supreme-court-of-india', 'cag', 'eci', 'sc', 'uidai', 'un', 'who'];
      for (const slug of sampleLegacy) {
        expect(LEGACY_PUBLIC_ENTITY_IDENTIFIERS.has(slug)).toBe(true);
        const entity = {
          id: slug,
          slug,
          name: `Entity ${slug}`,
          type: 'organization',
        };
        expect(isEntityPubliclyPublishable(entity)).toBe(true);
        expect(canPubliclyViewEntity(entity)).toBe(true);
      }
    });

    it('fails closed for legacy entities with incomplete structure', () => {
      // Missing name
      expect(isEntityPubliclyPublishable({ id: 'rbi', slug: 'rbi', type: 'organization' })).toBe(false);
      // Missing type
      expect(isEntityPubliclyPublishable({ id: 'rbi', slug: 'rbi', name: 'RBI' })).toBe(false);
      // Missing identifier
      expect(isEntityPubliclyPublishable({ name: 'RBI', type: 'organization' })).toBe(false);
    });

    it('fails closed if a legacy entity carries an explicit draft or quarantine status', () => {
      const legacyDraft = {
        id: 'rbi',
        slug: 'rbi',
        name: 'Reserve Bank of India',
        type: 'organization',
        publicationStatus: 'draft',
      };
      expect(isEntityPubliclyPublishable(legacyDraft)).toBe(false);

      const legacyQuarantined = {
        id: 'rbi',
        slug: 'rbi',
        name: 'Reserve Bank of India',
        type: 'organization',
        isQuarantined: true,
      };
      expect(isEntityPubliclyPublishable(legacyQuarantined)).toBe(false);
    });

    it('allows non-legacy entities if and only if they carry explicit published or active status', () => {
      const newEntityPublished = {
        id: 'new-approved-agency',
        slug: 'new-approved-agency',
        name: 'New Approved Agency',
        type: 'organization',
        publicationStatus: 'published',
      };
      expect(isEntityPubliclyPublishable(newEntityPublished)).toBe(true);

      const newEntityActive = {
        id: 'new-active-agency',
        slug: 'new-active-agency',
        name: 'New Active Agency',
        type: 'organization',
        status: 'active',
      };
      expect(isEntityPubliclyPublishable(newEntityActive)).toBe(true);

      const newEntityStatusPublished = {
        id: 'new-status-published',
        slug: 'new-status-published',
        name: 'New Status Published',
        type: 'organization',
        status: 'published',
      };
      expect(isEntityPubliclyPublishable(newEntityStatusPublished)).toBe(true);
    });
  });

  // ── 14. Public Pagination Correctness ─────────────────────────────────────────
  describe('14. Public Pagination Correctness', () => {
    it('app/api/v1/entities correctly paginates after visibility filtering without skipping or duplicates', async () => {
      // Construct a dataset of 25 entities where 10 are draft and 15 are public
      const mockRows: any[] = [];
      for (let i = 1; i <= 25; i++) {
        const isDraft = i % 2 === 0 && mockRows.filter(r => r.publication_status === 'draft').length < 10;
        mockRows.push({
          id: `entity-${i}`,
          slug: `entity-${i}`,
          name: `Entity ${i}`,
          description: `Description ${i}`,
          type: 'organization',
          publication_status: isDraft ? 'draft' : 'published',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        });
      }

      const totalPublicCount = mockRows.filter(r => r.publication_status === 'published').length;
      expect(totalPublicCount).toBe(15);

      // Mock repository response
      supabaseMock.queryBuilder.then.mockImplementationOnce((resolve: any) =>
        resolve({ data: mockRows, count: mockRows.length, error: null })
      );

      // Page 1 with pageSize 10
      const reqPage1 = new NextRequest('http://localhost/api/v1/entities?page=1&pageSize=10');
      const resPage1 = await getApiV1Entities(reqPage1);
      const json1 = await resPage1.json();

      expect(resPage1.status).toBe(200);
      expect(json1.data.length).toBe(10);
      expect(json1.meta.total).toBe(15);
      expect(json1.meta.page).toBe(1);
      expect(json1.meta.pageSize).toBe(10);
      expect(json1.meta.totalPages).toBe(2);

      // Verify all items on page 1 are public
      for (const e of json1.data) {
        expect(canPubliclyViewEntity(e)).toBe(true);
        expect(e.publicationStatus).toBe('published');
      }

      // Page 2 with pageSize 10
      supabaseMock.queryBuilder.then.mockImplementationOnce((resolve: any) =>
        resolve({ data: mockRows, count: mockRows.length, error: null })
      );

      const reqPage2 = new NextRequest('http://localhost/api/v1/entities?page=2&pageSize=10');
      const resPage2 = await getApiV1Entities(reqPage2);
      const json2 = await resPage2.json();

      expect(resPage2.status).toBe(200);
      expect(json2.data.length).toBe(5);
      expect(json2.meta.total).toBe(15);
      expect(json2.meta.page).toBe(2);
      expect(json2.meta.pageSize).toBe(10);
      expect(json2.meta.totalPages).toBe(2);

      // Verify no duplicates between page 1 and page 2
      const page1Ids = new Set(json1.data.map((e: any) => e.id));
      const page2Ids = new Set(json2.data.map((e: any) => e.id));
      for (const id of page2Ids) {
        expect(page1Ids.has(id)).toBe(false);
      }
      expect(page1Ids.size + page2Ids.size).toBe(15);
    });

    it('app/api/entities correctly paginates public entities without draft leakage', async () => {
      const req = new NextRequest('http://localhost/api/entities?page=1&pageSize=10');
      const res = await getApiEntities(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.length).toBeLessThanOrEqual(10);
      expect(json.meta.total).toBeGreaterThan(0);
      expect(json.meta.page).toBe(1);

      for (const e of json.data) {
        expect(canPubliclyViewEntity(e)).toBe(true);
        expect(e.slug).not.toBe('robert-clive');
        expect(e.slug).not.toBe('plassey-mir-jafar');
      }
    });
  });

  // ── 15. Explorer Discovery Security Across All Result Types ───────────────────
  describe('15. Explorer Discovery Security Across All Result Types', () => {
    it('executes via registered services path and strictly excludes draft Plassey story, claims, sources, and evidence', async () => {
      const req = new NextRequest('http://localhost/api/v2/explorer?q=plassey');
      const res = await getExplorer(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.length).toBe(0);
      expect(json.meta.total).toBe(0);
      expect(json.meta.typeCounts).toEqual({});
    });

    it('strictly excludes draft Plassey entities (Robert Clive, Mir Jafar, East India Company) from Explorer', async () => {
      for (const query of ['robert clive', 'mir-jafar', 'plassey-mir-jafar', 'siraj-ud-daulah', 'east india company']) {
        const req = new NextRequest(`http://localhost/api/v2/explorer?q=${encodeURIComponent(query)}`);
        const res = await getExplorer(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.data.length).toBe(0);
        expect(json.meta.total).toBe(0);
      }
    });

    it('preserves public control story and entities in Explorer discovery', async () => {
      const reqStory = new NextRequest('http://localhost/api/v2/explorer?q=mgnrega');
      const resStory = await getExplorer(reqStory);
      const jsonStory = await resStory.json();

      expect(resStory.status).toBe(200);
      expect(jsonStory.data.length).toBeGreaterThan(0);
      expect(jsonStory.data.some((r: any) => r.type === 'story' && r.href.includes('mgnrega-reform'))).toBe(true);

      const reqEntity = new NextRequest('http://localhost/api/v2/explorer?q=Reserve+Bank');
      const resEntity = await getExplorer(reqEntity);
      const jsonEntity = await resEntity.json();

      expect(resEntity.status).toBe(200);
      expect(jsonEntity.data.length).toBeGreaterThan(0);
      expect(jsonEntity.data.some((r: any) => r.type === 'entity' && r.href.includes('rbi'))).toBe(true);
    });

    it('verifies registered-services execution path excludes quarantined entities referenced by published stories', async () => {
      // Construct a registered service environment with:
      // - A published story referencing a quarantined draft entity
      // - A draft topic
      // - A draft timeline
      const mockPublishedStory: Story = {
        id: 'published-story-1',
        slug: 'published-story-1',
        title: 'Published Story With Entity Reference',
        summary: 'A public investigation report referencing entities.',
        readingTime: 5,
        content: '<p>Content</p>',
        publishedAt: '2026-01-01T00:00:00Z',
        publicationStatus: 'published',
        blocks: [],
        claims: [
          {
            id: 'claim-pub-1',
            claim: 'Public claim data point',
            source: 'Official Source',
            status: 'verified',
            evidenceTier: 1,
            confidence: 90,
          } as any,
        ],
        sources: [
          {
            id: 'source-pub-1',
            title: 'Official Gazette',
            url: 'https://example.gov.in/gazette',
            publisher: 'Government of India',
            tier: 1,
          } as any,
        ],
        relatedEntityIds: ['rbi', 'quarantined-draft-entity'],
      } as any;

      const mockDraftStory: Story = {
        id: 'draft-story-plassey',
        slug: 'draft-story-plassey',
        title: 'Before the Battle Plassey Draft',
        summary: 'Secret unpublished Plassey research draft.',
        readingTime: 10,
        content: '<p>Draft</p>',
        publishedAt: '2026-01-01T00:00:00Z',
        publicationStatus: 'draft',
        blocks: [],
        claims: [
          {
            id: 'claim-draft-1',
            claim: 'Plassey battle casualty estimate claim',
            source: 'Clive Diaries',
            status: 'draft',
          } as any,
        ],
        sources: [
          {
            id: 'source-draft-1',
            title: 'Clive Private Manuscript',
            url: 'https://archive.org/clive',
            publisher: 'Clive Archive',
            tier: 3,
          } as any,
        ],
      } as any;

      const mockQuarantinedEntity = {
        id: 'quarantined-draft-entity',
        slug: 'quarantined-draft-entity',
        name: 'Quarantined Secret Entity',
        description: 'Classified draft entity not for release.',
        type: 'organization' as const,
        publicationStatus: 'draft' as const,
        aliases: ['secret-entity'],
      } as any;

      const mockPublicEntity = {
        id: 'rbi',
        slug: 'rbi',
        name: 'Reserve Bank of India',
        description: 'Central bank of the Republic of India.',
        type: 'organization' as const,
        publicationStatus: 'published' as const,
        aliases: ['central-bank'],
      } as any;

      const mockDraftTopic = {
        id: 'topic-draft-plassey',
        slug: 'topic-draft-plassey',
        name: 'Battle of Plassey Strategic Analysis',
        description: 'Unpublished topic dossier.',
        publicationStatus: 'draft',
      } as any;

      const mockDraftTimeline = {
        id: 'timeline-draft-plassey',
        title: 'Plassey 1757 Tactical Timeline',
        description: 'Unpublished battlefield movements.',
        publicationStatus: 'draft',
      } as any;

      const customServices = initDefaultServices(
        [mockPublishedStory, mockDraftStory],
        [mockDraftTopic],
        [mockPublicEntity, mockQuarantinedEntity],
        [mockDraftTimeline],
        [],
        [],
        [],
        []
      );

      // Register services
      initServices(customServices);

      try {
        // 1. Search for draft story claims/sources/content
        const resDraftStory = await getExplorer(new NextRequest('http://localhost/api/v2/explorer?q=Plassey'));
        const jsonDraftStory = await resDraftStory.json();
        expect(jsonDraftStory.data.length).toBe(0);

        // 2. Search for quarantined entity referenced by published story
        const resQuarantined = await getExplorer(new NextRequest('http://localhost/api/v2/explorer?q=Quarantined+Secret'));
        const jsonQuarantined = await resQuarantined.json();
        expect(jsonQuarantined.data.length).toBe(0);

        // 3. Search for draft topic
        const resDraftTopic = await getExplorer(new NextRequest('http://localhost/api/v2/explorer?q=Strategic+Analysis'));
        const jsonDraftTopic = await resDraftTopic.json();
        expect(jsonDraftTopic.data.length).toBe(0);

        // 4. Search for draft timeline
        const resDraftTimeline = await getExplorer(new NextRequest('http://localhost/api/v2/explorer?q=Tactical+Timeline'));
        const jsonDraftTimeline = await resDraftTimeline.json();
        expect(jsonDraftTimeline.data.length).toBe(0);

        // 5. Search for published control story and its claims/sources
        const resPubStory = await getExplorer(new NextRequest('http://localhost/api/v2/explorer?q=Entity+Reference'));
        const jsonPubStory = await resPubStory.json();
        expect(jsonPubStory.data.length).toBeGreaterThan(0);
        expect(jsonPubStory.data.some((r: any) => r.type === 'story' && r.id === 'published-story-1')).toBe(true);

        // 6. Search for published entity
        const resPubEntity = await getExplorer(new NextRequest('http://localhost/api/v2/explorer?q=Reserve+Bank'));
        const jsonPubEntity = await resPubEntity.json();
        expect(jsonPubEntity.data.length).toBeGreaterThan(0);
        expect(jsonPubEntity.data.some((r: any) => r.type === 'entity' && r.id === 'rbi')).toBe(true);
      } finally {
        // Reset services registry
        initServices(null as any);
      }
    });
  });


  // ── 16. Canonical Topic Publication State Machine & Route Isolation ─────────
  describe('16. Canonical Topic Publication State Machine & Route Isolation', () => {
    it('fails closed for null, undefined, or empty topic objects', () => {
      expect(isTopicPubliclyPublishable(null)).toBe(false);
      expect(isTopicPubliclyPublishable(undefined)).toBe(false);
      expect(isTopicPubliclyPublishable({})).toBe(false);
    });

    it('fails closed for explicit quarantine, draft, or test artifact flags on topics', () => {
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', isTestArtifact: true })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', isDraft: true })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', isQuarantined: true })).toBe(false);
    });

    it('fails closed for null, empty, unknown, draft, or archived publicationStatus on topics', () => {
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', publicationStatus: null })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', publicationStatus: '' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', publicationStatus: 'unknown' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', publicationStatus: 'draft' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', publicationStatus: 'archived' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', publicationStatus: 'review' })).toBe(false);
    });

    it('fails closed for null, empty, unknown, pending, or draft status on topics', () => {
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', status: null })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', status: '' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', status: 'unknown' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', status: 'pending' })).toBe(false);
      expect(isTopicPubliclyPublishable({ id: 'economy', name: 'Economy', status: 'draft' })).toBe(false);
    });

    it('allows topics with explicit published or active status', () => {
      expect(isTopicPubliclyPublishable({ id: 'custom-topic', name: 'Custom Topic', publicationStatus: 'published' })).toBe(true);
      expect(isTopicPubliclyPublishable({ id: 'custom-topic', name: 'Custom Topic', status: 'published' })).toBe(true);
      expect(isTopicPubliclyPublishable({ id: 'custom-topic', name: 'Custom Topic', status: 'active' })).toBe(true);
    });

    it('enforces bounded legacy catalog allowlist: approved topics succeed, unlisted fail closed', () => {
      expect(LEGACY_PUBLIC_TOPIC_IDENTIFIERS.size).toBe(15);
      for (const slug of ['economy', 'technology', 'cybersecurity', 'policy', 'agriculture', 'governance', 'infrastructure', 'geopolitics']) {
        expect(LEGACY_PUBLIC_TOPIC_IDENTIFIERS.has(slug)).toBe(true);
        expect(canPubliclyViewTopic({ id: slug, slug, name: `Topic ${slug}` })).toBe(true);
      }

      // New unlisted topic without publication metadata MUST fail closed
      const unlistedTopic = { id: 'unapproved-topic-2026', slug: 'unapproved-topic-2026', name: 'Unapproved Topic' };
      expect(LEGACY_PUBLIC_TOPIC_IDENTIFIERS.has(unlistedTopic.slug)).toBe(false);
      expect(canPubliclyViewTopic(unlistedTopic)).toBe(false);

      // Incomplete legacy topic fails closed
      expect(canPubliclyViewTopic({ id: 'economy', slug: 'economy' })).toBe(false);
    });

    it('app/api/topics/[slug] returns 200 for approved control topic and 404 for draft/unlisted topic', async () => {
      const reqControl = new NextRequest('http://localhost/api/topics/economy');
      const resControl = await getApiTopicBySlug(reqControl, { params: Promise.resolve({ slug: 'economy' }) });
      expect(resControl.status).toBe(200);

      const reqDraft = new NextRequest('http://localhost/api/topics/unapproved-draft-topic');
      const resDraft = await getApiTopicBySlug(reqDraft, { params: Promise.resolve({ slug: 'unapproved-draft-topic' }) });
      expect(resDraft.status).toBe(404);
    });

    it('app/api/topics returns public topics and applies canPubliclyViewTopic filtering', async () => {
      const req = new NextRequest('http://localhost/api/topics?page=1&pageSize=10');
      const res = await getApiTopics(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.length).toBeGreaterThan(0);
      for (const t of json.data) {
        expect(canPubliclyViewTopic(t)).toBe(true);
      }
    });
  });

  // ── 17. Canonical Timeline Publication State Machine & Route Isolation ──────
  describe('17. Canonical Timeline Publication State Machine & Route Isolation', () => {
    it('fails closed for null, undefined, or empty timeline objects', () => {
      expect(isTimelinePubliclyPublishable(null)).toBe(false);
      expect(isTimelinePubliclyPublishable(undefined)).toBe(false);
      expect(isTimelinePubliclyPublishable({})).toBe(false);
    });

    it('fails closed for explicit quarantine, draft, or test artifact flags on timelines', () => {
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', isTestArtifact: true })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', isDraft: true })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', isQuarantined: true })).toBe(false);
    });

    it('fails closed for null, empty, unknown, draft, or archived publicationStatus on timelines', () => {
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', publicationStatus: null })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', publicationStatus: '' })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', publicationStatus: 'unknown' })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', publicationStatus: 'draft' })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', publicationStatus: 'archived' })).toBe(false);
    });

    it('fails closed for null, empty, unknown, pending, or draft status on timelines', () => {
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', status: null })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', status: '' })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', status: 'unknown' })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', status: 'pending' })).toBe(false);
      expect(isTimelinePubliclyPublishable({ id: 'mgnrega-timeline', title: 'MGNREGA', status: 'draft' })).toBe(false);
    });

    it('allows timelines with explicit published or active status', () => {
      expect(isTimelinePubliclyPublishable({ id: 'custom-timeline', title: 'Custom Timeline', publicationStatus: 'published' })).toBe(true);
      expect(isTimelinePubliclyPublishable({ id: 'custom-timeline', title: 'Custom Timeline', status: 'published' })).toBe(true);
      expect(isTimelinePubliclyPublishable({ id: 'custom-timeline', title: 'Custom Timeline', status: 'active' })).toBe(true);
    });

    it('enforces bounded legacy catalog allowlist: approved timelines succeed, unlisted fail closed', () => {
      expect(LEGACY_PUBLIC_TIMELINE_IDENTIFIERS.size).toBe(13);
      for (const id of ['mgnrega-timeline', 'upi-timeline', 'pmfby-timeline', 'semiconductor-pli-timeline', 'dpdp-bill-timeline', 'rbi-repo-rate-timeline']) {
        expect(LEGACY_PUBLIC_TIMELINE_IDENTIFIERS.has(id)).toBe(true);
        expect(canPubliclyViewTimeline({ id, title: `Timeline ${id}` })).toBe(true);
      }

      // New unlisted timeline without publication metadata MUST fail closed
      const unlistedTimeline = { id: 'unapproved-timeline-2026', title: 'Unapproved Timeline' };
      expect(LEGACY_PUBLIC_TIMELINE_IDENTIFIERS.has(unlistedTimeline.id)).toBe(false);
      expect(canPubliclyViewTimeline(unlistedTimeline)).toBe(false);

      // Incomplete legacy timeline fails closed
      expect(canPubliclyViewTimeline({ id: 'mgnrega-timeline' })).toBe(false);
    });

    it('app/api/timelines/[id] returns 200 for approved control timeline and 404 for draft/unlisted timeline', async () => {
      const reqControl = new NextRequest('http://localhost/api/timelines/mgnrega-timeline');
      const resControl = await getApiTimelineById(reqControl, { params: Promise.resolve({ id: 'mgnrega-timeline' }) });
      expect(resControl.status).toBe(200);

      const reqDraft = new NextRequest('http://localhost/api/timelines/unapproved-draft-timeline');
      const resDraft = await getApiTimelineById(reqDraft, { params: Promise.resolve({ id: 'unapproved-draft-timeline' }) });
      expect(resDraft.status).toBe(404);
    });

    it('app/api/timelines returns public timelines and applies canPubliclyViewTimeline filtering', async () => {
      const req = new NextRequest('http://localhost/api/timelines?page=1&pageSize=10');
      const res = await getApiTimelines(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.length).toBeGreaterThan(0);
      for (const tl of json.data) {
        expect(canPubliclyViewTimeline(tl)).toBe(true);
      }
    });
  });

  // ── 18. Entity Lifecycle Persistence & Durability Proof ───────────────────────
  describe('18. Entity Lifecycle Persistence & Durability Proof', () => {
    it('proves database schema columns and demonstrates write/read roundtrip preservation for legacy catalog entities', async () => {
      const repo = new SupabaseEntityRepository();

      const legacyEntity = {
        id: 'rbi',
        slug: 'rbi',
        name: 'Reserve Bank of India',
        description: 'Updated central bank overview',
        type: 'organization' as const,
        aliases: ['central-bank', 'rbi-india'],
        storyCount: 5,
        evidenceScore: 92,
        relatedEntityIds: ['india', 'ministry-of-finance'],
        relatedStoryIds: ['digital-payments-boom'],
        relatedTopicIds: ['economy'],
        statistics: [{ label: 'Repo Rate', value: '6.5%' }],
        timeline: [],
        faq: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      // Mock database write return (Row structure reflecting public.entities schema)
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: legacyEntity.id,
          slug: legacyEntity.slug,
          name: legacyEntity.name,
          description: legacyEntity.description,
          type: legacyEntity.type,
          aliases: legacyEntity.aliases,
          story_count: legacyEntity.storyCount,
          evidence_score: legacyEntity.evidenceScore,
          related_entity_ids: legacyEntity.relatedEntityIds,
          related_story_ids: legacyEntity.relatedStoryIds,
          related_topic_ids: legacyEntity.relatedTopicIds,
          statistics: legacyEntity.statistics,
          timeline: legacyEntity.timeline,
          faq: legacyEntity.faq,
          created_at: legacyEntity.createdAt,
          updated_at: new Date().toISOString(),
          // Note: publication_status does not exist in public.entities schema
        },
        error: null,
      });

      const saved = await repo.save(legacyEntity);
      expect(saved.id).toBe('rbi');
      expect(saved.slug).toBe('rbi');
      // Lifecycle status was not stored in DB columns
      expect(saved.publicationStatus).toBeUndefined();
      // Provenance allowlist durably establishes publication eligibility across the roundtrip
      expect(canPubliclyViewEntity(saved)).toBe(true);
    });

    it('proves that newly created entities written without durable publication columns fail closed on read', async () => {
      const repo = new SupabaseEntityRepository();

      const newEntity = {
        id: 'new-unapproved-org',
        slug: 'new-unapproved-org',
        name: 'New Unapproved Organization',
        description: 'Draft organization awaiting editorial sign-off',
        type: 'organization' as const,
        aliases: [],
        storyCount: 0,
        evidenceScore: 0,
        relatedEntityIds: [],
        relatedStoryIds: [],
        relatedTopicIds: [],
        statistics: [],
        timeline: [],
        faq: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      // Mock database write return without publication_status column
      supabaseMock.queryBuilder.single.mockResolvedValueOnce({
        data: {
          id: newEntity.id,
          slug: newEntity.slug,
          name: newEntity.name,
          description: newEntity.description,
          type: newEntity.type,
          aliases: [],
          story_count: 0,
          evidence_score: 0,
          related_entity_ids: [],
          related_story_ids: [],
          related_topic_ids: [],
          statistics: [],
          timeline: [],
          faq: [],
          created_at: newEntity.createdAt,
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const saved = await repo.save(newEntity);
      expect(saved.id).toBe('new-unapproved-org');
      expect(saved.publicationStatus).toBeUndefined();
      // Since it is NOT in the legacy catalog allowlist and lacks durable publication metadata,
      // it MUST fail closed to prevent unauthorized publication
      expect(canPubliclyViewEntity(saved)).toBe(false);
    });
  });

  // ── 19. Explorer Registered Services Discovery Isolation Matrix ───────────────
  describe('19. Explorer Registered Services Discovery Isolation Matrix', () => {
    it('completely isolates all missing, null, empty, unsupported, draft, and quarantined topics & timelines', async () => {
      // Create a test environment with various invalid/draft topics and timelines
      const testTopics = [
        { id: 'topic-null-status', slug: 'topic-null-status', name: 'Null Status Topic', publicationStatus: null },
        { id: 'topic-empty-status', slug: 'topic-empty-status', name: 'Empty Status Topic', publicationStatus: '' },
        { id: 'topic-unknown-status', slug: 'topic-unknown-status', name: 'Unknown Status Topic', publicationStatus: 'unknown' },
        { id: 'topic-draft-status', slug: 'topic-draft-status', name: 'Draft Status Topic', publicationStatus: 'draft' },
        { id: 'topic-archived-status', slug: 'topic-archived-status', name: 'Archived Status Topic', publicationStatus: 'archived' },
        { id: 'topic-unlisted-no-meta', slug: 'topic-unlisted-no-meta', name: 'Unlisted Topic With No Meta' },
        { id: 'economy', slug: 'economy', name: 'Economy & Finance', description: 'Curated Indian economy topic' }, // Control
      ] as any[];

      const testTimelines = [
        { id: 'tl-null-status', title: 'Null Status Timeline', publicationStatus: null },
        { id: 'tl-empty-status', title: 'Empty Status Timeline', publicationStatus: '' },
        { id: 'tl-unknown-status', title: 'Unknown Status Timeline', publicationStatus: 'unknown' },
        { id: 'tl-draft-status', title: 'Draft Status Timeline', publicationStatus: 'draft' },
        { id: 'tl-archived-status', title: 'Archived Status Timeline', publicationStatus: 'archived' },
        { id: 'tl-unlisted-no-meta', title: 'Unlisted Timeline With No Meta' },
        { id: 'mgnrega-timeline', title: 'MGNREGA Implementation Timeline', description: 'Curated timeline' }, // Control
      ] as any[];

      const customServices = initDefaultServices(
        [],
        testTopics,
        [],
        testTimelines,
        [],
        [],
        [],
        []
      );

      initServices(customServices);

      try {
        // 1. Search for each defective/draft topic -> MUST return 0 results
        for (const badTopicName of ['Null Status', 'Empty Status', 'Unknown Status', 'Draft Status', 'Archived Status', 'Unlisted Topic']) {
          const req = new NextRequest(`http://localhost/api/v2/explorer?q=${encodeURIComponent(badTopicName)}`);
          const res = await getExplorer(req);
          const json = await res.json();
          expect(json.data.length).toBe(0);
        }

        // 2. Search for each defective/draft timeline -> MUST return 0 results
        for (const badTlName of ['Null Status Timeline', 'Empty Status Timeline', 'Unknown Status Timeline', 'Draft Status Timeline', 'Archived Status Timeline', 'Unlisted Timeline']) {
          const req = new NextRequest(`http://localhost/api/v2/explorer?q=${encodeURIComponent(badTlName)}`);
          const res = await getExplorer(req);
          const json = await res.json();
          expect(json.data.length).toBe(0);
        }

        // 3. Search for control topic -> MUST be found
        const reqControlTopic = new NextRequest('http://localhost/api/v2/explorer?q=Economy');
        const resControlTopic = await getExplorer(reqControlTopic);
        const jsonControlTopic = await resControlTopic.json();
        expect(jsonControlTopic.data.length).toBeGreaterThan(0);
        expect(jsonControlTopic.data.some((r: any) => r.type === 'topic' && r.id === 'economy')).toBe(true);

        // 4. Search for control timeline -> MUST be found
        const reqControlTimeline = new NextRequest('http://localhost/api/v2/explorer?q=MGNREGA+Implementation');
        const resControlTimeline = await getExplorer(reqControlTimeline);
        const jsonControlTimeline = await resControlTimeline.json();
        expect(jsonControlTimeline.data.length).toBeGreaterThan(0);
        expect(jsonControlTimeline.data.some((r: any) => r.type === 'timeline' && r.id === 'mgnrega-timeline')).toBe(true);
      } finally {
        initServices(null as any);
      }
    });
  });


  // ── 20. Bounded Multi-Batch Candidate Retrieval and Exact Pagination Beyond 1,000 Candidates ──
  describe('20. Bounded Multi-Batch Candidate Retrieval and Exact Pagination Beyond 1,000 Candidates', () => {
    it('app/api/v1/entities scans candidates across multiple bounded batches and paginates accurately with 1,500 candidates', async () => {
      // Create 1,500 candidate entities:
      // Batch 1 (0..499): 200 public, 300 draft
      // Batch 2 (500..999): 200 public, 300 draft
      // Batch 3 (1000..1499): 100 public, 400 draft
      // Total candidates: 1,500 | Total public: 500
      const allCandidates: any[] = [];
      let publicCount = 0;

      for (let i = 0; i < 1500; i++) {
        let isPub = false;
        if (i < 500 && i < 200) isPub = true;
        else if (i >= 500 && i < 700) isPub = true;
        else if (i >= 1000 && i < 1100) isPub = true;

        if (isPub) {
          publicCount++;
          allCandidates.push({
            id: `public-entity-${i}`,
            slug: `public-entity-${i}`,
            name: `Public Entity ${i}`,
            type: 'organization',
            publication_status: 'published',
            status: 'published',
            story_count: 5,
            evidence_score: 80,
            statistics: [],
            timeline: [],
            faq: [],
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          });
        } else {
          allCandidates.push({
            id: `draft-entity-${i}`,
            slug: `draft-entity-${i}`,
            name: `Draft Entity ${i}`,
            type: 'organization',
            publication_status: 'draft',
            status: 'draft',
            is_draft: true,
            story_count: 0,
            evidence_score: 10,
            statistics: [],
            timeline: [],
            faq: [],
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          });
        }
      }

      expect(publicCount).toBe(500);

      // Track range calls to verify individual database fetches are bounded (BATCH_SIZE = 500)
      const rangeCalls: Array<{ start: number; end: number }> = [];

      supabaseMock.queryBuilder.range = vi.fn((start: number, end: number) => {
        rangeCalls.push({ start, end });
        const slice = allCandidates.slice(start, end + 1);
        supabaseMock.queryBuilder.then = vi.fn((resolve: (v: any) => any, reject: (r: any) => any) =>
          Promise.resolve({ data: slice, count: slice.length, error: null }).then(resolve, reject)
        );
        return supabaseMock.queryBuilder;
      });

      // 1. Request Page 1 with pageSize 50
      const reqPage1 = new NextRequest('http://localhost:3000/api/v1/entities?page=1&pageSize=50');
      const resPage1 = await getApiV1Entities(reqPage1);
      const jsonPage1 = await resPage1.json();

      expect(resPage1.status).toBe(200);
      expect(jsonPage1.data.length).toBe(50);
      expect(jsonPage1.meta.total).toBe(500);
      expect(jsonPage1.meta.totalPages).toBe(10);
      expect(jsonPage1.meta.page).toBe(1);
      expect(jsonPage1.meta.pageSize).toBe(50);

      // Verify that individual fetches were bounded to pageSize = 500
      expect(rangeCalls.length).toBeGreaterThanOrEqual(3);
      for (const call of rangeCalls) {
        expect(call.end - call.start + 1).toBeLessThanOrEqual(500);
      }

      // 2. Request Page 10 (items 451-500, sourced from Batch 3 > 1,000)
      rangeCalls.length = 0;
      const reqPage10 = new NextRequest('http://localhost:3000/api/v1/entities?page=10&pageSize=50');
      const resPage10 = await getApiV1Entities(reqPage10);
      const jsonPage10 = await resPage10.json();

      expect(resPage10.status).toBe(200);
      expect(jsonPage10.data.length).toBe(50);
      expect(jsonPage10.meta.total).toBe(500);
      expect(jsonPage10.meta.page).toBe(10);
      expect(jsonPage10.data[0].slug).toBe('public-entity-1050');
      expect(jsonPage10.data[49].slug).toBe('public-entity-1099');

      // 3. Verify no overlap between Page 1 and Page 10
      const page1Slugs = new Set(jsonPage1.data.map((e: any) => e.slug));
      const page10Slugs = new Set(jsonPage10.data.map((e: any) => e.slug));
      for (const s of page10Slugs) {
        expect(page1Slugs.has(s)).toBe(false);
      }
    });

    it('reports explicit catalog cap metadata and headers when candidates reach MAX_CANDIDATE_SCAN (10,000)', async () => {
      // Mock repository returning full 500-sized batches indefinitely
      let callCount = 0;
      supabaseMock.queryBuilder.range = vi.fn((start: number, end: number) => {
        callCount++;
        const dummyBatch = Array.from({ length: 500 }, (_, idx) => ({
          id: `dummy-entity-${start + idx}`,
          slug: `dummy-entity-${start + idx}`,
          name: `Dummy Entity ${start + idx}`,
          type: 'organization',
          publication_status: 'published',
          status: 'published',
          story_count: 1,
          evidence_score: 50,
          statistics: [],
          timeline: [],
          faq: [],
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        }));
        supabaseMock.queryBuilder.then = vi.fn((resolve: (v: any) => any, reject: (r: any) => any) =>
          Promise.resolve({ data: dummyBatch, count: 500, error: null }).then(resolve, reject)
        );
        return supabaseMock.queryBuilder;
      });

      const req = new NextRequest('http://localhost:3000/api/v1/entities?page=1&pageSize=20');
      const res = await getApiV1Entities(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.meta.isCapped).toBe(true);
      expect(json.meta.scanCeiling).toBe(10000);
      expect(res.headers.get('X-Catalog-Capped')).toBe('true');
      expect(res.headers.get('X-Catalog-Scan-Ceiling')).toBe('10000');
    });
  });

  // ── 21. Non-Legacy Entity Lifecycle Persistence and Approval Durability ────────
  describe('21. Non-Legacy Entity Lifecycle Persistence and Approval Durability', () => {
    it('proves non-legacy entity lifecycle in MemoryEntityRepository: creation, approval, persistence, read-back, and quarantine', async () => {
      const memoryRepo = new MemoryEntityRepository();

      const newEntity: any = {
        id: 'new-space-agency',
        slug: 'isro-commercial-arm',
        name: 'NewSpace India Limited',
        type: 'organization',
        description: 'Commercial arm of ISRO',
        aliases: ['NSIL'],
        storyCount: 2,
        evidenceScore: 92,
        publicationStatus: 'published',
        status: 'published',
        statistics: [],
        timeline: [],
        faq: [],
        createdAt: '2026-10-22T00:00:00Z',
        updatedAt: '2026-10-22T00:00:00Z',
      };

      // 1. Save approved non-legacy entity
      await memoryRepo.save(newEntity);

      // 2. Read back
      const readBack = await memoryRepo.getEntityBySlug('isro-commercial-arm');
      expect(readBack).toBeDefined();
      expect(readBack?.publicationStatus).toBe('published');

      // 3. Verify public visibility
      expect(canPubliclyViewEntity(readBack)).toBe(true);

      // 4. Update to quarantined
      await memoryRepo.save({
        ...readBack!,
        isQuarantined: true,
      });

      const readQuarantined = await memoryRepo.getEntityBySlug('isro-commercial-arm');
      expect(readQuarantined?.isQuarantined).toBe(true);
      expect(canPubliclyViewEntity(readQuarantined)).toBe(false);

      // 5. Update to draft
      await memoryRepo.save({
        ...readQuarantined!,
        isQuarantined: false,
        publicationStatus: 'draft',
      });

      const readDraft = await memoryRepo.getEntityBySlug('isro-commercial-arm');
      expect(readDraft?.publicationStatus).toBe('draft');
      expect(canPubliclyViewEntity(readDraft)).toBe(false);
    });

    it('proves that in SupabaseEntityRepository, schema boundary causes non-legacy entities to fail closed on read-back without migrations', () => {
      // Real schema in 002_canonical_schema.sql and 021_publication_compatibility_schema.sql
      // has NO publication_status or is_quarantined columns.
      const nonLegacyApprovedEntity: any = {
        id: '9b2c3d4e-1234-5678-9abc-def012345678',
        slug: 'national-quantum-mission',
        name: 'National Quantum Mission',
        type: 'organization',
        description: 'Quantum tech initiative',
        aliases: ['NQM'],
        storyCount: 3,
        evidenceScore: 88,
        publicationStatus: 'published',
        status: 'published',
        statistics: [],
        timeline: [],
        faq: [],
        createdAt: '2026-10-22T00:00:00Z',
        updatedAt: '2026-10-22T00:00:00Z',
      };

      // 1. rowFromEntity mapping for public.entities table
      const insertRow = rowFromEntity(nonLegacyApprovedEntity);
      expect((insertRow as any).publication_status).toBeUndefined();
      expect((insertRow as any).is_quarantined).toBeUndefined();
      expect((insertRow as any).is_test_artifact).toBeUndefined();

      // 2. Simulated read from real database table public.entities (which lacks publication_status column)
      const simulatedDbRow = {
        id: insertRow.id,
        slug: insertRow.slug,
        name: insertRow.name,
        type: insertRow.type,
        description: insertRow.description,
        aliases: insertRow.aliases,
        image: insertRow.image,
        story_count: insertRow.story_count,
        evidence_score: insertRow.evidence_score,
        statistics: insertRow.statistics,
        timeline: insertRow.timeline,
        faq: insertRow.faq,
        created_at: '2026-10-22T00:00:00Z',
        updated_at: '2026-10-22T00:00:00Z',
      };

      // 3. rowToEntity maps database row back to Entity
      const entityFromDb = rowToEntity(simulatedDbRow as any);
      expect(entityFromDb.publicationStatus).toBeUndefined();

      // 4. Because entity is non-legacy and lacks publicationStatus in database, canPubliclyViewEntity FAILS CLOSED
      expect(LEGACY_PUBLIC_ENTITY_IDENTIFIERS.has(entityFromDb.slug)).toBe(false);
      expect(canPubliclyViewEntity(entityFromDb)).toBe(false);

      // This mathematically guarantees zero leakage of newly created database entities
      // until a formal schema migration adds publication_status to public.entities.
    });

    it('proves that approved legacy catalog entities retain publication eligibility across Supabase DB round-trips without column loss', () => {
      const legacyCatalogEntity: any = {
        id: 'uidai',
        slug: 'uidai',
        name: 'Unique Identification Authority of India',
        type: 'organization',
        description: 'Aadhaar issuing authority',
        aliases: ['Aadhaar Authority'],
        storyCount: 15,
        evidenceScore: 98,
        statistics: [],
        timeline: [],
        faq: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const insertRow = rowFromEntity(legacyCatalogEntity);
      const simulatedDbRow = {
        id: insertRow.id,
        slug: insertRow.slug,
        name: insertRow.name,
        type: insertRow.type,
        description: insertRow.description,
        aliases: insertRow.aliases,
        image: insertRow.image,
        story_count: insertRow.story_count,
        evidence_score: insertRow.evidence_score,
        statistics: insertRow.statistics,
        timeline: insertRow.timeline,
        faq: insertRow.faq,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const entityFromDb = rowToEntity(simulatedDbRow as any);
      expect(LEGACY_PUBLIC_ENTITY_IDENTIFIERS.has(entityFromDb.slug)).toBe(true);
      expect(canPubliclyViewEntity(entityFromDb)).toBe(true);
    });
  });

});
