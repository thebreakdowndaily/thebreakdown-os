/**
 * ─── Source Reference Integrity Validator Test Suite (F-12) ──────────────────
 *
 * Verifies the fail-closed source integrity validator:
 *   1. Valid claim -> existing source = PASS
 *   2. Claim -> unknown source = FAIL (SOURCE_NOT_FOUND)
 *   3. Malformed source reference = FAIL (MALFORMED_SOURCE_ID)
 *   4. Multiple claims referencing the same source handled correctly
 *   5. Duplicate source references do not create duplicate findings
 *   6. Draft/non-published content follows discovered publication boundary
 *   7. Validator is deterministic
 *   8. Representative published content (RBI, MGNREGA, Chapter 1) remains valid
 *   9. Real-world inventory regression (exposes 111 F-04 debt without hiding)
 *  10. Unrelated registry reference detection
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { CanonicalClaim, CanonicalSource } from '@/types/canonical';
import {
  validateSourceIntegrity,
  resolveClaimPublicationBoundary,
  formatSourceIntegrityReport,
} from '@/lib/knowledge/source-validator';
import { getAllClaims } from '@/lib/knowledge/claim-registry';
import { getAllSources } from '@/lib/knowledge/source-registry';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const sampleSource1: CanonicalSource = {
  id: 'src-1',
  title: 'Government of India Gazette 2026',
  tier: 1,
  accessedAt: '2026-07-01',
  claimIds: ['claim-valid-1', 'claim-valid-2'],
  documentIds: [],
  chapterIds: [],
  thinkerIds: [],
  storyIds: [],
  datasetIds: [],
};

const sampleSource2: CanonicalSource = {
  id: 'src-2',
  title: 'Reserve Bank of India Bulletin',
  tier: 2,
  accessedAt: '2026-07-01',
  claimIds: ['claim-valid-2'],
  documentIds: [],
  chapterIds: [],
  thinkerIds: [],
  storyIds: [],
  datasetIds: [],
};

function createMockClaim(overrides: Partial<CanonicalClaim>): CanonicalClaim {
  return {
    id: 'mock-claim-1',
    statement: 'A mock claim statement for testing.',
    confidence: 'established',
    evidence: [],
    counterArguments: [],
    sourceIds: [],
    documentIds: [],
    entityIds: [],
    conceptIds: [],
    appearsIn: [
      { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: "India's Inheritance" },
    ],
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    ...overrides,
  };
}

describe('F-12 Source Reference Integrity Validator', () => {
  // ─── 1. Valid Claim -> Existing Source ──────────────────────────────────────
  it('1. Passes when claims reference valid existing canonical sources', () => {
    const claim = createMockClaim({
      id: 'claim-valid-1',
      sourceIds: ['src-1'],
      evidence: [
        { sourceId: 'src-1', relevance: 'direct', excerpt: 'Official gazette record.' },
      ],
    });

    const report = validateSourceIntegrity({
      claims: [claim],
      sources: [sampleSource1],
      boundaryResolver: () => 'published',
    });

    assert.equal(report.valid, true, 'Report must be valid when all sources resolve');
    assert.equal(report.errors.length, 0, 'Must have zero errors');
    assert.equal(report.inventory.resolvedSourceIds, 1);
    assert.equal(report.inventory.unresolvedSourceIds, 0);
    assert.equal(report.inventory.uniqueReferencedSourceIds, 1);
    assert.equal(report.inventory.malformedReferences, 0);
  });

  // ─── 2. Claim -> Unknown Source ─────────────────────────────────────────────
  it('2. Fails when a published claim references an unknown source ID', () => {
    const claim = createMockClaim({
      id: 'claim-err-1',
      sourceIds: ['src-does-not-exist'],
      evidence: [],
    });

    const report = validateSourceIntegrity({
      claims: [claim],
      sources: [sampleSource1],
      boundaryResolver: () => 'published',
    });

    assert.equal(report.valid, false, 'Report must fail when source is unknown');
    assert.equal(report.errors.length, 1);
    assert.equal(report.errors[0].reason, 'SOURCE_NOT_FOUND');
    assert.equal(report.errors[0].sourceId, 'src-does-not-exist');
    assert.equal(report.errors[0].claimId, 'claim-err-1');
    assert.equal(report.errors[0].publicationBoundary, 'published');
  });

  // ─── 3. Malformed Source Reference ──────────────────────────────────────────
  it('3. Detects malformed source references (empty string, whitespace, non-string)', () => {
    const claim = createMockClaim({
      id: 'claim-malformed',
      sourceIds: ['', '   '],
      evidence: [
        { sourceId: '', relevance: 'direct', excerpt: 'Broken excerpt.' },
      ],
    });

    const report = validateSourceIntegrity({
      claims: [claim],
      sources: [sampleSource1],
      boundaryResolver: () => 'published',
    });

    assert.equal(report.valid, false, 'Report must fail on malformed source references');
    assert.ok(report.inventory.malformedReferences >= 3, 'Must record malformed count');
    const malformedErrors = report.errors.filter((e) => e.reason === 'MALFORMED_SOURCE_ID');
    assert.equal(malformedErrors.length, 3, 'Must emit 3 malformed reference errors');
  });

  // ─── 4. Multiple Claims Referencing Same Source ─────────────────────────────
  it('4. Handles multiple claims referencing the same valid or invalid source', () => {
    const claimA = createMockClaim({ id: 'claim-a', sourceIds: ['src-1'] });
    const claimB = createMockClaim({ id: 'claim-b', sourceIds: ['src-1'] });
    const claimC = createMockClaim({ id: 'claim-c', sourceIds: ['src-missing'] });
    const claimD = createMockClaim({ id: 'claim-d', sourceIds: ['src-missing'] });

    const report = validateSourceIntegrity({
      claims: [claimA, claimB, claimC, claimD],
      sources: [sampleSource1],
      boundaryResolver: () => 'published',
    });

    assert.equal(report.inventory.totalClaimsInspected, 4);
    assert.equal(report.inventory.totalSourceReferences, 4);
    assert.equal(report.inventory.uniqueReferencedSourceIds, 2);
    assert.equal(report.inventory.resolvedSourceIds, 1); // src-1
    assert.equal(report.inventory.unresolvedSourceIds, 1); // src-missing
    // Each distinct claim gets an error pointing to its own context
    assert.equal(report.errors.length, 2);
    assert.ok(report.errors.some((e) => e.claimId === 'claim-c'));
    assert.ok(report.errors.some((e) => e.claimId === 'claim-d'));
  });

  // ─── 5. Duplicate Source References Do Not Inflate Errors ───────────────────
  it('5. De-duplicates source references within the same claim to prevent duplicate findings', () => {
    const claimWithInternalDups = createMockClaim({
      id: 'claim-dups',
      sourceIds: ['src-missing-dup', 'src-missing-dup'],
      evidence: [
        { sourceId: 'src-missing-dup', relevance: 'direct', excerpt: 'Excerpt 1' },
        { sourceId: 'src-missing-dup', relevance: 'supporting', excerpt: 'Excerpt 2' },
      ],
    });

    const report = validateSourceIntegrity({
      claims: [claimWithInternalDups],
      sources: [sampleSource1],
      boundaryResolver: () => 'published',
    });

    // Exactly 1 SOURCE_NOT_FOUND error for (claim-dups, src-missing-dup) with field: 'both'
    const notFoundErrors = report.errors.filter((e) => e.reason === 'SOURCE_NOT_FOUND');
    assert.equal(notFoundErrors.length, 1, 'Must not emit multiple SOURCE_NOT_FOUND errors for the same claim+source');
    assert.equal(notFoundErrors[0].field, 'both');

    // 1 warning for the duplicate entry inside sourceIds array
    const dupWarnings = report.warnings.filter((w) => w.reason === 'DUPLICATE_SOURCE_IN_CLAIM');
    assert.equal(dupWarnings.length, 1);
  });

  // ─── 6. Publication Boundary Respect (Draft vs Published) ───────────────────
  it('6. Treats unresolved sources in draft content as WARNINGS, not build-blocking ERRORS', () => {
    const draftClaim = createMockClaim({
      id: 'claim-draft-1',
      sourceIds: ['src-future-draft'],
      appearsIn: [{ contentType: 'story', contentId: 'draft-story-slug', contentTitle: 'Draft Story' }],
    });

    // Default mode: boundary = 'draft' -> warning, valid = true
    const reportDraft = validateSourceIntegrity({
      claims: [draftClaim],
      sources: [sampleSource1],
      boundaryResolver: () => 'draft',
      strictAllBoundaries: false,
    });

    assert.equal(reportDraft.valid, true, 'Draft content should not cause validator failure in default mode');
    assert.equal(reportDraft.errors.length, 0);
    assert.equal(reportDraft.warnings.length, 1);
    assert.equal(reportDraft.warnings[0].reason, 'SOURCE_NOT_FOUND');
    assert.equal(reportDraft.warnings[0].publicationBoundary, 'draft');

    // Strict mode: strictAllBoundaries = true -> error, valid = false
    const reportStrict = validateSourceIntegrity({
      claims: [draftClaim],
      sources: [sampleSource1],
      boundaryResolver: () => 'draft',
      strictAllBoundaries: true,
    });

    assert.equal(reportStrict.valid, false, 'Draft content MUST fail validator in strict mode');
    assert.equal(reportStrict.errors.length, 1);
    assert.equal(reportStrict.errors[0].reason, 'SOURCE_NOT_FOUND');
  });

  // ─── 7. Determinism ─────────────────────────────────────────────────────────
  it('7. Is completely deterministic across multiple invocations', () => {
    const claim1 = createMockClaim({ id: 'c1', sourceIds: ['src-1', 'src-missing-x'] });
    const claim2 = createMockClaim({ id: 'c2', sourceIds: ['src-2', 'src-missing-y'] });

    const run1 = validateSourceIntegrity({
      claims: [claim1, claim2],
      sources: [sampleSource1, sampleSource2],
      boundaryResolver: () => 'published',
    });

    const run2 = validateSourceIntegrity({
      claims: [claim1, claim2],
      sources: [sampleSource1, sampleSource2],
      boundaryResolver: () => 'published',
    });

    assert.equal(run1.valid, run2.valid);
    assert.equal(run1.errors.length, run2.errors.length);
    assert.equal(run1.warnings.length, run2.warnings.length);
    assert.equal(run1.inventory.totalSourceReferences, run2.inventory.totalSourceReferences);
    assert.equal(run1.inventory.resolvedSourceIds, run2.inventory.resolvedSourceIds);
    assert.equal(run1.inventory.unresolvedSourceIds, run2.inventory.unresolvedSourceIds);

    for (let i = 0; i < run1.errors.length; i++) {
      assert.equal(run1.errors[i].claimId, run2.errors[i].claimId);
      assert.equal(run1.errors[i].sourceId, run2.errors[i].sourceId);
      assert.equal(run1.errors[i].reason, run2.errors[i].reason);
    }
  });

  // ─── 8. Representative Published Content (RBI, MGNREGA, Chapter 1) ──────────
  it('8. Confirms representative published chapters (Chapter 1, MGNREGA, RBI) have 0 errors', () => {
    const allClaims = getAllClaims();
    const allSources = getAllSources();

    // Select claims appearing in the canonical chapters: kl-ch-1, kl-ch-mgnrega, kl-ch-rbi-repo-rate
    const chapterClaims = allClaims.filter((c) =>
      c.appearsIn?.some((app) =>
        app.contentType === 'chapter' &&
        ['kl-ch-1', 'kl-ch-mgnrega', 'kl-ch-rbi-repo-rate'].includes(app.contentId)
      )
    );

    assert.ok(chapterClaims.length >= 31, 'Must have at least 31 chapter claims');

    const report = validateSourceIntegrity({
      claims: chapterClaims,
      sources: allSources,
      boundaryResolver: () => 'published',
    });

    assert.equal(report.valid, true, 'Representative published chapters must pass with 0 errors');
    assert.equal(report.errors.length, 0);
    assert.equal(report.inventory.unresolvedSourceIds, 0);
    assert.equal(report.inventory.resolvedSourceIds, 34, 'All 34 chapter sources must be resolved');
  });

  // ─── 9. Real-World Inventory Regression (Exposes 111 F-04 Debt) ──────────────
  it('9. Accurately surfaces the 111 unresolved sources in real data without hiding them', () => {
    const realReport = validateSourceIntegrity();

    // The real repo currently contains 111 missing sources (F-04 debt)
    assert.equal(realReport.valid, false, 'Real repo must fail validation due to unseeded F-04 sources');
    assert.equal(realReport.inventory.totalClaimsInspected, 144);
    assert.equal(realReport.inventory.totalSourceReferences, 387);
    assert.equal(realReport.inventory.uniqueReferencedSourceIds, 148);
    assert.equal(realReport.inventory.resolvedSourceIds, 37);
    assert.equal(realReport.inventory.unresolvedSourceIds, 111);
    assert.equal(realReport.inventory.registeredSourcesCount, 39);
    assert.equal(realReport.inventory.unreferencedSourcesCount, 2);
    assert.equal(realReport.inventory.malformedReferences, 0);

    // Published stories debt = 106 errors, unreferenced debt = 5 warnings
    assert.equal(realReport.errors.length, 106);
    assert.equal(realReport.warnings.length, 5);

    // Verify formatted output produces readable text
    const formatted = formatSourceIntegrityReport(realReport);
    assert.ok(formatted.includes('THE BREAKDOWN OS — SOURCE INTEGRITY REPORT (F-12)'));
    assert.ok(formatted.includes('Unresolved Source IDs (F-04):   111'));
  });

  // ─── 10. Unrelated Registry Reference Detection ─────────────────────────────
  it('10. Detects and flags references to sources existing only in an unrelated registry', () => {
    const claim = createMockClaim({
      id: 'claim-research-src',
      sourceIds: ['src-bbc-business-rss'],
      appearsIn: [{ contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: "India's Inheritance" }],
    });

    const report = validateSourceIntegrity({
      claims: [claim],
      sources: [sampleSource1],
      unrelatedSourceIds: new Set(['src-bbc-business-rss']),
      boundaryResolver: () => 'published',
    });

    const unrelatedWarnings = report.warnings.filter((w) => w.reason === 'SOURCE_IN_UNRELATED_REGISTRY');
    assert.equal(unrelatedWarnings.length, 1);
    assert.equal(unrelatedWarnings[0].sourceId, 'src-bbc-business-rss');
  });
});
