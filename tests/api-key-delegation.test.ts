import { describe, expect, it } from 'vitest';
import { authorizeApiKeyDelegation } from '@/features/auth/api-keys/delegation';
import { apiKeyRecordToPrincipal } from '@/features/auth/api-keys/principal';
import { can } from '@/features/auth/policy';
import type { Principal } from '@/features/auth/principal';

function principal(
  role: Principal['role'],
  isSuperAdmin = false,
  permissions?: Principal['permissions']
): Principal {
  return {
    userId: 'test-user',
    email: 'test@example.invalid',
    name: 'Test User',
    role,
    isSuperAdmin,
    status: 'active',
    organizationId: null,
    permissions,
  };
}

describe('API-key delegation least-privilege policy', () => {
  const managingEditor = principal('managing_editor');

  it('allows a managing editor to create a lower-privilege key with permissions they hold', () => {
    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'editor',
      permissions: ['story.read', 'story.update'],
      rateLimitTier: 'standard',
    })).toEqual({
      allowed: true,
      role: 'editor',
      permissions: ['story.read', 'story.update'],
      rateLimitTier: 'standard',
    });
  });

  it('allows a managing editor to delegate editor role defaults that are within their grants', () => {
    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'editor',
      permissions: [],
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: true,
      role: 'editor',
      permissions: [],
      rateLimitTier: 'standard',
    });
  });

  it.each(['admin', 'owner'])('prevents a managing editor from issuing a %s API key', (role) => {
    const result = authorizeApiKeyDelegation(managingEditor, {
      role,
      permissions: [],
      rateLimitTier: 'standard',
    });
    expect(result).toMatchObject({
      allowed: false,
      status: 403,
      code: 'ROLE_ESCALATION',
    });
  });

  it.each(['system.config', 'radar.poll', 'radar.poll.force'])(
    'prevents a managing editor from delegating %s without holding it',
    (permission) => {
      const result = authorizeApiKeyDelegation(managingEditor, {
        role: 'reader',
        permissions: [permission],
        rateLimitTier: 'standard',
      });
      expect(result).toMatchObject({
        allowed: false,
        status: 403,
        code: 'PERMISSION_ESCALATION',
      });
    }
  );

  it('rejects unknown permission strings at runtime', () => {
    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'reader',
      permissions: ['system.root.shell'],
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: false,
      status: 400,
      code: 'INVALID_PERMISSIONS',
    });
  });

  it('rejects malformed permission payloads rather than silently dropping them', () => {
    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'reader',
      permissions: 'system.config',
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: false,
      status: 400,
      code: 'INVALID_PERMISSIONS',
    });
  });

  it('prevents a non-owner from delegating an unlimited rate-limit tier', () => {
    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'reader',
      permissions: ['story.read'],
      rateLimitTier: 'unlimited',
    })).toMatchObject({
      allowed: false,
      status: 403,
      code: 'RATE_LIMIT_ESCALATION',
    });
  });

  it('allows an owner to grant Radar scopes to a scoped key and the unlimited tier', () => {
    const owner = principal('owner', true);
    expect(authorizeApiKeyDelegation(owner, {
      role: 'reader',
      permissions: ['radar.poll', 'radar.poll.force'],
      rateLimitTier: 'unlimited',
    })).toEqual({
      allowed: true,
      role: 'reader',
      permissions: ['radar.poll', 'radar.poll.force'],
      rateLimitTier: 'unlimited',
    });
  });

  it('rejects misleading explicit scopes on an elevated owner key', () => {
    const owner = principal('owner', true);
    expect(authorizeApiKeyDelegation(owner, {
      role: 'owner',
      permissions: ['radar.poll'],
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: false,
      status: 400,
      code: 'ELEVATED_ROLE_WITH_SCOPES',
    });
  });

  it('allows an owner to issue an owner key without a misleading scope list', () => {
    const owner = principal('owner', true);
    expect(authorizeApiKeyDelegation(owner, {
      role: 'owner',
      permissions: [],
      rateLimitTier: 'standard',
    })).toEqual({
      allowed: true,
      role: 'owner',
      permissions: [],
      rateLimitTier: 'standard',
    });
  });

  it('rejects role defaults outside a scoped creator permission set', () => {
    const scopedManager = principal('managing_editor', false, ['api_key.create']);
    expect(authorizeApiKeyDelegation(scopedManager, {
      role: 'editor',
      permissions: [],
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: false,
      status: 403,
      code: 'PERMISSION_ESCALATION',
    });
  });

  it('rejects explicit scopes outside a scoped creator permission set', () => {
    const scopedManager = principal('managing_editor', false, ['api_key.create']);
    expect(authorizeApiKeyDelegation(scopedManager, {
      role: 'reader',
      permissions: ['story.read'],
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: false,
      status: 403,
      code: 'PERMISSION_ESCALATION',
    });
  });

  it('allows a scoped creator to delegate only the permissions they hold', () => {
    const scopedManager = principal('managing_editor', false, ['api_key.create']);
    expect(authorizeApiKeyDelegation(scopedManager, {
      role: 'reader',
      permissions: ['api_key.create'],
      rateLimitTier: 'standard',
    })).toMatchObject({
      allowed: true,
      role: 'reader',
      permissions: ['api_key.create'],
      rateLimitTier: 'standard',
    });
  });

  it('rejects unknown roles and rate-limit tiers', () => {
    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'superuser',
      permissions: [],
      rateLimitTier: 'standard',
    })).toMatchObject({ allowed: false, status: 400, code: 'INVALID_ROLE' });

    expect(authorizeApiKeyDelegation(managingEditor, {
      role: 'reader',
      permissions: [],
      rateLimitTier: 'unlimited-forever',
    })).toMatchObject({ allowed: false, status: 400, code: 'INVALID_RATE_LIMIT_TIER' });
  });
});

describe('API-key principal projection', () => {
  const key = {
    id: 'key-id',
    owner_id: 'owner-id',
    name: 'scoped-key',
    role: 'editor' as const,
    revoked_at: null,
    permissions: ['api_key.create'] as const,
  };

  it('preserves explicit stored scopes in the principal', () => {
    const resolved = apiKeyRecordToPrincipal({ ...key, permissions: [...key.permissions] });
    expect(resolved?.permissions).toEqual(['api_key.create']);
    expect(resolved && can(resolved, 'api_key.create')).toBe(true);
    expect(resolved && can(resolved, 'story.read')).toBe(false);
  });

  it('fails closed for a legacy record containing an unknown permission', () => {
    const resolved = apiKeyRecordToPrincipal({
      ...key,
      permissions: ['api_key.create', 'system.root.shell'] as never,
    });
    expect(resolved).toBeNull();
  });

  it('returns null when the stored permission payload is not an array', () => {
    const resolved = apiKeyRecordToPrincipal({
      ...key,
      permissions: 'api_key.create' as never,
    });
    expect(resolved).toBeNull();
  });
});
