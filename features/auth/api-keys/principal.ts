import type { Principal } from '../principal';
import { isAppPermission } from '../permissions';
import type { ApiKeyRecord } from './types';

/**
 * Projects a verified API-key record into an authorization principal.
 * Invalid legacy scope values fail closed instead of being discarded and
 * accidentally restoring role-derived permissions.
 */
export function apiKeyRecordToPrincipal(
  key: Pick<ApiKeyRecord, 'id' | 'owner_id' | 'name' | 'role' | 'revoked_at' | 'permissions'>
): Principal | null {
  if (!Array.isArray(key.permissions) || !key.permissions.every(isAppPermission)) {
    return null;
  }

  return {
    userId: key.owner_id || key.id,
    email: `api_key:${key.name}`,
    name: key.name,
    // API-key roles intentionally share the runtime role-policy resolver.
    // Unknown legacy labels normalize to the lowest default role in can().
    role: key.role as Principal['role'],
    isSuperAdmin: key.role === 'owner',
    status: key.revoked_at ? 'suspended' : 'active',
    organizationId: null,
    permissions: key.permissions,
  };
}
