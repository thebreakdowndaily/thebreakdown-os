// ── Fix Model Projections (AR-13A.0 Specification) ─────────────────────────

import { Fix } from '../../types/canonical';
import { InternalFixViewModel, PublicFixViewModel } from './fix-domain.types';

export class FixProjectionService {
  /**
   * Projects a canonical Fix into the Internal Editorial View.
   * Includes audit summary and full operational fields.
   */
  public static toInternalView(fix: Fix, auditSummary?: { totalEdits: number; lastEventId?: string; lastEditorId?: string }): InternalFixViewModel {
    return {
      ...fix,
      auditTrailSummary: auditSummary || {
        totalEdits: 1,
        lastEventId: undefined,
        lastEditorId: undefined,
      },
    };
  }

  /**
   * Projects a canonical Fix into the Public Reader API View.
   * Strips internal editorial notes and guarantees public field completeness.
   */
  public static toPublicView(fix: Fix): PublicFixViewModel {
    const rootCausesArray = Array.isArray(fix.rootCauses)
      ? fix.rootCauses
      : fix.rootCauses
      ? [fix.rootCauses]
      : [];

    return {
      id: fix.id,
      slug: fix.slug,
      title: fix.title || fix.headline || '',
      summary: fix.summary,
      primaryCategory: fix.primaryCategory || 'administrative',
      secondaryCategories: fix.secondaryCategories || [],
      maturityStatus: fix.maturityStatus || 'proposed',
      problemStatement: fix.problemStatement || fix.summary,
      rootCauses: rootCausesArray,
      recommendedActions: fix.recommendedActions || [],
      responsibleActorIds: fix.responsibleActorIds || [],
      beneficiaryGroups: fix.beneficiaryGroups || [],
      disadvantagedGroups: fix.disadvantagedGroups || [],
      fiscalCost: fix.fiscalCost || { amount: '0', currency: 'USD', timeframe: 'N/A', fundingMechanism: 'N/A', category: 'Budget-Neutral' },
      timeToImpact: fix.timeToImpact || 'medium-term',
      globalPrecedents: fix.globalPrecedents || [],
      tradeOffs: fix.tradeOffs || [],
      risksAndFailures: fix.risksAndFailures || [],
      constitutionalBasis: fix.constitutionalBasis,
      evidenceGrade: fix.evidenceGrade || 'Moderate',
      unknownsAndGaps: fix.unknownsAndGaps || [],
      successMetrics: fix.successMetrics || [],
      sourceIds: fix.sourceIds || [],
      supersededByFixId: fix.supersededByFixId,
      lastVerified: fix.lastVerified || new Date().toISOString(),
      version: fix.version || '1.0.0',
    };
  }
}
