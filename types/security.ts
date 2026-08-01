// ── Security & Access Control Domain Specification (Phase 18B) ────────────────
// Immutable Security & RBAC domain interfaces.

export type SystemResourceCategory =
  | 'EDITORIAL'
  | 'KNOWLEDGE'
  | 'RESEARCH'
  | 'OPERATIONS'
  | 'SECURITY'
  | 'SYSTEM';

export type SessionState = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'ANONYMOUS';

export type UserRole = 'ADMIN' | 'EDITOR' | 'RESEARCHER' | 'AUDITOR' | 'PUBLIC_READER';

export type Permission =
  | 'public:read'
  | 'research:read'
  | 'research:export'
  | 'editorial:write'
  | 'editorial:review'
  | 'editorial:publish'
  | 'operations:view'
  | 'operations:execute_job'
  | 'security:manage_roles'
  | 'admin:full';

export interface UserIdentity {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  effectivePermissions: readonly Permission[];
}

export interface SessionToken {
  sessionId: string;
  userId: string;
  state: SessionState;
  createdAt: string;
  expiresAt: string;
}

export interface SecurityPolicy {
  policyId: string;
  resourceCategory: SystemResourceCategory;
  action: string;
  requiredPermission: Permission;
  description: string;
}

export interface SecurityAuditEvent {
  eventId: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  resourceCategory: SystemResourceCategory;
  action: string;
  decision: 'ALLOW' | 'DENY';
  reason: string;
}

export interface AuthorizationResult {
  allowed: boolean;
  decision: 'ALLOW' | 'DENY';
  reason: string;
  userId: string;
  resourceCategory: SystemResourceCategory;
  action: string;
}

export interface SecurityContext {
  identity: UserIdentity;
  session: SessionToken;
}

export interface SecurityContextProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  identity: UserIdentity;
  sessionState: SessionState;
  capabilities: {
    canReadPublic: boolean;
    canResearch: boolean;
    canEditContent: boolean;
    canReviewContent: boolean;
    canPublishContent: boolean;
    canViewOperations: boolean;
    canRunJobs: boolean;
    canManageSecurity: boolean;
  };
  recentAuditLogs: readonly SecurityAuditEvent[];
}
