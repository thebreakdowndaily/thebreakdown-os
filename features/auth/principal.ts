import { getSupabaseAuth } from './auth-server';
import { isDemoMode, DEMO_USER } from './demo';
import { extractAuthoritativeRole, normalizeIntelRole, type IntelRole } from './roles';
import type { User } from '@supabase/supabase-js';

export interface Principal {
  userId: string;
  email: string;
  name: string;
  role: IntelRole;
  isSuperAdmin: boolean;
  status: 'active' | 'suspended';
  organizationId: string | null;
}

/**
 * Queries the authoritative PostgreSQL user_roles table for server-side role assignment.
 * Returns null if database is unavailable or no record exists yet.
 */
export async function fetchUserRoleFromDatabase(
  userId: string
): Promise<{ role: IntelRole; status: 'active' | 'suspended'; organizationId: string | null } | null> {
  try {
    const supabase = await getSupabaseAuth();
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, status, organization_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as { role?: string; status?: string; organization_id?: string | null };
    const role = normalizeIntelRole(typeof row.role === 'string' ? row.role : null);
    const status = row.status === 'active' ? 'active' : 'suspended';
    const organizationId = typeof row.organization_id === 'string' ? row.organization_id : null;
    return {
      role,
      status,
      organizationId,
    };
  } catch {
    return null;
  }
}

/**
 * Derives a canonical, authoritative Principal from a verified Supabase User.
 * Privileges are derived strictly from server-controlled app_metadata and system claims.
 * Mutable user_metadata is NEVER used to grant permissions.
 */
export function resolvePrincipalFromUser(user: User): Principal {
  const role = extractAuthoritativeRole(user);
  const isSuperAdmin = role === 'owner' || user.app_metadata.is_super_admin === true;
  const status = (user.app_metadata.status === 'suspended' || (user.banned_until && new Date(user.banned_until) > new Date()))
    ? 'suspended'
    : 'active';

  return {
    userId: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.name as string | undefined) || user.email?.split('@')[0] || 'User',
    role,
    isSuperAdmin,
    status,
    organizationId: (user.app_metadata.organization_id as string | undefined) ?? null,
  };
}

/**
 * Retrieves the verified identity and authoritative principal of the current caller.
 * Flow:
 * Supabase Auth identity (getUser)
 * -> server-side user ID
 * -> database user_roles lookup (authoritative source of truth)
 * -> fallback to server-verified app_metadata claim (convenience cache)
 * -> centralized policy engine
 */
export async function getCurrentPrincipal(): Promise<Principal | null> {
  if (isDemoMode()) {
    return {
      userId: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      role: DEMO_USER.role as IntelRole,
      isSuperAdmin: false,
      status: 'active',
      organizationId: null,
    };
  }

  try {
    const supabase = await getSupabaseAuth();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 1. Authoritative database lookup
    const dbRole = await fetchUserRoleFromDatabase(user.id);
    if (dbRole) {
      const isSuperAdmin = dbRole.role === 'owner' || user.app_metadata.is_super_admin === true;
      const isBanned = Boolean(user.banned_until && new Date(user.banned_until) > new Date());
      const status = (dbRole.status === 'suspended' || isBanned) ? 'suspended' : 'active';

      return {
        userId: user.id,
        email: user.email ?? '',
        name: (user.user_metadata?.name as string | undefined) || user.email?.split('@')[0] || 'User',
        role: dbRole.role,
        isSuperAdmin,
        status,
        organizationId: dbRole.organizationId ?? (user.app_metadata.organization_id as string | undefined) ?? null,
      };
    }

    // 2. Fallback to server-verified app_metadata claim (convenience cache)
    return resolvePrincipalFromUser(user);
  } catch {
    return null;
  }
}
