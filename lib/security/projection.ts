// ── Security Context Projection Builder (Phase 18B WP5 / Recommendation 6) ────

import { SecurityContext, SecurityContextProjection, SecurityAuditEvent } from '../../types/security';
import { RoleRegistry } from './roles';

export class SecurityContextProjectionBuilder {
  /**
   * Builds an immutable SecurityContextProjection from a SecurityContext and audit logs.
   */
  public static buildProjection(
    context: SecurityContext,
    recentAuditLogs: readonly SecurityAuditEvent[] = [],
    options?: {
      projectionId?: string;
      platformVersion?: string;
    }
  ): SecurityContextProjection {
    const perms = context.identity.effectivePermissions;

    const capabilities = Object.freeze({
      canReadPublic: RoleRegistry.hasPermission(perms, 'public:read'),
      canResearch: RoleRegistry.hasPermission(perms, 'research:read'),
      canEditContent: RoleRegistry.hasPermission(perms, 'editorial:write'),
      canReviewContent: RoleRegistry.hasPermission(perms, 'editorial:review'),
      canPublishContent: RoleRegistry.hasPermission(perms, 'editorial:publish'),
      canViewOperations: RoleRegistry.hasPermission(perms, 'operations:view'),
      canRunJobs: RoleRegistry.hasPermission(perms, 'operations:execute_job'),
      canManageSecurity: RoleRegistry.hasPermission(perms, 'security:manage_roles'),
    });

    return Object.freeze({
      projectionId: options?.projectionId || `proj-sec-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'AR-13A.0',
      generatedAt: new Date().toISOString(),
      identity: context.identity,
      sessionState: context.session.state,
      capabilities,
      recentAuditLogs: Object.freeze([...recentAuditLogs.slice(-10)]),
    });
  }
}
