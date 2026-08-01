// scripts/audit/editorial/riskRanking.ts
// Stage B: Multi-Factor Risk Engine & Batch 1 Selection for Audit Triage

import type { Story } from '../../../types/canonical';
import { resolveStory } from '../../../lib/story/resolver';
import type { EnumerationRecord, StoryRiskProfile, RiskFactor, RiskRankingReport } from './types';

// Topic & keyword rules for risk categorization
const GEOPOLITICAL_KEYWORDS = ['border', 'china', 'tibet', 'war', 'lac', 'army', 'military', 'kashmir', 'panchsheel', 'non-alignment', 'bandung', 'defence', 'pakistan', 'un', 'diplomacy'];
const FINANCIAL_KEYWORDS = ['metro', 'cost', 'crore', 'budget', 'lakh', 'investment', 'corridor', 'highway', 'expenditure', 'loan', 'eib', 'jica', 'funding', 'sanction'];
const HEALTH_SAFETY_KEYWORDS = ['aiims', 'health', 'hospital', 'pandemic', 'disaster', 'safety', 'medical'];
const POLICY_KEYWORDS = ['pesa', 'reservation', 'constitution', 'court', 'supreme court', 'election', 'assembly', 'governance', 'amendment', 'tribal'];

function evaluateRiskFactors(story: Story, slug: string): StoryRiskProfile['factors'] {
  const text = `${story.headline || ''} ${story.summary || ''} ${(story.tags || []).join(' ')} ${story.category || ''}`.toLowerCase();
  
  const claimsCount = story.claims?.length || 0;
  const sourcesCount = story.sources?.length || 0;
  const factsCount = story.facts?.length || 0;

  // 1. Freshness Risk
  const isRecent = story.updatedAt ? new Date(story.updatedAt).getFullYear() >= 2024 : false;
  const freshnessScore = isRecent ? 8 : 4;
  const freshnessRisk: RiskFactor = {
    name: 'Freshness Volatility',
    score: freshnessScore,
    weight: 1.2,
    indicatorType: 'CONTENT_VOLATILITY',
    rationale: isRecent ? 'Recently updated story with active/evolving facts' : 'Historical content with stable static context',
  };

  // 2. Geopolitical Risk
  const isGeopolitical = GEOPOLITICAL_KEYWORDS.some(k => text.includes(k));
  const geopoliticalRisk: RiskFactor = {
    name: 'Geopolitical / Conflict Impact',
    score: isGeopolitical ? 9 : 2,
    weight: 1.5,
    indicatorType: 'IMPACT_BURDEN',
    rationale: isGeopolitical ? 'Involves national security, border dynamics, or foreign policy' : 'Local or domestic policy context',
  };

  // 3. Health & Safety Consequence
  const isHealthSafety = HEALTH_SAFETY_KEYWORDS.some(k => text.includes(k));
  const healthSafetyRisk: RiskFactor = {
    name: 'Health / Safety Consequence',
    score: isHealthSafety ? 9 : 1,
    weight: 1.4,
    indicatorType: 'IMPACT_BURDEN',
    rationale: isHealthSafety ? 'Direct public health, safety, or medical infrastructure implications' : 'Standard institutional/policy domain',
  };

  // 4. Financial & Budget Complexity
  const isFinancial = FINANCIAL_KEYWORDS.some(k => text.includes(k)) || factsCount > 0;
  const financialComplexityRisk: RiskFactor = {
    name: 'Financial / Budget Complexity',
    score: isFinancial ? 8 : 3,
    weight: 1.3,
    indicatorType: 'IMPACT_BURDEN',
    rationale: isFinancial ? 'Contains high-value monetary allocations, infrastructure costs, or multi-stage budget figures' : 'Low financial data density',
  };

  // 5. Public Policy Consequence
  const isPolicy = POLICY_KEYWORDS.some(k => text.includes(k));
  const policyConsequenceRisk: RiskFactor = {
    name: 'Public Policy Consequence',
    score: isPolicy ? 8 : 3,
    weight: 1.2,
    indicatorType: 'IMPACT_BURDEN',
    rationale: isPolicy ? 'Substantial statutory, constitutional, or governance precedent' : 'Narrow operational context',
  };

  // 6. Causal Claim Density Risk
  const causalKeywords = ['caused', 'led to', 'resulted in', 'due to', 'impact of', 'consequence'];
  const hasCausalText = causalKeywords.some(k => text.includes(k));
  const causalClaimDensityRisk: RiskFactor = {
    name: 'Causal Claim Density',
    score: hasCausalText ? 7 : 3,
    weight: 1.1,
    indicatorType: 'STRUCTURAL_INDICATOR',
    rationale: hasCausalText ? 'Contains explanatory or attributional assertions requiring causal validation' : 'Primarily descriptive content',
  };

  // 7. Factual Burden / Verification Complexity
  const factualBurden = claimsCount + factsCount;
  const factualBurdenScore = Math.min(10, Math.max(2, factualBurden * 1.5));
  const factualBurdenRisk: RiskFactor = {
    name: 'Factual Burden / Verification Complexity',
    score: factualBurdenScore,
    weight: 1.1,
    indicatorType: 'STRUCTURAL_INDICATOR',
    rationale: `Carries ${factualBurden} specific factual assertions and data points requiring source verification`,
  };

  // 8. Structural Evidence Gap Indicator
  const ratio = sourcesCount > 0 ? claimsCount / sourcesCount : claimsCount;
  const gapScore = ratio > 2 || sourcesCount === 0 ? 8 : 3;
  const structuralEvidenceGapRisk: RiskFactor = {
    name: 'Structural Evidence Gap Indicator',
    score: gapScore,
    weight: 1.3,
    indicatorType: 'STRUCTURAL_INDICATOR',
    rationale: gapScore >= 7 ? 'High ratio of claims relative to cited sources (structural triage alert)' : 'Adequate structural source-to-claim ratio',
  };

  // 9. Fast-Changing Underlying Facts
  const fastChangingKeywords = ['2024', '2025', '2026', 'ongoing', 'under construction', 'bypoll', 'election'];
  const isFastChanging = fastChangingKeywords.some(k => text.includes(k));
  const fastChangingFactsRisk: RiskFactor = {
    name: 'Fast-Changing Underlying Facts',
    score: isFastChanging ? 8 : 2,
    weight: 1.2,
    indicatorType: 'CONTENT_VOLATILITY',
    rationale: isFastChanging ? 'Active legal, electoral, or construction development' : 'Historical or settled subject matter',
  };

  return {
    freshnessRisk,
    geopoliticalRisk,
    healthSafetyRisk,
    financialComplexityRisk,
    policyConsequenceRisk,
    causalClaimDensityRisk,
    factualBurdenRisk,
    structuralEvidenceGapRisk,
    fastChangingFactsRisk,
  };
}

export async function rankPublicStories(publicRecords: EnumerationRecord[]): Promise<RiskRankingReport> {
  const profiles: StoryRiskProfile[] = [];

  for (const rec of publicRecords) {
    try {
      const res = await resolveStory(rec.slug);
      if (res.type === 'not_found') continue;

      const canonical = res.canonicalStory;
      const factors = evaluateRiskFactors(canonical, rec.slug);

      // Compute weighted composite score strictly for triage ordering
      const factorList = Object.values(factors);
      const totalWeight = factorList.reduce((sum, f) => sum + f.weight, 0);
      const weightedSum = factorList.reduce((sum, f) => sum + f.score * f.weight, 0);
      const compositeRiskScore = Math.round((weightedSum / totalWeight) * 10) / 10;

      profiles.push({
        slug: rec.slug,
        title: rec.title || canonical.headline || rec.slug,
        sourceType: rec.sourceType,
        compositeRiskScore,
        rank: 0, // Assigned after sort
        factors,
        selectionCategory: 'STANDARD_QUEUE',
        selectionRationale: '',
      });
    } catch (e: any) {
      console.error(`Error calculating risk profile for ${rec.slug}:`, e.message);
    }
  }

  // Sort profiles with deterministic tie-breaking rules:
  // Primary: compositeRiskScore descending
  // Secondary: Health/Safety score descending
  // Tertiary: Geopolitical score descending
  // Quaternary: Financial score descending
  profiles.sort((a, b) => {
    if (b.compositeRiskScore !== a.compositeRiskScore) {
      return b.compositeRiskScore - a.compositeRiskScore;
    }
    if (b.factors.healthSafetyRisk.score !== a.factors.healthSafetyRisk.score) {
      return b.factors.healthSafetyRisk.score - a.factors.healthSafetyRisk.score;
    }
    if (b.factors.geopoliticalRisk.score !== a.factors.geopoliticalRisk.score) {
      return b.factors.geopoliticalRisk.score - a.factors.geopoliticalRisk.score;
    }
    if (b.factors.financialComplexityRisk.score !== a.factors.financialComplexityRisk.score) {
      return b.factors.financialComplexityRisk.score - a.factors.financialComplexityRisk.score;
    }
    return a.slug.localeCompare(b.slug);
  });

  // Assign rank numbers and selection categories
  profiles.forEach((p, idx) => {
    p.rank = idx + 1;
    if (idx < 5) {
      p.selectionCategory = 'BATCH_1';
      const topFactors = Object.values(p.factors)
        .filter(f => f.score >= 7)
        .map(f => f.name);
      p.selectionRationale = `Selected for Batch 1 (Rank #${p.rank}) due to high-risk vectors: ${topFactors.join(', ')}. Composite triage score: ${p.compositeRiskScore}.`;
    } else if (idx < 12) {
      p.selectionCategory = 'HIGH_PRIORITY';
      p.selectionRationale = `High priority queue (Rank #${p.rank}).`;
    } else if (idx < 25) {
      p.selectionCategory = 'MEDIUM_PRIORITY';
      p.selectionRationale = `Medium priority queue (Rank #${p.rank}).`;
    } else {
      p.selectionCategory = 'STANDARD_QUEUE';
      p.selectionRationale = `Standard review queue (Rank #${p.rank}).`;
    }
  });

  const batch1Selected = profiles.slice(0, 5);

  return {
    generatedAt: new Date().toISOString(),
    totalPublicAudited: profiles.length,
    methodology: '9-Factor Risk Engine (Freshness, Geopolitics, Health/Safety, Financial Complexity, Policy Consequence, Causal Density, Factual Burden, Structural Evidence Gap, Fast-Changing Facts). Composite score used strictly for audit triage priority.',
    batch1Selected,
    fullRanking: profiles,
  };
}
