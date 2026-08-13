import { resolveStory, selectReadPath } from '../../lib/story/resolver';
import { isCanonicalReadPathEnabled, getFeatureFlags, CANONICAL_ELIGIBILITY_REGISTRY } from '../../lib/feature-flags';
import { test, expect, describe, afterEach, vi } from 'vitest';

describe('Phase 4.5: Server-Only CANONICAL_READ_PATH Feature Flag', () => {
  const originalEnv = process.env.CANONICAL_READ_PATH;
  const originalPublicEnv = process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;

  afterEach(() => {
    process.env.CANONICAL_READ_PATH = originalEnv;
    process.env.NEXT_PUBLIC_CANONICAL_READ_PATH = originalPublicEnv;
    vi.restoreAllMocks();
  });

  test('Flag parsing: invalid or missing values resolve safely to OFF', () => {
    delete process.env.CANONICAL_READ_PATH;
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;
    expect(getFeatureFlags().CANONICAL_READ_PATH).toBe('OFF');

    process.env.CANONICAL_READ_PATH = '';
    expect(getFeatureFlags().CANONICAL_READ_PATH).toBe('OFF');

    process.env.CANONICAL_READ_PATH = 'INVALID_STATE';
    expect(getFeatureFlags().CANONICAL_READ_PATH).toBe('OFF');

    process.env.CANONICAL_READ_PATH = 'true';
    expect(getFeatureFlags().CANONICAL_READ_PATH).toBe('OFF');
  });

  test('selectReadPath: Flag is OFF -> all legacy', () => {
    process.env.CANONICAL_READ_PATH = 'OFF';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;
    expect(selectReadPath('mgnrega-reform')).toBe('legacy');
    expect(selectReadPath('digital-payments-boom')).toBe('legacy');
  });

  test('selectReadPath: Flag is CANARY -> canary stories route to canonical, non-canary to legacy', () => {
    process.env.CANONICAL_READ_PATH = 'CANARY';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;
    expect(selectReadPath('mgnrega-reform')).toBe('canonical');
    expect(selectReadPath('rbi-repo-rate')).toBe('canonical');
    
    // Non-canary stories
    expect(selectReadPath('digital-payments-boom')).toBe('legacy');
    expect(selectReadPath('pm-fasal-bima-claims')).toBe('legacy');
  });

  test('selectReadPath: Flag is ON -> only precomputed ELIGIBLE stories route to canonical', () => {
    process.env.CANONICAL_READ_PATH = 'ON';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;

    expect(CANONICAL_ELIGIBILITY_REGISTRY['mgnrega-reform']).toBe('ELIGIBLE');
    expect(selectReadPath('mgnrega-reform')).toBe('canonical');

    expect(CANONICAL_ELIGIBILITY_REGISTRY['cyber-resilience-act']).toBe('BLOCKED');
    expect(selectReadPath('cyber-resilience-act')).toBe('legacy');

    expect(CANONICAL_ELIGIBILITY_REGISTRY['digital-payments-boom']).toBe('NEEDS_REVIEW');
    expect(selectReadPath('digital-payments-boom')).toBe('legacy');
  });
});

describe('Phase 4.5: Canonical Adapter & Structured Telemetry', () => {
  const originalEnv = process.env.CANONICAL_READ_PATH;
  const originalPublicEnv = process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;

  afterEach(() => {
    process.env.CANONICAL_READ_PATH = originalEnv;
    process.env.NEXT_PUBLIC_CANONICAL_READ_PATH = originalPublicEnv;
    vi.restoreAllMocks();
  });

  test('Gate B: Telemetry emissions for canonical success', async () => {
    process.env.CANONICAL_READ_PATH = 'CANARY';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = await resolveStory('mgnrega-reform');
    expect(result.type).toBe('chapter');

    expect(logSpy).toHaveBeenCalled();
    const emittedLogs = logSpy.mock.calls
      .map(call => {
        try {
          return JSON.parse(call[0]);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const resolutionLog = emittedLogs.find(l => l.event === 'story_read_resolution');
    expect(resolutionLog).toBeDefined();
    expect(resolutionLog).toEqual({
      event: 'story_read_resolution',
      slug: 'mgnrega-reform',
      flag: 'CANARY',
      path: 'canonical',
      chapterFound: true,
      claimCount: expect.any(Number),
      evidenceCount: expect.any(Number),
      resolution: 'success',
      fallbackUsed: false,
    });
    expect(resolutionLog.claimCount).toBeGreaterThan(0);
  });

  test('Missing canonical chapter fails closed (not_found) and emits not_found telemetry', async () => {
    process.env.CANONICAL_READ_PATH = 'CANARY';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;

    // Manually force an eligible slug that has no actual chapter in knowledge library
    // Or temporarily mock tryLoadChapter
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // For a non-existent chapter when resolving canonically directly:
    const { resolveCanonicalStory } = await import('../../lib/story/resolver');
    const result = await resolveCanonicalStory('non-existent-slug');
    expect(result.type).toBe('not_found');

    const emittedLogs = logSpy.mock.calls
      .map(call => {
        try {
          return JSON.parse(call[0]);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const resolutionLog = emittedLogs.find(l => l.event === 'story_read_resolution');
    expect(resolutionLog).toBeDefined();
    expect(resolutionLog.resolution).toBe('not_found');
    expect(resolutionLog.chapterFound).toBe(false);
    expect(resolutionLog.fallbackUsed).toBe(false);
  });

  test('Full trace: rbi-repo-rate resolves canonically with claims and evidence', async () => {
    process.env.CANONICAL_READ_PATH = 'CANARY';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;
    const result = await resolveStory('rbi-repo-rate');
    
    expect(result.type).toBe('chapter');
    if (result.type === 'chapter') {
      expect(result.chapter).toBeDefined();
      expect(result.canonicalStory).toBeDefined();
      expect(result.canonicalStory.headline).toBe('RBI Monetary Policy Adjustments 2026');
    }
  });

  test('Hard Production Invariant: Canonical-classified stories NEVER silently fall back to legacy store', async () => {
    process.env.CANONICAL_READ_PATH = 'CANARY';
    delete process.env.NEXT_PUBLIC_CANONICAL_READ_PATH;

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // 1. Valid canary story
    const resultCanary = await resolveStory('mgnrega-reform');
    expect(resultCanary.type).toBe('chapter');
    if (resultCanary.type === 'chapter') {
      expect(resultCanary.canonicalStory.slug).toBe('mgnrega-reform');
    }

    // 2. Canonical resolution failure MUST fail closed to not_found, never return a legacy_story type
    const { resolveCanonicalStory } = await import('../../lib/story/resolver');
    const resultMissing = await resolveCanonicalStory('non-existent-canary-slug');
    expect(resultMissing.type).toBe('not_found');
    expect(resultMissing.type).not.toBe('legacy_story');

    const emittedLogs = logSpy.mock.calls
      .map(call => {
        try {
          return JSON.parse(call[0]);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    for (const log of emittedLogs) {
      if (log.event === 'story_read_resolution' && log.path === 'canonical') {
        expect(log.fallbackUsed).toBe(false);
      }
    }
  });
});
