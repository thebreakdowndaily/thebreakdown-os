import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TrustLayerPanel } from '../../components/public/TrustLayerPanel';

describe('TrustLayerPanel', () => {
  afterEach(() => vi.restoreAllMocks());

  const baseProps = {
    lastUpdated: '2026-10-15',
    totalClaims: 3,
    verifiedClaims: 2,
    primarySourcesCount: 1,
  };

  it('does not invent a verification badge or audit pass when evidence is not supplied', () => {
    const html = renderToStaticMarkup(createElement(TrustLayerPanel, baseProps));

    expect(html).not.toContain('Verified Primary Evidence');
    expect(html).not.toContain('Gold Standard Audit');
    expect(html).not.toContain('>PASS<');
    expect(html).toContain('Last updated: 2026-10-15');
  });

  it('renders a provided verification label and audit outcome explicitly', () => {
    const html = renderToStaticMarkup(createElement(TrustLayerPanel, {
      ...baseProps,
      verificationBadge: 'Editorial evidence review complete',
      auditStatus: 'pass',
    }));

    expect(html).toContain('Editorial evidence review complete');
    expect(html).toContain('Editorial audit');
    expect(html).toContain('Pass');
  });

  it('does not represent a review-required audit as a pass', () => {
    const html = renderToStaticMarkup(createElement(TrustLayerPanel, {
      ...baseProps,
      auditStatus: 'review',
    }));

    expect(html).toContain('Review required');
    expect(html).not.toContain('>PASS<');
  });
});
