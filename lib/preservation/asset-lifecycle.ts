// ── Architectural Asset Lifecycle Manager (Phase 23A WP3) ──────────────────────

import { AssetLifecycleRecord, AssetState } from '../../types/knowledge-preservation';

export class ArchitecturalAssetLifecycleManager {
  private static lifecycleRecords: AssetLifecycleRecord[] = [
    {
      assetId: 'asset-canonical-fix-domain',
      assetName: 'Canonical Fix Domain Service & Schema',
      state: 'ACTIVE',
      lastStateChange: new Date().toISOString(),
      approvedBy: 'CTO / Editorial Constitution Committee',
      adrReference: 'ADR-001',
    },
    {
      assetId: 'asset-v0.8-legacy-router',
      assetName: 'Legacy v0.8 API Router',
      state: 'DEPRECATED',
      lastStateChange: new Date().toISOString(),
      approvedBy: 'Extensibility Governance Board',
      adrReference: 'ADR-002',
    },
  ];

  public static listLifecycleRecords(): readonly AssetLifecycleRecord[] {
    return Object.freeze(this.lifecycleRecords.map((r) => Object.freeze({ ...r })));
  }

  public static validateStateTransition(currentState: AssetState, nextState: AssetState): boolean {
    const allowedTransitions: Record<AssetState, AssetState[]> = {
      PROPOSED: ['ACTIVE', 'RETIRED'],
      ACTIVE: ['DEPRECATED'],
      DEPRECATED: ['RETIRED', 'ACTIVE'],
      RETIRED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    return allowedTransitions[currentState]?.includes(nextState) || false;
  }
}
