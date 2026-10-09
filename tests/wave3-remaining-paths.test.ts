/**
 * Wave 3 — Remaining Service-Backed Paths Migration Verification & Safety Tests
 *
 * Covers:
 * 1. GET /api/countries (`app/api/countries/route.ts`)
 * 2. GET /api/countries/[slug] (`app/api/countries/[slug]/route.ts`)
 * 3. GET /api/organizations (`app/api/organizations/route.ts`)
 * 4. GET /api/organizations/[slug] (`app/api/organizations/[slug]/route.ts`)
 * 5. GET /api/feed (RSS & JSON) (`app/api/feed/route.ts`)
 * 6. GET /api/graph/evidence (`app/api/graph/evidence/route.ts`)
 * 7. Entity Subtype Service Methods (country & organization)
 * 8. Public Story Author Aggregation Service Path (for Team page)
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { GET as getCountriesApi } from '@/app/api/countries/route';
import { GET as getCountryApi } from '@/app/api/countries/[slug]/route';
import { GET as getOrganizationsApi } from '@/app/api/organizations/route';
import { GET as getOrganizationApi } from '@/app/api/organizations/[slug]/route';
import { GET as getFeedApi } from '@/app/api/feed/route';
import { GET as getEvidenceGraphApi } from '@/app/api/graph/evidence/route';
import { isCanonicalStoryPublic } from '@/lib/story/publication';

describe('Wave 3: Remaining Service-Backed Paths Migration', () => {
  // 1. Countries List API
  describe('1. GET /api/countries', () => {
    it('returns all 2 countries with pagination metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/countries?pageSize=50');
      const res = await getCountriesApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(2);
      expect(json.meta.total).toBe(2);

      const slugs = json.data.map((c: any) => c.slug).sort();
      expect(slugs).toEqual(['bihar', 'india']);
    });

    it('filters countries by search query', async () => {
      const req = new NextRequest('http://localhost:3000/api/countries?search=bihar');
      const res = await getCountriesApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(1);
      expect(json.data[0].slug).toBe('bihar');
    });

    it('handles pagination parameters correctly', async () => {
      const req = new NextRequest('http://localhost:3000/api/countries?page=1&pageSize=1');
      const res = await getCountriesApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(1);
      expect(json.meta.totalPages).toBe(2);
    });
  });

  // 2. Country Detail API
  describe('2. GET /api/countries/[slug]', () => {
    it('returns country details for valid slug', async () => {
      const req = new NextRequest('http://localhost:3000/api/countries/india');
      const res = await getCountryApi(req, { params: Promise.resolve({ slug: 'india' }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.slug).toBe('india');
      expect(json.name).toBe('India');
      expect(json.type).toBe('country');
    });

    it('returns 404 for non-existent country slug', async () => {
      const req = new NextRequest('http://localhost:3000/api/countries/non-existent-country');
      const res = await getCountryApi(req, { params: Promise.resolve({ slug: 'non-existent-country' }) });
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toContain('Country not found');
    });

    it('returns 404 for non-country entity slug (subtype isolation)', async () => {
      // 'un' is an organization, not a country
      const req = new NextRequest('http://localhost:3000/api/countries/un');
      const res = await getCountryApi(req, { params: Promise.resolve({ slug: 'un' }) });
      expect(res.status).toBe(404);
    });
  });

  // 3. Organizations List API
  describe('3. GET /api/organizations', () => {
    it('returns all 39 organizations with pagination metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/organizations?pageSize=100');
      const res = await getOrganizationsApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(39);
      expect(json.meta.total).toBe(39);

      for (const org of json.data) {
        expect(org.type).toBe('organization');
      }
    });

    it('filters organizations by search query', async () => {
      const req = new NextRequest('http://localhost:3000/api/organizations?search=nations');
      const res = await getOrganizationsApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.some((o: any) => o.slug === 'un')).toBe(true);
    });

    it('respects pagination parameters', async () => {
      const req = new NextRequest('http://localhost:3000/api/organizations?page=2&pageSize=10');
      const res = await getOrganizationsApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBe(10);
      expect(json.meta.page).toBe(2);
      expect(json.meta.pageSize).toBe(10);
      expect(json.meta.total).toBe(39);
    });
  });

  // 4. Organization Detail API
  describe('4. GET /api/organizations/[slug]', () => {
    it('returns organization details for valid slug', async () => {
      const req = new NextRequest('http://localhost:3000/api/organizations/un');
      const res = await getOrganizationApi(req, { params: Promise.resolve({ slug: 'un' }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.slug).toBe('un');
      expect(json.name).toBe('United Nations');
      expect(json.type).toBe('organization');
    });

    it('returns 404 for non-existent organization slug', async () => {
      const req = new NextRequest('http://localhost:3000/api/organizations/non-existent-org');
      const res = await getOrganizationApi(req, { params: Promise.resolve({ slug: 'non-existent-org' }) });
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toContain('Organization not found');
    });

    it('returns 404 for non-organization entity slug (subtype isolation)', async () => {
      // 'bihar' is a country, not an organization
      const req = new NextRequest('http://localhost:3000/api/organizations/bihar');
      const res = await getOrganizationApi(req, { params: Promise.resolve({ slug: 'bihar' }) });
      expect(res.status).toBe(404);
    });
  });

  // 5. Feed API
  describe('5. GET /api/feed', () => {
    it('returns RSS XML with only public stories', async () => {
      const req = new NextRequest('http://localhost:3000/api/feed?format=rss');
      const res = await getFeedApi(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('application/rss+xml');

      const xml = await res.text();
      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('<title>The Breakdown</title>');

      // Count item tags
      const itemCount = (xml.match(/<item>/g) || []).length;
      expect(itemCount).toBe(41);

      // Verify no draft chapters or test artifacts leaked
      expect(xml).not.toContain('ng-ch-');
      expect(xml).not.toContain('test-published-artifact');
      expect(xml).not.toContain('adversarial-dml');
    });

    it('returns JSON Feed with only public stories', async () => {
      const req = new NextRequest('http://localhost:3000/api/feed?format=json');
      const res = await getFeedApi(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('application/feed+json');

      const json = await res.json();
      expect(json.version).toBe('https://jsonfeed.org/version/1.1');
      expect(json.items.length).toBe(41);

      // Verify each item
      for (const item of json.items) {
        expect(item.id).toMatch(/^https:\/\/thebreakdown\.in\/story\//);
        expect(item.id).not.toContain('ng-ch-');
      }
    });
  });

  // 6. Evidence Graph API
  describe('6. GET /api/graph/evidence', () => {
    it('returns evidence graph with nodes and edges', async () => {
      const req = new NextRequest('http://localhost:3000/api/graph/evidence');
      const res = await getEvidenceGraphApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.nodes).toBeDefined();
      expect(Array.isArray(json.nodes)).toBe(true);
      expect(json.nodes.length).toBeGreaterThan(0);

      expect(json.edges).toBeDefined();
      expect(Array.isArray(json.edges)).toBe(true);
      expect(json.edges.length).toBeGreaterThan(0);
    });

    it('returns lineage when claimId is provided', async () => {
      const allReq = new NextRequest('http://localhost:3000/api/graph/evidence');
      const allRes = await getEvidenceGraphApi(allReq);
      const allJson = await allRes.json();
      const claimNode = allJson.nodes.find((n: any) => n.type === 'claim');

      if (claimNode) {
        const req = new NextRequest(`http://localhost:3000/api/graph/evidence?claimId=${encodeURIComponent(claimNode.id)}`);
        const res = await getEvidenceGraphApi(req);
        expect(res.status).toBe(200);

        const lineage = await res.json();
        expect(lineage.nodes).toBeDefined();
        expect(lineage.edges).toBeDefined();
        expect(lineage.nodes.some((n: any) => n.id === claimNode.id)).toBe(true);
      }
    });
  });

  // 7. Subtype Service Methods (Underlying Countries & Organizations Pages)
  describe('7. Subtype Service Layer Retrieval', () => {
    const services = bootstrapServices();

    it('retrieves countries correctly for CountriesPage', async () => {
      const countries = await services.entities.getEntitiesByType('country');
      expect(countries.length).toBe(2);
      expect(countries.map(c => c.slug).sort()).toEqual(['bihar', 'india']);
      for (const c of countries) {
        expect(c.type).toBe('country');
        expect(c.name).toBeTruthy();
      }
    });

    it('retrieves organizations correctly for OrganizationsPage', async () => {
      const orgs = await services.entities.getEntitiesByType('organization');
      expect(orgs.length).toBe(39);
      for (const o of orgs) {
        expect(o.type).toBe('organization');
        expect(o.name).toBeTruthy();
      }
    });
  });

  // 8. Public Story Author Aggregation (Underlying Team Page)
  describe('8. Public Story Author Aggregation', () => {
    it('aggregates authors only from public stories with zero draft leakage', async () => {
      const services = bootstrapServices({ publicOnly: true });
      const { data: stories } = await services.stories.getPublicStories({ pageSize: 100 });
      expect(stories.length).toBe(41);

      const authorMap = new Map<string, { name: string; stories: string[] }>();
      for (const s of stories) {
        expect(isCanonicalStoryPublic(s)).toBe(true);
        expect(s.isTestArtifact).toBeFalsy();
        expect(s.slug).not.toMatch(/^ng-ch-/);

        const name = typeof s.author === 'string' ? s.author : (s.author as any)?.name || 'The Breakdown';
        if (!name) continue;
        if (!authorMap.has(name)) authorMap.set(name, { name, stories: [] });
        authorMap.get(name)!.stories.push(s.headline);
      }

      const authors = Array.from(authorMap.values());
      expect(authors.length).toBeGreaterThan(0);
      for (const author of authors) {
        expect(author.name).toBeTruthy();
        expect(author.stories.length).toBeGreaterThan(0);
      }
    });
  });
});
