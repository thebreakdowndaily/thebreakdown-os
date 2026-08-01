// ── Session & Identity Manager with Public Reader Fallback (Phase 18B WP4) ─────

import { UserIdentity, SessionToken, SecurityContext, UserRole } from '../../types/security';
import { RoleRegistry } from './roles';

export class SessionManager {
  private activeSessions = new Map<string, SecurityContext>();

  public createSession(
    user: { id: string; username: string; email: string; role: UserRole },
    customExpiresAt?: string
  ): SecurityContext {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const effectivePermissions = RoleRegistry.getPermissionsForRole(user.role);

    const identity: UserIdentity = Object.freeze({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      effectivePermissions,
    });

    const session: SessionToken = Object.freeze({
      sessionId,
      userId: user.id,
      state: 'ACTIVE',
      createdAt: new Date().toISOString(),
      expiresAt: customExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const context: SecurityContext = Object.freeze({ identity, session });
    this.activeSessions.set(sessionId, context);
    return context;
  }

  public getSession(sessionId: string): SecurityContext | null {
    const context = this.activeSessions.get(sessionId);
    if (!context) return null;

    // Check expiration
    if (new Date(context.session.expiresAt).getTime() < Date.now()) {
      const expiredSession: SessionToken = Object.freeze({ ...context.session, state: 'EXPIRED' });
      const updatedContext = Object.freeze({ ...context, session: expiredSession });
      this.activeSessions.set(sessionId, updatedContext);
      return updatedContext;
    }

    return context;
  }

  public revokeSession(sessionId: string): void {
    const context = this.activeSessions.get(sessionId);
    if (context) {
      const revokedSession: SessionToken = Object.freeze({ ...context.session, state: 'REVOKED' });
      this.activeSessions.set(sessionId, Object.freeze({ ...context, session: revokedSession }));
    }
  }

  /**
   * Anonymous Public Reader Fallback for unauthenticated requests.
   */
  public getAnonymousContext(): SecurityContext {
    const identity: UserIdentity = Object.freeze({
      id: 'usr-anon-public',
      username: 'Anonymous Reader',
      email: 'anonymous@thebreakdown.org',
      role: 'PUBLIC_READER',
      effectivePermissions: RoleRegistry.getPermissionsForRole('PUBLIC_READER'),
    });

    const session: SessionToken = Object.freeze({
      sessionId: 'sess-anon-public',
      userId: identity.id,
      state: 'ANONYMOUS',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return Object.freeze({ identity, session });
  }

  public clear(): void {
    this.activeSessions.clear();
  }
}
