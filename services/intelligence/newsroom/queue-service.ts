/**
 * ─── Editorial Queue Service (Newsroom Intelligence OS) ──────────────────────
 *
 * Segments signals into the 7 canonical operational triage queues:
 * 1. BREAKING_P0
 * 2. P1_IMPORTANT
 * 3. DEVELOPING
 * 4. NEEDS_VERIFICATION
 * 5. CONTRADICTIONS
 * 6. COVERAGE_GAPS
 * 7. RESOLVED
 */

import {
  NewsroomSignal,
  CoverageGap,
  EditorialQueueItem,
  QueueSection,
} from '@/types/newsroom-intelligence';

export class NewsroomQueueService {
  /**
   * Sorts and maps active signals into 7 operational queue segments.
   */
  public static buildQueue(
    signals: NewsroomSignal[],
    gaps: CoverageGap[] = []
  ): Record<QueueSection, EditorialQueueItem[]> {
    const queue: Record<QueueSection, EditorialQueueItem[]> = {
      BREAKING_P0: [],
      P1_IMPORTANT: [],
      DEVELOPING: [],
      NEEDS_VERIFICATION: [],
      CONTRADICTIONS: [],
      COVERAGE_GAPS: [],
      RESOLVED: [],
    };

    for (const sig of signals) {
      const item: EditorialQueueItem = {
        id: `q-sig-${sig.id}`,
        section: 'DEVELOPING',
        signalId: sig.id,
        priority: sig.priority,
        title: sig.title,
        summary: sig.summary,
        whyItMatters: sig.explanation.whyItMatters,
        observationCount: sig.observationCount,
        independentSourceCount: sig.independentSourceCount,
        primarySourceCount: sig.primarySourceCount,
        confidence: sig.scores.confidence,
        velocityLevel:
          sig.scores.velocity >= 75
            ? 'extreme'
            : sig.scores.velocity >= 55
            ? 'high'
            : sig.scores.velocity >= 35
            ? 'elevated'
            : 'normal',
        lastUpdatedAt: sig.lastUpdatedAt,
        assignedTo: sig.assignedTo,
        status: sig.lifecycleState,
      };

      if (sig.lifecycleState === 'resolved') {
        item.section = 'RESOLVED';
        queue.RESOLVED.push(item);
      } else if (sig.priority === 'P0') {
        item.section = 'BREAKING_P0';
        queue.BREAKING_P0.push(item);
      } else if (sig.contradictionIds.length > 0) {
        item.section = 'CONTRADICTIONS';
        queue.CONTRADICTIONS.push(item);
      } else if (
        sig.scores.uncertainty >= 60 ||
        sig.scores.evidenceStrength < 35 ||
        sig.lifecycleState === 'monitoring'
      ) {
        item.section = 'NEEDS_VERIFICATION';
        queue.NEEDS_VERIFICATION.push(item);
      } else if (sig.priority === 'P1') {
        item.section = 'P1_IMPORTANT';
        queue.P1_IMPORTANT.push(item);
      } else {
        item.section = 'DEVELOPING';
        queue.DEVELOPING.push(item);
      }
    }

    // Map Coverage Gaps into queue items
    for (const gap of gaps) {
      if (gap.status !== 'resolved') {
        queue.COVERAGE_GAPS.push({
          id: `q-gap-${gap.id}`,
          section: 'COVERAGE_GAPS',
          signalId: gap.id,
          priority: gap.severity === 'critical' ? 'P0' : gap.severity === 'high' ? 'P1' : 'P2',
          title: `GAP: ${gap.title}`,
          summary: gap.description,
          whyItMatters: `Expected development missing: ${gap.expectedDevelopment}`,
          observationCount: 0,
          independentSourceCount: 0,
          primarySourceCount: 0,
          confidence: 0,
          velocityLevel: 'normal',
          lastUpdatedAt: gap.detectedAt,
          status: 'discovered',
        });
      }
    }

    // Sort each section by priority and timestamp
    const priorityWeight: Record<string, number> = { P0: 4, P1: 3, P2: 2, P3: 1 };
    for (const key of Object.keys(queue) as QueueSection[]) {
      queue[key].sort((a, b) => {
        const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
        if (pDiff !== 0) return pDiff;
        return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
      });
    }

    return queue;
  }
}
