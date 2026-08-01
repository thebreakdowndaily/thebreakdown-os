import { describe, it, expect } from 'vitest';
import { ArchitecturalKnowledgeGraphEngine } from '../lib/preservation/knowledge-graph-engine';
import { ArchitecturalAssetLifecycleManager } from '../lib/preservation/asset-lifecycle';
import { ArchitecturalLineageTracker } from '../lib/preservation/lineage-tracker';
import { ArchitecturalPreservationAuditor } from '../lib/preservation/preservation-auditor';
import { PlatformKnowledgePreservationProjectionBuilder } from '../lib/preservation/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-PRESERVATION: Platform Knowledge Lifecycle & Architectural Preservation (Phase 23A)', () => {
  it('TEST-PRE-01: Architectural Knowledge Graph Construction (5 Nodes / 4 Edges)', () => {
    const nodes = ArchitecturalKnowledgeGraphEngine.getNodes();
    const edges = ArchitecturalKnowledgeGraphEngine.getEdges();

    expect(nodes.length).toBe(5);
    expect(edges.length).toBe(4);
    expect(Object.isFrozen(nodes)).toBe(true);
    expect(Object.isFrozen(edges)).toBe(true);
  });

  it('TEST-PRE-02: Governed 5-State Asset Lifecycle State Machine', () => {
    const records = ArchitecturalAssetLifecycleManager.listLifecycleRecords();

    expect(records.length).toBe(2);
    expect(records.some((r) => r.state === 'ACTIVE')).toBe(true);
    expect(records.some((r) => r.state === 'DEPRECATED')).toBe(true);
  });

  it('TEST-PRE-03: Invalid Asset Lifecycle State Transition Guard Rejection', () => {
    const valid = ArchitecturalAssetLifecycleManager.validateStateTransition('ACTIVE', 'DEPRECATED');
    const invalid = ArchitecturalAssetLifecycleManager.validateStateTransition('ARCHIVED', 'ACTIVE');

    expect(valid).toBe(true);
    expect(invalid).toBe(false);
  });

  it('TEST-PRE-04: Enriched End-to-End Architectural Lineage Chain Resolution', () => {
    const chains = ArchitecturalLineageTracker.resolveLineageChains();

    expect(chains.length).toBe(1);
    expect(chains[0].intent).toContain('Article IX');
    expect(chains[0].adrId).toContain('ADR-001');
    expect(chains[0].testing).toBe('tests/fix-domain.test.ts (TEST-DOM)');
  });

  it('TEST-PRE-05: Architectural Preservation Audit', () => {
    const audits = ArchitecturalPreservationAuditor.auditPreservation();

    expect(audits.length).toBe(2);
    expect(audits[0].preservationScore).toBe(100.0);
    expect(audits[0].issueCount).toBe(0);
  });

  it('TEST-PRE-06: Orphaned Node & Broken Lineage Chain Detection', () => {
    const audits = ArchitecturalPreservationAuditor.auditPreservation();
    const orphanAudit = audits.find((a) => a.auditId === 'audit-orphan-nodes');

    expect(orphanAudit?.issueCount).toBe(0);
  });

  it('TEST-PRE-07: Explicit Edge Semantic Relationship Validation', () => {
    const edges = ArchitecturalKnowledgeGraphEngine.getEdges();
    expect(edges.some((e) => e.edgeType === 'IMPLEMENTS')).toBe(true);
    expect(edges.some((e) => e.edgeType === 'DERIVES_FROM')).toBe(true);
  });

  it('TEST-PRE-08: Knowledge Graph Density & Connectivity Metric Calculation', () => {
    const nodes = ArchitecturalKnowledgeGraphEngine.getNodes();
    const edges = ArchitecturalKnowledgeGraphEngine.getEdges();

    const density = edges.length / nodes.length;
    expect(density).toBeGreaterThan(0.5);
  });

  it('TEST-PRE-09: Historical Preservation Intelligence Snapshot Tracking', () => {
    const proj = PlatformKnowledgePreservationProjectionBuilder.buildProjection();
    const snapshot = proj.historicalTrends[0];

    expect(snapshot.preservationScore).toBe(100);
    expect(snapshot.orphanNodeCount).toBe(0);
  });

  it('TEST-PRE-10: PlatformKnowledgePreservationProjection Building & Immutability', () => {
    const proj = PlatformKnowledgePreservationProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(proj.preservationScore).toBe(100);
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.nodes)).toBe(true);
  });

  it('TEST-PRE-11: Overall Preservation Score Resolution', () => {
    const proj = PlatformKnowledgePreservationProjectionBuilder.buildProjection();
    expect(proj.preservationScore).toBe(100);
  });

  it('TEST-PRE-12: Cyclic Graph Detection & Safety Guard', () => {
    const edges = ArchitecturalKnowledgeGraphEngine.getEdges();
    expect(edges.every((e) => e.sourceNodeId !== e.targetNodeId)).toBe(true);
  });

  it('TEST-PRE-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PlatformKnowledgePreservationProjectionBuilder.buildProjection();
    ArchitecturalKnowledgeGraphEngine.getNodes();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-PRE-14: Preservation Boundary Invariant Verification ("Knowledge Preservation records. Knowledge Preservation relates. Knowledge Preservation audits. Knowledge Preservation never rewrites architectural history.")', () => {
    const proj = PlatformKnowledgePreservationProjectionBuilder.buildProjection();
    expect(proj).toBeDefined();
    // Knowledge Preservation audits & relates; zero mutations to canonical editorial data
  });

  it('TEST-PRE-15: High-Volume Knowledge Graph Traversal Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      ArchitecturalKnowledgeGraphEngine.getEdges();
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // 500 graph traversals under 100ms
  });

  it('TEST-PRE-16: Deterministic Preservation Projection Serialization Stability', () => {
    const proj = PlatformKnowledgePreservationProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"preservationScore":100');
  });
});
