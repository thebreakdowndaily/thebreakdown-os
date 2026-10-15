import type { Principal } from '../principal';
import { can } from '../policy';
import type { AppPermission } from '../permissions';
import { isAppPermission } from '../permissions';
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
      code: 'INVALID_ROLE' | 'INVALID_PERMISSIONS' | 'INVALID_RATE_LIMIT_TIER' | 'ROLE_ESCALATION' | 'PERMISSION_ESCALATION' | 'RATE_LIMIT_ESCALATION';
      message: string;
    };

/**
 * Ensures an API-key creator cannot delegate authority that they do not hold.
 * Role grants and permission grants are checked independently because roles
 * can confer capabilities even when an explicit permission list is empty.
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
  const canGrantElevatedRoles = principal.isSuperAdmin;
  if ((role === 'admin' || role === 'owner') && !canGrantElevatedRoles) {
    return {
      allowed: false,
      status: 403,
      code: 'ROLE_ESCALATION',
      message: 'Only an owner can issue admin or owner API keys',
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

  const permissions = [...new Set(rawPermissions as AppPermission[])];
  const denied = permissions.find((permission) => !can(principal, permission));
  if (denied) {
    return {
      allowed: false,
      status: 403,
      code: 'PERMISSION_ESCALATION',
      message: 'You cannot delegate permissions you do not hold',
    };
  }

  return { allowed: true, role, permissions, rateLimitTier };
}
