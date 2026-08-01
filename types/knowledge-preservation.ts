// ── Platform Knowledge Lifecycle & Architectural Preservation Specification (Phase 23A) ─
// Immutable Knowledge Preservation domain interfaces.

export type EdgeType =
  | 'IMPLEMENTS'
  | 'DERIVES_FROM'
  | 'SUPERSEDES'
  | 'REFERENCES'
  | 'DEPENDS_ON'
  | 'VALIDATED_BY'
  | 'GOVERNED_BY'
  | 'DOCUMENTED_BY'
  | 'DEPLOYED_IN';

export type AssetState = 'PROPOSED' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED' | 'ARCHIVED';

export interface ArchitecturalGraphNode {
  nodeId: string;
  nodeType: 'ADR' | 'ROADMAP' | 'RULE' | 'SERVICE' | 'PROJECTION' | 'DOCUMENTATION' | 'GATE';
  title: string;
  version: string;
}

export interface ArchitecturalGraphEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
}

export interface AssetLifecycleRecord {
  assetId: string;
  assetName: string;
  state: AssetState;
  lastStateChange: string;
  approvedBy: string;
  adrReference: string;
}

export interface ArchitecturalLineageChain {
  chainId: string;
  intent: string;
  adrId: string;
  specification: string;
  implementation: string;
  validation: string;
  testing: string;
  gateId: string;
  releaseVersion: string;
}

export interface PreservationAuditResult {
  auditId: string;
  category: string;
  issueCount: number;
  findings: readonly string[];
  preservationScore: number; // 0 to 100
}

export interface HistoricalPreservationSnapshot {
  snapshotId: string;
  timestamp: string;
  preservationScore: number;
  orphanNodeCount: number;
  lineageCompletenessPercent: number;
}

export interface PlatformKnowledgePreservationProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  preservationScore: number; // 0 to 100
  nodes: readonly ArchitecturalGraphNode[];
  edges: readonly ArchitecturalGraphEdge[];
  lifecycleRecords: readonly AssetLifecycleRecord[];
  lineageChains: readonly ArchitecturalLineageChain[];
  auditResults: readonly PreservationAuditResult[];
  historicalTrends: readonly HistoricalPreservationSnapshot[];
}
