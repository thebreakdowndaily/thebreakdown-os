import { describe, it, expect, beforeEach } from 'vitest';
import { RoleRegistry } from '../lib/security/roles';
import { PolicyRegistry } from '../lib/security/policies';
import { AccessControlEngine } from '../lib/security/access-control';
import { SessionManager } from '../lib/security/session';
import { SecurityContextProjectionBuilder } from '../lib/security/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-SECURITY: Security & Access Control Subsystem (Phase 18B)', () => {
  let sessionManager: SessionManager;
  let accessControlEngine: AccessControlEngine;

  beforeEach(() => {
    sessionManager = new SessionManager();
    accessControlEngine = new AccessControlEngine();
  });

  it('TEST-SECURITY-01: Role Hierarchy & Permission Resolution', () => {
    const pubPerms = RoleRegistry.getPermissionsForRole('PUBLIC_READER');
    expect(pubPerms).toContain('public:read');
    expect(pubPerms).not.toContain('editorial:write');

    const edPerms = RoleRegistry.getPermissionsForRole('EDITOR');
    expect(edPerms).toContain('public:read');
    expect(edPerms).toContain('editorial:write');
    expect(edPerms).toContain('editorial:publish');
    expect(edPerms).not.toContain('security:manage_roles');

    const adminPerms = RoleRegistry.getPermissionsForRole('ADMIN');
    expect(adminPerms).toContain('admin:full');
  });

  it('TEST-SECURITY-02: Public Reader Fallback Context', () => {
    const anonContext = sessionManager.getAnonymousContext();
    expect(anonContext.identity.role).toBe('PUBLIC_READER');
    expect(anonContext.session.state).toBe('ANONYMOUS');
    expect(anonContext.identity.effectivePermissions).toContain('public:read');
  });

  it('TEST-SECURITY-03: Declarative Policy Registry Lookups', () => {
    const reqPerm = PolicyRegistry.findRequiredPermission('EDITORIAL', 'publish_chapter');
    expect(reqPerm).toBe('editorial:publish');

    const opsPerm = PolicyRegistry.findRequiredPermission('OPERATIONS', 'execute_job');
    expect(opsPerm).toBe('operations:execute_job');
  });

  it('TEST-SECURITY-04: Authorization Engine Grants Allowed Operations', () => {
    const editorCtx = sessionManager.createSession({
      id: 'usr-editor-1',
      username: 'editor_jane',
      email: 'jane@thebreakdown.org',
      role: 'EDITOR',
    });

    const res = accessControlEngine.authorize(
      editorCtx.identity,
      editorCtx.session,
      'EDITORIAL',
      'publish_chapter'
    );

    expect(res.allowed).toBe(true);
    expect(res.decision).toBe('ALLOW');
    expect(res.reason).toContain('Authorization Granted');
  });

  it('TEST-SECURITY-05: Authorization Engine Denies Unauthorized Operations', () => {
    const researcherCtx = sessionManager.createSession({
      id: 'usr-res-1',
      username: 'researcher_bob',
      email: 'bob@thebreakdown.org',
      role: 'RESEARCHER',
    });

    const res = accessControlEngine.authorize(
      researcherCtx.identity,
      researcherCtx.session,
      'EDITORIAL',
      'publish_chapter'
    );

    expect(res.allowed).toBe(false);
    expect(res.decision).toBe('DENY');
    expect(res.reason).toContain('Authorization Denied');
  });

  it('TEST-SECURITY-06: Admin Bypass Permission Rule (admin:full)', () => {
    const adminCtx = sessionManager.createSession({
      id: 'usr-admin-1',
      username: 'admin_alice',
      email: 'alice@thebreakdown.org',
      role: 'ADMIN',
    });

    const res = accessControlEngine.authorize(
      adminCtx.identity,
      adminCtx.session,
      'OPERATIONS',
      'execute_job'
    );

    expect(res.allowed).toBe(true);
    expect(res.decision).toBe('ALLOW');
  });

  it('TEST-SECURITY-07: Session State Validation (Active vs Anonymous vs Revoked)', () => {
    const editorCtx = sessionManager.createSession({
      id: 'usr-ed-2',
      username: 'editor_mark',
      email: 'mark@thebreakdown.org',
      role: 'EDITOR',
    });

    sessionManager.revokeSession(editorCtx.session.sessionId);
    const revokedCtx = sessionManager.getSession(editorCtx.session.sessionId)!;

    const res = accessControlEngine.authorize(
      revokedCtx.identity,
      revokedCtx.session,
      'EDITORIAL',
      'draft_chapter'
    );

    expect(res.allowed).toBe(false);
    expect(res.decision).toBe('DENY');
    expect(res.reason).toContain('Session state is "REVOKED"');
  });

  it('TEST-SECURITY-08: Session Expiration Guard', () => {
    const expiredTime = new Date(Date.now() - 1000).toISOString();
    const editorCtx = sessionManager.createSession(
      {
        id: 'usr-ed-3',
        username: 'editor_tim',
        email: 'tim@thebreakdown.org',
        role: 'EDITOR',
      },
      expiredTime
    );

    const retrieved = sessionManager.getSession(editorCtx.session.sessionId);
    expect(retrieved?.session.state).toBe('EXPIRED');
  });

  it('TEST-SECURITY-09: Anonymous Reader Can Read Public Content Only', () => {
    const anonCtx = sessionManager.getAnonymousContext();

    const readRes = accessControlEngine.authorize(
      anonCtx.identity,
      anonCtx.session,
      'KNOWLEDGE',
      'read_public'
    );
    expect(readRes.allowed).toBe(true);

    const editRes = accessControlEngine.authorize(
      anonCtx.identity,
      anonCtx.session,
      'EDITORIAL',
      'draft_chapter'
    );
    expect(editRes.allowed).toBe(false);
  });

  it('TEST-SECURITY-10: Immutable Append-Only Security Audit Stream', () => {
    const editorCtx = sessionManager.createSession({
      id: 'usr-ed-4',
      username: 'editor_sam',
      email: 'sam@thebreakdown.org',
      role: 'EDITOR',
    });

    accessControlEngine.authorize(editorCtx.identity, editorCtx.session, 'EDITORIAL', 'draft_chapter');
    accessControlEngine.authorize(editorCtx.identity, editorCtx.session, 'SECURITY', 'manage_roles');

    const logs = accessControlEngine.getAuditStream();
    expect(logs.length).toBe(2);
    expect(logs[0].decision).toBe('ALLOW');
    expect(logs[1].decision).toBe('DENY');
    expect(Object.isFrozen(logs)).toBe(true);
  });

  it('TEST-SECURITY-11: SecurityContextProjection Building & Capability Derivation', () => {
    const researcherCtx = sessionManager.createSession({
      id: 'usr-res-2',
      username: 'researcher_sara',
      email: 'sara@thebreakdown.org',
      role: 'RESEARCHER',
    });

    const projection = SecurityContextProjectionBuilder.buildProjection(researcherCtx);
    expect(projection.capabilities.canReadPublic).toBe(true);
    expect(projection.capabilities.canResearch).toBe(true);
    expect(projection.capabilities.canPublishContent).toBe(false);
    expect(projection.capabilities.canManageSecurity).toBe(false);
    expect(Object.isFrozen(projection)).toBe(true);
  });

  it('TEST-SECURITY-12: UI Capability Flags for Admin User', () => {
    const adminCtx = sessionManager.createSession({
      id: 'usr-admin-2',
      username: 'super_admin',
      email: 'admin@thebreakdown.org',
      role: 'ADMIN',
    });

    const projection = SecurityContextProjectionBuilder.buildProjection(adminCtx);
    expect(projection.capabilities.canReadPublic).toBe(true);
    expect(projection.capabilities.canEditContent).toBe(true);
    expect(projection.capabilities.canPublishContent).toBe(true);
    expect(projection.capabilities.canViewOperations).toBe(true);
    expect(projection.capabilities.canRunJobs).toBe(true);
    expect(projection.capabilities.canManageSecurity).toBe(true);
  });

  it('TEST-SECURITY-13: Non-Mutation Guarantee on Canonical Objects & User Identity', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    const editorCtx = sessionManager.createSession({
      id: 'usr-ed-5',
      username: 'editor_chris',
      email: 'chris@thebreakdown.org',
      role: 'EDITOR',
    });

    accessControlEngine.authorize(editorCtx.identity, editorCtx.session, 'EDITORIAL', 'publish_chapter');
    SecurityContextProjectionBuilder.buildProjection(editorCtx, accessControlEngine.getAuditStream());

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
    expect(editorCtx.identity.role).toBe('EDITOR');
  });

  it('TEST-SECURITY-14: High Volume Authorization Check Performance', () => {
    const editorCtx = sessionManager.createSession({
      id: 'usr-ed-6',
      username: 'editor_fast',
      email: 'fast@thebreakdown.org',
      role: 'EDITOR',
    });

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      accessControlEngine.authorize(editorCtx.identity, editorCtx.session, 'EDITORIAL', 'draft_chapter');
    }
    const duration = Date.now() - start;

    expect(accessControlEngine.getAuditStream().length).toBe(1000);
    expect(duration).toBeLessThan(100); // 1000 checks under 100ms
  });

  it('TEST-SECURITY-15: Security Boundary Invariant', () => {
    const anonCtx = sessionManager.getAnonymousContext();

    const decision = accessControlEngine.authorize(anonCtx.identity, anonCtx.session, 'OPERATIONS', 'execute_job');
    expect(decision.allowed).toBe(false);
    expect(decision.decision).toBe('DENY');
    // Verify Security engine only returns decision; caller handles control flow
  });

  it('TEST-SECURITY-16: Deterministic Projection Serialization', () => {
    const adminCtx = sessionManager.createSession({
      id: 'usr-admin-3',
      username: 'admin_test',
      email: 'test@thebreakdown.org',
      role: 'ADMIN',
    });

    const proj = SecurityContextProjectionBuilder.buildProjection(adminCtx);
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"role":"ADMIN"');
  });
});
