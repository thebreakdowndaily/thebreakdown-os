import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { listPublishedCorrectionsMock } = vi.hoisted(() => ({
  listPublishedCorrectionsMock: vi.fn(),
}));

vi.mock('@/services/editorial/corrections-service', () => ({
  listPublishedCorrections: listPublishedCorrectionsMock,
}));

import CorrectionsPage from '../app/transparency/corrections/page';

describe('public corrections ledger availability state', () => {
  beforeEach(() => {
    listPublishedCorrectionsMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('describes an empty durable ledger without inferring that all stories passed review', async () => {
    listPublishedCorrectionsMock.mockResolvedValue([]);
    const html = renderToStaticMarkup(await CorrectionsPage());

    expect(html).toContain('No Published Corrections Listed');
    expect(html).toContain('An empty ledger is not, by itself, proof');
    expect(html).not.toContain('Zero Unresolved Errata');
    expect(html).not.toContain('All currently published knowledge objects have passed the Gold Standard Review');
  });

  it('reports storage unavailability instead of presenting it as zero corrections', async () => {
    listPublishedCorrectionsMock.mockRejectedValue(new Error('storage offline'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const html = renderToStaticMarkup(createElement(await CorrectionsPage()));

    expect(html).toContain('Corrections Ledger Temporarily Unavailable');
    expect(html).toContain('no conclusion about the presence or absence of corrections can be drawn');
    expect(html).not.toContain('No Published Corrections Listed');
    expect(errorSpy).toHaveBeenCalled();
  });
});
