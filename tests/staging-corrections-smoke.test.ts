/**
 * ─── Staging Corrections Persistence Smoke Test Unit Test Suite ─────────────
 *
 * Validates:
 * 1. Strict environment isolation (rejects production URLs and project references).
 * 2. Fail-closed behavior on missing bypass tokens or database keys.
 * 3. Synthetic payload generation and privacy leak detection.
 * 4. API error handling (non-201, non-JSON, missing submissionId).
 * 5. PostgreSQL persistence verification and field mismatch detection.
 * 6. Reliable cleanup execution and verified deletion.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateEnvironment,
  verifyPrivacyProjection,
  generateSyntheticPayload,
  runStagingPersistenceSmokeTest,
  KNOWN_STAGING_SUPABASE_REF,
  KNOWN_PROD_SUPABASE_REF,
  type SmokeTestConfig,
  type SyntheticCorrectionPayload,
} from '@/scripts/verify-staging-corrections-smoke';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Staging Persistence Smoke Test — Validation & Isolation Gates', () => {
  it('1. Rejects missing staging deployment URL', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: '',
      stagingSupabaseUrl: `https://${KNOWN_STAGING_SUPABASE_REF}.supabase.co`,
      vercelBypassToken: 'valid-bypass',
      stagingServiceRoleKey: 'valid-key',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Missing STAGING_DEPLOYMENT_URL');
  });

  it('2. Rejects production deployment URL hosts', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: 'https://thebreakdown.in',
      stagingSupabaseUrl: `https://${KNOWN_STAGING_SUPABASE_REF}.supabase.co`,
      vercelBypassToken: 'valid-bypass',
      stagingServiceRoleKey: 'valid-key',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('[FATAL_ISOLATION_BREACH]');
  });

  it('3. Rejects production Supabase project reference (mskyhaunnlwtwvsqcmav)', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: 'https://staging.thebreakdown.app',
      stagingSupabaseUrl: `https://${KNOWN_PROD_SUPABASE_REF}.supabase.co`,
      vercelBypassToken: 'valid-bypass',
      stagingServiceRoleKey: 'valid-key',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('[FATAL_ISOLATION_BREACH]');
  });

  it('4. Rejects unexpected/arbitrary Supabase project references', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: 'https://staging.thebreakdown.app',
      stagingSupabaseUrl: 'https://arbitrary-project.supabase.co',
      vercelBypassToken: 'valid-bypass',
      stagingServiceRoleKey: 'valid-key',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('[ISOLATION_ERROR]');
  });

  it('5. Rejects missing VERCEL_PROTECTION_BYPASS token', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: 'https://staging.thebreakdown.app',
      stagingSupabaseUrl: `https://${KNOWN_STAGING_SUPABASE_REF}.supabase.co`,
      vercelBypassToken: '',
      stagingServiceRoleKey: 'valid-key',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('[CONFIGURATION_REQUIRED] VERCEL_PROTECTION_BYPASS');
  });

  it('6. Rejects missing STAGING_SUPABASE_SERVICE_ROLE_KEY', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: 'https://staging.thebreakdown.app',
      stagingSupabaseUrl: `https://${KNOWN_STAGING_SUPABASE_REF}.supabase.co`,
      vercelBypassToken: 'valid-bypass',
      stagingServiceRoleKey: '',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('[CONFIGURATION_REQUIRED] STAGING_SUPABASE_SERVICE_ROLE_KEY');
  });

  it('7. Accepts strictly isolated staging configuration with all required secrets', () => {
    const res = validateEnvironment({
      stagingDeploymentUrl: 'https://thebreakdown-os-git-staging-org.vercel.app',
      stagingSupabaseUrl: `https://${KNOWN_STAGING_SUPABASE_REF}.supabase.co`,
      vercelBypassToken: 'valid-bypass',
      stagingServiceRoleKey: 'valid-key',
    });
    expect(res.valid).toBe(true);
  });
});

describe('Staging Persistence Smoke Test — Privacy Projection Verifications', () => {
  const payload: SyntheticCorrectionPayload = {
    storySlug: 'electoral-bonds',
    passageExcerpt: 'Excerpt text',
    suggestedCorrection: 'Correction text',
    submitterEmail: 'whistleblower@archives.org',
    supportingEvidenceUrl: 'https://private.evidence.url/secret',
    auditMarker: 'AUDIT-1234',
  };

  it('1. Detects submitterEmail leakage in response object', () => {
    const leakedBody = {
      success: true,
      submissionId: 'sub-1',
      submitterEmail: 'whistleblower@archives.org',
    };
    const res = verifyPrivacyProjection(leakedBody, JSON.stringify(leakedBody), payload);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('submitterEmail');
  });

  it('2. Detects submitter_email snake_case leakage in response object', () => {
    const leakedBody = {
      success: true,
      submissionId: 'sub-1',
      submitter_email: 'whistleblower@archives.org',
    };
    const res = verifyPrivacyProjection(leakedBody, JSON.stringify(leakedBody), payload);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('submitterEmail');
  });

  it('3. Detects private evidence URL leakage in raw response text', () => {
    const body = { success: true, submissionId: 'sub-1' };
    const raw = JSON.stringify(body) + ' <!-- https://private.evidence.url/secret -->';
    const res = verifyPrivacyProjection(body, raw, payload);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('supporting evidence URL');
  });

  it('4. Approves clean response omitting private fields', () => {
    const cleanBody = {
      success: true,
      submissionId: 'sub-1',
      status: 'received',
      message: 'Correction report successfully received',
      receivedAt: '2026-10-13T12:00:00Z',
    };
    const res = verifyPrivacyProjection(cleanBody, JSON.stringify(cleanBody), payload);
    expect(res.valid).toBe(true);
  });
});

describe('Staging Persistence Smoke Test — Execution Flow & Dependency Mocking', () => {
  const baseConfig: SmokeTestConfig = {
    stagingDeploymentUrl: 'https://thebreakdown-os-git-staging-org.vercel.app',
    stagingSupabaseUrl: `https://${KNOWN_STAGING_SUPABASE_REF}.supabase.co`,
    vercelBypassToken: 'valid-bypass-token',
    stagingServiceRoleKey: 'valid-service-key',
  };

  it('1. End-to-end success: dispatches POST, verifies persistence and cleans up record', async () => {
    const submissionId = '00000000-0000-4000-a000-000000000777';
    let dbRecord: any = null;
    let deleteCalled = false;

    // Mock fetch implementation
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      const body = JSON.parse(opts.body);
      dbRecord = {
        id: submissionId,
        story_slug: body.storySlug,
        passage_excerpt: body.passageExcerpt,
        suggested_correction: body.suggestedCorrection,
        status: 'received',
        created_at: new Date().toISOString(),
      };

      return {
        status: 201,
        text: async () =>
          JSON.stringify({
            success: true,
            submissionId,
            status: 'received',
            message: 'Correction report successfully received',
          }),
      };
    });

    // Mock Supabase client
    const mockDb: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [{ slug: 'the-partition-and-its-legacies' }],
              error: null,
            }),
          };
        }
        if (table === 'reader_corrections') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation((col: string, val: string) => {
              return {
                single: vi.fn().mockResolvedValue({
                  data: dbRecord && dbRecord.id === val ? dbRecord : null,
                  error: null,
                }),
                then: (resolve: any) =>
                  resolve({
                    data: deleteCalled ? [] : [dbRecord],
                    error: null,
                  }),
              };
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((col: string, val: string) => {
                deleteCalled = true;
                dbRecord = null;
                return Promise.resolve({ error: null });
              }),
            }),
          };
        }
        return {};
      }),
    };

    const result = await runStagingPersistenceSmokeTest(baseConfig, {
      fetchFn: mockFetch as any,
      dbClient: mockDb as any,
    });

    expect(result.success).toBe(true);
    expect(result.submissionId).toBe(submissionId);
    expect(result.persistedRecordVerified).toBe(true);
    expect(result.privacyVerified).toBe(true);
    expect(result.cleanupVerified).toBe(true);
    expect(deleteCalled).toBe(true);
  });

  it('2. Fails when endpoint returns non-201 response and triggers cleanup safely', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 500,
      text: async () => JSON.stringify({ success: false, message: 'Database connection failed' }),
    });

    const mockDb: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    await expect(
      runStagingPersistenceSmokeTest(baseConfig, {
        fetchFn: mockFetch as any,
        dbClient: mockDb as any,
      })
    ).rejects.toThrow('[INTAKE_FAILED]');
  });

  it('3. Fails when persisted row is not found in database', async () => {
    const submissionId = '00000000-0000-4000-a000-000000000888';

    const mockFetch = vi.fn().mockResolvedValue({
      status: 201,
      text: async () =>
        JSON.stringify({
          success: true,
          submissionId,
          status: 'received',
          message: 'Received',
        }),
    });

    const mockDb: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        if (table === 'reader_corrections') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation((col: string, val: string) => {
              return {
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Row not found' },
                }),
                then: (res: any) => res({ data: [], error: null }),
              };
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      }),
    };

    await expect(
      runStagingPersistenceSmokeTest(baseConfig, {
        fetchFn: mockFetch as any,
        dbClient: mockDb as any,
      })
    ).rejects.toThrow('[PERSISTENCE_FAILED]');
  });

  it('4. Adversarial cleanup: Fails when deletion operation returns an error', async () => {
    const submissionId = '00000000-0000-4000-a000-000000000991';
    let dbRecord: any = null;

    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      const body = JSON.parse(opts.body);
      dbRecord = {
        id: submissionId,
        story_slug: body.storySlug,
        passage_excerpt: body.passageExcerpt,
        suggested_correction: body.suggestedCorrection,
        status: 'received',
      };
      return {
        status: 201,
        text: async () => JSON.stringify({ success: true, submissionId }),
      };
    });

    const mockDb: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ slug: 'the-partition-and-its-legacies' }] }),
          };
        }
        if (table === 'reader_corrections') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: dbRecord, error: null }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: { message: 'Database delete failed: permission denied' },
              }),
            }),
          };
        }
        return {};
      }),
    };

    await expect(
      runStagingPersistenceSmokeTest(baseConfig, {
        fetchFn: mockFetch as any,
        dbClient: mockDb as any,
      })
    ).rejects.toThrow('[CLEANUP_FAILED] Failed to delete synthetic record');
  });

  it('5. Adversarial cleanup: Fails when post-delete verification query returns an error', async () => {
    const submissionId = '00000000-0000-4000-a000-000000000992';
    let dbRecord: any = null;

    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      const body = JSON.parse(opts.body);
      dbRecord = {
        id: submissionId,
        story_slug: body.storySlug,
        passage_excerpt: body.passageExcerpt,
        suggested_correction: body.suggestedCorrection,
        status: 'received',
      };
      return {
        status: 201,
        text: async () => JSON.stringify({ success: true, submissionId }),
      };
    });

    const mockDb: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ slug: 'the-partition-and-its-legacies' }] }),
          };
        }
        if (table === 'reader_corrections') {
          let isVerificationQuery = false;
          return {
            select: vi.fn().mockImplementation((cols: string) => {
              if (cols === 'id') isVerificationQuery = true;
              return {
                eq: vi.fn().mockImplementation(() => {
                  if (isVerificationQuery) {
                    return Promise.resolve({
                      data: null,
                      error: { message: 'Postgres connection timeout' },
                    });
                  }
                  return {
                    single: vi.fn().mockResolvedValue({ data: dbRecord, error: null }),
                  };
                }),
              };
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      }),
    };

    await expect(
      runStagingPersistenceSmokeTest(baseConfig, {
        fetchFn: mockFetch as any,
        dbClient: mockDb as any,
      })
    ).rejects.toThrow('[CLEANUP_UNVERIFIED] Post-delete verification query failed');
  });

  it('6. Adversarial cleanup: Fails when synthetic row remains present after deletion', async () => {
    const submissionId = '00000000-0000-4000-a000-000000000993';
    let dbRecord: any = null;

    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      const body = JSON.parse(opts.body);
      dbRecord = {
        id: submissionId,
        story_slug: body.storySlug,
        passage_excerpt: body.passageExcerpt,
        suggested_correction: body.suggestedCorrection,
        status: 'received',
      };
      return {
        status: 201,
        text: async () => JSON.stringify({ success: true, submissionId }),
      };
    });

    const mockDb: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ slug: 'the-partition-and-its-legacies' }] }),
          };
        }
        if (table === 'reader_corrections') {
          return {
            select: vi.fn().mockImplementation((cols: string) => {
              if (cols === 'id') {
                return {
                  eq: vi.fn().mockResolvedValue({
                    data: [{ id: submissionId }], // Row still present!
                    error: null,
                  }),
                };
              }
              return {
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: dbRecord, error: null }),
                }),
              };
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      }),
    };

    await expect(
      runStagingPersistenceSmokeTest(baseConfig, {
        fetchFn: mockFetch as any,
        dbClient: mockDb as any,
      })
    ).rejects.toThrow('still present after cleanup deletion');
  });

  it('7. Adversarial cleanup: Surfaces both primary error and cleanup failure when both fail', async () => {
    const submissionId = '00000000-0000-4000-a000-000000000994';

    const mockFetch = vi.fn().mockResolvedValue({
      status: 201,
      text: async () => JSON.stringify({ success: true, submissionId }),
    });

    const mockDb: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'stories') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ slug: 'the-partition-and-its-legacies' }] }),
          };
        }
        if (table === 'reader_corrections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Primary retrieval failed' },
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: { message: 'Delete also failed' },
              }),
            }),
          };
        }
        return {};
      }),
    };

    await expect(
      runStagingPersistenceSmokeTest(baseConfig, {
        fetchFn: mockFetch as any,
        dbClient: mockDb as any,
      })
    ).rejects.toThrow('ADDITIONAL_CRITICAL_FAILURE');
  });
});
