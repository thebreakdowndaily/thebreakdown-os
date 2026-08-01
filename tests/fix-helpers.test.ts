import { describe, it, expect } from 'vitest';
import {
  MATURITY_CONFIG, MATURITY_ORDER, INTERVENTION_COLOR_MAP, EVIDENCE_GRADE_CONFIG,
  HORIZON_LABELS, FILTER_LABELS,
  formatCostLabel, formatDate, formatDateLong, getSourceCount,
  getEvidenceLabel, getEvidenceTextColor, getEvidenceBarColor,
  computeImpactScores, computeImplementationPhases, computeRelevanceScore,
} from '../lib/fix-helpers';
import type { Fix } from '../types/canonical';

function makeFix(overrides: Partial<Fix> = {}): Fix {
  return {
    id: 'test-1',
    slug: 'test-fix',
    headline: 'Test Fix',
    summary: 'Summary',
    storySlug: 'test-story',
    publishedAt: '2025-01-01',
    updatedAt: '2025-06-01',
    readingTime: 5,
    author: { name: 'Editorial Bureau', role: 'Research Analyst' },
    evidenceScore: 80,
    tags: ['governance', 'education'],
    problem: { title: 'Problem', content: 'Content' },
    rootCauses: { title: 'Root', content: 'Causes' },
    evidence: { title: 'Evidence', content: 'Data' },
    stakeholders: [],
    existingSolutions: [],
    globalExamples: [],
    recommendedActions: [],
    citizenActions: [],
    governmentActions: [],
    metricsToTrack: [],
    primaryCategory: 'administrative',
    maturityStatus: 'expert_reviewed',
    evidenceGrade: 'High',
    fiscalCost: undefined,
    timeToImpact: 'medium-term',
    tradeOffs: [],
    risksAndFailures: [],
    successMetrics: [],
    sourceIds: ['s1', 's2', 's3'],
    sources: [],
    lastVerified: '2025-07-01',
    ...overrides,
  } as Fix;
}

describe('fix-helpers constants', () => {
  it('MATURITY_CONFIG has all 4 statuses', () => {
    expect(Object.keys(MATURITY_CONFIG)).toEqual(
      expect.arrayContaining(['published', 'expert_reviewed', 'pilot', 'proposed'])
    );
  });

  it('MATURITY_ORDER is ordered correctly', () => {
    expect(MATURITY_ORDER.published).toBe(0);
    expect(MATURITY_ORDER.proposed).toBe(3);
  });

  it('INTERVENTION_COLOR_MAP has all 6 intervention types', () => {
    expect(Object.keys(INTERVENTION_COLOR_MAP)).toEqual(
      expect.arrayContaining(['fiscal', 'statutory', 'administrative', 'technological', 'institutional', 'judicial'])
    );
  });

  it('EVIDENCE_GRADE_CONFIG has High, Moderate, Low', () => {
    expect(Object.keys(EVIDENCE_GRADE_CONFIG)).toEqual(
      expect.arrayContaining(['High', 'Moderate', 'Low'])
    );
  });

  it('HORIZON_LABELS maps all time horizons', () => {
    expect(HORIZON_LABELS['short-term']).toBeDefined();
    expect(HORIZON_LABELS['medium-term']).toBeDefined();
    expect(HORIZON_LABELS['long-term']).toBeDefined();
  });

  it('FILTER_LABELS covers 4 filter fields', () => {
    expect(Object.keys(FILTER_LABELS)).toHaveLength(4);
  });
});

describe('formatCostLabel', () => {
  it('returns Budget Neutral when no fiscal cost', () => {
    expect(formatCostLabel(undefined)).toBe('Budget Neutral');
  });

  it('returns formatted cost with currency and amount', () => {
    expect(formatCostLabel({ currency: 'INR', amount: '50000 Cr' })).toBe('INR 50000 Cr');
  });
});

describe('formatDate', () => {
  it('returns N/A for undefined', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('formats a valid date string', () => {
    const result = formatDate('2025-07-15');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatDateLong', () => {
  it('returns N/A for undefined', () => {
    expect(formatDateLong(undefined)).toBe('N/A');
  });

  it('formats a valid date string with full month', () => {
    const result = formatDateLong('2025-07-15');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('getSourceCount', () => {
  it('counts sourceIds first', () => {
    const fix = makeFix({ sourceIds: ['a', 'b', 'c'], sources: ['x'] });
    expect(getSourceCount(fix)).toBe(3);
  });

  it('falls back to sources if sourceIds is empty', () => {
    const fix = makeFix({ sourceIds: [], sources: ['x', 'y'] });
    expect(getSourceCount(fix)).toBe(2);
  });

  it('returns 0 when both are empty', () => {
    const fix = makeFix({ sourceIds: [], sources: [] });
    expect(getSourceCount(fix)).toBe(0);
  });
});

describe('getEvidenceLabel', () => {
  it('returns High for score >= 85', () => {
    expect(getEvidenceLabel(90)).toBe('High');
    expect(getEvidenceLabel(85)).toBe('High');
  });

  it('returns Moderate-High for 70-84', () => {
    expect(getEvidenceLabel(75)).toBe('Moderate-High');
  });

  it('returns Moderate for 55-69', () => {
    expect(getEvidenceLabel(60)).toBe('Moderate');
  });

  it('returns Low-Moderate for 40-54', () => {
    expect(getEvidenceLabel(45)).toBe('Low-Moderate');
  });

  it('returns Low for score < 40', () => {
    expect(getEvidenceLabel(30)).toBe('Low');
  });
});

describe('getEvidenceTextColor', () => {
  it('returns emerald for high scores', () => {
    expect(getEvidenceTextColor(90)).toContain('emerald');
  });

  it('returns amber for moderate scores', () => {
    expect(getEvidenceTextColor(60)).toContain('amber');
  });

  it('returns red for low scores', () => {
    expect(getEvidenceTextColor(30)).toContain('red');
  });
});

describe('getEvidenceBarColor', () => {
  it('returns emerald bg for high scores', () => {
    expect(getEvidenceBarColor(90)).toContain('emerald');
  });
});

describe('computeImpactScores', () => {
  it('computes correct impact fraction', () => {
    const fix = makeFix({ evidenceScore: 80 });
    const scores = computeImpactScores(fix);
    expect(scores.impactFrac).toBe(0.8);
  });

  it('returns correct assessment basis for High evidence', () => {
    const fix = makeFix({ evidenceGrade: 'High' });
    const scores = computeImpactScores(fix);
    expect(scores.assessmentBasis).toBe('Evidence-backed estimate');
  });

  it('returns correct assessment basis for expert_reviewed maturity', () => {
    const fix = makeFix({ evidenceGrade: 'Moderate', maturityStatus: 'expert_reviewed' });
    const scores = computeImpactScores(fix);
    expect(scores.assessmentBasis).toBe('Expert review');
  });

  it('returns Significant cost for fixes with fiscal cost', () => {
    const fix = makeFix({ fiscalCost: { currency: 'INR', amount: '500 Cr' } });
    const scores = computeImpactScores(fix);
    expect(scores.costLabel).toBe('Significant');
  });

  it('returns Budget Neutral for fixes without fiscal cost', () => {
    const fix = makeFix({ fiscalCost: undefined });
    const scores = computeImpactScores(fix);
    expect(scores.costLabel).toBe('Budget Neutral');
  });
});

describe('computeImplementationPhases', () => {
  it('returns 3 phases for short-term', () => {
    const fix = makeFix({ timeToImpact: 'short-term' });
    const phases = computeImplementationPhases(fix);
    expect(phases).toHaveLength(3);
    expect(phases[0].status).toBe('completed');
    expect(phases[1].status).toBe('in_progress');
    expect(phases[2].status).toBe('upcoming');
  });

  it('returns 4 phases for long-term', () => {
    const fix = makeFix({ timeToImpact: 'long-term' });
    const phases = computeImplementationPhases(fix);
    expect(phases).toHaveLength(4);
  });

  it('returns 3 phases for medium-term (default)', () => {
    const fix = makeFix({ timeToImpact: 'medium-term' });
    const phases = computeImplementationPhases(fix);
    expect(phases).toHaveLength(3);
  });
});

describe('computeRelevanceScore', () => {
  it('scores higher for headline match', () => {
    const fix = makeFix({ headline: 'Education Reform' });
    const score = computeRelevanceScore(fix, 'education');
    expect(score).toBeGreaterThan(30);
  });

  it('scores higher for tag match', () => {
    const fix = makeFix({ tags: ['governance', 'reform'] });
    const score = computeRelevanceScore(fix, 'governance');
    expect(score).toBeGreaterThan(20);
  });

  it('returns 0 for no match', () => {
    const fix = makeFix({ headline: 'Healthcare', tags: ['health'] });
    const score = computeRelevanceScore(fix, 'xyz-no-match');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
