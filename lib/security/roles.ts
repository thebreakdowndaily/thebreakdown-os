// ── Permission & Role Registry with Hierarchical Inheritance (Phase 18B WP2) ──

import { UserRole, Permission } from '../../types/security';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PUBLIC_READER: ['public:read'],
  RESEARCHER: ['public:read', 'research:read', 'research:export'],
  AUDITOR: ['public:read', 'research:read', 'operations:view'],
  EDITOR: [
    'public:read',
    'research:read',
    'research:export',
    'editorial:write',
    'editorial:review',
    'editorial:publish',
  ],
  ADMIN: [
    'public:read',
    'research:read',
    'research:export',
    'editorial:write',
    'editorial:review',
    'editorial:publish',
    'operations:view',
    'operations:execute_job',
    'security:manage_roles',
    'admin:full',
  ],
};

export class RoleRegistry {
  /**
   * Resolves effective permissions for a role, resolving hierarchical inheritance.
   */
  public static getPermissionsForRole(role: UserRole): readonly Permission[] {
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.PUBLIC_READER;
    return Object.freeze([...new Set(permissions)]);
  }

  /**
   * Checks whether a set of effective permissions includes a required permission.
   */
  public static hasPermission(effectivePermissions: readonly Permission[], requiredPermission: Permission): boolean {
    if (effectivePermissions.includes('admin:full')) {
      return true; // Admin bypass
    }
    return effectivePermissions.includes(requiredPermission);
  }
}
