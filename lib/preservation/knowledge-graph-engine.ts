// ── Architectural Knowledge Graph Engine (Phase 23A WP2) ────────────────────────

import { ArchitecturalGraphNode, ArchitecturalGraphEdge } from '../../types/knowledge-preservation';

export class ArchitecturalKnowledgeGraphEngine {
  private static nodes: ArchitecturalGraphNode[] = [
    { nodeId: 'node-adr-001', nodeType: 'ADR', title: 'Canonical Domain Isolation', version: 'v1.0' },
    { nodeId: 'node-rule-fitness-01', nodeType: 'RULE', title: 'Non-Mutation Invariant', version: 'v1.0' },
    { nodeId: 'node-service-fix', nodeType: 'SERVICE', title: 'FixDomainService', version: 'v1.0' },
    { nodeId: 'node-proj-excellence', nodeType: 'PROJECTION', title: 'PlatformExcellenceProjection', version: 'v1.0' },
    { nodeId: 'node-gate-22a', nodeType: 'GATE', title: 'Gate 22A Clearance', version: 'v1.0' },
  ];

  private static edges: ArchitecturalGraphEdge[] = [
    { edgeId: 'edge-01', sourceNodeId: 'node-service-fix', targetNodeId: 'node-adr-001', edgeType: 'IMPLEMENTS' },
    { edgeId: 'edge-02', sourceNodeId: 'node-rule-fitness-01', targetNodeId: 'node-adr-001', edgeType: 'GOVERNED_BY' },
    { edgeId: 'edge-03', sourceNodeId: 'node-proj-excellence', targetNodeId: 'node-service-fix', edgeType: 'DERIVES_FROM' },
    { edgeId: 'edge-04', sourceNodeId: 'node-gate-22a', targetNodeId: 'node-proj-excellence', edgeType: 'VALIDATED_BY' },
  ];

  public static getNodes(): readonly ArchitecturalGraphNode[] {
    return Object.freeze(this.nodes.map((n) => Object.freeze({ ...n })));
  }

  public static getEdges(): readonly ArchitecturalGraphEdge[] {
    return Object.freeze(this.edges.map((e) => Object.freeze({ ...e })));
  }
}
