// ── Workstream 5: Editorial Dashboard Projection (Phase 14B Pure Projection) ──

import { Fix } from '../../types/canonical';
import { EditorialDashboardData } from './intelligence-types';
import { EditorialIntelligenceService } from './editorial-intelligence.service';
import { KnowledgeGapService } from './knowledge-gap.service';
import { ConflictAnalysisService } from './conflict-analysis.service';

export class EditorialDashboardProjection {
  /**
   * Generates a derived real-time Editorial Dashboard projection from an array of Fix objects.
   * Pure projection: Composes EditorialIntelligenceService, KnowledgeGapService, & ConflictAnalysisService.
   * Zero state storage, 0 mutation.
   */
  public static projectDashboard(fixes: Fix[]): EditorialDashboardData {
    // 1. Gather all insights across fixes
    const allInsights = fixes.flatMap((f) => EditorialIntelligenceService.generateInsights(f));

    // 2. Detect all gaps across fixes
    const allGaps = KnowledgeGapService.detectGaps(fixes);

    // 3. Analyze all conflicts across fixes
    const conflictReport = ConflictAnalysisService.analyzeConflicts(fixes);

    // 4. Compute Operational Metrics
    const reviewQueue = fixes.filter((f) => f.publicationStatus === 'review' || f.editorialStatus === 'review');
    const verificationBacklog = fixes.filter((f) => !f.sources || f.sources.length === 0 || f.evidenceGrade === 'Low');
    const publishedFixes = fixes.filter((f) => f.publicationStatus === 'published');
    const staleContent = allGaps.filter((g) => g.type === 'STALE_CONTENT');

    const totalFixes = fixes.length || 1;
    const highQualityFixes = publishedFixes.filter((f) => f.evidenceGrade === 'High' && (f.sources?.length || 0) > 0);
    const evidenceHealthIndex = Math.min(100, Math.round((highQualityFixes.length / totalFixes) * 100));

    const readyFixes = fixes.filter((f) => f.publicationStatus === 'published' || f.publicationStatus === 'review');
    const publicationReadinessScore = Math.min(100, Math.round((readyFixes.length / totalFixes) * 100));

    return {
      verificationBacklogCount: verificationBacklog.length,
      evidenceHealthIndex,
      reviewQueueCount: reviewQueue.length,
      publicationReadinessScore,
      staleContentCount: staleContent.length,
      unresolvedConflictsCount: conflictReport.conflictsCount,
      topInsights: allInsights.slice(0, 10),
      topGaps: allGaps.slice(0, 10),
      topConflicts: conflictReport.conflicts.slice(0, 10),
    };
  }
}
