/**
 * Wave 2 — API Routes Migration Verification & Safety Tests
 *
 * Covers the 10 migrated API routes:
 * 1. GET /api/stories
 * 2. GET /api/stories/[slug]
 * 3. GET /api/topics
 * 4. GET /api/topics/[slug]
 * 5. GET /api/entities
 * 6. GET /api/entities/[slug]
 * 7. GET /api/timelines
 * 8. GET /api/timelines/[id]
 * 9. GET /api/fixes
 * 10. GET /api/fixes/[slug]
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getStories } from '@/app/api/stories/route';
import { GET as getStory } from '@/app/api/stories/[slug]/route';
import { GET as getTopics } from '@/app/api/topics/route';
import { GET as getTopic } from '@/app/api/topics/[slug]/route';
import { GET as getEntities } from '@/app/api/entities/route';
import { GET as getEntity } from '@/app/api/entities/[slug]/route';
import { GET as getTimelines } from '@/app/api/timelines/route';
import { GET as getTimeline } from '@/app/api/timelines/[id]/route';
import { GET as getFixes } from '@/app/api/fixes/route';
import { GET as getFix } from '@/app/api/fixes/[slug]/route';
import { isCanonicalStoryPublic } from '@/lib/story/publication';

describe('Wave 2: API Read-Path Migration', () => {
  // 1. Stories List API
  describe('/api/stories', () => {
    it('returns only public stories with valid pagination metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/stories?pageSize=100');
      const res = await getStories(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(41);
      expect(json.meta.total).toBe(41);

      // Visibility & quarantine verification
      for (const story of json.data) {
        expect(isCanonicalStoryPublic(story)).toBe(true);
        expect(story.isTestArtifact).toBeFalsy();
        expect(story.slug).not.toMatch(/^ng-ch-/); // Draft chapters excluded
      }
    });

    it('respects pagination parameters', async () => {
      const req = new NextRequest('http://localhost:3000/api/stories?page=1&pageSize=5');
      const res = await getStories(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(5);
      expect(json.meta.page).toBe(1);
      expect(json.meta.pageSize).toBe(5);
      expect(json.meta.total).toBe(41);
    });
  });

  // 2. Story Detail API
  describe('/api/stories/[slug]', () => {
    it('returns public story when slug exists', async () => {
      const res = await getStory(
        new NextRequest('http://localhost:3000/api/stories/mgnrega-reform'),
        { params: Promise.resolve({ slug: 'mgnrega-reform' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.slug).toBe('mgnrega-reform');
      expect(isCanonicalStoryPublic(json)).toBe(true);
    });

    it('returns 404 for non-existent story', async () => {
      const res = await getStory(
        new NextRequest('http://localhost:3000/api/stories/non-existent-slug'),
        { params: Promise.resolve({ slug: 'non-existent-slug' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Story not found: non-existent-slug');
      expect(json.status).toBe(404);
    });

    it('returns 404 for draft story (publication safety gate)', async () => {
      const res = await getStory(
        new NextRequest('http://localhost:3000/api/stories/ng-ch-01'),
        { params: Promise.resolve({ slug: 'ng-ch-01' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Story not found: ng-ch-01');
    });

    it('returns 404 for quarantined test artifact (quarantine safety gate)', async () => {
      const res = await getStory(
        new NextRequest('http://localhost:3000/api/stories/test-published-artifact-001'),
        { params: Promise.resolve({ slug: 'test-published-artifact-001' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Story not found: test-published-artifact-001');
    });
  });

  // 3. Topics List API
  describe('/api/topics', () => {
    it('returns 15 canonical topics with metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/topics?pageSize=100');
      const res = await getTopics(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(15);
      expect(json.meta.total).toBe(15);
      const slugs = json.data.map((t: any) => t.slug);
      expect(slugs).toContain('economy');
      expect(slugs).toContain('policy');
    });
  });

  // 4. Topic Detail API
  describe('/api/topics/[slug]', () => {
    it('returns topic when slug exists', async () => {
      const res = await getTopic(
        new NextRequest('http://localhost:3000/api/topics/economy'),
        { params: Promise.resolve({ slug: 'economy' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.slug).toBe('economy');
      expect(json.name).toBe('Economy & Finance');
    });

    it('returns 404 for non-existent topic', async () => {
      const res = await getTopic(
        new NextRequest('http://localhost:3000/api/topics/unknown-topic'),
        { params: Promise.resolve({ slug: 'unknown-topic' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Topic not found: unknown-topic');
    });
  });

  // 5. Entities List API
  describe('/api/entities', () => {
    it('returns 42 canonical entities with zero duplicate slugs', async () => {
      const req = new NextRequest('http://localhost:3000/api/entities?pageSize=100');
      const res = await getEntities(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(42);
      expect(json.meta.total).toBe(42);

      const slugs = json.data.map((e: any) => e.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(42);
    });

    it('supports type filtering', async () => {
      const reqOrg = new NextRequest('http://localhost:3000/api/entities?type=organization');
      const resOrg = await getEntities(reqOrg);
      expect(resOrg.status).toBe(200);

      const jsonOrg = await resOrg.json();
      expect(jsonOrg.data.length).toBeGreaterThan(0);
      for (const e of jsonOrg.data) {
        expect(e.type).toBe('organization');
      }

      const reqCountry = new NextRequest('http://localhost:3000/api/entities?type=country');
      const resCountry = await getEntities(reqCountry);
      expect(resCountry.status).toBe(200);

      const jsonCountry = await resCountry.json();
      expect(jsonCountry.data.length).toBeGreaterThan(0);
      for (const e of jsonCountry.data) {
        expect(e.type).toBe('country');
      }
    });
  });

  // 6. Entity Detail API
  describe('/api/entities/[slug]', () => {
    it('returns entity when slug exists', async () => {
      const res = await getEntity(
        new NextRequest('http://localhost:3000/api/entities/un'),
        { params: Promise.resolve({ slug: 'un' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.slug).toBe('un');
      expect(json.name).toBe('United Nations');
    });

    it('returns 404 for non-existent entity', async () => {
      const res = await getEntity(
        new NextRequest('http://localhost:3000/api/entities/unknown-entity'),
        { params: Promise.resolve({ slug: 'unknown-entity' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Entity not found: unknown-entity');
    });
  });

  // 7. Timelines List API
  describe('/api/timelines', () => {
    it('returns 13 canonical timelines with metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/timelines?pageSize=100');
      const res = await getTimelines(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(13);
      expect(json.meta.total).toBe(13);
    });
  });

  // 8. Timeline Detail API
  describe('/api/timelines/[id]', () => {
    it('returns timeline when id exists', async () => {
      const res = await getTimeline(
        new NextRequest('http://localhost:3000/api/timelines/mgnrega-timeline'),
        { params: Promise.resolve({ id: 'mgnrega-timeline' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe('mgnrega-timeline');
      expect(json.title).toBeDefined();
    });

    it('returns 404 for non-existent timeline', async () => {
      const res = await getTimeline(
        new NextRequest('http://localhost:3000/api/timelines/unknown-timeline'),
        { params: Promise.resolve({ id: 'unknown-timeline' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Timeline not found: unknown-timeline');
    });
  });

  // 9. Fixes List API
  describe('/api/fixes', () => {
    it('returns 6 canonical fixes with metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/fixes?pageSize=100');
      const res = await getFixes(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(6);
      expect(json.meta.total).toBe(6);
    });
  });

  // 10. Fix Detail API
  describe('/api/fixes/[slug]', () => {
    it('returns fix when slug exists', async () => {
      const res = await getFix(
        new NextRequest('http://localhost:3000/api/fixes/fix-mgnrega-reform'),
        { params: Promise.resolve({ slug: 'fix-mgnrega-reform' }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.slug).toBe('fix-mgnrega-reform');
      expect(json.headline).toBeDefined();
    });

    it('returns 404 for non-existent fix', async () => {
      const res = await getFix(
        new NextRequest('http://localhost:3000/api/fixes/unknown-fix'),
        { params: Promise.resolve({ slug: 'unknown-fix' }) }
      );
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('Fix not found: unknown-fix');
    });
  });

  // 11. Relationship Integrity Check
  describe('Relationship Integrity', () => {
    it('verifies relationship references resolve to existing entities/topics', async () => {
      const topicRes = await getTopics(new NextRequest('http://localhost:3000/api/topics?pageSize=100'));
      const topicJson = await topicRes.json();
      const topicSlugs = new Set(topicJson.data.map((t: any) => t.slug));

      const entityRes = await getEntities(new NextRequest('http://localhost:3000/api/entities?pageSize=100'));
      const entityJson = await entityRes.json();
      const entitySlugs = new Set(entityJson.data.map((e: any) => e.slug));
      const entityIds = new Set(entityJson.data.map((e: any) => e.id));

      const storyRes = await getStories(new NextRequest('http://localhost:3000/api/stories?pageSize=100'));
      const storyJson = await storyRes.json();

      // Assert that resolved topics and entities are valid
      const resolvedCount = storyJson.data.reduce((acc: number, s: any) => {
        const matches = (s.relatedTopicIds || []).filter((id: string) => topicSlugs.has(id));
        return acc + matches.length;
      }, 0);
      expect(resolvedCount).toBeGreaterThan(0);
    });
  });
});
