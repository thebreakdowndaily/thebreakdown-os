import { describe, expect, it } from 'vitest';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import { REMEDIATED_BCCI_CRICKET_STORY } from '@/lib/editorial/drafts/remediated-stories';

describe('Minimum narrative depth publication gate', () => {
  it('rejects a long-form story that declares a short reading time but contains only a stub', () => {
    const stub = {
      ...REMEDIATED_BCCI_CRICKET_STORY,
      storyType: 'analysis' as const,
      blocks: [{ id: 'stub-paragraph', type: 'paragraph', data: { text: '<p>Only a few words are present in this deliberately shallow story.</p>' } }],
      readingTime: 1,
    };
    const result = validateStoryForPublication(
      { storyId: stub.id, triggeredBy: 'manual' },
      stub,
      new Date('2026-10-25T00:00:00.000Z'),
      { bypassEditorialHold: true },
    );
    const depth = result.checks.find((check) => check.name === 'narrative_depth');
    expect(depth?.passed).toBe(false);
    expect(depth?.reason).toContain('requires at least 1800 narrative words');
  });

  it('uses the same narrative metric for the remediated BCCI story and its publication gate', () => {
    const result = validateStoryForPublication(
      { storyId: REMEDIATED_BCCI_CRICKET_STORY.id, triggeredBy: 'manual' },
      REMEDIATED_BCCI_CRICKET_STORY,
      new Date('2026-10-25T00:00:00.000Z'),
      { bypassEditorialHold: true },
    );
    const depth = result.checks.find((check) => check.name === 'narrative_depth');
    expect(depth?.passed).toBe(true);
    expect(depth?.reason).toContain('words meets the 1800-word target');
  });
});
