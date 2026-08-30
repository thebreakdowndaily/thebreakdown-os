import { describe, it, expect } from 'vitest';
import { seedAll, getKnowledgeCore } from '../lib/knowledge/knowledge-core';
import { getAllEvidence } from '../lib/knowledge/evidence-registry';
import { getCanonicalTrustMetrics } from '../lib/knowledge/trust-metrics';
import { extractTocItems } from '../lib/toc';
import { RepositoryFactory } from '../services/factory/repository';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
import { createArticleSchema, createBreadcrumbSchema } from '../lib/seo/jsonld';
import { isPubliclyPublished } from '../lib/story/publication';

describe('TEST-SPRINT-8: Chapter Rendering & Trust Metrics Completeness', () => {
  seedAll();

  describe('1. Evidence Registry Boundary & Extension', () => {
    it('EV-01: getAllEvidence returns canonical evidence records', () => {
      const allEv = getAllEvidence();
      expect(Array.isArray(allEv)).toBe(true);
      expect(allEv.length).toBeGreaterThanOrEqual(30);
      
      const first = allEv[0];
      expect(first.id).toBeDefined();
      expect(first.claimId).toBeDefined();
      expect(first.sourceId).toBeDefined();
      expect(first.excerpt).toBeDefined();
      expect(first.confidence).toBeGreaterThan(0);
    });

    it('EV-02: getKnowledgeCore().evidence.all() returns identical canonical evidence', () => {
      const core = getKnowledgeCore();
      const allEv = core.evidence.all();
      expect(Array.isArray(allEv)).toBe(true);
      expect(allEv.length).toBe(getAllEvidence().length);
    });

    it('EV-03: evidence.all() preserves registry immutability across repeated calls', () => {
      const core = getKnowledgeCore();
      const firstCall = core.evidence.all();
      const secondCall = core.evidence.all();
      expect(firstCall.length).toBe(secondCall.length);

      // Mutating returned array does not mutate internal registry
      firstCall.pop();
      expect(core.evidence.all().length).toBe(secondCall.length);
    });
  });

  describe('2. Canonical Trust Metrics Aggregation', () => {
    it('METRIC-01: Aggregates deterministic live metrics from canonical sources', async () => {
      const metrics = await getCanonicalTrustMetrics(new Date('2026-08-14T00:00:00Z'));
      
      expect(metrics.publishedChapters).toBeGreaterThanOrEqual(1);
      expect(metrics.totalClaims).toBeGreaterThanOrEqual(18);
      expect(metrics.primarySourcesCited).toBeGreaterThanOrEqual(10);
      expect(metrics.sourcesInRegistry).toBeGreaterThanOrEqual(25);
      expect(metrics.evidenceEntries).toBeGreaterThanOrEqual(30);
      expect(metrics.documentsReproduced).toBeGreaterThanOrEqual(5);
      expect(metrics.thinkersProfiled).toBeGreaterThanOrEqual(5);
      expect(metrics.openScholarlyDisagreements).toBeGreaterThanOrEqual(10);
      expect(metrics.correctionsIssued).toBe(0);
      expect(metrics.chapterOneClaims).toBeGreaterThanOrEqual(18);
      expect(metrics.chapterOneSources).toBeGreaterThanOrEqual(31);
    });

    it('METRIC-02: Public visibility filter respects isPubliclyPublished contract', () => {
      const pastDate = new Date('2026-07-01T00:00:00Z');
      const futureDate = new Date('2026-12-01T00:00:00Z');
      const now = new Date('2026-08-01T00:00:00Z');

      expect(isPubliclyPublished({ publicationStatus: 'published', publishedAt: pastDate.toISOString() }, now)).toBe(true);
      expect(isPubliclyPublished({ publicationStatus: 'published', publishedAt: futureDate.toISOString() }, now)).toBe(false);
      expect(isPubliclyPublished({ publicationStatus: 'draft', publishedAt: pastDate.toISOString() }, now)).toBe(false);
      expect(isPubliclyPublished({ publicationStatus: 'review', publishedAt: pastDate.toISOString() }, now)).toBe(false);
      expect(isPubliclyPublished({ publicationStatus: 'archived', publishedAt: pastDate.toISOString() }, now)).toBe(false);
    });

    it('METRIC-03: Deduplication ensures no double-counting of claims and sources', async () => {
      const metrics = await getCanonicalTrustMetrics();
      const core = getKnowledgeCore();
      
      const allClaimIds = core.claims.all().map(c => c.id);
      const uniqueClaimIds = new Set(allClaimIds);
      expect(allClaimIds.length).toBe(uniqueClaimIds.size);

      const allSourceIds = core.sources.all().map(s => s.id);
      const uniqueSourceIds = new Set(allSourceIds);
      expect(allSourceIds.length).toBe(uniqueSourceIds.size);
    });
  });

  describe('3. Chapter Route, Repository & TOC Extraction', () => {
    it('CHAP-01: Resolves Chapter 1 from KnowledgeLibraryRepository', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const chapter = await repo.getChapter(
        'india-and-the-world',
        'foundations-1947-1962',
        'the-nehruvian-era',
        'indias-inheritance'
      );

      expect(chapter).not.toBeNull();
      expect(chapter?.slug).toBe('indias-inheritance');
      expect(chapter?.title).toContain("India's Inheritance");
      expect(chapter?.content.length).toBeGreaterThan(50);
      expect(chapter?.sources.length).toBeGreaterThan(0);
      expect(chapter?.keyQuestions.length).toBeGreaterThan(0);
      expect(chapter?.misconceptions.length).toBeGreaterThan(0);
      expect(chapter?.keyTerms.length).toBeGreaterThan(0);
    });

    it('CHAP-02: Returns null for non-existent chapter', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const chapter = await repo.getChapter(
        'india-and-the-world',
        'foundations-1947-1962',
        'the-nehruvian-era',
        'non-existent-chapter'
      );
      expect(chapter).toBeNull();
    });

    it('CHAP-03: Extracts deterministic TOC items from chapter heading blocks', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const chapter = await repo.getChapter(
        'india-and-the-world',
        'foundations-1947-1962',
        'the-nehruvian-era',
        'indias-inheritance'
      );

      const toc = extractTocItems(chapter?.content || []);
      expect(toc.length).toBeGreaterThanOrEqual(10);
      
      const firstToc = toc[0];
      expect(firstToc.id).toBeDefined();
      expect(firstToc.text).toBeDefined();
      expect([1, 2, 3]).toContain(firstToc.level);

      // Verify no duplicate IDs
      const ids = toc.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('CHAP-04: Chapter content includes visual and analytical block types', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const chapter = await repo.getChapter(
        'india-and-the-world',
        'foundations-1947-1962',
        'the-nehruvian-era',
        'indias-inheritance'
      );

      const blockTypes = new Set(chapter?.content.map(b => b.type));
      expect(blockTypes.has('heading')).toBe(true);
      expect(blockTypes.has('paragraph')).toBe(true);
      expect(blockTypes.has('claim')).toBe(true);
      expect(blockTypes.has('callout')).toBe(true);
      expect(blockTypes.has('evidence-summary')).toBe(true);
      expect(blockTypes.has('map')).toBe(true);
      expect(blockTypes.has('image')).toBe(true);
      expect(blockTypes.has('chart')).toBe(true);
      expect(blockTypes.has('document')).toBe(true);
      expect(blockTypes.has('timeline')).toBe(true);
      expect(blockTypes.has('thinker')).toBe(true);
      expect(blockTypes.has('decision-matrix')).toBe(true);
      expect(blockTypes.has('counterfactual')).toBe(true);
      expect(blockTypes.has('historiography')).toBe(true);
      expect(blockTypes.has('relationship-card')).toBe(true);
    });

    it('CHAP-05: SEO Schemas (JSON-LD and Breadcrumbs) generate valid structured data', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const chapter = await repo.getChapter(
        'india-and-the-world',
        'foundations-1947-1962',
        'the-nehruvian-era',
        'indias-inheritance'
      );
      if (!chapter) throw new Error('Chapter not found');

      const articleSchema = createArticleSchema({
        headline: chapter.title,
        summary: chapter.summary,
        url: 'https://thebreakdown.in/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance',
        publishedAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
        wordCount: chapter.metadata?.wordCount || 10000,
        tags: chapter.relatedConceptIds,
        isNews: false,
      });

      expect(articleSchema['@type']).toBe('Article');
      expect(articleSchema.headline).toBe(chapter.title);
      expect(articleSchema.description).toBe(chapter.summary);

      const breadcrumbSchema = createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Library', url: '/series' },
        { name: 'Foundations', url: '/series/foundations-1947-1962' },
        { name: 'The Nehruvian Era', url: '/series/foundations-1947-1962/volume/the-nehruvian-era' },
        { name: chapter.title, url: '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance' },
      ]);

      expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');
      expect(breadcrumbSchema.itemListElement.length).toBe(5);
    });
  });
});
