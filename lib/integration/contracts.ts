// ── Subsystem Contract Registry (Phase 19A Recommendation 2) ──────────────────

import { SubsystemContract } from '../../types/integration';

export const DEFAULT_CONTRACTS: SubsystemContract[] = [
  {
    provider: 'TelemetryProvider',
    expectedProjection: 'TelemetryProjection',
    failureBehaviour: 'DEGRADE_GRACEFULLY',
    compatibilityVersion: 'v1.0',
    verified: true,
  },
  {
    provider: 'JobsProvider',
    expectedProjection: 'JobsProjection',
    failureBehaviour: 'CIRCUIT_BREAK',
    compatibilityVersion: 'v1.0',
    verified: true,
  },
  {
    provider: 'ControlPlaneProvider',
    expectedProjection: 'OperationsControlPlaneProjection',
    failureBehaviour: 'FALLBACK_PROJECTION',
    compatibilityVersion: 'v1.0',
    verified: true,
  },
  {
    provider: 'SecurityProvider',
    expectedProjection: 'SecurityContextProjection',
    failureBehaviour: 'CIRCUIT_BREAK',
    compatibilityVersion: 'v1.0',
    verified: true,
  },
  {
    provider: 'InfrastructureProvider',
    expectedProjection: 'ProductionInfrastructureProjection',
    failureBehaviour: 'DEGRADE_GRACEFULLY',
    compatibilityVersion: 'v1.0',
    verified: true,
  },
  {
    provider: 'PerformanceProvider',
    expectedProjection: 'PerformanceProjection',
    failureBehaviour: 'DEGRADE_GRACEFULLY',
    compatibilityVersion: 'v1.0',
    verified: true,
  },
];

export class SubsystemContractRegistry {
  public static listContracts(): readonly SubsystemContract[] {
    return Object.freeze(DEFAULT_CONTRACTS.map((c) => Object.freeze({ ...c })));
  }

  public static validateAllContracts(): boolean {
    return DEFAULT_CONTRACTS.every((c) => c.verified && c.compatibilityVersion === 'v1.0');
  }
}
