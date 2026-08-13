import { describe, it, expect } from 'vitest';
import { CanonicalCertificationEngine } from '@/lib/certification/canonical-certification';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import type { Chapter } from '@/types/canonical';

describe('Canonical Certification Engine & Integrity Gates', () => {
  it('certifies high-quality canonical chapters with a complete audit trail', () => {
    const libraries = getKnowledgeLibrarySeedData();
    const econLib = libraries.find((l) => l.slug === 'indian-economy');
    expect(econLib).toBeDefined();

    const mgnregaChapter = econLib?.collections[0]?.volumes[0]?.chapters.find((c) => c.slug === 'mgnrega-reform');
    expect(mgnregaChapter).toBeDefined();

    const result = CanonicalCertificationEngine.certifyChapter(mgnregaChapter!);
    if (result.status !== 'ELIGIBLE') {
      console.error('Certification issues:', result.issues, 'Evaluations:', result.auditTrail.evaluations.filter(e => e.status !== 'PASS'));
    }
    expect(result.status).toBe('ELIGIBLE');
    expect(result.isCertified).toBe(true);
    expect(result.engineVersion).toBe('canonical-certification@2.0');
    expect(result.contentHash).toBeDefined();

    // Disambiguated metrics check
    expect(result.metrics.claimsCount).toBe(5);
    expect(result.metrics.evidenceObjectsCount).toBe(6);
    expect(result.metrics.uniqueSourcesCount).toBe(3);
    expect(result.metrics.citationOccurrencesCount).toBeGreaterThanOrEqual(5);

    // Audit trail check
    expect(result.auditTrail.evaluations.length).toBeGreaterThan(0);
    expect(result.auditTrail.evaluations.some((e) => e.ruleId === 'STRUC-001' && e.status === 'PASS')).toBe(true);
  });

  it('detects tampering and invalidates previous certification when evidence is modified', () => {
    const libraries = getKnowledgeLibrarySeedData();
    const econLib = libraries.find((l) => l.slug === 'indian-economy');
    const mgnregaChapter = econLib?.collections[0]?.volumes[0]?.chapters.find((c) => c.slug === 'mgnrega-reform');

    const originalCert = CanonicalCertificationEngine.certifyChapter(mgnregaChapter!);
    expect(CanonicalCertificationEngine.isCertificationValid(mgnregaChapter!, originalCert)).toBe(true);

    // Tamper with chapter claims
    const modifiedChapter: Chapter = {
      ...mgnregaChapter!,
      claims: [
        ...mgnregaChapter!.claims,
        {
          id: 'tampered-claim',
          text: 'Tampered claim without evidence linkage.',
          status: 'UNSUPPORTED',
          confidence: 0.1,
          type: 'factual',
          evidenceIds: [],
        },
      ],
    };

    // Hash mismatch detection
    expect(CanonicalCertificationEngine.isCertificationValid(modifiedChapter, originalCert)).toBe(false);

    // Recertification must block the tampered chapter
    const recert = CanonicalCertificationEngine.certifyChapter(modifiedChapter);
    expect(recert.status).toBe('BLOCKED');
    expect(recert.isCertified).toBe(false);
    expect(recert.issues.some((i) => i.targetId === 'tampered-claim')).toBe(true);
  });

  it('blocks chapters with unsupported claims or broken provenance chains', () => {
    const invalidChapter: Chapter = {
      id: 'test-unsupported',
      slug: 'unsupported-test',
      title: 'Unsupported Test Chapter',
      summary: 'Summary of sufficient length to pass presentation checks.',
      publishedAt: '2026-08-01T00:00:00Z',
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Valid content block.' } }],
      claims: [
        {
          id: 'c1',
          text: 'This is an unsupported factual claim.',
          status: 'UNSUPPORTED',
          confidence: 0.2,
          type: 'factual',
          evidenceIds: [],
        },
      ],
      evidence: [],
      sources: [],
    };

    const result = CanonicalCertificationEngine.certifyChapter(invalidChapter);
    expect(result.status).toBe('BLOCKED');
    expect(result.metrics.unsupportedClaimsCount).toBe(1);
    expect(result.issues.some((i) => i.layer === 'editorial_verification' && i.severity === 'error')).toBe(true);
    expect(result.issues.some((i) => i.layer === 'evidence_support' && i.severity === 'error')).toBe(true);
  });
});
