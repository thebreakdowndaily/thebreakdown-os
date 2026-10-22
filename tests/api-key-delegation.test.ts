import { describe, expect, it } from 'vitest';
import {
  authorizeApiKeyDelegation,
  SUPPORTED_API_KEY_ROLES,
  UNSUPPORTED_API_KEY_ROLES,
} from '@/features/auth/api-keys/delegation';
import {
  apiKeyRecordToPrincipal,
  mapApiKeyRoleToIntelRole,
  API_KEY_ROLE_MAPPING,
} from '@/features/auth/api-keys/principal';
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
  const owner = principal('owner', true);
  const reporter = principal('reporter');
  const guest = principal('guest');

  describe('Supported key roles delegation and defaults', () => {
    it('allows a managing editor to delegate editor role defaults that are within their grants', () => {
      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'editor',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: true,
        role: 'editor',
        permissions: [],
        rateLimitTier: 'standard',
      });
    });

    it('allows a managing editor to create a lower-privilege editor key with explicit permissions they hold', () => {
      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'editor',
          permissions: ['story.read', 'story.update'],
          rateLimitTier: 'standard',
        })
      ).toEqual({
        allowed: true,
        role: 'editor',
        permissions: ['story.read', 'story.update'],
        rateLimitTier: 'standard',
      });
    });

    it('allows a managing editor or reporter to delegate reporter role defaults', () => {
      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'reporter',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: true,
        role: 'reporter',
        permissions: [],
        rateLimitTier: 'standard',
      });

      expect(
        authorizeApiKeyDelegation(reporter, {
          role: 'reporter',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: true,
        role: 'reporter',
        permissions: [],
        rateLimitTier: 'standard',
      });
    });

    it('allows delegating reader role defaults', () => {
      expect(
        authorizeApiKeyDelegation(reporter, {
          role: 'reader',
          permissions: [],
          rateLimitTier: 'tier_low',
        })
      ).toMatchObject({
        allowed: true,
        role: 'reader',
        permissions: [],
        rateLimitTier: 'tier_low',
      });
    });

    it('allows an owner to issue an owner key without explicit scopes', () => {
      expect(
        authorizeApiKeyDelegation(owner, {
          role: 'owner',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toEqual({
        allowed: true,
        role: 'owner',
        permissions: [],
        rateLimitTier: 'standard',
      });
    });

    it('allows an owner to grant Radar scopes to a scoped reader key and unlimited tier', () => {
      expect(
        authorizeApiKeyDelegation(owner, {
          role: 'reader',
          permissions: ['radar.poll', 'radar.poll.force'],
          rateLimitTier: 'unlimited',
        })
      ).toEqual({
        allowed: true,
        role: 'reader',
        permissions: ['radar.poll', 'radar.poll.force'],
        rateLimitTier: 'unlimited',
      });
    });
  });

  describe('Elevation prevention & role escalation', () => {
    it('prevents a managing editor from issuing an elevated owner API key', () => {
      const result = authorizeApiKeyDelegation(managingEditor, {
        role: 'owner',
        permissions: [],
        rateLimitTier: 'standard',
      });
      expect(result).toMatchObject({
        allowed: false,
        status: 403,
        code: 'ROLE_ESCALATION',
        message: 'Only an owner can issue owner API keys',
      });
    });

    it('prevents a non-owner from delegating an unlimited rate-limit tier', () => {
      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'reader',
          permissions: ['story.read'],
          rateLimitTier: 'unlimited',
        })
      ).toMatchObject({
        allowed: false,
        status: 403,
        code: 'RATE_LIMIT_ESCALATION',
      });
    });

    it('rejects misleading explicit scopes on an elevated owner key', () => {
      expect(
        authorizeApiKeyDelegation(owner, {
          role: 'owner',
          permissions: ['radar.poll'],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: false,
        status: 400,
        code: 'ELEVATED_ROLE_WITH_SCOPES',
      });
    });

    it('prevents a guest/reader from delegating reporter role defaults', () => {
      expect(
        authorizeApiKeyDelegation(guest, {
          role: 'reporter',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: false,
        status: 403,
        code: 'PERMISSION_ESCALATION',
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
  });

  describe('Rejection of unsupported and invalid role labels', () => {
    it.each(['admin', 'contributor'])(
      'rejects unsupported role label "%s" rather than guessing privileges',
      (role) => {
        const result = authorizeApiKeyDelegation(owner, {
          role,
          permissions: [],
          rateLimitTier: 'standard',
        });
        expect(result).toMatchObject({
          allowed: false,
          status: 400,
          code: 'UNSUPPORTED_ROLE',
        });
      }
    );

    it('rejects unknown roles and malformed inputs', () => {
      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'superuser',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({ allowed: false, status: 400, code: 'INVALID_ROLE' });

      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 12345,
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({ allowed: false, status: 400, code: 'INVALID_ROLE' });

      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'reader',
          permissions: [],
          rateLimitTier: 'unlimited-forever',
        })
      ).toMatchObject({ allowed: false, status: 400, code: 'INVALID_RATE_LIMIT_TIER' });

      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'reader',
          permissions: 'system.config',
          rateLimitTier: 'standard',
        })
      ).toMatchObject({ allowed: false, status: 400, code: 'INVALID_PERMISSIONS' });

      expect(
        authorizeApiKeyDelegation(managingEditor, {
          role: 'reader',
          permissions: ['system.root.shell'],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({ allowed: false, status: 400, code: 'INVALID_PERMISSIONS' });
    });
  });

  describe('Scoped creator delegation bounds', () => {
    it('rejects role defaults outside a scoped creator permission set', () => {
      const scopedManager = principal('managing_editor', false, ['api_key.create']);
      expect(
        authorizeApiKeyDelegation(scopedManager, {
          role: 'editor',
          permissions: [],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: false,
        status: 403,
        code: 'PERMISSION_ESCALATION',
      });
    });

    it('rejects explicit scopes outside a scoped creator permission set', () => {
      const scopedManager = principal('managing_editor', false, ['api_key.create']);
      expect(
        authorizeApiKeyDelegation(scopedManager, {
          role: 'reader',
          permissions: ['story.read'],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: false,
        status: 403,
        code: 'PERMISSION_ESCALATION',
      });
    });

    it('allows a scoped creator to delegate only the permissions they hold', () => {
      const scopedManager = principal('managing_editor', false, ['api_key.create']);
      expect(
        authorizeApiKeyDelegation(scopedManager, {
          role: 'reader',
          permissions: ['api_key.create'],
          rateLimitTier: 'standard',
        })
      ).toMatchObject({
        allowed: true,
        role: 'reader',
        permissions: ['api_key.create'],
        rateLimitTier: 'standard',
      });
    });
  });
});

describe('API-key principal projection and role mapping', () => {
  it('correctly maps supported roles to canonical IntelRole', () => {
    expect(mapApiKeyRoleToIntelRole('owner')).toBe('owner');
    expect(mapApiKeyRoleToIntelRole('editor')).toBe('editor');
    expect(mapApiKeyRoleToIntelRole('reporter')).toBe('reporter');
    expect(mapApiKeyRoleToIntelRole('reader')).toBe('guest');
  });

  it('fails closed on unsupported or ambiguous role labels', () => {
    expect(mapApiKeyRoleToIntelRole('admin')).toBeNull();
    expect(mapApiKeyRoleToIntelRole('contributor')).toBeNull();
    expect(mapApiKeyRoleToIntelRole('superuser')).toBeNull();
    expect(mapApiKeyRoleToIntelRole('')).toBeNull();
  });

  it('projects an owner key to an active superadmin principal', () => {
    const key = {
      id: 'owner-key-id',
      owner_id: 'owner-user-id',
      name: 'Owner Key',
      role: 'owner' as const,
      revoked_at: null,
      permissions: [],
    };
    const principal = apiKeyRecordToPrincipal(key);
    expect(principal).not.toBeNull();
    expect(principal?.role).toBe('owner');
    expect(principal?.isSuperAdmin).toBe(true);
    expect(can(principal, 'system.config')).toBe(true);
    expect(can(principal, 'story.publish')).toBe(true);
  });

  it('projects an editor key to an editor principal inheriting editor role defaults', () => {
    const key = {
      id: 'editor-key-id',
      owner_id: 'editor-user-id',
      name: 'Editor Key',
      role: 'editor' as const,
      revoked_at: null,
      permissions: [],
    };
    const principal = apiKeyRecordToPrincipal(key);
    expect(principal).not.toBeNull();
    expect(principal?.role).toBe('editor');
    expect(principal?.isSuperAdmin).toBe(false);
    expect(can(principal, 'story.publish')).toBe(true);
    expect(can(principal, 'system.config')).toBe(false);
  });

  it('projects a reporter key to a reporter principal inheriting reporter defaults', () => {
    const key = {
      id: 'reporter-key-id',
      owner_id: 'reporter-user-id',
      name: 'Reporter Key',
      role: 'reporter' as const,
      revoked_at: null,
      permissions: [],
    };
    const principal = apiKeyRecordToPrincipal(key);
    expect(principal).not.toBeNull();
    expect(principal?.role).toBe('reporter');
    expect(principal?.isSuperAdmin).toBe(false);
    expect(can(principal, 'story.create')).toBe(true);
    expect(can(principal, 'story.publish')).toBe(false);
  });

  it('projects a reader key to a guest principal with read-only baseline defaults', () => {
    const key = {
      id: 'reader-key-id',
      owner_id: 'reader-user-id',
      name: 'Reader Key',
      role: 'reader' as const,
      revoked_at: null,
      permissions: [],
    };
    const principal = apiKeyRecordToPrincipal(key);
    expect(principal).not.toBeNull();
    expect(principal?.role).toBe('guest');
    expect(principal?.isSuperAdmin).toBe(false);
    expect(can(principal, 'story.read')).toBe(true);
    expect(can(principal, 'intel.dashboard')).toBe(true);
    expect(can(principal, 'story.create')).toBe(false);
  });

  it('preserves explicit stored scopes and prevents silently regaining broader role defaults', () => {
    const key = {
      id: 'scoped-editor-key-id',
      owner_id: 'owner-id',
      name: 'Scoped Editor Key',
      role: 'editor' as const,
      revoked_at: null,
      permissions: ['api_key.create'] as const,
    };
    const resolved = apiKeyRecordToPrincipal({ ...key, permissions: [...key.permissions] });
    expect(resolved).not.toBeNull();
    expect(resolved?.permissions).toEqual(['api_key.create']);
    // Explicit scope is granted:
    expect(resolved && can(resolved, 'api_key.create')).toBe(true);
    // Broader editor defaults are strictly excluded and not regained:
    expect(resolved && can(resolved, 'story.read')).toBe(false);
    expect(resolved && can(resolved, 'story.publish')).toBe(false);
  });

  it('fails closed for records with unsupported role labels ("admin", "contributor")', () => {
    expect(
      apiKeyRecordToPrincipal({
        id: 'legacy-admin',
        owner_id: 'user-1',
        name: 'Legacy Admin Key',
        role: 'admin' as any,
        revoked_at: null,
        permissions: [],
      })
    ).toBeNull();

    expect(
      apiKeyRecordToPrincipal({
        id: 'legacy-contributor',
        owner_id: 'user-2',
        name: 'Legacy Contributor Key',
        role: 'contributor' as any,
        revoked_at: null,
        permissions: [],
      })
    ).toBeNull();
  });

  it('fails closed for a legacy record containing an unknown permission', () => {
    expect(
      apiKeyRecordToPrincipal({
        id: 'bad-key',
        owner_id: 'user-3',
        name: 'Bad Permissions Key',
        role: 'editor',
        revoked_at: null,
        permissions: ['api_key.create', 'system.root.shell'] as never,
      })
    ).toBeNull();
  });

  it('returns null when the stored permission payload is not an array', () => {
    expect(
      apiKeyRecordToPrincipal({
        id: 'malformed-key',
        owner_id: 'user-4',
        name: 'Malformed Key',
        role: 'editor',
        revoked_at: null,
        permissions: 'api_key.create' as never,
      })
    ).toBeNull();
  });
});
