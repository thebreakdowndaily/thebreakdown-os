// ── Architecture Decision Records Registry (Phase 22B WP5) ──────────────────────

import { ArchitectureDecisionRecord } from '../../types/evolution';

export class ArchitectureDecisionRegistry {
  private static adrs: ArchitectureDecisionRecord[] = [
    {
      adrId: 'ADR-001',
      version: 'v1.0',
      title: 'Canonical Domain Isolation & Immuntability Boundary',
      status: 'ACCEPTED',
      context: 'Platform subsystems require clear boundaries to prevent accidental mutation of editorial knowledge.',
      decision: 'All operational, governance, observability, resilience, and excellence subsystems observe state via immutable projections.',
      alternativesConsidered: Object.freeze(['Direct Database Shared Models', 'Event Sourcing Object Replay']),
      consequences: Object.freeze(['Zero canonical edits during operational monitoring', 'Guaranteed read reproducibility']),
      linkedRoadmapPhase: 'Phase 13B.1 — Core Domain',
      linkedArchitecturalRules: Object.freeze(['FITNESS-INV-01', 'INV-FIX-001']),
      traceabilityReferences: Object.freeze(['docs/editorial/editorial-constitution.md#Article-IX', 'AGENTS.md#Everything-is-a-Knowledge-Object']),
    },
    {
      adrId: 'ADR-002',
      version: 'v1.0',
      title: 'Projection-First Control Plane UI Architecture',
      status: 'ACCEPTED',
      context: 'Control plane UI components need a decoupled, deterministic data contract.',
      decision: 'UI components render strictly typed freeze projections without executing domain logic.',
      alternativesConsidered: Object.freeze(['Direct GraphQL Queries in UI', 'Client-side Service Invocation']),
      consequences: Object.freeze(['Fast UI rendering (<15ms)', 'Clean component testability']),
      linkedRoadmapPhase: 'Phase 18A — Control Plane',
      linkedArchitecturalRules: Object.freeze(['FITNESS-INV-03', 'FITNESS-INV-04']),
      traceabilityReferences: Object.freeze(['docs/architecture/gate-18a-conformance-report.md']),
    },
  ];

  public static listADRs(): readonly ArchitectureDecisionRecord[] {
    return Object.freeze(this.adrs.map((a) => Object.freeze({ ...a })));
  }

  public static getADR(adrId: string): ArchitectureDecisionRecord | undefined {
    return this.adrs.find((a) => a.adrId === adrId);
  }
}
