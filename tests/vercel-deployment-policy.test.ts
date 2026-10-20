import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  branchPatternToRegex,
  isBranchDeploymentEnabled,
  validateVercelConfig,
  VercelConfig,
  MANDATORY_CRON_PATHS,
  MANDATORY_ALLOWLISTED_BRANCHES,
} from '../scripts/verify-vercel-policy';

describe('Vercel Deployment Policy & Git Allowlist Suite', () => {
  const vercelJsonPath = path.resolve(__dirname, '../vercel.json');
  let currentConfig: VercelConfig;

  it('loads and parses vercel.json successfully', () => {
    expect(fs.existsSync(vercelJsonPath)).toBe(true);
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    currentConfig = JSON.parse(raw) as VercelConfig;
    expect(currentConfig).toBeDefined();
    expect(typeof currentConfig).toBe('object');
  });

  it('preserves ignoreCommand pointing to vercel-ignore-build.js', () => {
    expect(currentConfig.ignoreCommand).toBe('node scripts/vercel-ignore-build.js');
  });

  it('preserves all mandatory production crons', () => {
    expect(Array.isArray(currentConfig.crons)).toBe(true);
    const paths = (currentConfig.crons ?? []).map((c) => c.path);
    for (const mandatoryPath of MANDATORY_CRON_PATHS) {
      expect(paths).toContain(mandatoryPath);
    }
  });

  it('enforces default-deny ("**": false) on git.deploymentEnabled', () => {
    expect(currentConfig.git).toBeDefined();
    expect(currentConfig.git?.deploymentEnabled).toBeDefined();
    expect(currentConfig.git?.deploymentEnabled?.['**']).toBe(false);
  });

  it('contains explicit allowlist entries for all required branches', () => {
    const rules = currentConfig.git?.deploymentEnabled ?? {};
    for (const branch of MANDATORY_ALLOWLISTED_BRANCHES) {
      expect(rules[branch]).toBe(true);
    }
  });

  it('validates canonical vercel.json passes validateVercelConfig with zero errors', () => {
    const result = validateVercelConfig(currentConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  describe('branchPatternToRegex conversion', () => {
    it('matches catch-all "**" to everything', () => {
      const regex = branchPatternToRegex('**');
      expect(regex.test('main')).toBe(true);
      expect(regex.test('preview/my-branch')).toBe(true);
      expect(regex.test('dependabot/npm_and_yarn/foo')).toBe(true);
    });

    it('matches single wildcard "*" within branch name segment', () => {
      const regex = branchPatternToRegex('preview/*');
      expect(regex.test('preview/ui')).toBe(true);
      expect(regex.test('preview/auth-flow-2026')).toBe(true);
      expect(regex.test('preview')).toBe(false);
      expect(regex.test('other/ui')).toBe(false);
    });

    it('matches exact branch literals', () => {
      const regex = branchPatternToRegex('main');
      expect(regex.test('main')).toBe(true);
      expect(regex.test('main-2')).toBe(false);
      expect(regex.test('feature/main')).toBe(false);
    });
  });

  describe('isBranchDeploymentEnabled evaluation logic', () => {
    it('enables automatic deployment for production release branch (main)', () => {
      expect(isBranchDeploymentEnabled('main', currentConfig)).toBe(true);
    });

    it('enables automatic deployment for staging and dev', () => {
      expect(isBranchDeploymentEnabled('staging', currentConfig)).toBe(true);
      expect(isBranchDeploymentEnabled('dev', currentConfig)).toBe(true);
    });

    it('enables automatic deployment for preview/* branches', () => {
      expect(isBranchDeploymentEnabled('preview/login-redesign', currentConfig)).toBe(true);
      expect(isBranchDeploymentEnabled('preview/issue-86', currentConfig)).toBe(true);
    });

    it('enables automatic deployment for release/* branches', () => {
      expect(isBranchDeploymentEnabled('release/v1.0.0', currentConfig)).toBe(true);
      expect(isBranchDeploymentEnabled('release/v1.0.1-rc1', currentConfig)).toBe(true);
    });

    it('enables automatic deployment for the authorized durable correction exception', () => {
      expect(
        isBranchDeploymentEnabled(
          'fix/durable-correction-publishing-2026-10-15',
          currentConfig
        )
      ).toBe(true);
    });

    it('blocks automatic deployment for documentation and mission branches', () => {
      expect(
        isBranchDeploymentEnabled('mission/post-merge-verification-2026-10-16', currentConfig)
      ).toBe(false);
      expect(
        isBranchDeploymentEnabled('mission/full-system-repair-2026-10-16', currentConfig)
      ).toBe(false);
    });

    it('blocks automatic deployment for chore and feature branches', () => {
      expect(
        isBranchDeploymentEnabled('chore/vercel-branch-deployment-policy-2026-10-15', currentConfig)
      ).toBe(false);
      expect(
        isBranchDeploymentEnabled('feat/knowledge-graph-v2', currentConfig)
      ).toBe(false);
    });

    it('blocks automatic deployment for Dependabot branches to preserve daily quota', () => {
      expect(
        isBranchDeploymentEnabled(
          'dependabot/npm_and_yarn/types/node-26.6.5',
          currentConfig
        )
      ).toBe(false);
      expect(
        isBranchDeploymentEnabled(
          'dependabot/npm_and_yarn/audit/typescript-7.0.2',
          currentConfig
        )
      ).toBe(false);
    });

    it('blocks arbitrary or unlisted branches by default', () => {
      expect(isBranchDeploymentEnabled('fix/quick-bug', currentConfig)).toBe(false);
      expect(isBranchDeploymentEnabled('test-branch', currentConfig)).toBe(false);
      expect(isBranchDeploymentEnabled('random-push', currentConfig)).toBe(false);
    });

    it('enables deployment when any matching Vercel rule is true', () => {
      const overlapping: VercelConfig = {
        git: {
          deploymentEnabled: {
            '**': false,
            'feature/*': false,
            'feature/approved': true,
          },
        },
      };

      expect(isBranchDeploymentEnabled('feature/approved', overlapping)).toBe(true);
      expect(isBranchDeploymentEnabled('feature/blocked', overlapping)).toBe(false);
    });

    it('defaults to enabled when no configured branch pattern matches', () => {
      const config: VercelConfig = {
        git: { deploymentEnabled: { 'release/*': false } },
      };
      expect(isBranchDeploymentEnabled('main', config)).toBe(true);
    });

    it('falls back to true if no git.deploymentEnabled configuration exists', () => {
      const unconfigured: VercelConfig = {
        ignoreCommand: 'node scripts/vercel-ignore-build.js',
      };
      expect(isBranchDeploymentEnabled('any-branch', unconfigured)).toBe(true);
    });
  });

  describe('validateVercelConfig error checking', () => {
    it('flags missing ignoreCommand', () => {
      const config: VercelConfig = {
        crons: [{ path: '/api/v2/radar/poll', schedule: '0 18 * * *' }],
        git: { deploymentEnabled: { '**': false } },
      };
      const res = validateVercelConfig(config);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('ignoreCommand'))).toBe(true);
    });

    it('flags missing "**": false default deny', () => {
      const config: VercelConfig = {
        ignoreCommand: 'node scripts/vercel-ignore-build.js',
        crons: [
          { path: '/api/v2/newsroom/observations/pull', schedule: '0 6 * * *' },
          { path: '/api/v2/radar/poll', schedule: '0 18 * * *' },
        ],
        git: {
          deploymentEnabled: {
            main: true,
          },
        },
      };
      const res = validateVercelConfig(config);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('"**": false'))).toBe(true);
    });

    it('flags missing mandatory cron paths', () => {
      const config: VercelConfig = {
        ignoreCommand: 'node scripts/vercel-ignore-build.js',
        crons: [{ path: '/some/other/path', schedule: '0 0 * * *' }],
        git: { deploymentEnabled: { '**': false } },
      };
      const res = validateVercelConfig(config);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('/api/v2/newsroom/observations/pull'))).toBe(true);
    });
  });
});
