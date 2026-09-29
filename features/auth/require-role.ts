import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentPrincipal, type Principal } from './principal';
import { can } from './policy';
import type { AppPermission } from './permissions';
import { intelRoleRank, type IntelRole } from './roles';
import { ForbiddenError, UnauthorizedError } from './require-auth';
import { verifyApiKey } from './api-keys/service';

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
 * Supports both session-based authentication (cookies) and programmatic authentication (x-api-key header).
 */
export async function requireApiPermission(
  permission: AppPermission,
  request?: NextRequest
): Promise<{ principal: Principal } | { response: NextResponse }> {
  let principal = await getCurrentPrincipal();

  if (!principal && request) {
    const apiKeyHeader = request.headers.get('x-api-key');
    if (apiKeyHeader) {
      const res = await verifyApiKey(apiKeyHeader);
      if (res.valid && res.key) {
        principal = {
          userId: res.key.owner_id || res.key.id,
          email: `api_key:${res.key.name}`,
          name: res.key.name,
          role: res.key.role as IntelRole,
          isSuperAdmin: res.key.role === 'owner',
          status: res.key.revoked_at ? 'suspended' : 'active',
          organizationId: null,
        };
      }
    }
  }

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
