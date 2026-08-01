import type { Fix, EvidenceGrade } from '../types/canonical';
import { computeImpactScores, formatCostLabel, HORIZON_LABELS, MATURITY_CONFIG, EVIDENCE_GRADE_CONFIG, INTERVENTION_COLOR_MAP } from './fix-helpers';
export { MATURITY_CONFIG, INTERVENTION_COLOR_MAP };

export const REVERSIBILITY_CONFIG: Record<string, { label: string; description: string; className: string }> = {
  fully_reversible: {
    label: 'Fully Reversible',
    description: 'Can be undone without lasting structural change',
    className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  partially_reversible: {
    label: 'Partially Reversible',
    description: 'Can be partially undone, but some effects persist',
    className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  irreversible: {
    label: 'Irreversible',
    description: 'Structural changes that cannot be undone',
    className: 'bg-red-500/20 text-red-300 border border-red-500/30',
  },
};

export const SCALABILITY_CONFIG: Record<string, { label: string; description: string; className: string }> = {
  local_only: {
    label: 'Local Only',
    description: 'Effective only at the local level',
    className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  },
  state_level: {
    label: 'State Level',
    description: 'Can scale to individual states',
    className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  national: {
    label: 'National',
    description: 'Can scale across all states',
    className: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  },
  universal: {
    label: 'Universal',
    description: 'Applicable across all contexts and scales',
    className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
};

export const COMPARISON_DIMENSIONS = [
  { key: 'evidenceGrade', label: 'Evidence Quality', category: 'evidence' as const },
  { key: 'evidenceScore', label: 'Evidence Score', category: 'evidence' as const },
  { key: 'confidence', label: 'Confidence Level', category: 'evidence' as const },
  { key: 'timeToImpact', label: 'Time Horizon', category: 'implementation' as const },
  { key: 'feasibility', label: 'Implementation Difficulty', category: 'implementation' as const },
  { key: 'fiscalCost', label: 'Implementation Cost', category: 'implementation' as const },
  { key: 'scalability', label: 'Scalability', category: 'implementation' as const },
  { key: 'reversibility', label: 'Reversibility', category: 'impact' as const },
  { key: 'primaryCategory', label: 'Intervention Type', category: 'impact' as const },
  { key: 'politicalDifficulty', label: 'Political Feasibility', category: 'impact' as const },
  { key: 'tradeOffs', label: 'Trade-offs', category: 'context' as const },
  { key: 'risks', label: 'Risks', category: 'context' as const },
  { key: 'globalPrecedents', label: 'Global Adoption', category: 'context' as const },
  { key: 'stakeholders', label: 'Stakeholders', category: 'context' as const },
  { key: 'beneficiaryGroups', label: 'Affected Population', category: 'context' as const },
] as const;

export type ComparisonDimension = typeof COMPARISON_DIMENSIONS[number];

export const MAX_FIXES = 5;
export const MIN_FIXES = 2;

export function parseCompareSlugs(searchParams: string | null): string[] {
  if (!searchParams) return [];
  const params = new URLSearchParams(searchParams);
  const fixes = params.get('fixes');
  if (!fixes) return [];
  return fixes.split(',').filter(Boolean).slice(0, MAX_FIXES);
}

export function buildCompareUrl(slugs: string[]): string {
  const valid = slugs.filter(Boolean).slice(0, MAX_FIXES);
  if (valid.length < MIN_FIXES) return '/fix';
  return `/compare?fixes=${valid.join(',')}`;
}

export function resolveFixes(slugs: string[], allFixes: Fix[]): Fix[] {
  return slugs
    .map(slug => allFixes.find(f => f.slug === slug))
    .filter((f): f is Fix => f !== undefined);
}

export function getComparisonValue(fix: Fix, key: string): string {
  const scores = computeImpactScores(fix);
  switch (key) {
    case 'evidenceGrade':
      return fix.evidenceGrade || 'Unknown';
    case 'evidenceScore':
      return `${fix.evidenceScore}/100`;
    case 'confidence':
      return scores.confidenceLabel;
    case 'timeToImpact':
      return HORIZON_LABELS[fix.timeToImpact || 'medium-term'] || 'Unknown';
    case 'feasibility':
      return scores.feasibility.label;
    case 'fiscalCost':
      return formatCostLabel(fix.fiscalCost);
    case 'scalability':
      return SCALABILITY_CONFIG[fix.scalability || '']?.label || 'Not specified';
    case 'reversibility':
      return REVERSIBILITY_CONFIG[fix.reversibility || '']?.label || 'Not specified';
    case 'primaryCategory':
      return fix.primaryCategory ? fix.primaryCategory.charAt(0).toUpperCase() + fix.primaryCategory.slice(1) : 'Unknown';
    case 'politicalDifficulty':
      return scores.political.label;
    case 'tradeOffs':
      return `${(fix.tradeOffs || []).length} dimension${(fix.tradeOffs || []).length !== 1 ? 's' : ''}`;
    case 'risks':
      return `${(fix.risksAndFailures || []).length} identified`;
    case 'globalPrecedents':
      return `${(fix.globalPrecedents || []).length} countries`;
    case 'stakeholders':
      return `${(fix.stakeholders || []).length} stakeholders`;
    case 'beneficiaryGroups':
      return `${(fix.beneficiaryGroups || []).length} groups`;
    default:
      return '—';
  }
}

export function getComparisonFraction(fix: Fix, key: string): number {
  const scores = computeImpactScores(fix);
  switch (key) {
    case 'evidenceScore':
      return fix.evidenceScore / 100;
    case 'confidence':
      return scores.confidenceFrac;
    case 'feasibility':
      return scores.feasibility.frac;
    case 'politicalDifficulty':
      return scores.political.frac;
    default:
      return 0;
  }
}

export function getComparisonBarColor(fix: Fix, key: string): string {
  const frac = getComparisonFraction(fix, key);
  return frac >= 0.7 ? 'bg-emerald-400' : frac >= 0.4 ? 'bg-amber-400' : 'bg-red-400';
}

export interface AggregatedEvidence {
  averageScore: number;
  averageConfidence: number;
  gradeDistribution: Record<string, number>;
  highestEvidence: Fix | null;
  lowestEvidence: Fix | null;
  highestConfidence: Fix | null;
  lowestConfidence: Fix | null;
  totalSources: number;
  evidenceGaps: Array<{ fix: string; gap: string }>;
}

export function aggregateEvidence(fixes: Fix[]): AggregatedEvidence {
  if (fixes.length === 0) {
    return {
      averageScore: 0,
      averageConfidence: 0,
      gradeDistribution: {},
      highestEvidence: null,
      lowestEvidence: null,
      highestConfidence: null,
      lowestConfidence: null,
      totalSources: 0,
      evidenceGaps: [],
    };
  }

  const scores = fixes.map(f => computeImpactScores(f));
  const avgScore = fixes.reduce((sum, f) => sum + (f.evidenceScore || 0), 0) / fixes.length;
  const avgConfidence = scores.reduce((sum, s) => sum + s.confidenceFrac, 0) / fixes.length;

  const gradeDistribution: Record<string, number> = {};
  for (const fix of fixes) {
    const grade = fix.evidenceGrade || 'Unknown';
    gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
  }

  const highestEvidence = fixes.reduce((best, f) => (f.evidenceScore > (best?.evidenceScore || 0)) ? f : best, null as Fix | null);
  const lowestEvidence = fixes.reduce((worst, f) => (f.evidenceScore < (worst?.evidenceScore || Infinity)) ? f : worst, null as Fix | null);

  const highestConfidence = fixes.reduce((best, f, i) => (scores[i].confidenceFrac > (best ? computeImpactScores(best).confidenceFrac : 0)) ? f : best, null as Fix | null);
  const lowestConfidence = fixes.reduce((worst, f, i) => (scores[i].confidenceFrac < (worst ? computeImpactScores(worst).confidenceFrac : 1)) ? f : worst, null as Fix | null);

  const totalSources = fixes.reduce((sum, f) => sum + (f.sourceIds || []).length + (f.sources || []).length, 0);

  const evidenceGaps: Array<{ fix: string; gap: string }> = [];
  for (const fix of fixes) {
    if (!fix.sourceIds?.length && !fix.sources?.length) {
      evidenceGaps.push({ fix: fix.headline, gap: 'No sources cited' });
    }
    if (fix.evidenceGrade === 'Contested') {
      evidenceGaps.push({ fix: fix.headline, gap: 'Evidence grade is contested' });
    }
    if (fix.unknownsAndGaps?.length) {
      for (const gap of fix.unknownsAndGaps) {
        evidenceGaps.push({ fix: fix.headline, gap: gap.description });
      }
    }
  }

  return {
    averageScore: Math.round(avgScore),
    averageConfidence: Math.round(avgConfidence * 100),
    gradeDistribution,
    highestEvidence,
    lowestEvidence,
    highestConfidence,
    lowestConfidence,
    totalSources,
    evidenceGaps,
  };
}

export interface FactualSummary {
  highestEvidence: Fix | null;
  lowestCost: Fix | null;
  fastestImpact: Fix | null;
  lowestComplexity: Fix | null;
  strongestResearch: Fix | null;
}

const HORIZON_ORDER: Record<string, number> = {
  immediate: 0,
  'short-term': 1,
  'medium-term': 2,
  'long-term': 3,
};

export function deriveFactualSummary(fixes: Fix[]): FactualSummary {
  if (fixes.length === 0) {
    return { highestEvidence: null, lowestCost: null, fastestImpact: null, lowestComplexity: null, strongestResearch: null };
  }

  const scores = fixes.map(f => ({ fix: f, scores: computeImpactScores(f) }));

  const highestEvidence = fixes.reduce((best, f) => (f.evidenceScore > (best?.evidenceScore || 0)) ? f : best, null as Fix | null);

  const lowestCost = fixes.reduce((best, f) => {
    if (!f.fiscalCost?.amount && best?.fiscalCost?.amount) return f;
    if (f.fiscalCost?.amount && best?.fiscalCost?.amount) {
      return f.fiscalCost.amount < best.fiscalCost.amount ? f : best;
    }
    return best;
  }, fixes[0]);

  const fastestImpact = fixes.reduce((best, f) => {
    const bestHorizon = best ? HORIZON_ORDER[best.timeToImpact || 'medium-term'] : Infinity;
    const thisHorizon = HORIZON_ORDER[f.timeToImpact || 'medium-term'];
    return thisHorizon < bestHorizon ? f : best;
  }, null as Fix | null);

  const lowestComplexity = fixes.reduce((best, f, i) => {
    const bestFrac = best ? scores.find(s => s.fix === best)?.scores.feasibility.frac ?? 1 : 1;
    return scores[i].scores.feasibility.frac > bestFrac ? f : best;
  }, null as Fix | null);

  const strongestResearch = fixes.reduce((best, f) => {
    const bestSources = best ? (best.sourceIds || []).length + (best.sources || []).length : -1;
    const thisSources = (f.sourceIds || []).length + (f.sources || []).length;
    return thisSources > bestSources ? f : best;
  }, null as Fix | null);

  return { highestEvidence, lowestCost, fastestImpact, lowestComplexity, strongestResearch };
}

export function validateComparison(slugs: string[]): { valid: boolean; error?: string } {
  if (slugs.length < MIN_FIXES) {
    return { valid: false, error: `Select at least ${MIN_FIXES} solutions to compare` };
  }
  if (slugs.length > MAX_FIXES) {
    return { valid: false, error: `Maximum ${MAX_FIXES} solutions can be compared at once` };
  }
  if (new Set(slugs).size !== slugs.length) {
    return { valid: false, error: 'Duplicate solutions selected' };
  }
  return { valid: true };
}

export function getMissingMetadataCount(fix: Fix): number {
  let missing = 0;
  if (!fix.reversibility) missing++;
  if (!fix.scalability) missing++;
  if (!fix.evidenceGrade) missing++;
  if (!fix.timeToImpact) missing++;
  if (!fix.maturityStatus) missing++;
  if (!fix.primaryCategory) missing++;
  if (!fix.fiscalCost) missing++;
  return missing;
}
