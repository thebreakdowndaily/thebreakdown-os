import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DECOMMISSION_ALLOWLIST,
  validateDecommissionTarget,
  isDryRunMode,
  maskCredential,
  validateAccountId,
  evaluateSafetyConstraints,
  runReconciliationAudit,
} from '../scripts/reconcile-cloudflare-integration';

describe('Cloudflare Reconciliation Safety & Immutability Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('enforces dry-run mode by default when DRY_RUN is unset or empty', () => {
    expect(isDryRunMode({})).toBe(true);
    expect(isDryRunMode({ DRY_RUN: '' })).toBe(true);
    expect(isDryRunMode({ DRY_RUN: 'true' })).toBe(true);
    expect(isDryRunMode({ DRY_RUN: '1' })).toBe(true);
    expect(isDryRunMode({ DRY_RUN: 'false' })).toBe(false);
  });

  it('rejects arbitrary or wildcard project names against DECOMMISSION_ALLOWLIST', () => {
    const arbitraryProjects = [
      'thebreakdown-os',
      'the-breakdown',
      'thebreakdown',
      'production-gateway',
      '*',
      'thebreakdown-website-production',
      '../../malicious',
    ];

    for (const proj of arbitraryProjects) {
      const res = validateDecommissionTarget(proj);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('NOT in DECOMMISSION_ALLOWLIST');
    }
  });

  it('accepts only strictly allowlisted projects', () => {
    expect(DECOMMISSION_ALLOWLIST).toContain('thebreakdown-website');
    const res = validateDecommissionTarget('thebreakdown-website');
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('rejects empty, undefined, or whitespace-only target project', () => {
    expect(validateDecommissionTarget(undefined).valid).toBe(false);
    expect(validateDecommissionTarget('').valid).toBe(false);
    expect(validateDecommissionTarget('   ').valid).toBe(false);
  });

  it('evaluates safety constraints and blocks projects with production custom domains', () => {
    const evaluation = evaluateSafetyConstraints(
      'thebreakdown-website',
      ['thebreakdown.in', 'thebreakdown-website.pages.dev'],
      [],
    );

    expect(evaluation.allowed).toBe(false);
    expect(evaluation.hasCustomDomains).toBe(true);
    expect(evaluation.reason).toContain('carries active production custom domains');
  });

  it('evaluates safety constraints and blocks projects with active schedules', () => {
    const evaluation = evaluateSafetyConstraints(
      'thebreakdown-website',
      ['thebreakdown-website.pages.dev'],
      [{ cron: '0 * * * *' }],
    );

    expect(evaluation.allowed).toBe(false);
    expect(evaluation.hasActiveSchedules).toBe(true);
    expect(evaluation.reason).toContain('carries active cron schedules');
  });

  it('masks credentials safely for telemetry and audit output', () => {
    expect(maskCredential('9ae804aafd58e752d60f2d0a8adb5feb')).toBe('9ae8...5feb');
    expect(maskCredential('secret_token_1234567890')).toBe('secr...7890');
    expect(maskCredential('short')).toBe('****');
    expect(maskCredential(undefined)).toBe('****');
  });

  it('validates expected Cloudflare account identifier structure', () => {
    expect(validateAccountId('9ae804aafd58e752d60f2d0a8adb5feb')).toBe(true);
    expect(validateAccountId('unrecognized_account_123456789012')).toBe(false);
    expect(validateAccountId('')).toBe(false);
    expect(validateAccountId(undefined)).toBe(false);
  });

  it('guarantees that dry-run mode NEVER issues a DELETE request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        errors: [],
        messages: [],
        result: [{ name: 'the-breakdown', domains: [] }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await runReconciliationAudit({
      accountId: '9ae804aafd58e752d60f2d0a8adb5feb',
      token: 'mock_test_token_123456789012345',
      dryRun: true,
      targetProject: 'thebreakdown-website',
    });

    expect(result.auditStatus).toBe('HEALTHY');
    expect(fetchMock).toHaveBeenCalled();

    // Verify ZERO DELETE requests were dispatched
    for (const call of fetchMock.mock.calls) {
      const options = call[1] as RequestInit | undefined;
      expect(options?.method).not.toBe('DELETE');
    }
  });

  it('refuses execution if account ID does not match expected Cloudflare account', async () => {
    await expect(
      runReconciliationAudit({
        accountId: '11111111111111111111111111111111',
        token: 'mock_token_1234567890123456789',
        dryRun: true,
      }),
    ).rejects.toThrow("Account ID does not match expected prefix '9ae804'");
  });
});
