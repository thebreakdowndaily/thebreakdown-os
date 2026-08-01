// ── Workstream 3: Knowledge Gap Service (Phase 14B Pure Derivation) ──────────

import { Fix } from '../../types/canonical';
import { KnowledgeGap } from './intelligence-types';

export class KnowledgeGapService {
  /**
   * Scans a set of canonical Fix objects and derives KnowledgeGap[] items.
   * Pure function: 0 persistence, 0 database writes.
   */
  public static detectGaps(fixes: Fix[]): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];

    for (const fix of fixes) {
      // 1. Unsupported Fix Gap
      const sourceCount = (fix.sources?.length || 0) + (fix.sourceIds?.length || 0);
      if (sourceCount === 0) {
        gaps.push({
          id: `gap-unsupported-${fix.id}`,
          type: 'UNSUPPORTED_FIX',
          severity: 'CRITICAL',
          title: 'Unsupported Fix Framework',
          description: `Fix "${fix.title || fix.headline}" has zero cited source attestations.`,
          affectedObjectId: fix.id,
          recommendedAction: 'Attach at least one Level 1-3 primary source citation to the Fix.',
          supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
        });
      }

      // 2. Missing Dataset Gap
      if (!fix.successMetrics || fix.successMetrics.length === 0) {
        gaps.push({
          id: `gap-missing-dataset-${fix.id}`,
          type: 'MISSING_DATASET',
          severity: 'HIGH',
          title: 'Missing Success Outcome Metric',
          description: `Fix "${fix.title || fix.headline}" lacks empirical success metrics or dataset indicators.`,
          affectedObjectId: fix.id,
          recommendedAction: 'Link a statistical dataset or baseline metric to track intervention outcome.',
          supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
        });
      }

      // 3. Stale Content Gap (>180 Days)
      if (fix.lastVerified && fix.evidenceGrade === 'High') {
        const verifiedTime = new Date(fix.lastVerified).getTime();
        const nowTime = new Date().getTime();
        const ageInDays = (nowTime - verifiedTime) / (1000 * 60 * 60 * 24);

        if (ageInDays > 180) {
          gaps.push({
            id: `gap-stale-${fix.id}`,
            type: 'STALE_CONTENT',
            severity: 'MEDIUM',
            title: 'Stale Audit Threshold Exceeded',
            description: `Fix last verified ${Math.floor(ageInDays)} days ago (exceeds 180-day audit threshold).`,
            affectedObjectId: fix.id,
            recommendedAction: 'Re-audit primary sources and update lastVerified timestamp.',
            supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
          });
        }
      }

      // 4. Weak Evidence Chain Gap
      const hasTier1 = fix.sources?.some((s) => s.tier === 1 || s.tier === 2);
      if (sourceCount > 0 && !hasTier1) {
        gaps.push({
          id: `gap-weak-chain-${fix.id}`,
          type: 'WEAK_CHAIN',
          severity: 'MEDIUM',
          title: 'Weak Primary Evidence Chain',
          description: `Fix relies solely on secondary media coverage without Level 1-2 statutory sources.`,
          affectedObjectId: fix.id,
          recommendedAction: 'Extract gazette notification or official court judgment citation.',
          supportingReferences: [{ targetId: fix.id, targetType: 'FIX', label: fix.title || fix.headline }],
        });
      }
    }

    return gaps;
  }
}
