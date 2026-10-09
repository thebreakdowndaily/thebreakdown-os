/**
 * ─── Missed-Event → Source Discovery Feedback Loop ─────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 5: Global Coverage Operating System
 *
 * Closes the loop between benchmarking and discovery:
 * When real-world events are missed due to missing sources or geographic gaps,
 * automatically formulates prioritized discovery tasks for the discovery queue.
 */

import { createHash } from 'node:crypto';
import type { GroundTruthEvent, RecallBenchmarkReport } from './recall';
import type { CountryPack } from '@/data/radar/countries';
import type { DiscoveryTask, ProactiveDiscoveryQueue } from '../discovery/queue';
import type { RadarBeat } from '../types';

export interface MissedEventGroup {
  location: string;
  beat: string;
  missedEvents: GroundTruthEvent[];
  keywords: string[];
}

export interface FeedbackLoopResult {
  evaluatedMissesCount: number;
  missedGroups: Array<{
    location: string;
    beat: string;
    missedCount: number;
    groundTruthIds: string[];
  }>;
  generatedTasks: DiscoveryTask[];
}

export class RecallFeedbackLoop {
  constructor(private discoveryQueue?: ProactiveDiscoveryQueue) {}

  /**
   * Processes a recall benchmark report, groups missed events by location and beat,
   * and generates prioritized discovery tasks with target institutions.
   */
  public processBenchmarkReport(
    report: RecallBenchmarkReport,
    groundTruth: GroundTruthEvent[],
    countryPack: CountryPack
  ): FeedbackLoopResult {
    const gtMap = new Map(groundTruth.map((gt) => [gt.id, gt]));
    const missedResults = report.results.filter((r) => r.status === 'MISSED');

    // Group misses by location + beat
    const groupMap = new Map<string, MissedEventGroup>();

    for (const res of missedResults) {
      const gt = gtMap.get(res.groundTruthId);
      if (!gt) continue;

      const groupKey = `${gt.location.toLowerCase()}:${gt.beat.toLowerCase()}`;
      let group = groupMap.get(groupKey);
      if (!group) {
        group = {
          location: gt.location,
          beat: gt.beat,
          missedEvents: [],
          keywords: [],
        };
        groupMap.set(groupKey, group);
      }

      group.missedEvents.push(gt);
      group.keywords.push(...gt.keywords);
    }

    const generatedTasks: DiscoveryTask[] = [];
    const missedGroupsSummary: FeedbackLoopResult['missedGroups'] = [];

    for (const group of groupMap.values()) {
      const uniqueKeywords = Array.from(new Set(group.keywords)).slice(0, 10);
      const groundTruthIds = group.missedEvents.map((e) => e.id);

      missedGroupsSummary.push({
        location: group.location,
        beat: group.beat,
        missedCount: group.missedEvents.length,
        groundTruthIds,
      });

      // Match against country pack discovery patterns
      const relevantPatterns = countryPack.discoveryPatterns.filter(
        (p) => p.beat.toLowerCase() === group.beat.toLowerCase()
      );

      const recommendedKeywords = Array.from(
        new Set([
          ...relevantPatterns.flatMap((p) => p.institutionKeywords),
          ...uniqueKeywords.slice(0, 4),
        ])
      ).slice(0, 8);

      const recommendedInstitutions = recommendedKeywords.map(
        (kw) => `${kw} ${group.location}`
      );

      const geoNode = Object.values(countryPack.nodes).find(
        (n) => n.name.toLowerCase() === group.location.toLowerCase() ||
               n.aliases.some((a) => a.toLowerCase() === group.location.toLowerCase())
      );

      const geographyId = geoNode ? geoNode.id : `geo_${group.location.toLowerCase().replace(/\s+/g, '_')}`;

      const taskId = `task_miss_${createHash('sha256')
        .update(`${geographyId}:${group.beat}:${groundTruthIds.join(',')}`)
        .digest('hex')
        .substring(0, 16)}`;

      const task: DiscoveryTask = {
        id: taskId,
        priority: group.missedEvents.length >= 2 ? 'P0' : 'P1',
        gapType: 'HIGH_MISS_RATE',
        geographyId,
        geographyName: geoNode ? geoNode.name : group.location,
        countryCode: countryPack.countryCode,
        targetBeat: (group.beat as RadarBeat) || 'government',
        recommendedKeywords,
        recommendedInstitutions,
        reason: `Missed ${group.missedEvents.length} ground-truth event(s) [${groundTruthIds.join(', ')}] in ${group.location} [${group.beat}]: ${group.missedEvents.map((e) => `"${e.title}"`).join(', ')}`,
        createdAt: new Date().toISOString(),
        status: 'queued',
        candidateIds: [],
      };

      if (this.discoveryQueue) {
        this.discoveryQueue.enqueue(task);
      }
      generatedTasks.push(task);
    }

    return {
      evaluatedMissesCount: missedResults.length,
      missedGroups: missedGroupsSummary,
      generatedTasks,
    };
  }
}
