// ── Workstream 2: Editorial Intelligence Engine (Phase 14B Pure Derivation) ─

import { Fix } from '../../types/canonical';
import { EditorialInsight } from './intelligence-types';

export class EditorialIntelligenceService {
  /**
   * Evaluates a Fix object and returns an array of derived EditorialInsight items.
   * Pure function: 0 persistence, 0 side effects.
   */
  public static generateInsights(fix: Fix): EditorialInsight[] {
    const insights: EditorialInsight[] = [];

    // 1. Evidence Completeness Insight
    const sourceCount = (fix.sources?.length || 0) + (fix.sourceIds?.length || 0);
    const evidenceGrade = fix.evidenceGrade || 'Moderate';

    if (sourceCount >= 3 && evidenceGrade === 'High') {
      insights.push({
        id: `ins-evd-complete-${fix.id}`,
        category: 'COMPLETENESS',
        severity: 'INFO',
        confidence: 0.95,
        title: 'Robust Evidentiary Foundation',
        explanation: `Fix contains ${sourceCount} sources with a High evidence grade attestation.`,
        supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
      });
    } else {
      insights.push({
        id: `ins-evd-incomplete-${fix.id}`,
        category: 'COMPLETENESS',
        severity: sourceCount < 2 ? 'HIGH' : 'MEDIUM',
        confidence: 0.85,
        title: sourceCount < 2 ? 'Low Citation Density' : 'Moderate Citation Density',
        explanation: `Fix references ${sourceCount} sources. Adding additional primary source attestations will increase evidence robustness.`,
        supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
      });
    }

    // 2. Source Diversity Insight
    const tier1Count = fix.sources?.filter((s) => s.tier === 1 || s.tier === 2).length || 0;
    if (sourceCount > 0 && tier1Count === 0) {
      insights.push({
        id: `ins-src-diversity-${fix.id}`,
        category: 'DIVERSITY',
        severity: 'MEDIUM',
        confidence: 0.8,
        title: 'Lacks Level 1 Statutory Sources',
        explanation: 'Cited sources consist exclusively of secondary reporting without primary gazette/court attestations.',
        supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
      });
    }

    const maturityStr = String(fix.maturityStatus || 'proposed').toLowerCase();
    if (maturityStr === 'scaled' || maturityStr === 'evaluating' || maturityStr === 'measured' || maturityStr === 'implemented') {
      insights.push({
        id: `ins-maturity-high-${fix.id}`,
        category: 'MATURITY',
        severity: 'INFO',
        confidence: 0.9,
        title: 'High Policy Maturity',
        explanation: `Policy intervention has reached ${fix.maturityStatus} status with empirical tracking.`,
        supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
      });
    }

    // 4. Verification Confidence
    const evidenceScore = fix.evidenceScore || 50;
    const confidenceRatio = Math.min(1.0, Math.max(0.1, evidenceScore / 100));
    insights.push({
      id: `ins-confidence-${fix.id}`,
      category: 'CONFIDENCE',
      severity: confidenceRatio >= 0.8 ? 'INFO' : 'MEDIUM',
      confidence: confidenceRatio,
      title: 'Verification Confidence Score',
      explanation: `Calculated verification confidence is ${Math.round(confidenceRatio * 100)}%.`,
      supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
    });

    // 5. Unresolved Questions
    if (fix.unknownsAndGaps && fix.unknownsAndGaps.length > 0) {
      insights.push({
        id: `ins-questions-${fix.id}`,
        category: 'QUESTION',
        severity: 'MEDIUM',
        confidence: 0.85,
        title: 'Explicit Uncertainty Callouts Documented',
        explanation: `Fix explicitly documents ${fix.unknownsAndGaps.length} unresolved data gaps/unknowns.`,
        supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
      });
    }

    return insights;
  }
}
