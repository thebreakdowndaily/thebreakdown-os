// ── Operational Resilience Engine & Incident Model (Phase 18C Recommendations 5, 7, 8) ─

import {
  ResiliencePolicy,
  InfrastructureIncident,
  RecoveryState,
} from '../../types/infrastructure';
import { DependencyRegistry } from './dependency-registry';

export class OperationalResilienceEngine {
  private policies: ResiliencePolicy[] = [];
  private incidents: InfrastructureIncident[] = [];

  constructor() {
    this.policies = [
      {
        policyId: 'res-repo-circuit',
        dependencyId: 'dep-repo',
        failureThreshold: 3,
        recoveryStrategy: 'CIRCUIT_BREAKER',
        circuitState: 'CLOSED',
      },
      {
        policyId: 'res-search-fallback',
        dependencyId: 'dep-search',
        failureThreshold: 2,
        recoveryStrategy: 'FALLBACK_PROJECTION',
        circuitState: 'CLOSED',
      },
    ];
  }

  public deriveRecoveryState(): RecoveryState {
    const deps = DependencyRegistry.listAll();
    const criticalUnhealthy = deps.some((d) => d.criticality === 'CRITICAL' && d.status === 'UNHEALTHY');
    const nonCriticalUnhealthy = deps.some((d) => d.criticality === 'NON_CRITICAL' && d.status === 'UNHEALTHY');
    const hasOpenIncidents = this.incidents.some((i) => i.status === 'OPEN');
    const hasRecoveringIncidents = this.incidents.some((i) => i.status === 'RECOVERING');

    if (criticalUnhealthy) return 'FAILED';
    if (hasRecoveringIncidents) return 'RECOVERING';
    if (nonCriticalUnhealthy || hasOpenIncidents) return 'DEGRADED';
    return 'NORMAL';
  }

  public reportIncident(component: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): InfrastructureIncident {
    const incident: InfrastructureIncident = Object.freeze({
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      severity,
      component,
      status: 'OPEN',
      startedAt: new Date().toISOString(),
    });
    this.incidents.push(incident);
    return incident;
  }

  public resolveIncident(id: string, resolution = 'Dependency restored to healthy status.'): void {
    const idx = this.incidents.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.incidents[idx] = Object.freeze({
        ...this.incidents[idx],
        status: 'RESOLVED',
        recoveredAt: new Date().toISOString(),
        resolution,
      });
    }
  }

  public getPolicies(): readonly ResiliencePolicy[] {
    return Object.freeze([...this.policies]);
  }

  public getActiveIncidents(): readonly InfrastructureIncident[] {
    return Object.freeze(this.incidents.filter((i) => i.status !== 'RESOLVED'));
  }
}
