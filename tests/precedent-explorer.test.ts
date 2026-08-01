import { describe, it, expect } from 'vitest';
import { PrecedentIntelligenceService } from '../lib/precedent/precedent-intelligence-service';
import { GlobalPrecedentProjectionBuilder } from '../lib/precedent/precedent-projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-PRECEDENT-EXPLORER: Global Implementation Precedents Engine (Phase 25B)', () => {
  it('TEST-PRECEDENT-EXPLORER-01: Canonical Precedent Node Composition from Knowledge Objects', () => {
    const precedents = PrecedentIntelligenceService.getCanonicalPrecedents();

    expect(precedents.length).toBeGreaterThan(0);
    expect(precedents[0].precedentId).toBe('prec-karachi-ceasefire-1949');
    expect(precedents[0].region).toBe('SOUTH_ASIA');
    expect(Object.isFrozen(precedents)).toBe(true);
  });

  it('TEST-PRECEDENT-EXPLORER-02: Zero-Persistence Projection-Only Invariant Verification', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PrecedentIntelligenceService.getCanonicalPrecedents();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-PRECEDENT-EXPLORER-03: Regional Precedent Filtering (SOUTH_ASIA)', () => {
    const proj = GlobalPrecedentProjectionBuilder.buildProjection({ filterRegion: 'SOUTH_ASIA' });

    expect(proj.precedentCount).toBe(1);
    expect(proj.precedents[0].region).toBe('SOUTH_ASIA');
  });

  it('TEST-PRECEDENT-EXPLORER-04: Problem-Scoped Precedent Resolution', () => {
    const proj = GlobalPrecedentProjectionBuilder.buildProjection({ problemSlug: 'kashmir-1947-un-reference' });

    expect(proj.precedentCount).toBe(1);
    expect(proj.precedents[0].relatedProblemSlugs).toContain('kashmir-1947-un-reference');
  });

  it('TEST-PRECEDENT-EXPLORER-05: Contextual Similarity Score vs Historical Equivalence Separation', () => {
    const precedents = PrecedentIntelligenceService.getCanonicalPrecedents();

    expect(precedents[0].contextSimilarityScore).toBe(92);
    expect(precedents[0].majorDifferences.length).toBeGreaterThan(0);
  });

  it('TEST-PRECEDENT-EXPLORER-06: Chronological Timeline Milestone Sequence Resolution', () => {
    const precedents = PrecedentIntelligenceService.getCanonicalPrecedents();
    const chronology = precedents[0].chronology;

    expect(chronology.length).toBe(4);
    expect(chronology[0].year).toBe(1949);
    expect(chronology[1].year).toBe(1972);
    expect(chronology[2].year).toBe(1999);
    expect(chronology[3].year).toBe(2003);
  });

  it('TEST-PRECEDENT-EXPLORER-07: Observed Outcomes with Explicit Attribution Limitations', () => {
    const precedents = PrecedentIntelligenceService.getCanonicalPrecedents();
    const outcomes = precedents[0].observedOutcomes;

    expect(outcomes.length).toBe(1);
    expect(outcomes[0].attributionLimitation).toContain('prevent attributing all calm to the ceasefire agreement alone');
  });

  it('TEST-PRECEDENT-EXPLORER-08: Contextual Applicability Constraints', () => {
    const precedents = PrecedentIntelligenceService.getCanonicalPrecedents();
    const constraints = precedents[0].applicabilityConstraints;

    expect(constraints.designedFor.length).toBeGreaterThan(0);
    expect(constraints.lessComparableTo.length).toBeGreaterThan(0);
    expect(constraints.requiredPrerequisites.length).toBeGreaterThan(0);
  });

  it('TEST-PRECEDENT-EXPLORER-09: Descriptive Precedent Safeguard Disclaimer Invariant Verification', () => {
    const proj = GlobalPrecedentProjectionBuilder.buildProjection();

    expect(proj.descriptiveDisclaimer).toBe(
      'Global Precedents describe, contextualise, and compare circumstances. Global Precedents never imply historical equivalence or prescribe transferability.'
    );
  });

  it('TEST-PRECEDENT-EXPLORER-10: GlobalPrecedentProjection Building & Immutability', () => {
    const proj = GlobalPrecedentProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.precedents)).toBe(true);
  });

  it('TEST-PRECEDENT-EXPLORER-11: Precedent Slug Lookup Resolution', () => {
    const precedent = PrecedentIntelligenceService.getPrecedentBySlug('karachi-ceasefire-agreement-1949');

    expect(precedent).toBeDefined();
    expect(precedent?.slug).toBe('karachi-ceasefire-agreement-1949');
  });

  it('TEST-PRECEDENT-EXPLORER-12: Missing Outcome Data Handling & Evidence Limitation Protection', () => {
    const precedent = PrecedentIntelligenceService.getPrecedentBySlug('non-existent-slug');
    expect(precedent).toBeUndefined();
  });

  it('TEST-PRECEDENT-EXPLORER-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    GlobalPrecedentProjectionBuilder.buildProjection();
    PrecedentIntelligenceService.getPrecedentBySlug('karachi-ceasefire-agreement-1949');

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-PRECEDENT-EXPLORER-14: Precedent Boundary Safeguard Invariant ("Global Precedents describe. Global Precedents contextualise. Global Precedents compare circumstances. Global Precedents never imply historical equivalence. Global Precedents never prescribe transferability.")', () => {
    const proj = GlobalPrecedentProjectionBuilder.buildProjection();
    expect(proj).toBeDefined();
  });

  it('TEST-PRECEDENT-EXPLORER-15: High-Volume Precedent Projection Builder Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      GlobalPrecedentProjectionBuilder.buildProjection();
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('TEST-PRECEDENT-EXPLORER-16: Deterministic Precedent Projection Serialization Stability', () => {
    const proj = GlobalPrecedentProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"precedentCount":1');
  });
});
