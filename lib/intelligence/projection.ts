// ── Platform Knowledge Intelligence Projection Builder (Phase 23B WP6) ───────────

import { PlatformKnowledgeIntelligenceProjection, HistoricalIntelligenceSnapshot } from '../../types/knowledge-intelligence';
import { SemanticReasoningEngine } from './semantic-reasoning-engine';
import { EvidenceProvenanceEngine } from './evidence-provenance-engine';
import { CrossDomainDiscoveryEngine } from './cross-domain-discovery';
import { KnowledgeConsistencyAnalyzer } from './consistency-analyzer';

export class PlatformKnowledgeIntelligenceProjectionBuilder {
  /**
   * Builds an immutable PlatformKnowledgeIntelligenceProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): PlatformKnowledgeIntelligenceProjection {
    const timestamp = options?.currentTime || new Date();
    const inferredRelationships = SemanticReasoningEngine.inferRelationships();
    const provenanceChains = EvidenceProvenanceEngine.traceProvenance();
    const discoveryItems = CrossDomainDiscoveryEngine.discoverCrossDomain();
    const consistencyIssues = KnowledgeConsistencyAnalyzer.analyzeConsistency();
    const consistencyScore = KnowledgeConsistencyAnalyzer.getConsistencyScore();

    const avgConfidence = inferredRelationships.reduce((acc, r) => acc + r.confidenceScore, 0) / (inferredRelationships.length || 1);

    const historicalTrends: HistoricalIntelligenceSnapshot[] = [
      {
        snapshotId: 'snap-intel-2026-07-25-01',
        timestamp: timestamp.toISOString(),
        inferenceCount: inferredRelationships.length,
        averageConfidenceScore: avgConfidence,
        provenanceCompletenessPercent: 100.0,
        consistencyScore,
      },
    ];

    return Object.freeze({
      projectionId: options?.projectionId || `proj-intel-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      consistencyScore,
      averageConfidenceScore: Math.round(avgConfidence * 100) / 100,
      inferredRelationships,
      provenanceChains,
      discoveryItems,
      consistencyIssues,
      historicalTrends: Object.freeze(historicalTrends.map((h) => Object.freeze({ ...h }))),
    });
  }
}
