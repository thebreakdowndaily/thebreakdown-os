import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRadarPersistenceRepository, RadarPersistenceConfigurationError } from '@/services/radar/persistence';

const setEmptyRadarConfig = () => {
  vi.stubEnv('RADAR_STATE_PROVIDER', '');
  vi.stubEnv('DATA_PROVIDER', '');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('VERCEL_ENV', '');
  vi.stubEnv('APP_ENV', '');
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('NEXT_PHASE', '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Radar persistence provider fail-closed contract', () => {
  it('keeps the file repository as a local development default', () => {
    setEmptyRadarConfig();
    expect(createRadarPersistenceRepository().kind).toBe('file');
  });

  it('allows explicit memory storage only outside production', () => {
    setEmptyRadarConfig();
    expect(createRadarPersistenceRepository({ provider: 'memory' }).kind).toBe('memory');
  });

  it('rejects missing provider in a production runtime instead of choosing local file storage', () => {
    setEmptyRadarConfig();
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(() => createRadarPersistenceRepository()).toThrow(RadarPersistenceConfigurationError);
  });

  it('rejects file and memory providers in production', () => {
    setEmptyRadarConfig();
    vi.stubEnv('APP_ENV', 'production');
    expect(() => createRadarPersistenceRepository({ provider: 'file' })).toThrow(RadarPersistenceConfigurationError);
    expect(() => createRadarPersistenceRepository({ provider: 'memory' })).toThrow(RadarPersistenceConfigurationError);
  });

  it('rejects explicit Supabase selection when credentials are missing', () => {
    setEmptyRadarConfig();
    expect(() => createRadarPersistenceRepository({ provider: 'supabase' })).toThrow(
      /Supabase Radar persistence was requested/
    );
  });

  it('rejects invalid provider strings instead of silently selecting file storage', () => {
    setEmptyRadarConfig();
    expect(() => createRadarPersistenceRepository({ provider: 'supabse' })).toThrow(
      /Invalid RADAR_STATE_PROVIDER value/
    );
  });

  it('selects Supabase when it is explicitly configured and credentials exist', () => {
    setEmptyRadarConfig();
    vi.stubEnv('RADAR_STATE_PROVIDER', 'supabase');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://radar-test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only-service-role-placeholder');
    expect(createRadarPersistenceRepository().kind).toBe('supabase');
  });

  it('does not apply the runtime guard during the Next.js production build phase', () => {
    setEmptyRadarConfig();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    expect(createRadarPersistenceRepository().kind).toBe('file');
  });
});
