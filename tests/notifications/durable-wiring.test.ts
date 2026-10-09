/**
 * ─── Phase 4B-1: Durable Store Runtime Wiring & Fail-Closed Invariant Tests ──
 *
 * Governing Document: .planning/PHASE-4B-1-OUTBOUND-NOTIFICATION-DISPATCH.md
 * Operating Doctrine: AGENTS.md (Operational Observability & Durability)
 *
 * Validates that:
 * 1. In Supabase runtime (DATA_PROVIDER=supabase):
 *    - Valid credentials wire SupabaseDurableDeliveryStore into AlertDispatcher and RadarPipeline.
 *    - Missing or dummy credentials fail closed immediately (throwing an informative error).
 *    - Zero silent fallbacks to in-memory deduplication exist.
 * 2. In Local/Test runtime (DATA_PROVIDER != supabase):
 *    - Explicit dependency injection is preserved (MemoryDurableDeliveryStore).
 *    - Unit test isolation remains untouched.
 * 3. RadarPipeline integrates createAlertDispatcher by default.
 * 4. globalAlertDispatcher proxy initializes lazily and enforces runtime invariants.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  AlertDispatcher,
  createAlertDispatcher,
  getGlobalAlertDispatcher,
  resetGlobalAlertDispatcher,
  globalAlertDispatcher,
  MemoryDurableDeliveryStore,
  SupabaseDurableDeliveryStore,
} from '@/services/notifications';
import { RadarPipeline } from '@/services/radar/pipeline';
import type { RadarSourceDefinition } from '@/services/radar/types';

describe('Phase 4B-1 — Durable Store Runtime Wiring & Fail-Closed Guardrails', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetGlobalAlertDispatcher();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetGlobalAlertDispatcher();
  });

  const dummySources: RadarSourceDefinition[] = [
    {
      id: 'test-src-1',
      name: 'Test Source',
      type: 'rss',
      url: 'https://test.example.com/rss',
      cadenceMinutes: 15,
      enabled: false, // Don't run real fetches in tests
      authorityClass: 'OFFICIAL',
    },
  ];

  describe('1. Supabase Runtime (DATA_PROVIDER=supabase)', () => {
    it('1.1 fails closed when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are missing', () => {
      process.env.DATA_PROVIDER = 'supabase';
      delete process.env.SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => createAlertDispatcher()).toThrow(
        /DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/
      );
      expect(() => new AlertDispatcher()).toThrow(
        /In-memory fallback is strictly prohibited in Supabase runtime/
      );
    });

    it('1.2 fails closed when SUPABASE_URL is a dummy URL', () => {
      process.env.DATA_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://dummy.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';

      expect(() => createAlertDispatcher()).toThrow(
        /DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/
      );
    });

    it('1.3 fails closed when SUPABASE_SERVICE_ROLE_KEY is missing but URL is provided', () => {
      process.env.DATA_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => createAlertDispatcher()).toThrow(
        /DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/
      );
    });

    it('1.4 successfully instantiates SupabaseDurableDeliveryStore when credentials are present', () => {
      process.env.DATA_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-valid-service-role-key-for-test';

      const dispatcher = createAlertDispatcher();
      const store = dispatcher.getDurableStore();

      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(SupabaseDurableDeliveryStore);
      expect(store?.kind).toBe('supabase');
    });

    it('1.5 preserves explicit dependency injection when options.durableStore is passed', () => {
      process.env.DATA_PROVIDER = 'supabase';
      // Even if credentials are completely missing, explicit DI must succeed
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const memoryStore = new MemoryDurableDeliveryStore();
      const dispatcher = createAlertDispatcher({ durableStore: memoryStore });

      expect(dispatcher.getDurableStore()).toBe(memoryStore);
      expect(dispatcher.getDurableStore()?.kind).toBe('memory');
    });
  });

  describe('2. Local/Test Runtime (DATA_PROVIDER != supabase)', () => {
    it('2.1 defaults to in-memory store behavior when DATA_PROVIDER is unset or memory', () => {
      delete process.env.DATA_PROVIDER;
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const dispatcher = createAlertDispatcher();
      expect(dispatcher.getDurableStore()).toBeUndefined();
    });

    it('2.2 allows explicit injection of MemoryDurableDeliveryStore', () => {
      process.env.DATA_PROVIDER = 'memory';
      const store = new MemoryDurableDeliveryStore();
      const dispatcher = createAlertDispatcher({ durableStore: store });

      expect(dispatcher.getDurableStore()).toBe(store);
      expect(dispatcher.getDurableStore()?.kind).toBe('memory');
    });
  });

  describe('3. RadarPipeline Default Wiring', () => {
    it('3.1 automatically equips SupabaseDurableDeliveryStore in Supabase runtime', () => {
      process.env.DATA_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

      const pipeline = new RadarPipeline(dummySources);
      const dispatcher = pipeline.getAlertDispatcher();

      expect(dispatcher).toBeDefined();
      expect(dispatcher.getDurableStore()).toBeInstanceOf(SupabaseDurableDeliveryStore);
      expect(dispatcher.getDurableStore()?.kind).toBe('supabase');
    });

    it('3.2 fails closed during pipeline construction if DATA_PROVIDER=supabase lacks credentials', () => {
      process.env.DATA_PROVIDER = 'supabase';
      delete process.env.SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => new RadarPipeline(dummySources)).toThrow(
        /DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/
      );
    });

    it('3.3 respects custom alertDispatcher passed in RadarPipelineOptions', () => {
      process.env.DATA_PROVIDER = 'supabase';
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const customDispatcher = new AlertDispatcher({
        durableStore: new MemoryDurableDeliveryStore(),
      });

      const pipeline = new RadarPipeline(dummySources, { alertDispatcher: customDispatcher });
      expect(pipeline.getAlertDispatcher()).toBe(customDispatcher);
      expect(pipeline.getAlertDispatcher().getDurableStore()?.kind).toBe('memory');
    });
  });

  describe('4. globalAlertDispatcher Proxy & Singleton Lifecycle', () => {
    it('4.1 lazily resolves to SupabaseDurableDeliveryStore in Supabase runtime', () => {
      process.env.DATA_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

      expect(globalAlertDispatcher.getDurableStore()).toBeInstanceOf(SupabaseDurableDeliveryStore);
      expect(globalAlertDispatcher.getDurableStore()?.kind).toBe('supabase');
    });

    it('4.2 lazily throws fail-closed error when accessed in Supabase runtime without credentials', () => {
      process.env.DATA_PROVIDER = 'supabase';
      delete process.env.SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => globalAlertDispatcher.getDurableStore()).toThrow(
        /DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/
      );
    });

    it('4.3 getGlobalAlertDispatcher returns singleton instance', () => {
      process.env.DATA_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

      const d1 = getGlobalAlertDispatcher();
      const d2 = getGlobalAlertDispatcher();
      expect(d1).toBe(d2);
    });
  });
});
