/**
 * PHASE 3: PRODUCTION REALITY & SELF-UPDATING INTEGRITY TEST SUITE
 *
 * Verifies the complete lifecycle:
 * External Source -> Evidence -> Change Detection -> Impact Analysis ->
 * Editorial Queue -> Human Verification -> Errata Ledger -> Public Story & Metadata.
 *
 * Also stress-tests negative cases, SSRF defenses, idempotency, and false positive prevention.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeDetector } from '@/services/lifecycle/change-detector/ChangeDetector';
import { ImpactAnalyzer } from '@/services/lifecycle/impact-analyzer/ImpactAnalyzer';
import { isSafeExternalUrl } from '@/services/radar/collectors/security';
import { registerSource } from '@/lib/knowledge/source-registry';
import {
  submitReaderCorrection,
  triageReaderCorrection,
  listPublishedCorrections,
  resetCorrectionsMemoryStore,
} from '@/services/editorial/corrections-service';
import { getStory } from '@/utils/data-layer/store';
import { createStoryJsonLd } from '@/lib/seo/jsonld-story';
import sitemap from '@/app/sitemap';

describe('Phase 3: Production Reality & Deep Verification Suite', () => {
  beforeEach(() => {
    resetCorrectionsMemoryStore();
  });

  describe('1. Vertical Lifecycle Chain: Source Change -> Impact -> Triage -> Ledger', () => {
    it('executes complete end-to-end self-updating chain from A=X to A=Y', async () => {
      const detector = new ChangeDetector();
      const analyzer = new ImpactAnalyzer();

      // Step 1: Initial Source State (A = X: 100 statutory work days, matching published claim in mgnrega-reform)
      const docV1 = {
        id: 'doc-mord-001',
        sourceId: 'src-mgnrega-statute',
        title: 'National Rural Employment Guarantee Statutory Framework',
        content: 'Section 3 guarantees 100 days of wage employment per rural household.',
        claims: [
          { text: 'The statutory guarantee for rural wage employment is 100 days per household.', context: 'entitlement' },
        ],
        entities: ['ministry-of-rural-development'],
        publishedAt: '2025-01-01T00:00:00Z',
        url: 'https://rural.gov.in/statute-2005.pdf',
      };

      // Step 2: Upstream Source Amendment (A = Y: 125 statutory work days under VB-G RAM G Act 2025)
      const docV2 = {
        id: 'doc-mord-002',
        sourceId: 'src-mgnrega-statute',
        title: 'National Rural Employment Guarantee Statutory Framework (Amended)',
        content: 'Section 3 guarantees 125 days of wage employment per rural household under VB-G RAM G Act 2025.',
        claims: [
          { text: 'The statutory guarantee for rural wage employment is 125 days per household under VB-G RAM G Act 2025.', context: 'entitlement' },
        ],
        entities: ['ministry-of-rural-development'],
        publishedAt: '2026-07-01T00:00:00Z',
        url: 'https://rural.gov.in/statute-2025.pdf',
      };

      // Step 3: ChangeDetector identifies semantic & claim modification
      const diff = await detector.compare(docV1, docV2);
      expect(diff.hasChanges).toBe(true);
      expect(diff.claimChanges.length).toBe(1);
      expect(diff.claimChanges[0].type).toBe('modified');
      expect(diff.claimChanges[0].oldText).toContain('100 days');
      expect(diff.claimChanges[0].newText).toContain('125 days');

      // Step 4: ImpactAnalyzer evaluates downstream dependencies
      const tasks = await analyzer.analyze(diff);
      expect(tasks.length).toBe(1);
      const task = tasks[0];

      // Verifies priority and severity are appropriately calculated for affected published story
      expect(task.affectedContent.stories).toContain('mgnrega-reform');
      expect(task.priority).toBe('high');
      expect(task.severity).toBe('major');
      expect(task.evidence.diffSummary).toContain('1 claim change(s) detected');

      // Step 5: Human Review Boundary Enforced (Task status is pending, not auto-published)
      expect(task.status).toBe('pending');

      // Step 6: Verification desk approves correction
      const submission = await submitReaderCorrection({
        storySlug: 'mgnrega-reform',
        passageExcerpt: '100 statutory work days',
        suggestedCorrection: '125 statutory work days under VB-G RAM G Act 2025',
      });

      const triageResult = await triageReaderCorrection(
        {
          correctionId: submission.submissionId!,
          status: 'resolved',
          triageNotes: 'Verified against Gazette Notification S.O. 2415(E).',
          publishedCorrection: {
            category: 'factual',
            previousWording: '100 statutory work days',
            correctedWording: '125 statutory work days under VB-G RAM G Act 2025',
            explanation: 'Updated to reflect commencement of the VB-G RAM G Act 2025 expanding statutory days to 125.',
          },
        },
        { userId: 'lead-verifier', role: 'editor' }
      );

      expect(triageResult.success).toBe(true);
      expect(triageResult.updatedStatus).toBe('resolved');

      // Step 7: Errata ledger reflects the permanent append-only correction
      const published = await listPublishedCorrections('mgnrega-reform');
      expect(published.length).toBeGreaterThanOrEqual(1);
      const correction = published.find(c => c.correctedWording.includes('125 statutory work days'));
      expect(correction).toBeDefined();
      expect(correction?.previousWording).toContain('100 statutory work days');
      expect(correction?.explanation).toContain('VB-G RAM G Act 2025');

      // Step 8: Structured Data & Sitemap remain consistent
      const story = getStory('mgnrega-reform');
      expect(story).toBeDefined();
      const jsonLd = createStoryJsonLd(story as any);
      expect(jsonLd.length).toBeGreaterThan(0);
      expect(jsonLd[0].headline).toBe(story?.headline);

      const sitemapEntries = await sitemap();
      const urls = sitemapEntries.map(e => e.url);
      expect(urls).toContain('https://thebreakdown.in/story/mgnrega-reform');
      expect(urls).toContain('https://thebreakdown.in/transparency/corrections');
    });
  });

  describe('2. Negative Cases & Anti-Fragility Gates', () => {
    it('prevents false positive alerts on whitespace or minor formatting differences', async () => {
      const detector = new ChangeDetector();

      const doc1 = {
        id: 'doc-fmt-1',
        sourceId: 'src-rbi-mpc',
        title: 'Monetary Policy Committee Statement',
        content: 'The MPC decided to keep the policy repo rate unchanged at 6.50 per cent.',
        claims: [{ text: 'Policy repo rate kept unchanged at 6.50%.', context: 'repo-rate' }],
        entities: ['rbi'],
        publishedAt: '2026-08-01T00:00:00Z',
        url: 'https://rbi.org.in/mpc.html',
      };

      const doc2 = {
        id: 'doc-fmt-2',
        sourceId: 'src-rbi-mpc',
        title: 'Monetary Policy Committee Statement',
        // Whitespace and capitalization difference in content body only
        content: '  The  MPC  decided to keep the policy repo rate unchanged at 6.50 per cent.  \n',
        claims: [{ text: 'Policy repo rate kept unchanged at 6.50%.', context: 'repo-rate' }],
        entities: ['rbi'],
        publishedAt: '2026-08-01T00:00:00Z',
        url: 'https://rbi.org.in/mpc.html',
      };

      const diff = await detector.compare(doc1, doc2);
      expect(diff.claimChanges.length).toBe(0);
    });

    it('isolates irrelevant source amendments outside dependent story claims', async () => {
      const analyzer = new ImpactAnalyzer();

      // Diff for an isolated claim that no story cites
      const diff = {
        sourceId: 'src-isolated-report',
        hasChanges: true,
        claimChanges: [
          { oldText: 'Incidental administrative note on stationery procurement', newText: 'Incidental administrative note on digital supplies procurement', type: 'modified' as const }
        ],
        metadataChanges: {},
        mediaChanges: [],
        relationshipChanges: [],
        timelineChanges: []
      };

      const tasks = await analyzer.analyze(diff);
      expect(tasks.length).toBe(1);
      // Because no published story cites this isolated claim, affectedContent.stories must be empty
      expect(tasks[0].affectedContent.stories.length).toBe(0);
      expect(tasks[0].priority).toBe('low');
    });

    it('escalates disputed or retracted sources to critical blocker severity', async () => {
      const analyzer = new ImpactAnalyzer();

      registerSource({
        id: 's-disputed-sample',
        title: 'Disputed Technical Dossier',
        tier: 1,
        accessedAt: '2026-09-01T00:00:00Z',
        claimIds: ['claim-1'],
        documentIds: [],
        chapterIds: [],
        thinkerIds: [],
        storyIds: ['mgnrega-reform'],
        datasetIds: [],
        verificationStatus: 'disputed',
      });

      const diff = {
        sourceId: 's-disputed-sample',
        hasChanges: true,
        claimChanges: [
          { oldText: 'Sample claim', newText: 'Retracted claim', type: 'removed' as const }
        ],
        metadataChanges: {},
        mediaChanges: [],
        relationshipChanges: [],
        timelineChanges: []
      };

      const tasks = await analyzer.analyze(diff);
      expect(tasks.length).toBe(1);
      // Critical severity due to disputed source
      expect(tasks[0].priority).toBe('critical');
      expect(tasks[0].severity).toBe('blocker');
    });

    it('enforces deterministic idempotency on repeated source diff processing', async () => {
      const analyzer = new ImpactAnalyzer();

      const diff = {
        sourceId: 's2',
        hasChanges: true,
        claimChanges: [
          { oldText: 'Text 1', newText: 'Text 2', type: 'modified' as const }
        ],
        metadataChanges: {},
        mediaChanges: [],
        relationshipChanges: [],
        timelineChanges: []
      };

      const run1 = await analyzer.analyze(diff);
      const run2 = await analyzer.analyze(diff);

      expect(run1.length).toBe(run2.length);
      expect(run1[0].priority).toBe(run2[0].priority);
      expect(run1[0].severity).toBe(run2[0].severity);
      expect(run1[0].affectedContent.stories).toEqual(run2[0].affectedContent.stories);
    });
  });

  describe('3. Collector Security & SSRF Defense Verification', () => {
    it('blocks private IPv4 networks (RFC 1918)', () => {
      expect(isSafeExternalUrl('http://10.0.0.1/admin').safe).toBe(false);
      expect(isSafeExternalUrl('http://192.168.1.1/').safe).toBe(false);
      expect(isSafeExternalUrl('http://172.16.0.5:8080/').safe).toBe(false);
      expect(isSafeExternalUrl('http://172.31.255.255/').safe).toBe(false);
    });

    it('blocks cloud metadata IP (169.254.169.254) and loopback addresses', () => {
      expect(isSafeExternalUrl('http://169.254.169.254/latest/meta-data/').safe).toBe(false);
      expect(isSafeExternalUrl('http://127.0.0.1:3000/api').safe).toBe(false);
      expect(isSafeExternalUrl('http://localhost:8000/secret').safe).toBe(false);
      expect(isSafeExternalUrl('http://0.0.0.0/').safe).toBe(false);
    });

    it('rejects dangerous non-HTTP schemes', () => {
      expect(isSafeExternalUrl('file:///etc/passwd').safe).toBe(false);
      expect(isSafeExternalUrl('ftp://server.com/doc').safe).toBe(false);
      expect(isSafeExternalUrl('gopher://gopher.server/').safe).toBe(false);
      expect(isSafeExternalUrl('javascript:alert(1)').safe).toBe(false);
    });

    it('allows legitimate public government and news domains', () => {
      expect(isSafeExternalUrl('https://egazette.gov.in/Document.aspx').safe).toBe(true);
      expect(isSafeExternalUrl('https://eci.gov.in/files/').safe).toBe(true);
      expect(isSafeExternalUrl('https://rural.gov.in/annual-report').safe).toBe(true);
      expect(isSafeExternalUrl('https://thebreakdown.in/rss').safe).toBe(true);
    });
  });
});
