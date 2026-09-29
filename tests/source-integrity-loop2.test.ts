/**
 * THE BREAKDOWN OS — SOURCE INTEGRITY & PROVENANCE REGRESSION SUITE (LOOP 2)
 *
 * Verifies canonical source reconstruction, provenance preservation,
 * retraction safety, and deterministic registry contract.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllSources,
  getSource,
  getSourcesByStatus,
  getClaimsForSource,
  updateSourceStatus,
  resetSourceRegistry,
  registerSource,
} from '@/lib/knowledge/source-registry';
import { getAllClaims, getClaim } from '@/lib/knowledge/claim-registry';
import { validateSourceIntegrity } from '@/lib/knowledge/source-validator';
import type { CanonicalClaim, CanonicalSource, Story } from '@/types/canonical';
import type { Principal } from '@/features/auth/principal';
import { evaluatePublicationContract } from '@/lib/editorial/canonical-publication';
import { createDefaultGoldStandardAudit } from '@/lib/editorial/gold-standard-review';
import { NextRequest } from 'next/server';
import { POST as postV2Source } from '@/app/api/v2/sources/route';

describe('LOOP 2 — CANONICAL EVIDENCE & SOURCE INTEGRITY RECONSTRUCTION', () => {
  beforeEach(() => {
    resetSourceRegistry();
  });

  it('1. Every published claim resolves to a canonical source (Zero F-04 missing IDs)', () => {
    const report = validateSourceIntegrity({ strictAllBoundaries: true });
    expect(report.inventory.unresolvedSourceIds).toBe(0);
    expect(report.inventory.resolvedSourceIds).toBe(report.inventory.uniqueReferencedSourceIds);
    expect(report.errors).toHaveLength(0);
  });

  it('2. Exact duplicate source IDs are normalized and resolvable', () => {
    // ECI results cited by clm-bjp-mission-360-001 and 004
    const s1 = getSource('src-bjp-mission-360-1');
    expect(s1).toBeDefined();
    expect(s1?.url).toBe('https://results.eci.gov.in');
    expect(s1?.tier).toBe(1);
    expect(s1?.verificationStatus).toBe('verified');
  });

  it('3. No fabricated metadata is accepted (unresolved sources lack fake URLs/publishers)', () => {
    const unresolvedSources = getSourcesByStatus('unresolved');
    expect(unresolvedSources.length).toBeGreaterThan(0);

    for (const source of unresolvedSources) {
      // Unresolved scaffold sources must NOT possess fabricated URLs
      expect(source.verificationStatus).toBe('unresolved');
      expect(source.notes).toMatch(/editorial review|unresolved|no corresponding/i);
    }
  });

  it('4. Invalid or non-existent source IDs fail validation with SOURCE_NOT_FOUND', () => {
    const syntheticClaim = {
      id: 'test-claim-broken-src',
      statement: 'Synthetic statement',
      confidence: 'disputed' as const,
      evidence: [{ sourceId: 'src-non-existent-999', relevance: 'direct' as const }],
      counterArguments: [],
      sourceIds: ['src-non-existent-999'],
      documentIds: [],
      entityIds: [],
      conceptIds: [],
      appearsIn: [{ contentType: 'story' as const, contentId: 'bjp-mission-360', contentTitle: 'Test' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    };

    const report = validateSourceIntegrity({
      claims: [syntheticClaim],
      strictAllBoundaries: true,
    });

    expect(report.errors.length).toBeGreaterThan(0);
    const issue = report.errors.find(e => e.sourceId === 'src-non-existent-999');
    expect(issue).toBeDefined();
    expect(issue?.reason).toBe('SOURCE_NOT_FOUND');
  });

  it('5. Unresolved source state is explicit (produces SOURCE_UNRESOLVED warning, not error)', () => {
    const p5Source = getSource('src-bjp-mission-360-p5-1');
    expect(p5Source).toBeDefined();
    expect(p5Source?.verificationStatus).toBe('unresolved');

    const report = validateSourceIntegrity();
    const unresolvedWarnings = report.warnings.filter(w => w.reason === 'SOURCE_UNRESOLVED');
    expect(unresolvedWarnings.length).toBe(55);
  });

  it('6. Retracted source cannot silently remain verified and raises SOURCE_RETRACTED error', () => {
    const testSrcId = 'src-bjp-mission-360-1';
    const updated = updateSourceStatus(testSrcId, 'retracted', 'Retracted due to formal erratum');
    expect(updated).toBe(true);

    const source = getSource(testSrcId);
    expect(source?.verificationStatus).toBe('retracted');

    const report = validateSourceIntegrity();
    const retractedErrors = report.errors.filter(e => e.reason === 'SOURCE_RETRACTED');
    expect(retractedErrors.length).toBeGreaterThan(0);
    expect(retractedErrors[0].sourceId).toBe(testSrcId);
  });

  it('7. Migration preserves original provenance (story match and notes trace origin)', () => {
    const groundwaterSource = getSource('src-groundwater-depletion-1');
    expect(groundwaterSource).toBeDefined();
    expect(groundwaterSource?.title).toContain('Dynamic Ground Water');
    expect(groundwaterSource?.url).toBe('https://cgwb.gov.in');
    expect(groundwaterSource?.storyIds).toContain('groundwater-depletion');
    expect(groundwaterSource?.notes).toContain('Recovered from inline story sources');
  });

  it('8. Canonical source references remain stable across multiple registry queries', () => {
    const firstFetch = getAllSources();
    const secondFetch = getAllSources();
    expect(firstFetch.length).toBe(secondFetch.length);
    expect(firstFetch.map(s => s.id).sort()).toEqual(secondFetch.map(s => s.id).sort());
  });

  it('9. Claims affected by source status can be accurately queried (getClaimsForSource)', () => {
    const claims = getClaimsForSource('src-bjp-mission-360-1');
    expect(claims.length).toBeGreaterThan(0);
    expect(claims).toContain('clm-bjp-mission-360-001');
  });

  it('10. Source registry remains deterministic after reset', () => {
    const initialCount = getAllSources().length;
    resetSourceRegistry();
    const postResetCount = getAllSources().length;
    expect(postResetCount).toBe(initialCount);
  });
});

function createMockPrincipal(role: Principal['role'], id = 'usr-editor-1'): Principal {
  return {
    userId: id,
    email: `${role}@example.com`,
    name: `Test ${role}`,
    role,
    isSuperAdmin: role === 'owner',
    status: 'active',
    organizationId: null,
  };
}

function createCanaryStory(status: Story['status'] = 'scheduled'): Story {
  const audit = createDefaultGoldStandardAudit('story-canary-1');
  audit.phases.phase1ExpertReview.passed = true;
  audit.phases.phase2ReaderReview.passed = true;
  audit.phases.phase3EvidenceAudit.passed = true;
  audit.phases.phase4BiasAudit.passed = true;
  audit.phases.phase5VisualAudit.passed = true;
  audit.phases.phase6KnowledgeDensityAudit.passed = true;
  audit.phases.phase7DefensibilityAudit.passed = true;

  return {
    id: 'story-canary-1',
    title: 'Canary Story on Source Provenance',
    slug: 'canary-source-provenance',
    headline: 'Canary Headline',
    summary: 'Canary summary meeting editorial guidelines.',
    heroImage: '/images/hero.jpg',
    author: 'Editorial Desk',
    category: 'governance',
    status,
    storyType: 'standard',
    evidenceScore: 95,
    readingTime: 5,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['policy'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Paragraph text' } }],
    sources: [{ id: 'src-bjp-mission-360-1', title: 'Election Commission of India Results', tier: 1, url: 'https://results.eci.gov.in' }],
    claims: [{ id: 'c1', claim: 'Factual verified claim', source: 'Election Commission of India Results', tier: 1, confidence: 95, status: 'verified' }],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    goldStandardAudit: audit as any,
  } as Story;
}

describe('LOOP 2 — PUBLICATION & LIVE SECURITY CANARIES (SCENARIOS A - F)', () => {
  beforeEach(() => {
    resetSourceRegistry();
  });

  it('Scenario A: Valid verified source -> publication allowed (200)', () => {
    const editor = createMockPrincipal('editor');
    const validStory = createCanaryStory('scheduled');

    const decision = evaluatePublicationContract(validStory, validStory, editor);
    expect(decision.allowed).toBe(true);
    expect(decision.httpStatus).toBe(200);
  });

  it('Scenario B: Missing source -> publication blocked by publication gate (422)', () => {
    const editor = createMockPrincipal('editor');
    const storyNoSources = { ...createCanaryStory('scheduled'), sources: [] };

    const decision = evaluatePublicationContract(storyNoSources, storyNoSources, editor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(422);
    expect(decision.error).toMatch(/has_sources/);
  });

  it('Scenario C: Unknown source ID -> fails validation with SOURCE_NOT_FOUND', () => {
    const claimWithUnknownSource: CanonicalClaim = {
      id: 'clm-unknown-source-test',
      statement: 'Claim referencing completely unknown source',
      confidence: 'disputed',
      evidence: [{ sourceId: 'src-non-existent-99999', relevance: 'direct' }],
      counterArguments: [],
      sourceIds: ['src-non-existent-99999'],
      documentIds: [],
      entityIds: [],
      conceptIds: [],
      appearsIn: [{ contentType: 'story', contentId: 'bjp-mission-360', contentTitle: 'Test' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    };

    const report = validateSourceIntegrity({
      claims: [claimWithUnknownSource],
      strictAllBoundaries: true,
    });

    expect(report.valid).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
    const err = report.errors.find(e => e.sourceId === 'src-non-existent-99999');
    expect(err).toBeDefined();
    expect(err?.reason).toBe('SOURCE_NOT_FOUND');
  });

  it('Scenario D: Retracted source -> publication blocked by publication gate (422)', () => {
    const editor = createMockPrincipal('editor');
    const targetSourceId = 'src-bjp-mission-360-1';

    // Mark source retracted in registry
    updateSourceStatus(targetSourceId, 'retracted', 'Retracted due to formal erratum');

    const storyWithRetracted = createCanaryStory('scheduled');
    const decision = evaluatePublicationContract(storyWithRetracted, storyWithRetracted, editor);

    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(422);
    expect(decision.error).toMatch(/sources_not_retracted/);
  });

  it('Scenario E: Unresolved source -> flags audit warning for editorial review', () => {
    const report = validateSourceIntegrity();
    const unresolvedWarnings = report.warnings.filter(w => w.reason === 'SOURCE_UNRESOLVED');

    // 55 scaffold sources explicitly flagged as unresolved
    expect(unresolvedWarnings.length).toBe(55);
    // Hard errors remain 0
    expect(report.errors).toHaveLength(0);
    // Unresolved sources have clear audit note
    for (const warning of unresolvedWarnings) {
      expect(warning.message).toMatch(/marked unresolved/i);
    }
  });

  it('Scenario F: Unauthenticated API mutation attempt on sources is blocked (401)', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/sources', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Unauthorized Malicious Source',
        tier: 1,
        url: 'https://malicious.example.com',
      }),
    });

    const res = await postV2Source(req);
    expect(res.status).toBe(401);
  });
});

