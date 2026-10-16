import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { can } from '@/features/auth/policy';
import { apiKeyRecordToPrincipal } from '@/features/auth/api-keys/principal';
import { requireApiPermission } from '@/features/auth/require-role';
const authState = vi.hoisted(() => ({
  principal: null as unknown,
  keyResult: {
    valid: true,
    key: {
      id: 'key-id',
      owner_id: 'owner-id',
      name: 'test key',
      role: 'editor',
      revoked_at: null,
      permissions: ['story.read'],
    } as unknown,
  },
}));

vi.mock('@/features/auth/principal', () => ({
  getCurrentPrincipal: vi.fn(async () => authState.principal),
}));

vi.mock('@/features/auth/api-keys/service', () => ({
  verifyApiKey: vi.fn(async () => authState.keyResult),
}));


function apiKey(permissions: unknown, role = 'editor') {
  return {
    id: 'key-id',
    owner_id: 'owner-id',
    name: 'test key',
    role,
    revoked_at: null,
    permissions,
  } as Parameters<typeof apiKeyRecordToPrincipal>[0];
}

describe('resource-specific authorization contracts', () => {
  it('keeps a scoped API key within its explicit permissions', () => {
    const principal = apiKeyRecordToPrincipal(apiKey(['story.read']));
    expect(principal).not.toBeNull();
    expect(can(principal, 'story.read')).toBe(true);
    expect(can(principal, 'topic.create')).toBe(false);
    expect(can(principal, 'dataset.create')).toBe(false);
  });

  it('uses the role policy only for a valid key with an empty scope list', () => {
    const principal = apiKeyRecordToPrincipal(apiKey([]));
    expect(principal).not.toBeNull();
    expect(can(principal, 'topic.create')).toBe(true);
    expect(can(principal, 'topic.delete')).toBe(false);
    expect(can(principal, 'dataset.create')).toBe(false);
  });

  it('rejects malformed stored scopes rather than widening to role defaults', () => {
    expect(apiKeyRecordToPrincipal(apiKey(['story.read', 'system.root']))).toBeNull();
    expect(apiKeyRecordToPrincipal(apiKey(null))).toBeNull();
    expect(apiKeyRecordToPrincipal(apiKey('story.read'))).toBeNull();
  });

  it('does not grant resource mutations to anonymous callers', () => {
    expect(can(null, 'topic.create')).toBe(false);
    expect(can(null, 'entity.delete')).toBe(false);
    expect(can(null, 'dataset.create')).toBe(false);
  });
});


describe('requireApiPermission route boundary', () => {
  beforeEach(() => {
    authState.principal = null;
    authState.keyResult = {
      valid: true,
      key: {
        id: 'key-id',
        owner_id: 'owner-id',
        name: 'test key',
        role: 'editor',
        revoked_at: null,
        permissions: ['story.read'],
      },
    };
  });

  it('denies a scoped API key at a resource mutation boundary', async () => {
    const result = await requireApiPermission(
      'topic.create',
      new NextRequest('http://localhost/api/v2/topics', { headers: { 'x-api-key': 'valid-key' } }),
    );
    expect('response' in result).toBe(true);
    if ('response' in result) expect(result.response.status).toBe(403);
  });

  it('allows a scoped API key only when the requested permission is present', async () => {
    authState.keyResult = {
      valid: true,
      key: {
        id: 'key-id',
        owner_id: 'owner-id',
        name: 'test key',
        role: 'editor',
        revoked_at: null,
        permissions: ['topic.create'],
      },
    };
    const result = await requireApiPermission(
      'topic.create',
      new NextRequest('http://localhost/api/v2/topics', { headers: { 'x-api-key': 'valid-key' } }),
    );
    expect('principal' in result).toBe(true);
  });
});
