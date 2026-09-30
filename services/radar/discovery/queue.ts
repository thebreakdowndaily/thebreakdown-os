/**
 * ─── Proactive Source Discovery Queue ──────────────────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 5: Global Coverage Operating System
 *
 * Moves radar from reactive manual source addition to autonomous gap identification.
 * Prioritizes discovery tasks based on coverage gaps (BLIND_SPOT, NO_PRIMARY_SOURCE,
 * UNCOVERED_BEAT, ALL_SOURCES_FAILING, HIGH_MISS_RATE).
 */

import { createHash } from 'node:crypto';
import type { CountryPack } from '@/data/radar/countries';
import type { CoverageGap, CoverageGapType } from '../coverage/types';
import type { RadarBeat } from '../types';

export type DiscoveryTaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type DiscoveryTaskStatus = 'queued' | 'in_progress' | 'completed' | 'dismissed';

export interface DiscoveryProvenance {
  discoveredFrom: string;
  discoveryMethod: 'portal_scan' | 'recall_gap_feedback' | 'coverage_matrix' | 'seed_expansion' | 'manual';
  discoveryTimestamp: string;
  organizationIdentityEvidence: string;
  geographicRelevance: string;
  authorityClass: string;
  feedType: string;
}

export interface DiscoveryTask {
  id: string;
  priority: DiscoveryTaskPriority;
  gapType: CoverageGapType;
  geographyId: string;
  geographyName: string;
  countryCode: string;
  targetBeat: RadarBeat;
  recommendedKeywords: string[];
  recommendedInstitutions: string[];
  reason: string;
  createdAt: string;
  status: DiscoveryTaskStatus;
  claimedAt?: string;
  completedAt?: string;
  candidateIds: string[];
  dismissedReason?: string;
}

export class ProactiveDiscoveryQueue {
  private tasks = new Map<string, DiscoveryTask>();

  /**
   * Generates prioritized discovery tasks from coverage gaps using country pack patterns.
   */
  public generateTasksFromGaps(gaps: CoverageGap[], countryPack: CountryPack): DiscoveryTask[] {
    const generated: DiscoveryTask[] = [];

    for (const gap of gaps) {
      const priority = this.inferPriority(gap.gapType);
      const targetBeat = this.inferBeatFromGap(gap);
      const relevantPatterns = countryPack.discoveryPatterns.filter(
        (p) => !targetBeat || p.beat === targetBeat
      );

      const recommendedKeywords = Array.from(
        new Set(relevantPatterns.flatMap((p) => p.institutionKeywords))
      ).slice(0, 8);

      const recommendedInstitutions = recommendedKeywords.map(
        (kw) => `${kw} ${gap.geographyName}`
      );

      const id = `task_${createHash('sha256')
        .update(`${gap.geographyId}:${gap.gapType}:${targetBeat || 'general'}`)
        .digest('hex')
        .substring(0, 16)}`;

      const task: DiscoveryTask = {
        id,
        priority,
        gapType: gap.gapType,
        geographyId: gap.geographyId,
        geographyName: gap.geographyName,
        countryCode: countryPack.countryCode,
        targetBeat: (targetBeat as RadarBeat) || 'government',
        recommendedKeywords,
        recommendedInstitutions,
        reason: gap.details,
        createdAt: new Date().toISOString(),
        status: 'queued',
        candidateIds: [],
      };

      this.enqueue(task);
      generated.push(task);
    }

    return generated;
  }

  public enqueue(task: DiscoveryTask): void {
    if (!this.tasks.has(task.id)) {
      this.tasks.set(task.id, task);
    }
  }

  public getTasks(filter?: {
    countryCode?: string;
    status?: DiscoveryTaskStatus;
    priority?: DiscoveryTaskPriority;
  }): DiscoveryTask[] {
    let list = Array.from(this.tasks.values());

    if (filter?.countryCode) {
      list = list.filter((t) => t.countryCode === filter.countryCode);
    }
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    if (filter?.priority) {
      list = list.filter((t) => t.priority === filter.priority);
    }

    // Sort by priority (P0 -> P1 -> P2 -> P3) then oldest
    const priorityWeight: Record<DiscoveryTaskPriority, number> = {
      P0: 0,
      P1: 1,
      P2: 2,
      P3: 3,
    };

    return list.sort((a, b) => {
      const diff = priorityWeight[a.priority] - priorityWeight[b.priority];
      if (diff !== 0) return diff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  public claimNextTask(): DiscoveryTask | null {
    const queued = this.getTasks({ status: 'queued' });
    if (queued.length === 0) return null;

    const task = queued[0];
    task.status = 'in_progress';
    task.claimedAt = new Date().toISOString();
    return task;
  }

  public completeTask(taskId: string, candidateIds: string[]): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.candidateIds = Array.from(new Set([...task.candidateIds, ...candidateIds]));
  }

  public dismissTask(taskId: string, reason: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.status = 'dismissed';
    task.dismissedReason = reason;
  }

  public getQueueSummary() {
    const all = Array.from(this.tasks.values());
    return {
      total: all.length,
      queued: all.filter((t) => t.status === 'queued').length,
      inProgress: all.filter((t) => t.status === 'in_progress').length,
      completed: all.filter((t) => t.status === 'completed').length,
      dismissed: all.filter((t) => t.status === 'dismissed').length,
      p0Count: all.filter((t) => t.priority === 'P0' && t.status === 'queued').length,
      p1Count: all.filter((t) => t.priority === 'P1' && t.status === 'queued').length,
    };
  }

  private inferPriority(gapType: CoverageGapType): DiscoveryTaskPriority {
    switch (gapType) {
      case 'BLIND_SPOT':
      case 'ALL_SOURCES_FAILING':
        return 'P0';
      case 'HIGH_MISS_RATE':
      case 'NO_PRIMARY_SOURCE':
        return 'P1';
      case 'UNCOVERED_BEAT':
        return 'P2';
      case 'SECONDARY_ONLY':
      case 'STALE_COVERAGE':
      default:
        return 'P3';
    }
  }

  private inferBeatFromGap(gap: CoverageGap): RadarBeat | undefined {
    const lower = gap.details.toLowerCase();
    const beats: RadarBeat[] = [
      'courts',
      'public_safety',
      'government',
      'infrastructure',
      'business',
      'environment',
      'education',
      'politics',
    ];
    for (const b of beats) {
      if (lower.includes(b)) return b;
    }
    return undefined;
  }
}
