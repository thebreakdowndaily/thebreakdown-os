import { describe, it, expect } from 'vitest';
import { resolveNextBestUnderstanding } from '@/lib/comprehension/next-best-understanding';

describe('Phase 5: Next Best Understanding Engine', () => {
  it('resolves curated cognitive plan for accountability-in-india', () => {
    const plan = resolveNextBestUnderstanding('accountability-in-india');
    expect(plan.storySlug).toBe('accountability-in-india');
    expect(plan.steps.length).toBe(4);

    const prerequisite = plan.steps.find((s) => s.type === 'prerequisite');
    expect(prerequisite).toBeDefined();
    expect(prerequisite?.url).toBe('/entity/cag');

    const actor = plan.steps.find((s) => s.type === 'institutional_actor');
    expect(actor).toBeDefined();
    expect(actor?.url).toBe('/entity/supreme-court-of-india');

    const fix = plan.steps.find((s) => s.type === 'structural_fix');
    expect(fix).toBeDefined();
    expect(fix?.url).toBe('/fix');
  });

  it('resolves curated cognitive plan for electoral-bonds', () => {
    const plan = resolveNextBestUnderstanding('electoral-bonds');
    expect(plan.storySlug).toBe('electoral-bonds');
    expect(plan.steps.length).toBe(4);

    const prerequisite = plan.steps.find((s) => s.type === 'prerequisite');
    expect(prerequisite).toBeDefined();
    expect(prerequisite?.url).toBe('/topic/policy');

    const actor = plan.steps.find((s) => s.type === 'institutional_actor');
    expect(actor).toBeDefined();
    expect(actor?.url).toBe('/entity/supreme-court-of-india');
  });

  it('resolves curated cognitive plan for mgnrega-reform', () => {
    const plan = resolveNextBestUnderstanding('mgnrega-reform');
    expect(plan.storySlug).toBe('mgnrega-reform');
    expect(plan.steps.length).toBe(4);

    const actor = plan.steps.find((s) => s.type === 'institutional_actor');
    expect(actor).toBeDefined();
    expect(actor?.url).toBe('/entity/ministry-of-rural-development');

    const prereq = plan.steps.find((s) => s.type === 'prerequisite');
    expect(prereq).toBeDefined();
    expect(prereq?.url).toBe('/trackers/mgnrega');
  });

  it('provides deterministic fallback cognitive plan for any valid story', () => {
    const plan = resolveNextBestUnderstanding('digital-payments-boom');
    expect(plan.storySlug).toBe('digital-payments-boom');
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.rationale).toBeDefined();
    expect(plan.steps.every((s) => Boolean(s.url && s.title && s.badgeLabel))).toBe(true);
  });
});
