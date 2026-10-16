import { describe, expect, it } from 'vitest';
import { can } from '@/features/auth/policy';
import { apiKeyRecordToPrincipal } from '@/features/auth/api-keys/principal';

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
