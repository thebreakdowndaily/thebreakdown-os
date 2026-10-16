import type { Principal } from '../principal';
import { isAppPermission } from '../permissions';
import type { IntelRole } from '../roles';
import type { ApiKeyRecord } from './types';

/**
 * Policy-approved mapping from persisted API-key roles into the canonical
 * application authorization roles. Legacy or ambiguous role labels are not
 * guessed into active principals.
 */
export const API_KEY_ROLE_MAPPING: Readonly<Record<string, IntelRole>> = Object.freeze({
  owner: 'owner',
  editor: 'editor',
  reporter: 'reporter',
  reader: 'guest',
});

export function mapApiKeyRoleToIntelRole(role: string): IntelRole | null {
  return API_KEY_ROLE_MAPPING[role] ?? null;
}

/**
 * Projects a verified API-key record into an authorization principal.
 * Invalid scopes and unsupported legacy roles fail closed rather than being
 * discarded or normalized into a principal with guessed permissions.
 */
export function apiKeyRecordToPrincipal(
  key: Pick<ApiKeyRecord, 'id' | 'owner_id' | 'name' | 'role' | 'revoked_at' | 'permissions'>
): Principal | null {
  if (!Array.isArray(key.permissions) || !key.permissions.every(isAppPermission)) {
    return null;
  }

  const role = mapApiKeyRoleToIntelRole(key.role);
  if (!role) {
    return null;
  }

  return {
    userId: key.owner_id || key.id,
    email: `api_key:${key.name}`,
    name: key.name,
    role,
    isSuperAdmin: role === 'owner',
    status: key.revoked_at ? 'suspended' : 'active',
    organizationId: null,
    permissions: key.permissions,
  };
}
