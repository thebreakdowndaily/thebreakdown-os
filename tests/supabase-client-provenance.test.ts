/**
 * THE BREAKDOWN — Supabase Client Provenance & Test Isolation Unit Tests
 *
 * Verifies Phase 50 Finding H:
 * 1. Deliberate test injection (setServiceClient) is strictly decoupled from lazy creation (getServiceClient).
 * 2. getInjectedServiceClient() returns ONLY explicitly injected test doubles, returning null for default/lazy clients.
 * 3. getServiceClient() returns the injected client when present, and lazily initializes cachedServiceClient when absent.
 * 4. setServiceClient(null) clears injectedServiceClient and resets cachedServiceClient.
 * 5. Browser environment guards strictly forbid privileged client creation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getServiceClient,
  setServiceClient,
  getInjectedServiceClient,
  createServiceClient,
} from '@/supabase/client';

describe('Supabase Client Provenance & Test Isolation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    setServiceClient(null);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    setServiceClient(null);
  });

  it('1. getInjectedServiceClient returns null by default before any injection', () => {
    expect(getInjectedServiceClient()).toBeNull();
  });

  it('2. calling getServiceClient() without injection lazily caches client but leaves getInjectedServiceClient as null', () => {
    const client = getServiceClient();
    expect(client).toBeDefined();
    // Provenance requirement: default/lazy client MUST NOT be identified as an injected test double
    expect(getInjectedServiceClient()).toBeNull();
    // Subsequent calls return the same cached instance
    expect(getServiceClient()).toBe(client);
  });

  it('3. setServiceClient(mock) sets injected client and makes getInjectedServiceClient return it', () => {
    const mockClient = {
      rpc: vi.fn(),
      from: vi.fn(),
    } as any;

    setServiceClient(mockClient);

    expect(getInjectedServiceClient()).toBe(mockClient);
    expect(getServiceClient()).toBe(mockClient);
  });

  it('4. setServiceClient(null) resets injected state and clears cache', () => {
    const mockClient = {
      rpc: vi.fn(),
      from: vi.fn(),
    } as any;

    setServiceClient(mockClient);
    expect(getInjectedServiceClient()).toBe(mockClient);

    setServiceClient(null);
    expect(getInjectedServiceClient()).toBeNull();

    // After reset, calling getServiceClient lazily initializes a fresh default client
    const freshClient = getServiceClient();
    expect(freshClient).not.toBe(mockClient);
    expect(getInjectedServiceClient()).toBeNull();
  });

  it('5. browser environment guard blocks getServiceClient and createServiceClient', () => {
    const originalWindow = (global as any).window;
    try {
      (global as any).window = {};

      expect(() => getServiceClient()).toThrowError(
        'getServiceClient() is strictly forbidden in client/browser environments.'
      );
      expect(() => createServiceClient()).toThrowError(
        'createServiceClient() is strictly forbidden in client/browser environments.'
      );
    } finally {
      if (originalWindow === undefined) {
        delete (global as any).window;
      } else {
        (global as any).window = originalWindow;
      }
    }
  });
});
