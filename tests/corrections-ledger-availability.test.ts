import { describe, expect, it } from 'vitest';
import { getCorrectionsLedgerViewModel } from '@/services/editorial/corrections-ledger-view-model';

describe('public corrections ledger view model', () => {
  it('describes an empty ledger without implying every story passed review', () => {
    const view = getCorrectionsLedgerViewModel({ unavailable: false, correctionCount: 0 });

    expect(view.state).toBe('empty');
    expect(view.countLabel).toBe('0');
    expect(view.title).toBe('No Published Corrections Listed');
    expect(view.description).toContain('An empty ledger is not, by itself, proof');
    expect(view.description).not.toContain('Zero Unresolved Errata');
  });

  it('reports storage unavailability instead of presenting it as zero corrections', () => {
    const view = getCorrectionsLedgerViewModel({ unavailable: true, correctionCount: 0 });

    expect(view.state).toBe('unavailable');
    expect(view.countLabel).toBe('unavailable');
    expect(view.title).toBe('Corrections Ledger Temporarily Unavailable');
    expect(view.description).toContain(
      'no conclusion about the presence or absence of corrections can be drawn',
    );
    expect(view.title).not.toBe('No Published Corrections Listed');
  });

  it('shows a count when published corrections exist', () => {
    const view = getCorrectionsLedgerViewModel({ unavailable: false, correctionCount: 3 });

    expect(view.state).toBe('published');
    expect(view.countLabel).toBe('3');
    expect(view.title).toBeUndefined();
    expect(view.description).toBeUndefined();
  });
});
