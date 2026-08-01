import { describe, it, expect } from 'vitest';
import {
  parseCompareSlugs,
  buildCompareUrl,
  resolveFixes,
  validateComparison,
  getComparisonValue,
  getComparisonFraction,
  aggregateEvidence,
  deriveFactualSummary,
  getMissingMetadataCount,
  REVERSIBILITY_CONFIG,
  SCALABILITY_CONFIG,
  COMPARISON_DIMENSIONS,
  MAX_FIXES,
  MIN_FIXES,
} from '../lib/compare-helpers';
import { FIX_MGNREGA_REFORM } from '../fixtures/fixes/fix-mgnrega';
import { FIX_PMFBY_CLAIMS } from '../fixtures/fixes/fix-pmfby';
import { FIX_AIR_POLLUTION, FIX_FARM_INCOME } from '../fixtures/fixes/fix-remaining';
import type { Fix } from '../types/canonical';

const ALL_FIXES = [FIX_MGNREGA_REFORM, FIX_PMFBY_CLAIMS, FIX_AIR_POLLUTION, FIX_FARM_INCOME];

describe('parseCompareSlugs', () => {
  it('returns empty array for null input', () => {
    expect(parseCompareSlugs(null)).toEqual([]);
  });

  it('parses comma-separated slugs', () => {
    expect(parseCompareSlugs('?fixes=a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('truncates to MAX_FIXES', () => {
    const slugs = Array.from({ length: 8 }, (_, i) => `fix-${i}`).join(',');
    expect(parseCompareSlugs(`?fixes=${slugs}`)).toHaveLength(MAX_FIXES);
  });

  it('returns empty array for missing fixes param', () => {
    expect(parseCompareSlugs('?other=value')).toEqual([]);
  });
});

describe('buildCompareUrl', () => {
  it('builds correct URL', () => {
    expect(buildCompareUrl(['fix-a', 'fix-b'])).toBe('/compare?fixes=fix-a,fix-b');
  });

  it('truncates to MAX_FIXES', () => {
    const slugs = Array.from({ length: 8 }, (_, i) => `fix-${i}`);
    const url = buildCompareUrl(slugs);
    const urlSlugs = new URL(url, 'http://localhost').searchParams.get('fixes')?.split(',') || [];
    expect(urlSlugs).toHaveLength(MAX_FIXES);
  });

  it('returns /fix for fewer than MIN_FIXES', () => {
    expect(buildCompareUrl(['fix-a'])).toBe('/fix');
    expect(buildCompareUrl([])).toBe('/fix');
  });
});

describe('resolveFixes', () => {
  it('resolves slugs to Fix objects', () => {
    const result = resolveFixes(['fix-mgnrega-reform', 'fix-pmfby-claims'], ALL_FIXES);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('fix-mgnrega-reform');
    expect(result[1].slug).toBe('fix-pmfby-claims');
  });

  it('filters out unknown slugs', () => {
    const result = resolveFixes(['fix-mgnrega-reform', 'nonexistent'], ALL_FIXES);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for no matches', () => {
    const result = resolveFixes(['nonexistent'], ALL_FIXES);
    expect(result).toHaveLength(0);
  });
});

describe('validateComparison', () => {
  it('validates minimum fixes', () => {
    expect(validateComparison(['a'])).toEqual({ valid: false, error: `Select at least ${MIN_FIXES} solutions to compare` });
  });

  it('validates maximum fixes', () => {
    const slugs = Array.from({ length: MAX_FIXES + 1 }, (_, i) => `fix-${i}`);
    expect(validateComparison(slugs)).toEqual({ valid: false, error: `Maximum ${MAX_FIXES} solutions can be compared at once` });
  });

  it('rejects duplicates', () => {
    expect(validateComparison(['a', 'a'])).toEqual({ valid: false, error: 'Duplicate solutions selected' });
  });

  it('validates correct input', () => {
    expect(validateComparison(['a', 'b'])).toEqual({ valid: true });
  });
});

describe('getComparisonValue', () => {
  it('returns evidence grade', () => {
    expect(getComparisonValue(FIX_MGNREGA_REFORM, 'evidenceGrade')).toBe('High');
  });

  it('returns evidence score formatted', () => {
    expect(getComparisonValue(FIX_MGNREGA_REFORM, 'evidenceScore')).toBe('91/100');
  });

  it('returns time horizon label', () => {
    const value = getComparisonValue(FIX_MGNREGA_REFORM, 'timeToImpact');
    expect(value).toBeTruthy();
  });

  it('returns scalability label', () => {
    expect(getComparisonValue(FIX_MGNREGA_REFORM, 'scalability')).toBe('National');
  });

  it('returns reversibility label', () => {
    expect(getComparisonValue(FIX_MGNREGA_REFORM, 'reversibility')).toBe('Partially Reversible');
  });

  it('returns trade-offs count', () => {
    const value = getComparisonValue(FIX_MGNREGA_REFORM, 'tradeOffs');
    expect(value).toMatch(/\d+ dimension/);
  });

  it('returns stakeholders count', () => {
    const value = getComparisonValue(FIX_MGNREGA_REFORM, 'stakeholders');
    expect(value).toMatch(/\d+ stakeholder/);
  });

  it('returns Not specified for missing metadata', () => {
    const fix = { ...FIX_MGNREGA_REFORM, reversibility: undefined, scalability: undefined } as Fix;
    expect(getComparisonValue(fix, 'scalability')).toBe('Not specified');
    expect(getComparisonValue(fix, 'reversibility')).toBe('Not specified');
  });
});

describe('getComparisonFraction', () => {
  it('returns evidence score fraction', () => {
    expect(getComparisonFraction(FIX_MGNREGA_REFORM, 'evidenceScore')).toBeCloseTo(0.91);
  });

  it('returns 0 for non-bar dimensions', () => {
    expect(getComparisonFraction(FIX_MGNREGA_REFORM, 'tradeOffs')).toBe(0);
  });
});

describe('aggregateEvidence', () => {
  it('computes average score', () => {
    const result = aggregateEvidence(ALL_FIXES);
    const avg = ALL_FIXES.reduce((sum, f) => sum + f.evidenceScore, 0) / ALL_FIXES.length;
    expect(result.averageScore).toBe(Math.round(avg));
  });

  it('counts total sources', () => {
    const result = aggregateEvidence(ALL_FIXES);
    expect(result.totalSources).toBeGreaterThanOrEqual(0);
  });

  it('identifies highest and lowest evidence', () => {
    const result = aggregateEvidence(ALL_FIXES);
    expect(result.highestEvidence).toBeTruthy();
    expect(result.lowestEvidence).toBeTruthy();
    expect(result.highestEvidence!.evidenceScore).toBeGreaterThanOrEqual(result.lowestEvidence!.evidenceScore);
  });

  it('handles empty input', () => {
    const result = aggregateEvidence([]);
    expect(result.averageScore).toBe(0);
    expect(result.highestEvidence).toBeNull();
    expect(result.evidenceGaps).toHaveLength(0);
  });

  it('identifies evidence gaps', () => {
    const fixWithNoSources = { ...FIX_MGNREGA_REFORM, sourceIds: [], sources: [] } as Fix;
    const result = aggregateEvidence([fixWithNoSources]);
    expect(result.evidenceGaps.some(g => g.gap === 'No sources cited')).toBe(true);
  });
});

describe('deriveFactualSummary', () => {
  it('finds highest evidence', () => {
    const result = deriveFactualSummary(ALL_FIXES);
    expect(result.highestEvidence).toBeTruthy();
    expect(result.highestEvidence!.evidenceScore).toBe(94);
  });

  it('finds fastest impact', () => {
    const result = deriveFactualSummary(ALL_FIXES);
    expect(result.fastestImpact).toBeTruthy();
  });

  it('handles empty input', () => {
    const result = deriveFactualSummary([]);
    expect(result.highestEvidence).toBeNull();
    expect(result.lowestCost).toBeNull();
  });
});

describe('getMissingMetadataCount', () => {
  it('returns 0 for fully specified fix', () => {
    expect(getMissingMetadataCount(FIX_MGNREGA_REFORM)).toBe(0);
  });

  it('counts missing optional fields', () => {
    const fix = { ...FIX_MGNREGA_REFORM, reversibility: undefined, scalability: undefined, fiscalCost: undefined } as Fix;
    expect(getMissingMetadataCount(fix)).toBeGreaterThanOrEqual(2);
  });
});

describe('constants', () => {
  it('has correct limits', () => {
    expect(MAX_FIXES).toBe(5);
    expect(MIN_FIXES).toBe(2);
  });

  it('has 15 comparison dimensions', () => {
    expect(COMPARISON_DIMENSIONS).toHaveLength(15);
  });

  it('has all reversibility configs', () => {
    expect(REVERSIBILITY_CONFIG.fully_reversible).toBeTruthy();
    expect(REVERSIBILITY_CONFIG.partially_reversible).toBeTruthy();
    expect(REVERSIBILITY_CONFIG.irreversible).toBeTruthy();
  });

  it('has all scalability configs', () => {
    expect(SCALABILITY_CONFIG.local_only).toBeTruthy();
    expect(SCALABILITY_CONFIG.state_level).toBeTruthy();
    expect(SCALABILITY_CONFIG.national).toBeTruthy();
    expect(SCALABILITY_CONFIG.universal).toBeTruthy();
  });
});
