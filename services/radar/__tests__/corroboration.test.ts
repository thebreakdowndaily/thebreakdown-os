import { describe, it, expect } from 'vitest';
import {
  detectWireByline,
  evaluateClusterCorroboration,
  SourceCorroborationInput,
} from '../corroboration';

describe('Radar Independence & Wire Corroboration Engine', () => {
  it('detects wire bylines correctly from raw news text', () => {
    expect(detectWireByline('Bhopal (PTI): The state cabinet approved new infrastructure projects.')).toBe('wire:pti');
    expect(detectWireByline('New Delhi (ANI): Asian News International reports on MP budget.')).toBe('wire:ani');
    expect(detectWireByline('Indore Bureau: Our correspondent reports on local municipal reforms.')).toBeNull();
  });

  it('collapses 10 syndicated wire reposts into 1 single independent source origin', () => {
    const syndicatedInputs: SourceCorroborationInput[] = Array.from({ length: 10 }).map((_, i) => ({
      sourceId: `local-outlet-${i}`,
      publisher: `Local Newspaper ${i}`,
      isPrimary: false,
      sourceTier: 't4',
      syndicatedFrom: 'wire:pti',
      contentSnippet: 'Bhopal (PTI): Cabinet clears river linking initiative.',
    }));

    const result = evaluateClusterCorroboration(syndicatedInputs);

    expect(result.primarySourceCount).toBe(0);
    expect(result.independentSourceCount).toBe(1); // All 10 collapse to wire:pti
    expect(result.wireOrigins).toContain('wire:pti');
    expect(result.corroborationLevel).toBe('SYNDICATED_SINGLE_ORIGIN');
    expect(result.isCorroborated).toBe(false); // Fails corroboration gate despite 10 media hits!
  });

  it('marks clusters as OFFICIAL_CONFIRMED when verified by primary official sources', () => {
    const inputs: SourceCorroborationInput[] = [
      {
        sourceId: 'radar-mp-gazette-pdf',
        publisher: 'Government Central Press Bhopal',
        isPrimary: true,
        sourceTier: 't1',
        contentSnippet: 'Official Gazette Notification No. 129.',
      },
      {
        sourceId: 'local-media-1',
        publisher: 'Bhopal Times',
        isPrimary: false,
        sourceTier: 't4',
        contentSnippet: 'Bhopal Times reports on the new gazette notification.',
      },
    ];

    const result = evaluateClusterCorroboration(inputs);

    expect(result.primarySourceCount).toBe(1);
    expect(result.isCorroborated).toBe(true);
    expect(result.corroborationLevel).toBe('OFFICIAL_CONFIRMED');
  });

  it('marks clusters as INDEPENDENT_CORROBORATED when 2 independent newsrooms report', () => {
    const inputs: SourceCorroborationInput[] = [
      {
        sourceId: 'radar-naidunia-rss',
        publisher: 'Nai Dunia',
        isPrimary: false,
        sourceTier: 't4',
        contentSnippet: 'Indore Bureau report on industrial summit.',
      },
      {
        sourceId: 'radar-bhaskar-mp-rss',
        publisher: 'Dainik Bhaskar',
        isPrimary: false,
        sourceTier: 't4',
        contentSnippet: 'Bhopal staff reporter analysis of industrial summit.',
      },
    ];

    const result = evaluateClusterCorroboration(inputs);

    expect(result.primarySourceCount).toBe(0);
    expect(result.independentSourceCount).toBe(2);
    expect(result.isCorroborated).toBe(true);
    expect(result.corroborationLevel).toBe('INDEPENDENT_CORROBORATED');
  });
});
