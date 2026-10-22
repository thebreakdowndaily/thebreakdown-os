import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

vi.mock('../services/editorial/corrections-service', () => ({
  listPublishedCorrections: async () => [],
}));

import CorrectionsPage from '../app/transparency/corrections/page';

describe('corrections ledger empty state', () => {
  it('does not imply an empty ledger proves universal editorial review success', async () => {
    const html = renderToStaticMarkup(await CorrectionsPage());

    expect(html).toContain('No Published Corrections Listed');
    expect(html).toContain('An empty ledger is not, by itself, proof');
    expect(html).not.toContain('Zero Unresolved Errata');
    expect(html).not.toContain('All currently published knowledge objects have passed the Gold Standard Review');
  });
});
