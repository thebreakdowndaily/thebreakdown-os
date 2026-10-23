import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getServiceClient } from '@/supabase/client';
import { createApiKey } from '@/features/auth/api-keys/service';

vi.mock('@/supabase/client', () => ({ getServiceClient: vi.fn() }));
vi.mock('@/features/security/audit-logger', () => ({ logSecurityEvent: vi.fn() }));

const mockedGetServiceClient = vi.mocked(getServiceClient);

function createInsertClient(result: { data: { id: string } | null; error: { message: string } | null }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));
  return { client: { from }, from, insert, select, single };
}

const keyInput = {
  name: 'Production persistence test',
  owner_id: 'test-owner',
  role: 'reader' as const,
  permissions: [],
  rate_limit_tier: 'standard' as const,
  expires_in_days: null,
};

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example-project.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-secret');
  mockedGetServiceClient.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('API key persistence fails closed in production', () => {
  it('does not issue a key if no durable database configuration exists', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    await expect(createApiKey(keyInput)).rejects.toThrow(/persistence is not configured/);
    expect(mockedGetServiceClient).not.toHaveBeenCalled();
  });

  it('does not issue or cache a key if the database insert fails', async () => {
    const db = createInsertClient({ data: null, error: { message: 'database unavailable' } });
    mockedGetServiceClient.mockReturnValue(db.client as never);

    await expect(createApiKey(keyInput)).rejects.toThrow(/could not be durably persisted/);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });
});
