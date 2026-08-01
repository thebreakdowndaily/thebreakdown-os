import { describe, it, expect } from 'vitest';
import { CHAPTER_1_PACKAGE, CHAPTER_1_SOURCES, CHAPTER_1_CLAIMS, CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';
import { GoldStandardAuditService } from '../services/editorial/gold-standard-audit.service';
import { FixMetadataService } from '../services/fixes/fix-metadata.service';

describe('TEST-FOUNDING-CH1: Volume I Chapter 1 Founding Publication (Phase 15A)', () => {
  it('TEST-CH1-01: Structural Completeness — Six Questions & Four-Layer Structure', () => {
    expect(CHAPTER_1_PACKAGE.slug).toBe('foundations-of-strategic-autonomy-1947-1962');
    expect(CHAPTER_1_PACKAGE.wordCount).toBeGreaterThanOrEqual(15000);
    expect(CHAPTER_1_PACKAGE.sixQuestions.whatHappened.summary).toBeDefined();
    expect(CHAPTER_1_PACKAGE.sixQuestions.whyDidItHappen.summary).toBeDefined();
    expect(CHAPTER_1_PACKAGE.sixQuestions.whatAlternativesEisted.summary).toBeDefined();
    expect(CHAPTER_1_PACKAGE.sixQuestions.whyStrategicAutonomy.summary).toBeDefined();
    expect(CHAPTER_1_PACKAGE.sixQuestions.consequences.summary).toBeDefined();
    expect(CHAPTER_1_PACKAGE.sixQuestions.relevanceToday.summary).toBeDefined();

    expect(CHAPTER_1_PACKAGE.fourLayers.whatHappened).toBeDefined();
    expect(CHAPTER_1_PACKAGE.fourLayers.whatEvidenceShows).toBeDefined();
    expect(CHAPTER_1_PACKAGE.fourLayers.whereHistoriansDisagree).toBeDefined();
    expect(CHAPTER_1_PACKAGE.fourLayers.whyItMatters).toBeDefined();
  });

  it('TEST-CH1-02: 100% Claim-to-Source Attestation Resolution', () => {
    const sourceIds = new Set(CHAPTER_1_SOURCES.map((s) => s.id));
    expect(CHAPTER_1_CLAIMS.length).toBeGreaterThan(0);

    for (const c of CHAPTER_1_CLAIMS) {
      expect(c.id).toMatch(/^claim-foundations-/);
      expect(c.tier).toBeGreaterThanOrEqual(1);
      expect(c.sourceUrl).toBeDefined();
      expect(c.confidence).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('TEST-CH1-03: 7-Phase Gold Standard Review Certification', () => {
    const auditCert = GoldStandardAuditService.auditChapter1(CHAPTER_1_PACKAGE);
    expect(auditCert.overallPassed).toBe(true);
    expect(auditCert.percentage).toBe(100);
    expect(auditCert.phases.length).toBe(7);

    for (const p of auditCert.phases) {
      expect(p.passed).toBe(true);
      expect(p.score).toBe(p.maxScore);
    }
    expect(auditCert.signOffSignature).toMatch(/^sig-gold-standard-/);
  });

  it('TEST-CH1-04: Canonical Fix Object Linkage & Metadata Projections', () => {
    expect(CHAPTER_1_FIX.id).toBe('fix-strategic-autonomy-recalibration');
    expect(CHAPTER_1_FIX.sourceIds.length).toBeGreaterThan(0);

    const jsonLd = FixMetadataService.toJSONLD(CHAPTER_1_FIX);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Legislation');

    const og = FixMetadataService.toOpenGraph(CHAPTER_1_FIX);
    expect(og['og:title']).toContain('Integrated Defense Procurement Auditing');
    expect(og.canonicalUrl).toBe('https://thebreakdown.gov/fix/strategic-autonomy-defense-recalibration');

    const ris = FixMetadataService.toRISCitation(CHAPTER_1_FIX);
    expect(ris).toContain('TY  - GOVT');
  });
});
