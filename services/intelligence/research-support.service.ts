// ── Workstream 6: Research Bureau Support Service (Phase 14B Pure Derivation) 

import { Fix } from '../../types/canonical';
import { ResearchRecommendation } from './intelligence-types';

export class ResearchSupportService {
  /**
   * Generates derived research assistance recommendations for a canonical Fix object.
   * Pure function: 0 database writes, 0 mutation.
   */
  public static generateRecommendations(fix: Fix, allFixes?: Fix[]): ResearchRecommendation[] {
    const recommendations: ResearchRecommendation[] = [];

    // 1. Related Story Reading Path
    if (fix.storySlug) {
      recommendations.push({
        id: `rec-story-${fix.id}`,
        category: 'RELATED_READING',
        title: 'Investigative Context Story',
        rationale: `Read systemic investigation narrative "${fix.storySlug}" associated with this Fix.`,
        targetId: fix.storySlug,
        targetType: 'STORY',
      });
    }

    // 2. Missing Evidence Suggestion
    const sourceCount = (fix.sources?.length || 0) + (fix.sourceIds?.length || 0);
    if (sourceCount < 2) {
      recommendations.push({
        id: `rec-evd-suggest-${fix.id}`,
        category: 'MISSING_EVIDENCE',
        title: 'Extract Statutory Primary Source',
        rationale: 'Search official gazette notifications or CAG audit reports for Level 1 attestation.',
        targetId: fix.id,
        targetType: 'FIX',
      });
    }

    // 3. Recommended Expert Domain Area
    const category = fix.primaryCategory || 'administrative';
    recommendations.push({
      id: `rec-expert-${fix.id}`,
      category: 'RECOMMENDED_EXPERT',
      title: `Domain Specialist Review (${category.toUpperCase()})`,
      rationale: `Engage a external domain specialist in ${category} policy for Gold Standard Audit sign-off.`,
      targetId: category,
      targetType: 'CONCEPT',
    });

    // 4. Related Fixes in Same Category
    if (allFixes) {
      const peerFixes = allFixes.filter((f) => f.id !== fix.id && f.primaryCategory === fix.primaryCategory);
      for (const peer of peerFixes.slice(0, 2)) {
        recommendations.push({
          id: `rec-peer-fix-${peer.id}`,
          category: 'RELATED_FIX',
          title: peer.title || peer.headline || 'Peer Solution',
          rationale: `Peer ${peer.primaryCategory} policy intervention addressing similar administrative domains.`,
          targetId: peer.id,
          targetType: 'FIX',
        });
      }
    }

    return recommendations;
  }
}
