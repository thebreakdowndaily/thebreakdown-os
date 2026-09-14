import { getSupabaseAuth } from './auth-server';
import { isDemoMode, DEMO_USER } from './demo';
import { extractAuthoritativeRole, type IntelRole } from './roles';
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
    name: (user.user_metadata.name as string | undefined) || user.email?.split('@')[0] || 'User',
    role,
    isSuperAdmin,
    status,
    organizationId: (user.app_metadata.organization_id as string | undefined) ?? null,
  };
}

/**
 * Retrieves the verified identity and authoritative principal of the current caller.
 * Unlike getSession(), this validates the JWT cryptographic signature on the server via getUser().
 * Fails closed if the token is revoked, expired, tampered with, or unauthenticated.
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

    return resolvePrincipalFromUser(user);
  } catch {
    return null;
  }
}
