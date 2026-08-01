import type { Fix, FixSection } from '../types/canonical';
import { CANONICAL_FIXTURES } from '../fixtures/fixes';

export interface Problem {
  slug: string;
  title: string;
  description: string;
  category: ProblemCategory;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  evidenceGrade: 'High' | 'Moderate' | 'Low' | 'Contested';
  fixCount: number;
  storyCount: number;
  entityCount: number;
  datasetCount: number;
  fixes: Fix[];
  lastUpdated: string;
  tags: string[];
}

export type ProblemCategory =
  | 'governance'
  | 'agriculture'
  | 'environment'
  | 'justice'
  | 'healthcare'
  | 'economy'
  | 'infrastructure'
  | 'education';

export const PROBLEM_CATEGORIES: Record<ProblemCategory, { label: string; icon: string; description: string }> = {
  governance: { label: 'Governance', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', description: 'Public administration, scheme delivery, and institutional reform' },
  agriculture: { label: 'Agriculture', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Farm income, crop insurance, market reform, and food security' },
  environment: { label: 'Environment', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Pollution, climate change, and ecological sustainability' },
  justice: { label: 'Justice', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', description: 'Judiciary, court reform, legal aid, and access to justice' },
  healthcare: { label: 'Healthcare', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', description: 'Nutrition, child development, public health, and welfare' },
  economy: { label: 'Economy', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Fiscal policy, employment, trade, and financial reform' },
  infrastructure: { label: 'Infrastructure', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', description: 'Transport, energy, digital infrastructure, and urban systems' },
  education: { label: 'Education', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', description: 'Schools, universities, skilling, and educational outcomes' },
};

const CATEGORY_KEYWORDS: Record<ProblemCategory, string[]> = {
  governance: ['MGNREGA', 'governance', 'scheme delivery', 'administrative', 'fund flow', 'DBT', 'social audit'],
  agriculture: ['crop insurance', 'PMFBY', 'farm income', 'MSP', 'agriculture', 'farmer', 'crop'],
  environment: ['air pollution', 'pollution', 'environment', 'emission', 'stubble', 'climate'],
  justice: ['judiciary', 'court', 'judicial', 'justice', 'pendency', 'backlog', 'ADR'],
  healthcare: ['nutrition', 'anganwadi', 'ICDS', 'child development', 'health', 'maternal', 'stunting'],
  economy: ['economy', 'fiscal', 'employment', 'trade', 'income', 'wage', 'financial'],
  infrastructure: ['infrastructure', 'transport', 'energy', 'digital', 'urban', 'housing'],
  education: ['education', 'school', 'university', 'skilling', 'literacy', 'learning'],
};

function classifyProblemCategory(fix: Fix): ProblemCategory {
  const allTags = [
    ...fix.tags,
    fix.problem?.title || '',
    fix.problemStatement || '',
    fix.primaryCategory || '',
  ].join(' ').toLowerCase();

  let bestCategory: ProblemCategory = 'governance';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => allTags.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as ProblemCategory;
    }
  }

  return bestCategory;
}

function computeSeverity(fix: Fix): Problem['severity'] {
  const score = fix.evidenceScore || 0;
  if (score >= 90) return 'critical';
  if (score >= 80) return 'high';
  if (score >= 60) return 'moderate';
  return 'low';
}

function problemSlugFromFix(fix: Fix): string {
  return fix.problem?.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || fix.slug;
}

export function extractProblems(fixes: Fix[] = CANONICAL_FIXTURES): Problem[] {
  const grouped = new Map<string, Fix[]>();

  for (const fix of fixes) {
    const slug = problemSlugFromFix(fix);
    const existing = grouped.get(slug) || [];
    existing.push(fix);
    grouped.set(slug, existing);
  }

  return Array.from(grouped.entries()).map(([slug, groupFixes]) => {
    const primary = groupFixes[0];
    const category = classifyProblemCategory(primary);
    const allStories = groupFixes.flatMap(f => f.relatedStories || []);
    const allEntities = groupFixes.flatMap(f => f.relatedEntities || []);

    return {
      slug,
      title: primary.problem?.title || primary.headline,
      description: primary.problemStatement || primary.problem?.content || primary.summary,
      category,
      severity: computeSeverity(primary),
      evidenceGrade: primary.evidenceGrade || 'Moderate',
      fixCount: groupFixes.length,
      storyCount: allStories.length,
      entityCount: allEntities.length,
      datasetCount: 0,
      fixes: groupFixes,
      lastUpdated: groupFixes.reduce((latest, f) => {
        const updated = new Date(f.updatedAt).getTime();
        return updated > latest ? updated : latest;
      }, 0).toString(),
      tags: [...new Set(groupFixes.flatMap(f => f.tags))],
    };
  });
}

export function getProblemsByCategory(problems: Problem[], category: ProblemCategory): Problem[] {
  return problems.filter(p => p.category === category);
}

export function searchProblems(problems: Problem[], query: string): Problem[] {
  if (!query) return problems;
  const q = query.toLowerCase();
  return problems.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function getCategoryStats(problems: Problem[]) {
  const stats: Record<ProblemCategory, { problemCount: number; fixCount: number; lastUpdated: string }> = {} as Record<ProblemCategory, { problemCount: number; fixCount: number; lastUpdated: string }>;

  for (const cat of Object.keys(PROBLEM_CATEGORIES) as ProblemCategory[]) {
    const catProblems = getProblemsByCategory(problems, cat);
    stats[cat] = {
      problemCount: catProblems.length,
      fixCount: catProblems.reduce((sum, p) => sum + p.fixCount, 0),
      lastUpdated: catProblems.reduce((latest, p) => {
        const updated = new Date(p.lastUpdated).getTime();
        return updated > latest ? updated : latest;
      }, 0).toString(),
    };
  }

  return stats;
}

export function getProblemBySlug(problems: Problem[], slug: string): Problem | undefined {
  return problems.find(p => p.slug === slug);
}
