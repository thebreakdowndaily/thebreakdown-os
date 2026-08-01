import { describe, it, expect } from 'vitest';
import {
  extractProblems,
  getProblemsByCategory,
  searchProblems,
  getCategoryStats,
  getProblemBySlug,
  PROBLEM_CATEGORIES,
} from '../lib/problem-helpers';
import type { Problem, ProblemCategory } from '../lib/problem-helpers';
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
    problem: { title: 'Test Problem', content: 'Content' },
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
    sourceIds: ['s1'],
    sources: [],
    lastVerified: '2025-07-01',
    ...overrides,
  } as Fix;
}

describe('problem-helpers extractProblems', () => {
  it('returns problems grouped by problem.title slug', () => {
    const fixes = [
      makeFix({ id: '1', slug: 'fix-1', problem: { title: 'Same Problem', content: 'A' } }),
      makeFix({ id: '2', slug: 'fix-2', problem: { title: 'Same Problem', content: 'B' } }),
    ];
    const problems = extractProblems(fixes);
    expect(problems).toHaveLength(1);
    expect(problems[0].fixCount).toBe(2);
  });

  it('creates separate problems for different titles', () => {
    const fixes = [
      makeFix({ id: '1', slug: 'fix-1', problem: { title: 'Problem A', content: 'A' } }),
      makeFix({ id: '2', slug: 'fix-2', problem: { title: 'Problem B', content: 'B' } }),
    ];
    const problems = extractProblems(fixes);
    expect(problems).toHaveLength(2);
  });

  it('derives slug from problem.title', () => {
    const fixes = [makeFix({ problem: { title: 'Air Pollution in Delhi', content: 'X' } })];
    const problems = extractProblems(fixes);
    expect(problems[0].slug).toBe('air-pollution-in-delhi');
  });

  it('falls back to fix.slug when problem.title is missing', () => {
    const fixes = [makeFix({ slug: 'fallback-slug', problem: undefined })];
    const problems = extractProblems(fixes);
    expect(problems[0].slug).toBe('fallback-slug');
  });

  it('uses default export with CANONICAL_FIXTURES', () => {
    const problems = extractProblems();
    expect(problems.length).toBeGreaterThan(0);
  });

  it('computes severity from evidenceScore', () => {
    const fixes = [
      makeFix({ id: '1', slug: 'f1', evidenceScore: 95, problem: { title: 'P1', content: 'X' } }),
      makeFix({ id: '2', slug: 'f2', evidenceScore: 70, problem: { title: 'P2', content: 'X' } }),
    ];
    const problems = extractProblems(fixes);
    expect(problems[0].severity).toBe('critical');
    expect(problems[1].severity).toBe('moderate');
  });

  it('collects all tags from grouped fixes', () => {
    const fixes = [
      makeFix({ id: '1', slug: 'f1', tags: ['a', 'b'], problem: { title: 'P', content: 'X' } }),
      makeFix({ id: '2', slug: 'f2', tags: ['b', 'c'], problem: { title: 'P', content: 'X' } }),
    ];
    const problems = extractProblems(fixes);
    expect(problems[0].tags).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for empty input', () => {
    expect(extractProblems([])).toEqual([]);
  });
});

describe('problem-helpers getProblemsByCategory', () => {
  it('filters problems by category', () => {
    const problems: Problem[] = [
      { slug: 'a', title: 'A', description: '', category: 'governance', severity: 'high', evidenceGrade: 'High', fixCount: 1, storyCount: 0, entityCount: 0, datasetCount: 0, fixes: [], lastUpdated: '', tags: [] },
      { slug: 'b', title: 'B', description: '', category: 'agriculture', severity: 'high', evidenceGrade: 'High', fixCount: 1, storyCount: 0, entityCount: 0, datasetCount: 0, fixes: [], lastUpdated: '', tags: [] },
    ];
    const result = getProblemsByCategory(problems, 'governance');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });
});

describe('problem-helpers searchProblems', () => {
  const problems: Problem[] = [
    { slug: 'air-pollution', title: 'Air Pollution', description: 'Delhi air quality crisis', category: 'environment', severity: 'critical', evidenceGrade: 'High', fixCount: 1, storyCount: 0, entityCount: 0, datasetCount: 0, fixes: [], lastUpdated: '', tags: ['pollution', 'health'] },
    { slug: 'farm-income', title: 'Farm Income', description: 'Low agricultural wages', category: 'agriculture', severity: 'high', evidenceGrade: 'Moderate', fixCount: 1, storyCount: 0, entityCount: 0, datasetCount: 0, fixes: [], lastUpdated: '', tags: ['agriculture', 'income'] },
  ];

  it('finds by title', () => {
    expect(searchProblems(problems, 'Farm')).toHaveLength(1);
  });

  it('finds by description', () => {
    expect(searchProblems(problems, 'Delhi')).toHaveLength(1);
  });

  it('finds by tag', () => {
    expect(searchProblems(problems, 'pollution')).toHaveLength(1);
  });

  it('returns all for empty query', () => {
    expect(searchProblems(problems, '')).toHaveLength(2);
  });

  it('returns empty for no match', () => {
    expect(searchProblems(problems, 'xyz')).toHaveLength(0);
  });
});

describe('problem-helpers getCategoryStats', () => {
  it('returns stats for all categories', () => {
    const stats = getCategoryStats([]);
    const cats = Object.keys(PROBLEM_CATEGORIES) as ProblemCategory[];
    expect(Object.keys(stats)).toEqual(cats);
  });

  it('counts problems and fixes per category', () => {
    const fixes = [
      makeFix({ id: '1', slug: 'f1', problem: { title: 'Gov Problem', content: 'X' }, tags: ['MGNREGA', 'governance'] }),
      makeFix({ id: '2', slug: 'f2', problem: { title: 'Farm Problem', content: 'X' }, tags: ['crop insurance', 'PMFBY'] }),
    ];
    const problems = extractProblems(fixes);
    const stats = getCategoryStats(problems);
    expect(stats.governance.problemCount).toBe(1);
    expect(stats.agriculture.problemCount).toBe(1);
  });
});

describe('problem-helpers getProblemBySlug', () => {
  const problems: Problem[] = [
    { slug: 'air-pollution', title: 'Air Pollution', description: '', category: 'environment', severity: 'critical', evidenceGrade: 'High', fixCount: 1, storyCount: 0, entityCount: 0, datasetCount: 0, fixes: [], lastUpdated: '', tags: [] },
  ];

  it('finds by slug', () => {
    expect(getProblemBySlug(problems, 'air-pollution')?.title).toBe('Air Pollution');
  });

  it('returns undefined for missing slug', () => {
    expect(getProblemBySlug(problems, 'missing')).toBeUndefined();
  });
});

describe('problem-helpers PROBLEM_CATEGORIES', () => {
  it('has 8 categories', () => {
    expect(Object.keys(PROBLEM_CATEGORIES)).toHaveLength(8);
  });

  it('each category has label, icon, description', () => {
    for (const [key, val] of Object.entries(PROBLEM_CATEGORIES)) {
      expect(val.label).toBeTruthy();
      expect(val.icon).toBeTruthy();
      expect(val.description).toBeTruthy();
    }
  });
});
