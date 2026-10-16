import type { Principal } from '../principal';
import { isAppPermission } from '../permissions';
import type { ApiKeyRecord } from './types';
import type { IntelRole } from '../roles';

/**
 * Policy-approved mapping from ApiKeyRole to canonical IntelRole.
 * - 'owner' maps to 'owner' (superadmin)
 * - 'editor' maps to 'editor'
 * - 'reporter' maps to 'reporter'
 * - 'reader' maps to 'guest' (read-only baseline)
 *
 * Unsupported or ambiguous labels ('admin', 'contributor') are NOT guessed
 * as owner and do not silently receive elevated or broader permissions.
 * They fail closed (returning null) to ensure only policy-approved keys
 * can be projected into active principals.
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
 * Invalid legacy scope values fail closed instead of being discarded and
 * accidentally restoring role-derived permissions.
 * Unsupported role labels fail closed instead of guessing privileges.
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
