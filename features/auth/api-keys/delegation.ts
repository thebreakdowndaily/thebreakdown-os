import type { Principal } from '../principal';
import { can } from '../policy';
import { APP_PERMISSIONS, isAppPermission, type AppPermission } from '../permissions';
import type { ApiKeyRateLimitTier, ApiKeyRole } from './types';
import { mapApiKeyRoleToIntelRole } from './principal';

export const SUPPORTED_API_KEY_ROLES: readonly ApiKeyRole[] = [
  'reader',
  'reporter',
  'editor',
  'owner',
];

export const UNSUPPORTED_API_KEY_ROLES: readonly ApiKeyRole[] = [
  'admin',
  'contributor',
];

export const API_KEY_RATE_LIMIT_TIERS: readonly ApiKeyRateLimitTier[] = [
  'tier_low',
  'standard',
  'tier_high',
  'unlimited',
];

export type ApiKeyDelegationDecision =
  | {
      allowed: true;
      role: ApiKeyRole;
      permissions: AppPermission[];
      rateLimitTier: ApiKeyRateLimitTier;
    }
  | {
      allowed: false;
      status: 400 | 403;
      code:
        | 'INVALID_ROLE'
        | 'UNSUPPORTED_ROLE'
        | 'INVALID_PERMISSIONS'
        | 'INVALID_RATE_LIMIT_TIER'
        | 'ELEVATED_ROLE_WITH_SCOPES'
        | 'ROLE_ESCALATION'
        | 'PERMISSION_ESCALATION'
        | 'RATE_LIMIT_ESCALATION';
      message: string;
    };

/**
 * Ensures an API-key creator cannot delegate authority they do not hold.
 * The allowlist matches the persisted-role-to-principal mapping. Legacy
 * 'admin' and 'contributor' labels are rejected rather than guessed.
 */
export function authorizeApiKeyDelegation(
  principal: Principal,
  input: {
    role: unknown;
    permissions: unknown;
    rateLimitTier: unknown;
  }
): ApiKeyDelegationDecision {
  if (typeof input.role !== 'string') {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_ROLE',
      message: 'The requested API key role is invalid',
    };
  }

  if (UNSUPPORTED_API_KEY_ROLES.includes(input.role as ApiKeyRole)) {
    return {
      allowed: false,
      status: 400,
      code: 'UNSUPPORTED_ROLE',
      message: `API key role '${input.role}' is unsupported; use a policy-approved canonical role ('owner', 'editor', 'reporter', 'reader')`,
    };
  }

  if (!SUPPORTED_API_KEY_ROLES.includes(input.role as ApiKeyRole)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_ROLE',
      message: 'The requested API key role is invalid',
    };
  }

  const role = input.role as ApiKeyRole;
  const mappedRole = mapApiKeyRoleToIntelRole(role);
  if (!mappedRole) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_ROLE',
      message: 'The requested API key role cannot be mapped to a canonical role',
    };
  }

  if (input.permissions !== undefined && !Array.isArray(input.permissions)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_PERMISSIONS',
      message: 'Permissions must be an array of recognized application permissions',
    };
  }

  const rawPermissions = input.permissions === undefined ? [] : (input.permissions as unknown[]);
  if (!rawPermissions.every(isAppPermission)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_PERMISSIONS',
      message: 'Permissions contain an unrecognized application permission',
    };
  }

  if (
    typeof input.rateLimitTier !== 'string' ||
    !API_KEY_RATE_LIMIT_TIERS.includes(input.rateLimitTier as ApiKeyRateLimitTier)
  ) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_RATE_LIMIT_TIER',
      message: 'The requested API key rate-limit tier is invalid',
    };
  }

  const rateLimitTier = input.rateLimitTier as ApiKeyRateLimitTier;
  const permissions = [...new Set(rawPermissions as AppPermission[])];
  const elevatedRole = role === 'owner';

  if (elevatedRole && !principal.isSuperAdmin) {
    return {
      allowed: false,
      status: 403,
      code: 'ROLE_ESCALATION',
      message: 'Only an owner can issue owner API keys',
    };
  }

  // Owner keys are privileged by role and must not carry a misleading scope
  // list that callers might assume limits owner-level capabilities.
  if (elevatedRole && permissions.length > 0) {
    return {
      allowed: false,
      status: 400,
      code: 'ELEVATED_ROLE_WITH_SCOPES',
      message: 'Use a non-elevated role when creating an explicitly scoped API key',
    };
  }

  if (rateLimitTier === 'unlimited' && !principal.isSuperAdmin) {
    return {
      allowed: false,
      status: 403,
      code: 'RATE_LIMIT_ESCALATION',
      message: 'Only an owner can issue API keys with unlimited rate limits',
    };
  }

  // Evaluate delegation against the same central permission policy used at runtime.
  const creatorPermissions = new Set(
    APP_PERMISSIONS.filter((permission) => can(principal, permission))
  );

  // A non-empty explicit scope list replaces role defaults. An empty list
  // delegates the canonical defaults of the mapped runtime role.
  const targetPermissions = elevatedRole
    ? [...APP_PERMISSIONS]
    : permissions.length > 0
      ? permissions
      : APP_PERMISSIONS.filter((permission) =>
          can(
            {
              ...principal,
              role: mappedRole,
              isSuperAdmin: false,
              permissions: undefined,
            },
            permission
          )
        );

  if (targetPermissions.some((permission) => !creatorPermissions.has(permission))) {
    return {
      allowed: false,
      status: 403,
      code: 'PERMISSION_ESCALATION',
      message: 'You cannot delegate role defaults or permissions you do not hold',
    };
  }

  return { allowed: true, role, permissions, rateLimitTier };
}
