import type { Fix } from '../types/canonical';

export const MATURITY_CONFIG: Record<string, { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  expert_reviewed: { label: 'Expert Reviewed', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  pilot: { label: 'Pilot', className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  proposed: { label: 'Proposed', className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
};

export const MATURITY_ORDER: Record<string, number> = {
  published: 0, expert_reviewed: 1, pilot: 2, proposed: 3,
};

export const INTERVENTION_COLOR_MAP: Record<string, string> = {
  fiscal: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  statutory: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  administrative: 'bg-teal-500/15 text-teal-300 border-teal-500/20',
  technological: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  institutional: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  judicial: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
};

export const EVIDENCE_GRADE_CONFIG: Record<string, { label: string; className: string; color: string; description: string }> = {
  High: { label: 'High Evidence', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', color: 'text-emerald-400', description: 'Strong evidence base' },
  Moderate: { label: 'Moderate Evidence', className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', color: 'text-amber-400', description: 'Adequate evidence' },
  Low: { label: 'Low Evidence', className: 'bg-red-500/20 text-red-300 border border-red-500/30', color: 'text-red-400', description: 'Limited evidence' },
};

export const HORIZON_LABELS: Record<string, string> = {
  'short-term': '< 1 year',
  'medium-term': '1\u20133 years',
  'long-term': '3+ years',
};

export const FILTER_LABELS: Record<string, string> = {
  primaryCategory: 'Intervention Type',
  maturityStatus: 'Maturity',
  evidenceGrade: 'Evidence Grade',
  timeToImpact: 'Time to Impact',
};

export function formatCostLabel(fiscalCost?: Fix['fiscalCost']): string {
  if (!fiscalCost?.amount) return 'Budget Neutral';
  return `${fiscalCost.currency} ${fiscalCost.amount}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateLong(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getSourceCount(fix: Fix): number {
  return (fix.sourceIds || []).length || (fix.sources || []).length;
}

export function getEvidenceLabel(score: number): string {
  return score >= 85 ? 'High' : score >= 70 ? 'Moderate-High' : score >= 55 ? 'Moderate' : score >= 40 ? 'Low-Moderate' : 'Low';
}

export function getEvidenceTextColor(score: number): string {
  return score >= 85 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-red-400';
}

export function getEvidenceBarColor(score: number): string {
  return score >= 85 ? 'bg-emerald-400' : score >= 55 ? 'bg-amber-400' : 'bg-red-400';
}

export interface ScoreResult {
  impactFrac: number;
  impactLabel: string;
  impactColor: string;
  feasibility: { frac: number; label: string };
  political: { frac: number; label: string };
  costFrac: number;
  costLabel: string;
  confidenceFrac: number;
  confidenceLabel: string;
  assessmentBasis: string;
}

export function computeImpactScores(fix: Fix): ScoreResult {
  const evidenceScore = fix.evidenceScore || 50;
  const impactFrac = evidenceScore / 100;
  const impactLabel = getEvidenceLabel(evidenceScore);
  const impactColor = getEvidenceTextColor(evidenceScore);

  const maturityMap: Record<string, { frac: number; label: string }> = {
    published: { frac: 1.0, label: 'High' },
    expert_reviewed: { frac: 0.8, label: 'Moderate-High' },
    pilot: { frac: 0.6, label: 'Moderate' },
    proposed: { frac: 0.3, label: 'Low' },
  };
  const feasibility = maturityMap[fix.maturityStatus || 'proposed'] || maturityMap.proposed;

  const categoryPolitical: Record<string, { frac: number; label: string }> = {
    fiscal: { frac: 0.3, label: 'Low' },
    statutory: { frac: 0.3, label: 'Low' },
    administrative: { frac: 0.8, label: 'High' },
    technological: { frac: 0.7, label: 'Moderate-High' },
    institutional: { frac: 0.6, label: 'Moderate' },
    judicial: { frac: 0.5, label: 'Moderate' },
  };
  const political = categoryPolitical[fix.primaryCategory || 'administrative'] || categoryPolitical.administrative;

  const hasFiscalCost = !!fix.fiscalCost?.amount;
  const costFrac = hasFiscalCost ? 0.8 : 0.2;
  const costLabel = hasFiscalCost ? 'Significant' : 'Budget Neutral';

  const confidenceFrac = fix.evidenceGrade === 'High' ? 1.0 : fix.evidenceGrade === 'Moderate' ? 0.6 : 0.3;
  const confidenceLabel = fix.evidenceGrade || 'Moderate';

  const assessmentBasis = fix.evidenceGrade === 'High'
    ? 'Evidence-backed estimate'
    : fix.maturityStatus === 'expert_reviewed'
    ? 'Expert review'
    : fix.maturityStatus === 'pilot'
    ? 'Pilot data'
    : 'Editorial synthesis';

  return { impactFrac, impactLabel, impactColor, feasibility, political, costFrac, costLabel, confidenceFrac, confidenceLabel, assessmentBasis };
}

type PhaseStatus = 'completed' | 'in_progress' | 'upcoming';

export interface ImplementationPhase {
  title: string;
  description: string;
  duration: string;
  status: PhaseStatus;
}

export function computeImplementationPhases(fix: Fix): ImplementationPhase[] {
  const timeToImpact = fix.timeToImpact || 'medium-term';

  if (timeToImpact === 'short-term') {
    return [
      { title: 'Pilot & Assessment', description: 'Launch pilot programme, establish baseline metrics, assess initial feasibility.', duration: '0\u20133 months', status: 'completed' },
      { title: 'Implementation', description: 'Scale to target populations, deploy monitoring systems.', duration: '3\u20139 months', status: 'in_progress' },
      { title: 'Evaluation & Adjustment', description: 'Review outcomes, address gaps, optimise delivery.', duration: '9\u201312 months', status: 'upcoming' },
    ];
  }
  if (timeToImpact === 'long-term') {
    return [
      { title: 'Foundation', description: 'Legal/policy framework, institutional setup, capacity building.', duration: '0\u20131 year', status: 'completed' },
      { title: 'Pilot & Expand', description: 'Phased rollout across states, continuous monitoring.', duration: '1\u20133 years', status: 'in_progress' },
      { title: 'National Scale', description: 'Full national deployment, cross-state coordination.', duration: '3\u20135 years', status: 'upcoming' },
      { title: 'Evaluation', description: 'Long-term impact assessment, institutional review.', duration: '5+ years', status: 'upcoming' },
    ];
  }
  return [
    { title: 'Foundation', description: 'Policy framework, institutional setup, early capacity building.', duration: '0\u20131 year', status: 'completed' },
    { title: 'Pilot & Iterate', description: 'Phased rollout, monitoring, and adjustment.', duration: '1\u20132 years', status: 'in_progress' },
    { title: 'National Scale', description: 'Full deployment, cross-state coordination.', duration: '2\u20133 years', status: 'upcoming' },
  ];
}

export function computeRelevanceScore(fix: Fix, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (fix.headline.toLowerCase().includes(q)) score += 40;
  if (fix.problemStatement?.toLowerCase().includes(q)) score += 20;
  if (fix.tags.some(t => t.toLowerCase().includes(q))) score += 30;
  score += (fix.evidenceScore || 0) * 0.4;
  score += (1 - (MATURITY_ORDER[fix.maturityStatus || 'proposed'] ?? 3) / 4) * 30;
  score += Math.min((fix.globalPrecedents || []).length, 5) * 10;
  return Math.min(score, 100);
}

export function getFixesForStory(storySlug: string, fixes: Fix[]): Fix[] {
  return fixes.filter(f =>
    f.storySlug === storySlug ||
    (f.relatedStories || []).some(s => s.slug === storySlug)
  );
}
