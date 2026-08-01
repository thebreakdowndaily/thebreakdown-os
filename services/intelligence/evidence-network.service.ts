// ── Workstream 1: Evidence Network Service (Phase 14B Pure Derivation) ───────

import { Fix, Source, Claim } from '../../types/canonical';
import { FixGraphEngine, FixGraphEdge } from '../fixes/fix-graph.service';
import { DerivedReference } from './intelligence-types';

export interface EvidenceChain {
  fixId: string;
  claimId?: string;
  sourceId: string;
  sourceTier: number;
  confidenceScore: number;
  chainStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  path: string[];
}

export interface EvidenceGraphView {
  rootFixId: string;
  totalEdges: number;
  edges: FixGraphEdge[];
  supportingChains: EvidenceChain[];
  missingAttestations: DerivedReference[];
}

export class EvidenceNetworkService {
  /**
   * Generates a derived evidence graph view for a canonical Fix object.
   * Pure function: 0 graph duplication, 0 mutation.
   */
  public static analyzeEvidenceNetwork(fix: Fix): EvidenceGraphView {
    const edges = FixGraphEngine.generateEdges(fix);
    const supportingChains: EvidenceChain[] = [];
    const missingAttestations: DerivedReference[] = [];

    // 1. Compute Supporting Evidence Chains
    const sources = fix.sources || [];
    const sourceIds = fix.sourceIds || [];

    if (sourceIds.length === 0 && sources.length === 0) {
      missingAttestations.push({
        targetId: fix.id,
        targetType: 'FIX',
        label: 'Zero primary/secondary sources cited on Fix object.',
      });
    }

    for (const src of sources) {
      const tier = src.tier || 3;
      const confidenceScore = tier === 1 ? 0.95 : tier === 2 ? 0.8 : 0.6;
      const chainStrength = tier === 1 ? 'STRONG' : tier === 2 ? 'MODERATE' : 'WEAK';

      supportingChains.push({
        fixId: fix.id,
        sourceId: src.id || src.url || 'src-unknown',
        sourceTier: tier,
        confidenceScore,
        chainStrength,
        path: [`FIX:${fix.id}`, `SOURCE:${src.id || src.title}`],
      });
    }

    if (sources.length === 0 && sourceIds.length > 0) {
      for (const srcId of sourceIds) {
        supportingChains.push({
          fixId: fix.id,
          sourceId: srcId,
          sourceTier: 2,
          confidenceScore: 0.75,
          chainStrength: 'MODERATE',
          path: [`FIX:${fix.id}`, `SOURCE:${srcId}`],
        });
      }
    }

    // 2. Check for missing entity attestation
    if (!fix.responsibleActorIds || fix.responsibleActorIds.length === 0) {
      missingAttestations.push({
        targetId: fix.id,
        targetType: 'ENTITY',
        label: 'No responsible executive/legislative Entity linked to Fix.',
      });
    }

    return {
      rootFixId: fix.id,
      totalEdges: edges.length,
      edges,
      supportingChains,
      missingAttestations,
    };
  }
}
