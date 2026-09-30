/**
 * PHASE 2 FULL-SYSTEM FORENSIC LOOPBACK VERIFICATION TEST SUITE
 *
 * Verifies that all Phase 2 engineering remediations hold across the platform:
 * 1. Lifecycle: ChangeDetector semantic & claim diffing (not mock)
 * 2. Lifecycle: ImpactAnalyzer graph & dependency resolution (not mock ['story-1', 'story-2'])
 * 3. Human Review Boundary: EditorialTask invariant enforcement
 * 4. Visual System: Remediation of image monoculture (foreign policy, Namami Gange)
 * 5. Accessibility: Stretched-link pattern in FixHubCard (WCAG 2.4.4)
 * 6. Vertical System Integration: Source -> Evidence -> Claim -> Story -> Entity -> JSON-LD -> RSS -> Sitemap
 */

import { describe, it, expect } from 'vitest';
import { ChangeDetector } from '@/services/lifecycle/change-detector/ChangeDetector';
import { ImpactAnalyzer } from '@/services/lifecycle/impact-analyzer/ImpactAnalyzer';
import { getSource, getAllSources } from '@/lib/knowledge/source-registry';
import { getStory, getPublicStories } from '@/utils/data-layer/store';
import { VERIFIED_STORY_IMAGE_MANIFEST } from '@/lib/image-intelligence/manifest';
import { createStoryJsonLd } from '@/lib/seo/jsonld-story';
import sitemap from '@/app/sitemap';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 2 Full-System Loopback Verification', () => {

  describe('1. Evidence Lifecycle & Change Detection', () => {
    it('detects real semantic, claim, and metadata diffs (no hardcoded mocks)', async () => {
      const detector = new ChangeDetector();

      const oldDoc = {
        id: 'doc-v1',
        sourceId: 's-mgnrega-audit',
        title: 'MGNREGA National Social Audit 2025',
        content: 'Original audit recorded 82,400 complaints across all states.',
        claims: [
          { text: 'Total complaints recorded: 82,400.', context: 'national-audit' }
        ],
        entities: ['mord'],
        publishedAt: '2025-06-01T00:00:00Z',
        url: 'https://rural.gov.in/audit-2025.pdf',
      };

      const newDoc = {
        id: 'doc-v2',
        sourceId: 's-mgnrega-audit',
        title: 'MGNREGA National Social Audit 2025 (Reconciled)',
        content: 'Reconciled audit recorded 89,066 complaints including 6.6k procedural records.',
        claims: [
          { text: 'Total complaints recorded: 89,066 (including 6,666 reconciliation items).', context: 'national-audit' },
          { text: 'Financial misappropriation confirmed in 14.8k cases.', context: 'misappropriation' }
        ],
        entities: ['mord', 'cag'],
        publishedAt: '2025-07-01T00:00:00Z',
        url: 'https://rural.gov.in/audit-2025-v2.pdf',
      };

      const diff = await detector.compare(oldDoc, newDoc);

      expect(diff.hasChanges).toBe(true);
      expect(diff.sourceId).toBe('s-mgnrega-audit');
      expect(diff.claimChanges.length).toBeGreaterThanOrEqual(2);

      // Verify real diffing algorithm detected modified and added claims
      const modified = diff.claimChanges.find(c => c.type === 'modified');
      expect(modified).toBeDefined();
      expect(modified?.oldText).toContain('82,400');
      expect(modified?.newText).toContain('89,066');

      const added = diff.claimChanges.find(c => c.type === 'added');
      expect(added).toBeDefined();
      expect(added?.newText).toContain('14.8k');

      // Verify metadata changes
      expect(diff.metadataChanges.title).toBeDefined();
      expect(diff.metadataChanges.publishedAt).toBeDefined();
      expect(diff.metadataChanges.entities).toBeDefined();
    });

    it('traverses genuine source and story dependencies in ImpactAnalyzer', async () => {
      const analyzer = new ImpactAnalyzer();

      // Test with an authentic source that links to stories in the registry (e.g. s2)
      const diff = {
        sourceId: 's2', // Ayesha Jalal: The Sole Spokesman
        hasChanges: true,
        claimChanges: [
          { oldText: 'Original historical assessment', newText: 'Revised historiographical interpretation', type: 'modified' as const }
        ],
        metadataChanges: {},
        mediaChanges: [],
        relationshipChanges: [],
        timelineChanges: []
      };

      const tasks = await analyzer.analyze(diff);
      expect(tasks.length).toBe(1);

      const task = tasks[0];
      expect(task.title).toContain('Sole Spokesman');
      expect(task.evidence.sourceId).toBe('s2');

      // Verify it did NOT return hardcoded mock ['story-1', 'story-2']
      expect(task.affectedContent.stories).not.toContain('story-1');
      expect(task.affectedContent.stories).not.toContain('story-2');

      // Human review boundary: tasks must require editorial signoff
      expect(task.status).toBe('pending');
      expect(task.priority).toBeDefined();
      expect(task.severity).toBeDefined();
    });
  });

  describe('2. Visual System & Image Monoculture Remediation', () => {
    it('ensures indias-foreign-policy uses an authentic historical asset, not EU summit', () => {
      const story = getStory('indias-foreign-policy');
      expect(story).toBeDefined();
      expect(story?.heroImage).not.toBe('/images/stories/india-europe-relations.jpg');
      expect(story?.heroImage).toBe('/images/library/chapter-1/photos/a-07-nehru-unga-1948.jpg');

      const manifestEntry = VERIFIED_STORY_IMAGE_MANIFEST['indias-foreign-policy'];
      expect(manifestEntry).toBeDefined();
      expect(manifestEntry.assetType).toBe('authentic-photo');
      expect(manifestEntry.provenance).toContain('United Nations');
    });

    it('ensures namami-gange uses authentic photography instead of generic environment placeholder', () => {
      const manifestEntry = VERIFIED_STORY_IMAGE_MANIFEST['namami-gange'];
      expect(manifestEntry).toBeDefined();
      expect(manifestEntry.approvedImage).not.toBe('/images/placeholders/environment-placeholder.svg');
      expect(manifestEntry.approvedImage).toBe('/images/stories/groundwater-depletion.jpg');
      expect(manifestEntry.assetType).toBe('authentic-photo');
    });
  });

  describe('3. Accessibility & Card Navigation Semantics', () => {
    it('verifies FixHubCard implements the stretched-link pattern without nesting links', () => {
      const filePath = path.resolve(process.cwd(), 'components/fix/FixHubCard.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Outer element should be article, not Link
      expect(content).toMatch(/<article[\s\S]*?<h3/);
      expect(content).not.toMatch(/<Link[\s\S]*?<article/);

      // Stretched link pseudo-element should be applied to the headline Link
      expect(content).toContain('after:absolute after:inset-0 after:z-0');

      // Nested interactive controls (badges, tags, etc.) must have higher z-index (z-10)
      expect(content).toContain('relative z-10');
    });
  });

  describe('4. Cross-System Vertical Integration Chain', () => {
    it('traces electoral-bonds fact consistency across Source -> Story -> JSON-LD -> Sitemap', async () => {
      // 1. Story
      const story = getStory('electoral-bonds');
      expect(story).toBeDefined();
      expect(story?.headline).toContain('Electoral Bond');

      // 2. Fact / Invariant: TMC #2 and INC #3, BJP share 47.5%
      const chart = story?.charts?.find(c => c.title.includes('Party-wise'));
      expect(chart).toBeDefined();
      const chartData = chart?.data as Array<{ party: string; amount: number }>;
      expect(chartData[1].party).toBe('TMC');
      expect(chartData[1].amount).toBe(1610);
      expect(chartData[2].party).toBe('INC');
      expect(chartData[2].amount).toBe(1422);

      // 3. Structured Data JSON-LD
      const jsonLd = createStoryJsonLd(story as any);
      expect(jsonLd.length).toBeGreaterThan(0);
      const articleSchema = jsonLd[0];
      expect(articleSchema['@type']).toBe('NewsArticle');
      expect(articleSchema.headline).toBe(story?.headline);
      expect(articleSchema.datePublished).toBe(story?.publishedAt);

      // 4. Public Stories collection
      const { data: publicStories } = getPublicStories({ pageSize: 100 });
      const inPublic = publicStories.find(s => s.slug === 'electoral-bonds');
      expect(inPublic).toBeDefined();

      // 5. Sitemap inclusion
      const sitemapEntries = await sitemap();
      const sitemapUrls = sitemapEntries.map(e => e.url);
      expect(sitemapUrls).toContain('https://thebreakdown.in/story/electoral-bonds');
      expect(sitemapUrls).toContain('https://thebreakdown.in/stories');
      expect(sitemapUrls).toContain('https://thebreakdown.in/fix');
      expect(sitemapUrls).toContain('https://thebreakdown.in/transparency/corrections');
    });
  });
});
