// ── Control Plane Subsystem Provider Interfaces (Phase 18A Recommendation 1) ─

import { TelemetryProjection } from '../../types/telemetry';
import { JobProjection } from '../../types/jobs';
import { SystemHealth, RuntimeConfiguration } from '../../types/control-plane';

export interface TelemetryProvider {
  getProjection(): TelemetryProjection;
}

export interface JobsProvider {
  getProjection(): JobProjection;
}

export interface HealthProvider {
  evaluateHealth(telemetry: TelemetryProjection, jobs: JobProjection): SystemHealth;
}

export interface ConfigurationProvider {
  getConfiguration(): RuntimeConfiguration;
}

export interface ControlPlaneExtension {
  id: string;
  name: string;
  onSnapshotGenerated(snapshot: unknown): void;
}

export class ControlPlaneExtensionRegistry {
  private static extensions = new Map<string, ControlPlaneExtension>();

  public static register(extension: ControlPlaneExtension): void {
    this.extensions.set(extension.id, extension);
  }

  public static listAll(): ControlPlaneExtension[] {
    return Array.from(this.extensions.values());
  }

  public static clear(): void {
    this.extensions.clear();
  }
}
