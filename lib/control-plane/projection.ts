// ── Control Plane Projection Builder (Phase 18A WP3) ──────────────────────────

import { ControlPlaneProjection } from '../../types/control-plane';
import { ControlPlaneManager } from './manager';

export class ControlPlaneProjectionBuilder {
  /**
   * Projects ControlPlaneManager state into an immutable ControlPlaneProjection.
   */
  public static buildProjection(
    manager: ControlPlaneManager,
    options?: {
      projectionId?: string;
      platformVersion?: string;
    }
  ): ControlPlaneProjection {
    const snapshot = manager.generateSnapshot();
    const events = manager.getEvents();

    let systemStatusLabel = 'OPERATIONAL';
    if (snapshot.health.severity === 'CRITICAL') {
      systemStatusLabel = 'CRITICAL ALERT';
    } else if (snapshot.health.severity === 'DEGRADED') {
      systemStatusLabel = 'SYSTEM DEGRADED';
    } else if (snapshot.health.severity === 'WARNING') {
      systemStatusLabel = 'SYSTEM WARNING';
    }

    return Object.freeze({
      projectionId: options?.projectionId || `proj-cp-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || snapshot.platformVersion || 'AR-13A.0',
      generatedAt: snapshot.generatedAt,
      snapshot,
      recentControlEvents: Object.freeze(events.slice(-10)),
      systemStatusLabel,
    });
  }
}
