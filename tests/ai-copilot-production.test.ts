import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockProvider, isMockProviderAllowed } from '@/services/ai/providers/mock';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Mock AI provider production guard', () => {
  it('allows local development', () => {
    expect(isMockProviderAllowed({ NODE_ENV: 'development' })).toBe(true);
  });

  it('allows preview deployments even when Next.js builds with NODE_ENV=production', () => {
    expect(isMockProviderAllowed({ NODE_ENV: 'production', VERCEL_ENV: 'preview' })).toBe(true);
  });

  it('blocks the production deployment regardless of other development markers', () => {
    expect(isMockProviderAllowed({
      NODE_ENV: 'development',
      VERCEL_ENV: 'production',
      APP_ENV: 'development',
    })).toBe(false);
  });

  it('does not emit simulated streaming content in production', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NODE_ENV', 'development');
    const provider = new MockProvider();
    expect(() => provider.generateStream([{ role: 'user', content: 'Give me the latest facts' }]))
      .toThrow(/disabled in production/);
  });

  it('does not return simulated blocking content in production', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NODE_ENV', 'development');
    const provider = new MockProvider();
    await expect(provider.generate([{ role: 'user', content: 'Give me the latest facts' }]))
      .rejects.toThrow(/disabled in production/);
  });
});
