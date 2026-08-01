import { describe, it, expect } from 'vitest';
import { CANONICAL_FIXTURES, getFixtureBySlug, getFixtureById } from '../fixtures/fixes';
import { FIX_MGNREGA_REFORM } from '../fixtures/fixes/fix-mgnrega';
import { FIX_PMFBY_CLAIMS } from '../fixtures/fixes/fix-pmfby';
import { FIX_AIR_POLLUTION, FIX_FARM_INCOME, FIX_JUDICIAL_PENDENCY, FIX_ANGANWADI } from '../fixtures/fixes/fix-remaining';

// ---------------------------------------------------------------------------
// TEST-FIX-HUB-01: Fixture Layer Completeness
// ---------------------------------------------------------------------------
describe('Fixtures: Canonical Fixture Layer', () => {
  it('TEST-FIX-HUB-01a: exports exactly 6 fixtures', () => {
    expect(CANONICAL_FIXTURES).toHaveLength(6);
  });

  it('TEST-FIX-HUB-01b: every fixture has AR-13A.0 required fields', () => {
    for (const fix of CANONICAL_FIXTURES) {
      expect(fix.primaryCategory).toBeDefined();
      expect(fix.maturityStatus).toBeDefined();
      expect(fix.evidenceGrade).toBeDefined();
      expect(fix.timeToImpact).toBeDefined();
      expect(fix.problemStatement).toBeDefined();
      expect(fix.lastVerified).toBeDefined();
      expect(fix.version).toBeDefined();
    }
  });

  it('TEST-FIX-HUB-01c: getFixtureBySlug returns correct fixture', () => {
    const fix = getFixtureBySlug('fix-mgnrega-reform');
    expect(fix).toBeDefined();
    expect(fix!.id).toBe('fix-mgnrega-reform');
  });

  it('TEST-FIX-HUB-01d: getFixtureBySlug returns undefined for unknown slug', () => {
    expect(getFixtureBySlug('nonexistent')).toBeUndefined();
  });

  it('TEST-FIX-HUB-01e: getFixtureById works', () => {
    const fix = getFixtureById('fix-pmfby-claims');
    expect(fix).toBeDefined();
    expect(fix!.slug).toBe('fix-pmfby-claims');
  });

  it('TEST-FIX-HUB-01f: every fixture has globalPrecedents array with entries', () => {
    for (const fix of CANONICAL_FIXTURES) {
      expect(Array.isArray(fix.globalPrecedents)).toBe(true);
      expect(fix.globalPrecedents!.length).toBeGreaterThan(0);
    }
  });

  it('TEST-FIX-HUB-01g: every fixture has tradeOffs array', () => {
    for (const fix of CANONICAL_FIXTURES) {
      expect(Array.isArray(fix.tradeOffs)).toBe(true);
    }
  });

  it('TEST-FIX-HUB-01h: every fixture has successMetrics', () => {
    for (const fix of CANONICAL_FIXTURES) {
      expect(fix.successMetrics).toBeDefined();
    }
  });

  it('TEST-FIX-HUB-01i: all fixture slugs are unique', () => {
    const slugs = CANONICAL_FIXTURES.map(f => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('TEST-FIX-HUB-01j: all fixture ids are unique', () => {
    const ids = CANONICAL_FIXTURES.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// TEST-FIX-HUB-02: Fixture Field Values
// ---------------------------------------------------------------------------
describe('Fixtures: Field Value Coverage', () => {
  const ALL_FIXTURES = [FIX_MGNREGA_REFORM, FIX_PMFBY_CLAIMS, FIX_AIR_POLLUTION, FIX_FARM_INCOME, FIX_JUDICIAL_PENDENCY, FIX_ANGANWADI];

  it('TEST-FIX-HUB-02a: covers all InterventionType values', () => {
    const categories = new Set(ALL_FIXTURES.map(f => f.primaryCategory));
    expect(categories.has('statutory')).toBe(true);
    expect(categories.has('administrative')).toBe(true);
    expect(categories.has('institutional')).toBe(true);
    expect(categories.has('fiscal')).toBe(true);
    expect(categories.has('judicial')).toBe(true);
  });

  it('TEST-FIX-HUB-02b: covers all PolicyMaturity values', () => {
    const maturities = new Set(ALL_FIXTURES.map(f => f.maturityStatus));
    expect(maturities.has('expert_reviewed')).toBe(true);
    expect(maturities.has('pilot')).toBe(true);
    expect(maturities.has('proposed')).toBe(true);
  });

  it('TEST-FIX-HUB-02c: covers all EvidenceGrade values', () => {
    const grades = new Set(ALL_FIXTURES.map(f => f.evidenceGrade));
    expect(grades.has('High')).toBe(true);
    expect(grades.has('Moderate')).toBe(true);
  });

  it('TEST-FIX-HUB-02d: covers all TimeHorizon values', () => {
    const horizons = new Set(ALL_FIXTURES.map(f => f.timeToImpact));
    expect(horizons.has('short-term')).toBe(true);
    expect(horizons.has('medium-term')).toBe(true);
    expect(horizons.has('long-term')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TEST-FIX-HUB-03: Facet Filtering Logic
// ---------------------------------------------------------------------------
describe('Fix Hub: Facet Filtering', () => {
  it('TEST-FIX-HUB-03a: filters by primaryCategory = statutory', () => {
    const result = CANONICAL_FIXTURES.filter(f => f.primaryCategory === 'statutory');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fix-mgnrega-reform');
  });

  it('TEST-FIX-HUB-03b: filters by maturityStatus = expert_reviewed', () => {
    const result = CANONICAL_FIXTURES.filter(f => f.maturityStatus === 'expert_reviewed');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('TEST-FIX-HUB-03c: filters by evidenceGrade = High', () => {
    const result = CANONICAL_FIXTURES.filter(f => f.evidenceGrade === 'High');
    expect(result).toHaveLength(4);
  });

  it('TEST-FIX-HUB-03d: filters by timeToImpact = short-term', () => {
    const result = CANONICAL_FIXTURES.filter(f => f.timeToImpact === 'short-term');
    expect(result).toHaveLength(2);
  });

  it('TEST-FIX-HUB-03e: multi-filter intersection (statutory + High evidence)', () => {
    const result = CANONICAL_FIXTURES.filter(f =>
      f.primaryCategory === 'statutory' && f.evidenceGrade === 'High'
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fix-mgnrega-reform');
  });

  it('TEST-FIX-HUB-03f: multi-filter union across categories', () => {
    const result = CANONICAL_FIXTURES.filter(f =>
      f.primaryCategory === 'fiscal' || f.primaryCategory === 'judicial'
    );
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// TEST-FIX-HUB-04: Search Logic
// ---------------------------------------------------------------------------
describe('Fix Hub: Search', () => {
  it('TEST-FIX-HUB-04a: searches by headline', () => {
    const q = 'mgnrega';
    const result = CANONICAL_FIXTURES.filter(f =>
      f.headline.toLowerCase().includes(q)
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('fix-mgnrega-reform');
  });

  it('TEST-FIX-HUB-04b: searches by tags', () => {
    const q = 'crop insurance';
    const result = CANONICAL_FIXTURES.filter(f =>
      f.tags.some(t => t.toLowerCase().includes(q))
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('fix-pmfby-claims');
  });

  it('TEST-FIX-HUB-04c: searches by problemStatement', () => {
    const q = '5.2 crore';
    const result = CANONICAL_FIXTURES.filter(f =>
      (f.problemStatement || '').toLowerCase().includes(q)
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('fix-judicial-pendency');
  });

  it('TEST-FIX-HUB-04d: empty query returns all', () => {
    const q = '';
    const result = CANONICAL_FIXTURES.filter(f =>
      q === '' || f.headline.toLowerCase().includes(q)
    );
    expect(result).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// TEST-FIX-HUB-05: Sort Logic
// ---------------------------------------------------------------------------
describe('Fix Hub: Sorting', () => {
  it('TEST-FIX-HUB-05a: sort by evidence score descending', () => {
    const sorted = [...CANONICAL_FIXTURES].sort((a, b) => b.evidenceScore - a.evidenceScore);
    expect(sorted[0].evidenceScore).toBeGreaterThanOrEqual(sorted[1].evidenceScore);
    expect(sorted[0].slug).toBe('fix-pmfby-claims');
  });

  it('TEST-FIX-HUB-05b: sort by reading time ascending', () => {
    const sorted = [...CANONICAL_FIXTURES].sort((a, b) => a.readingTime - b.readingTime);
    expect(sorted[0].readingTime).toBeLessThanOrEqual(sorted[1].readingTime);
  });

  it('TEST-FIX-HUB-05c: sort by freshness descending', () => {
    const sorted = [...CANONICAL_FIXTURES].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    expect(new Date(sorted[0].updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(sorted[1].updatedAt).getTime()
    );
  });

  it('TEST-FIX-HUB-05d: sort by maturity (expert_reviewed before proposed)', () => {
    const order: Record<string, number> = { published: 0, expert_reviewed: 1, pilot: 2, proposed: 3 };
    const sorted = [...CANONICAL_FIXTURES].sort((a, b) =>
      (order[a.maturityStatus || 'proposed'] || 3) - (order[b.maturityStatus || 'proposed'] || 3)
    );
    expect(sorted[0].maturityStatus).toBe('expert_reviewed');
    expect(sorted[sorted.length - 1].maturityStatus).toBe('proposed');
  });
});

// ---------------------------------------------------------------------------
// TEST-FIX-HUB-06: Saved Views Presets
// ---------------------------------------------------------------------------
describe('Fix Hub: Saved View Presets', () => {
  const VIEW_PRESETS: Record<string, Record<string, string[]>> = {
    all: {},
    published: { maturityStatus: ['published'] },
    'high-evidence': { evidenceGrade: ['High'] },
    'quick-impact': { timeToImpact: ['short-term'] },
    'policy-reforms': { primaryCategory: ['statutory', 'fiscal'] },
    governance: { primaryCategory: ['administrative', 'institutional', 'judicial'] },
  };

  function applyFilters(fixes: typeof CANONICAL_FIXTURES, filters: Record<string, string[]>) {
    if (Object.keys(filters).length === 0) return fixes;
    return fixes.filter(f => {
      return Object.entries(filters).every(([field, values]) => {
        if (values.length === 0) return true;
        const val = (f as Record<string, unknown>)[field];
        if (Array.isArray(val)) return values.some(v => val.includes(v));
        return values.includes(String(val));
      });
    });
  }

  it('TEST-FIX-HUB-06a: "all" returns all 6', () => {
    expect(applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS.all)).toHaveLength(6);
  });

  it('TEST-FIX-HUB-06b: "published" returns 0 (none have published maturity)', () => {
    expect(applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS.published)).toHaveLength(0);
  });

  it('TEST-FIX-HUB-06c: "high-evidence" returns 4', () => {
    expect(applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS['high-evidence'])).toHaveLength(4);
  });

  it('TEST-FIX-HUB-06d: "quick-impact" returns 2', () => {
    expect(applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS['quick-impact'])).toHaveLength(2);
  });

  it('TEST-FIX-HUB-06e: "policy-reforms" returns 2 (statutory + fiscal)', () => {
    expect(applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS['policy-reforms'])).toHaveLength(2);
  });

  it('TEST-FIX-HUB-06f: "governance" returns 4 (administrative + institutional×2 + judicial)', () => {
    expect(applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS.governance)).toHaveLength(4);
  });

  it('TEST-FIX-HUB-06g: combined saved view + search works', () => {
    const q = 'air';
    const published = applyFilters(CANONICAL_FIXTURES, VIEW_PRESETS.published);
    const searched = published.filter(f => f.headline.toLowerCase().includes(q));
    expect(searched).toHaveLength(0);
  });
});
