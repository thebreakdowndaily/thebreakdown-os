/**
 * Vercel Deployment Policy & Git Branch Allowlist Verifier
 *
 * Governing Document: AGENTS.md (Platform Beta - Deployment Hygiene & Release Integrity)
 * Purpose:
 *  - Verifies vercel.json contains explicit git.deploymentEnabled controls.
 *  - Enforces default-deny ("**": false) to protect team daily deployment quota.
 *  - Verifies explicit allowlist overrides for main, staging, dev, release/*, preview/*,
 *    and active authorized release exception branches.
 *  - Simulates and validates Vercel branch glob matching logic.
 */

import fs from 'fs';
import path from 'path';

export interface VercelCronRoute {
  path: string;
  schedule: string;
}

export interface VercelGitConfiguration {
  deploymentEnabled?: Record<string, boolean>;
}

export interface VercelConfig {
  ignoreCommand?: string;
  crons?: VercelCronRoute[];
  git?: VercelGitConfiguration;
  [key: string]: unknown;
}

export interface PolicyValidationResult {
  valid: boolean;
  errors: string[];
}

export const MANDATORY_CRON_PATHS = [
  '/api/v2/newsroom/observations/pull',
  '/api/v2/radar/poll',
];

export const MANDATORY_ALLOWLISTED_BRANCHES = [
  'main',
  'staging',
  'dev',
  'release/*',
  'preview/*',
  'fix/durable-correction-publishing-2026-10-15',
];

/**
 * Converts a Vercel git branch glob pattern into a regular expression.
 * - '**' matches any characters including slashes
 * - '*' matches characters within a single segment (no slashes)
 * - Exact characters are escaped
 */
export function branchPatternToRegex(pattern: string): RegExp {
  // If pattern is '**', match anything
  if (pattern === '**') {
    return /^.*$/;
  }

  // Tokenize wildcard markers to avoid double-escaping
  const DOUBLE_STAR = '___DOUBLE_STAR___';
  const SINGLE_STAR = '___SINGLE_STAR___';

  let tokenized = pattern
    .replace(/\*\*/g, DOUBLE_STAR)
    .replace(/\*/g, SINGLE_STAR);

  // Escape special regex characters in the remaining literal text
  const escaped = tokenized.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // Replace tokens with appropriate regex patterns
  const regexStr = escaped
    .replace(new RegExp(DOUBLE_STAR, 'g'), '.*')
    .replace(new RegExp(SINGLE_STAR, 'g'), '[^/]+');

  return new RegExp(`^${regexStr}$`);
}

/**
 * Determines whether automatic Vercel deployment is enabled for a given branch name.
 * 
 * Vercel Evaluation Order:
 * 1. Exact match has highest precedence.
 * 2. Specific glob patterns (e.g. preview/*, release/*) have secondary precedence.
 * 3. General catch-all '**' pattern provides fallback.
 * 4. If no rules exist, Vercel defaults to true.
 */
export function isBranchDeploymentEnabled(
  branch: string,
  config?: VercelConfig
): boolean {
  if (!config || !config.git || !config.git.deploymentEnabled) {
    return true; // Unrestricted default
  }

  const rules = config.git.deploymentEnabled;

  // 1. Exact literal match
  if (Object.prototype.hasOwnProperty.call(rules, branch)) {
    return Boolean(rules[branch]);
  }

  // 2. Specific globs (not '**')
  for (const [pattern, enabled] of Object.entries(rules)) {
    if (pattern === '**' || pattern === branch) continue;
    const regex = branchPatternToRegex(pattern);
    if (regex.test(branch)) {
      return Boolean(enabled);
    }
  }

  // 3. Fallback catch-all '**'
  if (Object.prototype.hasOwnProperty.call(rules, '**')) {
    return Boolean(rules['**']);
  }

  return true;
}

/**
 * Validates the contents of vercel.json against release hygiene requirements.
 */
export function validateVercelConfig(config: VercelConfig): PolicyValidationResult {
  const errors: string[] = [];

  if (!config.ignoreCommand || typeof config.ignoreCommand !== 'string') {
    errors.push('Missing or invalid ignoreCommand in vercel.json');
  } else if (!config.ignoreCommand.includes('scripts/vercel-ignore-build.js')) {
    errors.push(`ignoreCommand must invoke scripts/vercel-ignore-build.js (found: "${config.ignoreCommand}")`);
  }

  if (!Array.isArray(config.crons) || config.crons.length === 0) {
    errors.push('Missing or empty crons array in vercel.json');
  } else {
    for (const mandatoryPath of MANDATORY_CRON_PATHS) {
      const found = config.crons.find((c) => c.path === mandatoryPath);
      if (!found) {
        errors.push(`Missing mandatory cron route for: ${mandatoryPath}`);
      }
    }
  }

  if (!config.git || !config.git.deploymentEnabled) {
    errors.push('Missing git.deploymentEnabled configuration in vercel.json');
  } else {
    const rules = config.git.deploymentEnabled;
    if (rules['**'] !== false) {
      errors.push('git.deploymentEnabled must specify "**": false to prevent quota exhaustion from unauthorized branches');
    }

    for (const reqBranch of MANDATORY_ALLOWLISTED_BRANCHES) {
      if (rules[reqBranch] !== true) {
        errors.push(`git.deploymentEnabled must explicitly enable: "${reqBranch}": true`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Loads vercel.json from project root and executes verification audit.
 */
export function runVercelPolicyAudit(projectRoot = process.cwd()): {
  success: boolean;
  errors: string[];
} {
  const vercelJsonPath = path.resolve(projectRoot, 'vercel.json');

  if (!fs.existsSync(vercelJsonPath)) {
    return {
      success: false,
      errors: [`vercel.json not found at ${vercelJsonPath}`],
    };
  }

  let config: VercelConfig;
  try {
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    config = JSON.parse(raw) as VercelConfig;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      errors: [`Failed to parse vercel.json: ${message}`],
    };
  }

  const validation = validateVercelConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Test standard branches
  const shouldBeAllowed = [
    'main',
    'staging',
    'dev',
    'preview/pr-ui-test',
    'preview/header-redesign',
    'release/v1.0.0',
    'release/beta-2',
    'fix/durable-correction-publishing-2026-10-15',
  ];

  const shouldBeBlocked = [
    'mission/post-merge-verification-2026-10-16',
    'chore/vercel-branch-deployment-policy-2026-10-15',
    'dependabot/npm_and_yarn/types/node-26.6.5',
    'feat/new-dashboard',
    'fix/random-bugfix',
    'experiment/ai-agents',
    'random-scratch-branch',
  ];

  const evaluationErrors: string[] = [];

  for (const branch of shouldBeAllowed) {
    if (!isBranchDeploymentEnabled(branch, config)) {
      evaluationErrors.push(`Branch '${branch}' was expected to be ALLOWED, but evaluated to BLOCKED`);
    }
  }

  for (const branch of shouldBeBlocked) {
    if (isBranchDeploymentEnabled(branch, config)) {
      evaluationErrors.push(`Branch '${branch}' was expected to be BLOCKED, but evaluated to ALLOWED`);
    }
  }

  if (evaluationErrors.length > 0) {
    return {
      success: false,
      errors: evaluationErrors,
    };
  }

  return {
    success: true,
    errors: [],
  };
}

if (process.argv[1] && process.argv[1].endsWith('verify-vercel-policy.ts')) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('VERCEL DEPLOYMENT POLICY & QUOTA PROTECTION AUDIT');
  console.log('═══════════════════════════════════════════════════════════');

  const result = runVercelPolicyAudit();
  if (result.success) {
    console.log('✓ vercel.json policy validated successfully.');
    console.log('✓ Default-deny ("**": false) is active.');
    console.log('✓ Explicit allowlists verified for main, staging, dev, preview/*, release/*, and durable corrections.');
    console.log('✓ Non-allowlisted task and bot branches are confirmed suppressed.');
    process.exit(0);
  } else {
    console.error('❌ Vercel policy audit failed:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}
