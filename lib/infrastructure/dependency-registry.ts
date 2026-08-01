// ── Infrastructure Dependency Registry (Phase 18C Recommendation 2) ───────────

import { InfrastructureDependency, DependencyCriticality } from '../../types/infrastructure';

export class DependencyRegistry {
  private static dependencies = new Map<string, InfrastructureDependency>();

  public static register(dep: { id: string; name: string; criticality: DependencyCriticality; timeoutMs?: number }): InfrastructureDependency {
    const item: InfrastructureDependency = Object.freeze({
      id: dep.id,
      name: dep.name,
      criticality: dep.criticality,
      status: 'HEALTHY',
      timeoutMs: dep.timeoutMs || 1000,
      lastCheckedAt: new Date().toISOString(),
    });
    this.dependencies.set(dep.id, item);
    return item;
  }

  public static updateStatus(id: string, status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED'): void {
    const existing = this.dependencies.get(id);
    if (existing) {
      this.dependencies.set(
        id,
        Object.freeze({
          ...existing,
          status,
          lastCheckedAt: new Date().toISOString(),
        })
      );
    }
  }

  public static listAll(): readonly InfrastructureDependency[] {
    if (this.dependencies.size === 0) {
      this.register({ id: 'dep-repo', name: 'Fix Repository Service', criticality: 'CRITICAL' });
      this.register({ id: 'dep-search', name: 'BM25 Search Engine', criticality: 'NON_CRITICAL' });
      this.register({ id: 'dep-graph', name: 'Knowledge Graph Engine', criticality: 'NON_CRITICAL' });
      this.register({ id: 'dep-telemetry', name: 'Telemetry Subsystem', criticality: 'NON_CRITICAL' });
      this.register({ id: 'dep-jobs', name: 'Automation Job Runner', criticality: 'NON_CRITICAL' });
    }
    return Object.freeze(Array.from(this.dependencies.values()));
  }

  public static clear(): void {
    this.dependencies.clear();
  }
}
