import { NextResponse } from 'next/server';
import { getCurrentPrincipal, type Principal } from './principal';
import { can } from './policy';
import type { AppPermission } from './permissions';
import { intelRoleRank, type IntelRole } from './roles';
import { ForbiddenError, UnauthorizedError } from './require-auth';

/**
 * Ensures the current caller holds the required permission, throwing ForbiddenError if unauthorized.
 */
export async function requirePermission(permission: AppPermission): Promise<Principal> {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    throw new UnauthorizedError();
  }

  if (!can(principal, permission)) {
    throw new ForbiddenError(`Lacks required permission: ${permission}`);
  }

  return principal;
}

/**
 * Route Handler guard ensuring the caller holds the required permission or returns 401/403 NextResponse.
 */
export async function requireApiPermission(
  permission: AppPermission
): Promise<{ principal: Principal } | { response: NextResponse }> {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    return {
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (!can(principal, permission)) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden', message: `Insufficient privileges for ${permission}` },
        { status: 403 }
      ),
    };
  }

  return { principal };
}

/**
 * Ensures the caller holds at least the minimum role rank.
 */
export async function requireRole(minRole: IntelRole): Promise<Principal> {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    throw new UnauthorizedError();
  }

  if (intelRoleRank(principal.role) < intelRoleRank(minRole)) {
    throw new ForbiddenError(`Requires at least ${minRole} role`);
  }

  return principal;
}
