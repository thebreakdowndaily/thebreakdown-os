import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextRequest } from 'next/server';
import { can } from '@/features/auth/policy';
import { apiKeyRecordToPrincipal } from '@/features/auth/api-keys/principal';
import { requireApiPermission } from '@/features/auth/require-role';
import { getPersistentWriteClient } from '@/features/auth/persistent-write-client';
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

const dbClientMocks = vi.hoisted(() => ({
  createUserScopedClient: vi.fn(),
}));

vi.mock('@/supabase/client', () => ({
  createUserScopedClient: dbClientMocks.createUserScopedClient,
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => {
    throw new Error('cookies unavailable in this runtime');
  }),
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


describe('persistent write client boundary', () => {
  it('fails closed for API-key principals until a service-to-service RLS contract exists', async () => {
    const result = await getPersistentWriteClient({
      userId: 'key-id',
      email: 'api_key:test key',
      name: 'test key',
      role: 'editor',
      isSuperAdmin: false,
      status: 'active',
      organizationId: null,
      permissions: ['topic.create'],
    });
    expect('response' in result).toBe(true);
    if ('response' in result) expect(result.response.status).toBe(403);
  });

  it('returns 503 instead of downgrading to the anonymous client when session context is unavailable', async () => {
    dbClientMocks.createUserScopedClient.mockRejectedValueOnce(
      new Error('Authenticated Supabase request context unavailable'),
    );

    const result = await getPersistentWriteClient({
      userId: 'session-user',
      email: 'editor@example.invalid',
      name: 'Editor',
      role: 'editor',
      isSuperAdmin: false,
      status: 'active',
      organizationId: null,
    });

    expect(dbClientMocks.createUserScopedClient).toHaveBeenCalledWith({ fallbackToAnon: false });
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response.status).toBe(503);
      expect(await result.response.json()).toEqual({
        error: 'Authenticated database session unavailable',
      });
    }
  });

  it('makes the strict Supabase session-client option throw when request cookies are unavailable', async () => {
    const actual = await vi.importActual<typeof import('@/supabase/client')>('@/supabase/client');

    await expect(
      actual.createUserScopedClient({ fallbackToAnon: false }),
    ).rejects.toThrow('Authenticated Supabase request context unavailable');
  });
});

type ResourceMutationContract = {
  path: string;
  method: 'POST' | 'PUT' | 'DELETE';
  permission: string;
};

const RESOURCE_MUTATION_CONTRACTS: ResourceMutationContract[] = [
  { path: 'app/api/v1/topics/route.ts', method: 'POST', permission: 'topic.create' },
  { path: 'app/api/v1/topics/[slug]/route.ts', method: 'PUT', permission: 'topic.update' },
  { path: 'app/api/v1/topics/[slug]/route.ts', method: 'DELETE', permission: 'topic.delete' },
  { path: 'app/api/v1/entities/route.ts', method: 'POST', permission: 'entity.create' },
  { path: 'app/api/v1/entities/[slug]/route.ts', method: 'PUT', permission: 'entity.update' },
  { path: 'app/api/v1/entities/[slug]/route.ts', method: 'DELETE', permission: 'entity.delete' },
  { path: 'app/api/v1/fixes/route.ts', method: 'POST', permission: 'fix.create' },
  { path: 'app/api/v1/fixes/[slug]/route.ts', method: 'PUT', permission: 'fix.update' },
  { path: 'app/api/v1/fixes/[slug]/route.ts', method: 'DELETE', permission: 'fix.delete' },
  { path: 'app/api/v1/timelines/route.ts', method: 'POST', permission: 'timeline.create' },
  { path: 'app/api/v1/timelines/[id]/route.ts', method: 'PUT', permission: 'timeline.update' },
  { path: 'app/api/v1/timelines/[id]/route.ts', method: 'DELETE', permission: 'timeline.delete' },
  { path: 'app/api/v1/media/route.ts', method: 'POST', permission: 'media.create' },
  { path: 'app/api/v1/datasets/route.ts', method: 'POST', permission: 'dataset.create' },
  { path: 'app/api/v2/topics/route.ts', method: 'POST', permission: 'topic.create' },
  { path: 'app/api/v2/topics/[slug]/route.ts', method: 'PUT', permission: 'topic.update' },
  { path: 'app/api/v2/topics/[slug]/route.ts', method: 'DELETE', permission: 'topic.delete' },
  { path: 'app/api/v2/entities/route.ts', method: 'POST', permission: 'entity.create' },
  { path: 'app/api/v2/entities/[slug]/route.ts', method: 'PUT', permission: 'entity.update' },
  { path: 'app/api/v2/entities/[slug]/route.ts', method: 'DELETE', permission: 'entity.delete' },
  { path: 'app/api/v2/fixes/route.ts', method: 'POST', permission: 'fix.create' },
  { path: 'app/api/v2/fixes/[slug]/route.ts', method: 'PUT', permission: 'fix.update' },
  { path: 'app/api/v2/fixes/[slug]/route.ts', method: 'DELETE', permission: 'fix.delete' },
  { path: 'app/api/v2/timelines/route.ts', method: 'POST', permission: 'timeline.create' },
  { path: 'app/api/v2/timelines/[slug]/route.ts', method: 'PUT', permission: 'timeline.update' },
  { path: 'app/api/v2/timelines/[slug]/route.ts', method: 'DELETE', permission: 'timeline.delete' },
];

function extractExportedMutationHandler(source: string, method: ResourceMutationContract['method']): string {
  const expression = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`);
  const match = expression.exec(source);
  if (!match) return '';

  const start = match.index;
  const remainder = source.slice(start + match[0].length);
  const nextHandler = remainder.search(/export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\(/);
  return nextHandler < 0 ? source.slice(start) : source.slice(start, start + match[0].length + nextHandler);
}

describe('resource mutation route guard coverage', () => {
  it.each(RESOURCE_MUTATION_CONTRACTS)(
    '$method $path requires $permission and a request-scoped write client',
    ({ path, method, permission }) => {
      const source = readFileSync(resolve(process.cwd(), path), 'utf8');
      const handler = extractExportedMutationHandler(source, method);

      expect(handler, `exported ${method} handler must exist in ${path}`).not.toBe('');
      expect(handler).toContain(`requireApiPermission('${permission}'`);
      expect(handler).toContain('getPersistentWriteClient(');
      expect(handler.includes('write.client') || handler.includes('writeRepo.')).toBe(true);
    },
  );
});

