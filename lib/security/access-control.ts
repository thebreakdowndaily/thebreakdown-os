// ── Pure Access Control Engine & Security Audit Stream (Phase 18B WP3) ───────

import {
  UserIdentity,
  SessionToken,
  SystemResourceCategory,
  AuthorizationResult,
  SecurityAuditEvent,
} from '../../types/security';
import { RoleRegistry } from './roles';
import { PolicyRegistry } from './policies';

export class AccessControlEngine {
  private auditStream: SecurityAuditEvent[] = [];
  private sequenceCounter = 0;

  private generateEventId(): string {
    this.sequenceCounter += 1;
    return `secaud-${Date.now()}-${this.sequenceCounter}`;
  }

  /**
   * Evaluates authorization request deterministically and appends an audit event.
   */
  public authorize(
    identity: UserIdentity,
    session: SessionToken,
    category: SystemResourceCategory,
    action: string
  ): AuthorizationResult {
    const timestamp = new Date().toISOString();

    // 1. Session State Guard
    if (session.state !== 'ACTIVE' && session.state !== 'ANONYMOUS') {
      const result: AuthorizationResult = {
        allowed: false,
        decision: 'DENY',
        reason: `Authorization Denied: Session state is "${session.state}". Active or Anonymous session required.`,
        userId: identity.id,
        resourceCategory: category,
        action,
      };
      this.logAuditEvent(identity, session, category, action, 'DENY', result.reason, timestamp);
      return result;
    }

    // 2. Resolve Policy & Required Permission
    const requiredPermission = PolicyRegistry.findRequiredPermission(category, action);

    // 3. Evaluate Permission
    const hasPerm = RoleRegistry.hasPermission(identity.effectivePermissions, requiredPermission);

    const decision = hasPerm ? 'ALLOW' : 'DENY';
    const reason = hasPerm
      ? `Authorization Granted: User "${identity.username}" (${identity.role}) holds required permission "${requiredPermission}".`
      : `Authorization Denied: User "${identity.username}" (${identity.role}) lacks required permission "${requiredPermission}".`;

    const result: AuthorizationResult = {
      allowed: hasPerm,
      decision,
      reason,
      userId: identity.id,
      resourceCategory: category,
      action,
    };

    this.logAuditEvent(identity, session, category, action, decision, reason, timestamp);
    return result;
  }

  private logAuditEvent(
    identity: UserIdentity,
    session: SessionToken,
    category: SystemResourceCategory,
    action: string,
    decision: 'ALLOW' | 'DENY',
    reason: string,
    timestamp: string
  ): void {
    const event: SecurityAuditEvent = Object.freeze({
      eventId: this.generateEventId(),
      timestamp,
      userId: identity.id,
      sessionId: session.sessionId,
      resourceCategory: category,
      action,
      decision,
      reason,
    });
    this.auditStream.push(event);
  }

  public getAuditStream(): readonly SecurityAuditEvent[] {
    return Object.freeze([...this.auditStream]);
  }

  public clearAuditStream(): void {
    this.auditStream = [];
  }
}
