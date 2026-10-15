export type CorrectionsLedgerViewState = 'unavailable' | 'empty' | 'published';

export interface CorrectionsLedgerViewModel {
  state: CorrectionsLedgerViewState;
  countLabel: string;
  title?: string;
  description?: string;
}

export function getCorrectionsLedgerViewModel(input: {
  unavailable: boolean;
  correctionCount: number;
}): CorrectionsLedgerViewModel {
  if (input.unavailable) {
    return {
      state: 'unavailable',
      countLabel: 'unavailable',
      title: 'Corrections Ledger Temporarily Unavailable',
      description:
        'The durable ledger could not be verified at this time. Please try again shortly; no conclusion about the presence or absence of corrections can be drawn.',
    };
  }

  if (input.correctionCount <= 0) {
    return {
      state: 'empty',
      countLabel: '0',
      title: 'No Published Corrections Listed',
      description:
        'This ledger lists formal corrections approved for publication. An empty ledger is not, by itself, proof that every story has passed every review gate or that no questions remain.',
    };
  }

  return {
    state: 'published',
    countLabel: String(input.correctionCount),
  };
}
