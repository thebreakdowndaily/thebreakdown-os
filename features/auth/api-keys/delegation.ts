import type { Principal } from '../principal';
import { can } from '../policy';
import { APP_PERMISSIONS, isAppPermission, type AppPermission } from '../permissions';
import type { ApiKeyRateLimitTier, ApiKeyRole } from './types';

const API_KEY_ROLES: readonly ApiKeyRole[] = [
  'reader',
  'contributor',
  'reporter',
  'editor',
  'admin',
  'owner',
];

const API_KEY_RATE_LIMIT_TIERS: readonly ApiKeyRateLimitTier[] = [
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
      code: 'INVALID_ROLE' | 'INVALID_PERMISSIONS' | 'INVALID_RATE_LIMIT_TIER' | 'ELEVATED_ROLE_WITH_SCOPES' | 'ROLE_ESCALATION' | 'PERMISSION_ESCALATION' | 'RATE_LIMIT_ESCALATION';
      message: string;
    };

/**
 * Ensures an API-key creator cannot delegate authority that they do not hold.
 * Non-empty explicit scopes replace role defaults at authorization time. With
 * no explicit scopes, the target key receives the permissions implied by its
 * role, so those role defaults must be bounded by the creator's authority too.
 */
export function authorizeApiKeyDelegation(
  principal: Principal,
  input: {
    role: unknown;
    permissions: unknown;
    rateLimitTier: unknown;
  }
): ApiKeyDelegationDecision {
  if (typeof input.role !== 'string' || !API_KEY_ROLES.includes(input.role as ApiKeyRole)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_ROLE',
      message: 'The requested API key role is invalid',
    };
  }

  const role = input.role as ApiKeyRole;

  if (input.permissions !== undefined && !Array.isArray(input.permissions)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_PERMISSIONS',
      message: 'Permissions must be an array of recognized application permissions',
    };
  }

  const rawPermissions = input.permissions === undefined ? [] : input.permissions as unknown[];
  if (!rawPermissions.every(isAppPermission)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_PERMISSIONS',
      message: 'Permissions contain an unrecognized application permission',
    };
  }

  if (typeof input.rateLimitTier !== 'string' || !API_KEY_RATE_LIMIT_TIERS.includes(input.rateLimitTier as ApiKeyRateLimitTier)) {
    return {
      allowed: false,
      status: 400,
      code: 'INVALID_RATE_LIMIT_TIER',
      message: 'The requested API key rate-limit tier is invalid',
    };
  }

  const rateLimitTier = input.rateLimitTier as ApiKeyRateLimitTier;
  const permissions = [...new Set(rawPermissions as AppPermission[])];
  const canGrantElevatedRoles = principal.isSuperAdmin;
  const elevatedRole = role === 'admin' || role === 'owner';

  if (elevatedRole && !canGrantElevatedRoles) {
    return {
      allowed: false,
      status: 403,
      code: 'ROLE_ESCALATION',
      message: 'Only an owner can issue admin or owner API keys',
    };
  }

  // Elevated roles are role-authorized principals, not explicitly scoped keys.
  // Reject mixed inputs to avoid suggesting that their permission list limits
  // the authority that owner/admin role resolution confers elsewhere.
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

  // Calculate effective grants with the same central policy used at runtime.
  // Explicit non-empty permissions on the creator are honoured by can().
  const creatorPermissions = new Set(
    APP_PERMISSIONS.filter((permission) => can(principal, permission))
  );

  // An elevated key is privileged independently of the normal role policy.
  // Only a superadmin can issue one, so model its effective set conservatively.
  // For a non-elevated key with explicit scopes, the scopes are its effective
  // permissions; otherwise, evaluate role defaults exactly as can() will.
  const targetPermissions = elevatedRole
    ? [...APP_PERMISSIONS]
    : permissions.length > 0
      ? permissions
      : APP_PERMISSIONS.filter((permission) =>
          can(
            {
              ...principal,
              role: role as Principal['role'],
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
