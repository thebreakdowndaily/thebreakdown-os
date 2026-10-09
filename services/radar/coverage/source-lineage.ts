/**
 * ─── Source Lineage & Corroboration Graph ──────────────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 5: Global Coverage Operating System
 *
 * Models the origin-to-syndication lineage:
 *   OFFICIAL_ORDER → WIRE (PTI/ANI/Reuters) → Regional Newspaper → Web Repost
 *
 * Distinguishes genuine independent corroboration from wire-echo duplicates.
 * Prevents false corroboration credit when multiple outlets syndicate the same feed.
 */

import type { StoryCluster } from '@/types/newsroom-intelligence';
import type { RadarSourceDefinition } from '../types';

export type LineageNodeType =
  | 'primary_institution'
  | 'wire_service'
  | 'regional_press'
  | 'national_press'
  | 'digital_aggregator'
  | 'social_observer';

export interface LineageNode {
  sourceId: string;
  name: string;
  nodeType: LineageNodeType;
  syndicatedFrom?: string; // wire:pti, wire:ani, wire:reuters, etc.
  parentInstitutionId?: string;
  knownWireAffiliations?: string[];
}

export interface DuplicateChain {
  wireOrOrigin: string;
  repostingSources: string[];
}

export interface CorroborationAnalysis {
  clusterId: string;
  totalObservations: number;
  independentSourceCount: number;
  syndicatedSourceCount: number;
  originSourcePresent: boolean;
  isGenuinelyCorroborated: boolean;
  wireSourcesIdentified: string[];
  duplicateChains: DuplicateChain[];
}

export class SourceLineageGraph {
  private nodes = new Map<string, LineageNode>();

  public registerNode(node: LineageNode): void {
    this.nodes.set(node.sourceId, node);
  }

  public getNode(sourceId: string): LineageNode | undefined {
    return this.nodes.get(sourceId);
  }

  /**
   * Analyzes an event cluster to determine whether multiple reporting sources
   * are truly independent or merely echoing the same wire service/press release.
   */
  public analyzeClusterCorroboration(
    cluster: StoryCluster,
    sourceDefinitions: RadarSourceDefinition[]
  ): CorroborationAnalysis {
    const sourceDefMap = new Map(sourceDefinitions.map((s) => [s.id, s]));
    const sourceIds: string[] = Array.from(new Set(cluster.sourceIds || []));

    const wireGroups = new Map<string, string[]>();
    const independentSources = new Set<string>();
    let originSourcePresent = false;

    for (const sid of sourceIds) {
      const def = sourceDefMap.get(sid);
      const node = this.nodes.get(sid);

      const officialStatus = def?.officialStatus;
      const syndicatedFrom = def?.syndicatedFrom || node?.syndicatedFrom;

      if (officialStatus === 'official_primary' || node?.nodeType === 'primary_institution') {
        originSourcePresent = true;
        independentSources.add(sid);
      } else if (syndicatedFrom) {
        // Source is syndicating from a wire service
        const group = wireGroups.get(syndicatedFrom) || [];
        group.push(sid);
        wireGroups.set(syndicatedFrom, group);
      } else if (node?.nodeType === 'wire_service') {
        const group = wireGroups.get(sid) || [];
        group.push(sid);
        wireGroups.set(sid, group);
      } else {
        independentSources.add(sid);
      }
    }

    // For each wire group, exactly ONE source gets corroboration credit as representative of that wire
    for (const [wire, group] of wireGroups.entries()) {
      if (group.length > 0) {
        independentSources.add(`wire_rep:${wire}`);
      }
    }

    const duplicateChains: DuplicateChain[] = [];
    for (const [wire, group] of wireGroups.entries()) {
      if (group.length > 1) {
        duplicateChains.push({
          wireOrOrigin: wire,
          repostingSources: group,
        });
      }
    }

    const independentSourceCount = independentSources.size;
    const syndicatedSourceCount = sourceIds.length - independentSourceCount;

    // Genuine corroboration requires:
    // (A) At least 2 independent sources, OR
    // (B) 1 primary origin + 1 independent observer
    const isGenuinelyCorroborated =
      independentSourceCount >= 2 || (originSourcePresent && independentSourceCount >= 1 && sourceIds.length >= 2);

    return {
      clusterId: cluster.id,
      totalObservations: cluster.observationIds?.length || sourceIds.length,
      independentSourceCount,
      syndicatedSourceCount: Math.max(0, syndicatedSourceCount),
      originSourcePresent,
      isGenuinelyCorroborated,
      wireSourcesIdentified: Array.from(wireGroups.keys()),
      duplicateChains,
    };
  }

  /**
   * Checks whether two sources are truly independent (not syndicating from the same wire).
   */
  public isIndependentPair(sourceAId: string, sourceBId: string): boolean {
    if (sourceAId === sourceBId) return false;
    const nodeA = this.nodes.get(sourceAId);
    const nodeB = this.nodes.get(sourceBId);

    if (nodeA?.syndicatedFrom && nodeB?.syndicatedFrom) {
      return nodeA.syndicatedFrom !== nodeB.syndicatedFrom;
    }
    return true;
  }
}
