import { describe, it, expect } from 'vitest';
import { CanonicalCertificationEngine } from '@/lib/certification/canonical-certification';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import type { Chapter } from '@/types/canonical';

describe('Canonical Certification Engine', () => {
  it('certifies high-quality canonical chapters as ELIGIBLE', () => {
    const libraries = getKnowledgeLibrarySeedData();
    const econLib = libraries.find((l) => l.slug === 'economic-policy-2026');
    expect(econLib).toBeDefined();

    const mgnregaChapter = econLib?.volumes[0].chapters.find((c) => c.slug === 'mgnrega-reform');
    expect(mgnregaChapter).toBeDefined();

    const result = CanonicalCertificationEngine.certifyChapter(mgnregaChapter!);
    expect(result.status).toBe('ELIGIBLE');
    expect(result.isCertified).toBe(true);
    expect(result.metrics.totalClaims).toBe(5);
    expect(result.metrics.totalEvidence).toBe(6);
    expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('blocks chapters missing claims or having empty text', () => {
    const invalidChapter: Chapter = {
      id: 'test-1',
      slug: 'invalid-chapter',
      title: 'Invalid Chapter',
      summary: 'Summary with sufficient length for presentation.',
      publishedAt: '2026-08-01T00:00:00Z',
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Hello' } }],
      claims: [],
      evidence: [],
      sources: [],
    };

    const result = CanonicalCertificationEngine.certifyChapter(invalidChapter);
    expect(result.status).toBe('BLOCKED');
    expect(result.isCertified).toBe(false);
    expect(result.issues.some((i) => i.layer === 'claim' && i.severity === 'error')).toBe(true);
  });

  it('generates a full certification matrix from knowledge library seed data', () => {
    const libraries = getKnowledgeLibrarySeedData();
    const registry = CanonicalCertificationEngine.deriveCertificationRegistry(libraries);

    expect(registry['mgnrega-reform']).toBe('ELIGIBLE');
    expect(registry['rbi-repo-rate']).toBe('ELIGIBLE');
  });
});
