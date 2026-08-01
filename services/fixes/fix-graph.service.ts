// ── Fix Knowledge Graph & Taxonomy Service (AR-13A.0 Specification) ───────────

import { Fix, Source } from '../../types/canonical';

export type FixNodeType =
  | 'FIX'
  | 'STORY'
  | 'INVESTIGATION'
  | 'CLAIM'
  | 'SOURCE'
  | 'ENTITY'
  | 'DATASET'
  | 'POLICY'
  | 'LAW'
  | 'TIMELINE_EVENT'
  | 'COUNTRY'
  | 'CONCEPT';

export type FixEdgeType =
  | 'addresses_problem'
  | 'addresses_investigation'
  | 'supported_by_claim'
  | 'cites_source'
  | 'requires_action_by'
  | 'amends_law'
  | 'replaces_policy'
  | 'evaluated_by_metric'
  | 'applicable_to'
  | 'superseded_by'
  | 'alternative_to';

export interface FixGraphEdge {
  sourceId: string;
  sourceType: FixNodeType;
  targetId: string;
  targetType: FixNodeType;
  edgeType: FixEdgeType;
  direction: 'outgoing' | 'undirected';
}

export class InvalidGraphEdgeError extends Error {
  constructor(public edge: Partial<FixGraphEdge>, public reason: string) {
    super(`Forbidden Graph Edge [${edge.sourceType} -${edge.edgeType}-> ${edge.targetType}]: ${reason}`);
    this.name = 'InvalidGraphEdgeError';
  }
}

// ── Allowed Edge Combinations Matrix ───────────────────────────────────────
const ALLOWED_EDGES: Array<{ sourceType: FixNodeType; edgeType: FixEdgeType; targetType: FixNodeType }> = [
  { sourceType: 'FIX', edgeType: 'addresses_problem', targetType: 'STORY' },
  { sourceType: 'FIX', edgeType: 'addresses_investigation', targetType: 'INVESTIGATION' },
  { sourceType: 'FIX', edgeType: 'supported_by_claim', targetType: 'CLAIM' },
  { sourceType: 'FIX', edgeType: 'cites_source', targetType: 'SOURCE' },
  { sourceType: 'FIX', edgeType: 'requires_action_by', targetType: 'ENTITY' },
  { sourceType: 'FIX', edgeType: 'amends_law', targetType: 'LAW' },
  { sourceType: 'FIX', edgeType: 'replaces_policy', targetType: 'POLICY' },
  { sourceType: 'FIX', edgeType: 'evaluated_by_metric', targetType: 'DATASET' },
  { sourceType: 'FIX', edgeType: 'applicable_to', targetType: 'COUNTRY' },
  { sourceType: 'FIX', edgeType: 'superseded_by', targetType: 'FIX' },
  { sourceType: 'FIX', edgeType: 'alternative_to', targetType: 'FIX' },
];

export class FixGraphEngine {
  /**
   * Validates whether a graph edge is permitted under the AR-13A.0 Relationship Taxonomy.
   * Throws InvalidGraphEdgeError if edge violates negative constraints.
   */
  public static validateEdge(edge: FixGraphEdge): boolean {
    // 1. Negative Constraint Check: FIX - [addresses_problem] -> FIX is forbidden
    if (edge.sourceType === 'FIX' && edge.edgeType === 'addresses_problem' && edge.targetType === 'FIX') {
      throw new InvalidGraphEdgeError(
        edge,
        'A Fix cannot use "addresses_problem" to reference another Fix. Use "superseded_by" or "alternative_to".'
      );
    }

    // 2. Negative Constraint Check: FIX - [cites_source] -> STORY is forbidden
    if (edge.sourceType === 'FIX' && edge.edgeType === 'cites_source' && edge.targetType === 'STORY') {
      throw new InvalidGraphEdgeError(
        edge,
        'Stories are narrative projections, not primary sources. Direct "cites_source" edges must point to SOURCE nodes.'
      );
    }

    // 3. Negative Constraint Check: Self-referencing superseded_by loop
    if (edge.edgeType === 'superseded_by' && edge.sourceId === edge.targetId) {
      throw new InvalidGraphEdgeError(edge, 'Circular Supersession: A Fix cannot reference itself as superseded_by.');
    }

    // 4. Matrix Match Check
    const match = ALLOWED_EDGES.some(
      (a) => a.sourceType === edge.sourceType && a.edgeType === edge.edgeType && a.targetType === edge.targetType
    );

    if (!match) {
      throw new InvalidGraphEdgeError(edge, 'Edge combination is not defined in the AR-13A.0 Relationship Taxonomy.');
    }

    return true;
  }

  /**
   * Generates canonical graph edges connecting a Fix to its related Knowledge Objects.
   */
  public static generateEdges(fix: Fix): FixGraphEdge[] {
    const edges: FixGraphEdge[] = [];

    // Story linkage
    if (fix.storySlug) {
      edges.push({
        sourceId: fix.id,
        sourceType: 'FIX',
        targetId: fix.storySlug,
        targetType: 'STORY',
        edgeType: 'addresses_problem',
        direction: 'outgoing',
      });
    }

    // Source linkages
    if (fix.sourceIds && Array.isArray(fix.sourceIds)) {
      for (const srcId of fix.sourceIds) {
        edges.push({
          sourceId: fix.id,
          sourceType: 'FIX',
          targetId: srcId,
          targetType: 'SOURCE',
          edgeType: 'cites_source',
          direction: 'outgoing',
        });
      }
    }

    // Responsible Actor Entity linkages
    if (fix.responsibleActorIds && Array.isArray(fix.responsibleActorIds)) {
      for (const actorId of fix.responsibleActorIds) {
        edges.push({
          sourceId: fix.id,
          sourceType: 'FIX',
          targetId: actorId,
          targetType: 'ENTITY',
          edgeType: 'requires_action_by',
          direction: 'outgoing',
        });
      }
    }

    // Supersession linkage
    if (fix.publicationStatus === 'superseded' && fix.supersededByFixId) {
      edges.push({
        sourceId: fix.id,
        sourceType: 'FIX',
        targetId: fix.supersededByFixId,
        targetType: 'FIX',
        edgeType: 'superseded_by',
        direction: 'outgoing',
      });
    }

    // Validate all generated edges
    for (const edge of edges) {
      this.validateEdge(edge);
    }

    return edges;
  }

  /**
   * Asserts Graph Invariants (Reachability, Attestation, No Orphan Actions).
   */
  public static assertGraphInvariants(fix: Fix): void {
    // Attestation Invariant: Published Fix must have at least 1 source edge
    if (fix.publicationStatus === 'published' && (!fix.sourceIds || fix.sourceIds.length === 0)) {
      throw new Error('Graph Invariant Violation (Attestation): Published FIX node must have an unbroken path to a SOURCE node.');
    }

    // No Orphan Actions Invariant: Every Fix must have at least 1 requires_action_by edge to an ENTITY node
    if (!fix.responsibleActorIds || fix.responsibleActorIds.length === 0) {
      throw new Error('Graph Invariant Violation (No Orphan Actions): FIX node must maintain an active requires_action_by edge pointing to an ENTITY node.');
    }
  }
}
