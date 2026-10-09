import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveNextBestUnderstanding,
  explainRecommendation,
  setEditorialOverride,
  clearEditorialOverrides,
} from '@/lib/comprehension/next-best-understanding';

describe('Phase 6: Empirical Reader Validation & Relevance Engine', () => {
  beforeEach(() => {
    clearEditorialOverrides();
  });

  describe('1. Gold-Standard Curated Plans', () => {
    it('verifies accountability-in-india plan satisfies multi-dimensional comprehension', () => {
      const plan = resolveNextBestUnderstanding('accountability-in-india');
      expect(plan.storySlug).toBe('accountability-in-india');
      expect(plan.steps.length).toBe(4);

      // Verify each step has a distinct learning path
      const learningPaths = plan.steps.map((s) => s.learningPath);
      expect(learningPaths).toContain('legal_statutory');
      expect(learningPaths).toContain('institutional');
      expect(learningPaths).toContain('structural_reform');
      expect(learningPaths).toContain('empirical_evidence');

      // Verify explanations describe reader cognitive need
      plan.steps.forEach((step) => {
        const explanation = explainRecommendation(step);
        expect(explanation.length).toBeGreaterThan(20);
        expect(explanation).not.toContain('Shares entity');
      });
    });

    it('verifies electoral-bonds plan routes to supreme court and state funding fix', () => {
      const plan = resolveNextBestUnderstanding('electoral-bonds');
      expect(plan.steps.some((s) => s.url === '/entity/supreme-court-of-india')).toBe(true);
      expect(plan.steps.some((s) => s.url === '/fix')).toBe(true);
      expect(plan.steps.some((s) => s.type === 'prerequisite')).toBe(true);
    });

    it('verifies pm-fasal-bima-claims connects to satellite remote sensing fix', () => {
      const plan = resolveNextBestUnderstanding('pm-fasal-bima-claims');
      expect(plan.storySlug).toBe('pm-fasal-bima-claims');
      expect(plan.steps.some((s) => s.url === '/fix/fix-pmfby-claims')).toBe(true);
      expect(plan.steps.some((s) => s.url === '/entity/ministry-of-agriculture')).toBe(true);
    });
  });

  describe('2. Prerequisite Suppression & Friction Reduction', () => {
    it('suppresses prerequisite on self-contained consumer stories (digital-payments-boom)', () => {
      const plan = resolveNextBestUnderstanding('digital-payments-boom');
      expect(plan.suppressPrerequisite).toBe(true);
      expect(plan.steps.some((s) => s.type === 'prerequisite')).toBe(false);
    });
  });

  describe('3. False Connection Safeguards', () => {
    it('blocks generic country entity (/entity/india) from becoming a primary recommendation', () => {
      // Create a story lookup that has primaryEntityId as 'india'
      const plan = resolveNextBestUnderstanding('digital-payments-boom');
      expect(plan.steps.some((s) => s.url === '/entity/india')).toBe(false);
    });

    it('blocks self-referential circular links', () => {
      const plan = resolveNextBestUnderstanding('accountability-in-india');
      expect(plan.steps.some((s) => s.url === '/story/accountability-in-india')).toBe(false);
    });
  });

  describe('4. Human-in-the-Loop Editorial Overrides', () => {
    it('allows an editor to customize the cognitive rationale', () => {
      setEditorialOverride('accountability-in-india', {
        customRationale: 'Focus exclusively on the 28-month audit delay and citizen social audits.',
      });

      const plan = resolveNextBestUnderstanding('accountability-in-india');
      expect(plan.rationale).toBe('Focus exclusively on the 28-month audit delay and citizen social audits.');
    });

    it('allows an editor to suppress specific URLs deemed tangential', () => {
      setEditorialOverride('accountability-in-india', {
        suppressedUrls: ['/fix'],
      });

      const plan = resolveNextBestUnderstanding('accountability-in-india');
      expect(plan.steps.some((s) => s.url === '/fix')).toBe(false);
    });

    it('allows an editor to force-suppress prerequisites on any story', () => {
      setEditorialOverride('electoral-bonds', {
        suppressPrerequisite: true,
      });

      const plan = resolveNextBestUnderstanding('electoral-bonds');
      expect(plan.suppressPrerequisite).toBe(true);
      expect(plan.steps.some((s) => s.type === 'prerequisite')).toBe(false);
    });
  });

  describe('5. Explainability & Cognitive Need', () => {
    it('explains why each recommendation exists in human terms', () => {
      const defaultExplanation = explainRecommendation({
        type: 'institutional_actor',
        badgeLabel: 'Key Institutional Actor',
        title: 'Comptroller and Auditor General',
        summary: 'Audit institution',
        url: '/entity/cag',
      });

      expect(defaultExplanation).toContain('Institutional leverage:');
      expect(defaultExplanation).toContain('statutory power');
    });
  });
});
