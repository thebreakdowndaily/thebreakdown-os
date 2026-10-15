import { describe, expect, it } from 'vitest';
import { getReaderTrustSignals } from '../../lib/story/trust-signals';

describe('getReaderTrustSignals', () => {
  it('fails closed when publication status is missing', () => {
    expect(getReaderTrustSignals({
      sources: [{ type: 'primary', title: 'Official report' }],
      claims: [{ status: 'verified', claim: 'A claim' }],
    })).toEqual([]);
  });

  it('does not invent an evidence-reviewed label for an empty published story', () => {
    expect(getReaderTrustSignals({
      publicationStatus: 'published',
      sources: [],
      claims: [],
    })).toEqual([]);
  });

  it('reports primary documents only when public and backed by source metadata', () => {
    expect(getReaderTrustSignals({
      publicationStatus: 'published',
      sources: [{ type: 'primary', title: 'Official report' }],
      claims: [],
    })).toEqual([{
      id: 'primary-docs',
      label: 'Primary documents available',
      type: 'primary',
    }]);
  });

  it('reports evidence reviewed only when a public claim is explicitly verified', () => {
    expect(getReaderTrustSignals({
      publicationStatus: 'published',
      sources: [{ type: 'secondary', title: 'Analysis' }],
      claims: [{ status: 'verified', claim: 'Verified claim' }],
    })).toContainEqual({
      id: 'evidence-reviewed',
      label: 'Evidence reviewed',
      type: 'verified',
    });
  });

  it('does not mark a draft as reader-verified even if it has source data', () => {
    expect(getReaderTrustSignals({
      publicationStatus: 'draft',
      sources: [{ type: 'primary', title: 'Official report' }],
      claims: [{ status: 'verified', claim: 'Claim' }],
    })).toEqual([]);
  });

  it('preserves an explicit partial-verification signal for a published story', () => {
    expect(getReaderTrustSignals({
      publicationStatus: 'published',
      sources: [],
      claims: [{ verification: 'unverifiable', claim: 'Unresolved claim' }],
    })).toContainEqual({
      id: 'partially-verified',
      label: 'Partially verified',
      type: 'partial',
    });
  });
});
