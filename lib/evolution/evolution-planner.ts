// ── Architecture Evolution Planner (Phase 22B WP2) ─────────────────────────────

import { ArchitectureEvolutionRoadmap } from '../../types/evolution';

export class ArchitectureEvolutionPlanner {
  public static getRoadmap(): ArchitectureEvolutionRoadmap {
    return Object.freeze({
      roadmapId: 'rdmp-2026-v1',
      currentPhase: 'Phase 22B — Release Governance',
      supportedVersions: Object.freeze(['v1.0.0', 'v1.1.0-preview']),
      compatibilityWindowDays: 180,
      migrationPaths: Object.freeze(['v0.9-alias-to-v1.0-canonical', 'v1.0-projection-freeze']),
      deprecationSchedule: Object.freeze(['v0.8-legacy-endpoints-sunset-2026-12-31']),
    });
  }
}
