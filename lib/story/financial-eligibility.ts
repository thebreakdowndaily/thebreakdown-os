/**
 * Financial Feature Eligibility & Semantic Extractor
 * Governance: Engineering Principles — Knowledge First (AGENTS.md)
 *
 * Verifies that a story contains genuine, structured financial metrics and returns
 * verified presentation objects with explicit semantic labels (e.g. FINANCIAL_SANCTION,
 * BUDGET_PROVISION, REPORTED_EXPENDITURE, REVISED_COST, ESTIMATED_COST).
 *
 * NEVER infers fake "cost overruns" or "savings" across non-comparable figures.
 */

export interface FinancialMetric {
  label: string;
  value: string;
  semanticType: 'FINANCIAL_SANCTION' | 'BUDGET_PROVISION' | 'REPORTED_EXPENDITURE' | 'REVISED_COST' | 'ESTIMATED_COST' | 'METRIC';
  source?: string;
  dateOrPeriod?: string;
}

export interface FinancialFeatureData {
  storySlug: string;
  headline: string;
  summary: string;
  category: string;
  metrics: FinancialMetric[];
  note?: string;
}

export function isEligibleForFinancialFeature(story: any): boolean {
  if (!story) return false;
  const raw = story.raw || story;
  const facts: any[] = raw.facts || [];

  // Count facts that contain monetary figures (₹, crore, lakh, $, billion)
  const monetaryFacts = facts.filter((f) => {
    const val = String(f.value || '');
    return /₹|\$|crore|lakh|billion|million/i.test(val);
  });

  return monetaryFacts.length >= 2;
}

export function extractFinancialFeature(story: any): FinancialFeatureData | null {
  if (!isEligibleForFinancialFeature(story)) return null;

  const raw = story.raw || story;
  const facts: any[] = raw.facts || [];

  const monetaryFacts = facts.filter((f) => {
    const val = String(f.value || '');
    return /₹|\$|crore|lakh|billion|million/i.test(val);
  });

  const mappedMetrics: FinancialMetric[] = monetaryFacts.slice(0, 4).map((f) => {
    const labelLower = (f.label || '').toLowerCase();
    let semanticType: FinancialMetric['semanticType'] = 'METRIC';

    if (labelLower.includes('sanction') || labelLower.includes('outlay') || labelLower.includes('allocated')) {
      semanticType = 'FINANCIAL_SANCTION';
    } else if (labelLower.includes('budget') || labelLower.includes('provision')) {
      semanticType = 'BUDGET_PROVISION';
    } else if (labelLower.includes('expenditure') || labelLower.includes('paid') || labelLower.includes('collected')) {
      semanticType = 'REPORTED_EXPENDITURE';
    } else if (labelLower.includes('revised')) {
      semanticType = 'REVISED_COST';
    } else if (labelLower.includes('estimate') || labelLower.includes('required')) {
      semanticType = 'ESTIMATED_COST';
    }

    return {
      label: f.label,
      value: f.value,
      semanticType,
      source: f.source,
    };
  });

  return {
    storySlug: raw.slug,
    headline: raw.headline,
    summary: raw.summary,
    category: raw.category || 'policy',
    metrics: mappedMetrics,
    note: 'Figures represent officially reported data. Concepts are non-comparable unless explicitly noted by auditors.',
  };
}
