/**
 * Cloudflare Worker & Pages Integration Safe Reconciliation & Audit Engine
 *
 * Governing Document: AGENTS.md (Operating Doctrine - Platform Beta)
 * Safety Standards:
 *  - READ-ONLY AND DRY-RUN BY DEFAULT
 *  - STRICT PROJECT DECOMMISSION ALLOWLIST
 *  - ZERO ARBITRARY OR WILDCARD DELETIONS
 *  - LEAST-PRIVILEGE CREDENTIAL MASKING (Zero Secret Exposure)
 *  - RE-ENTRANT AND IDEMPOTENT VERIFICATION
 */

export const EXPECTED_CLOUDFLARE_ACCOUNT_PREFIX = '9ae804';
export const EXPECTED_CLOUDFLARE_ACCOUNT_LENGTH = 32;

/**
 * Explicit allowlist of projects eligible for decommissioning.
 * Any project NOT in this allowlist is strictly protected and cannot be deleted.
 */
export const DECOMMISSION_ALLOWLIST = Object.freeze([
  'thebreakdown-website',
] as const);

export type AllowedProject = typeof DECOMMISSION_ALLOWLIST[number];

export interface ProjectSafetyEvaluation {
  allowed: boolean;
  reason?: string;
  hasCustomDomains: boolean;
  hasActiveSchedules: boolean;
}

/**
 * Validates that a requested target project is explicitly allowlisted.
 */
export function validateDecommissionTarget(targetProject?: string): { valid: boolean; error?: string } {
  if (!targetProject || targetProject.trim() === '') {
    return { valid: false, error: 'No target project specified.' };
  }
  const normalized = targetProject.trim();
  if (!DECOMMISSION_ALLOWLIST.includes(normalized as AllowedProject)) {
    return {
      valid: false,
      error: `Project '${normalized}' is NOT in DECOMMISSION_ALLOWLIST. Disallowed.`,
    };
  }
  return { valid: true };
}

/**
 * Evaluates whether an ordinary run is dry-run mode.
 * Safe default: True unless explicitly and strictly set to 'false'.
 */
export function isDryRunMode(env: Record<string, string | undefined> = process.env): boolean {
  return env.DRY_RUN !== 'false';
}

/**
 * Masks credentials for logging.
 */
export function maskCredential(val?: string): string {
  if (!val || val.length < 8) return '****';
  return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
}

/**
 * Validates account identifier structure.
 */
export function validateAccountId(accountId?: string): boolean {
  if (!accountId) return false;
  return accountId.startsWith(EXPECTED_CLOUDFLARE_ACCOUNT_PREFIX) && accountId.length === EXPECTED_CLOUDFLARE_ACCOUNT_LENGTH;
}

/**
 * Verifies safety constraints for a given project before any deletion could ever be permitted.
 */
export function evaluateSafetyConstraints(
  projectName: string,
  domains: string[] = [],
  schedules: any[] = [],
): ProjectSafetyEvaluation {
  const targetCheck = validateDecommissionTarget(projectName);
  if (!targetCheck.valid) {
    return {
      allowed: false,
      reason: targetCheck.error,
      hasCustomDomains: false,
      hasActiveSchedules: false,
    };
  }

  // Ensure no production custom domain on thebreakdown.in is attached
  const hasCustomDomains = domains.some((d) => !d.endsWith('.pages.dev') && !d.endsWith('.workers.dev'));
  if (hasCustomDomains) {
    return {
      allowed: false,
      reason: `Project '${projectName}' carries active production custom domains: ${domains.join(', ')}`,
      hasCustomDomains: true,
      hasActiveSchedules: false,
    };
  }

  // Ensure no active schedules / crons exist
  const hasActiveSchedules = Array.isArray(schedules) && schedules.length > 0;
  if (hasActiveSchedules) {
    return {
      allowed: false,
      reason: `Project '${projectName}' carries active cron schedules.`,
      hasCustomDomains: false,
      hasActiveSchedules: true,
    };
  }

  return {
    allowed: true,
    hasCustomDomains: false,
    hasActiveSchedules: false,
  };
}

interface CloudflareApiResponse<T = any> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
}

async function cfFetch<T = any>(
  accountId: string,
  token: string,
  endpoint: string,
  options: RequestInit = {},
): Promise<CloudflareApiResponse<T>> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  return (await res.json()) as CloudflareApiResponse<T>;
}

export async function runReconciliationAudit(options: {
  accountId?: string;
  token?: string;
  dryRun?: boolean;
  targetProject?: string;
} = {}): Promise<{
  auditStatus: 'HEALTHY' | 'DEGRADED' | 'MUTATION_EXECUTED';
  pagesProjects: string[];
  workerScripts: string[];
  websiteProjectPresent: boolean;
  osWorkerPresent: boolean;
}> {
  const accountId = options.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = options.token || process.env.CLOUDFLARE_API_TOKEN;
  const dryRun = options.dryRun !== undefined ? options.dryRun : isDryRunMode();
  const targetProject = options.targetProject || process.env.TARGET_PROJECT || '';

  if (!accountId || !token) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in environment.');
  }

  if (!validateAccountId(accountId)) {
    throw new Error(`Refusing execution: Account ID does not match expected prefix '${EXPECTED_CLOUDFLARE_ACCOUNT_PREFIX}'.`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('CLOUDFLARE INTEGRATION AUDIT & SAFETY RECONCILIATION');
  console.log(`Account: ${maskCredential(accountId)}`);
  console.log(`Execution Mode: ${dryRun ? 'DRY-RUN (READ-ONLY AUDIT)' : 'ARMED MUTATION MODE'}`);
  console.log(`Allowlisted Targets: ${DECOMMISSION_ALLOWLIST.join(', ')}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Audit Pages Projects
  console.log('── 1. Auditing Cloudflare Pages Projects ──');
  const pagesRes = await cfFetch<Array<{ name: string; domains: string[] }>>(
    accountId,
    token,
    '/pages/projects',
  );

  const pagesProjects = pagesRes.result?.map((p) => p.name) || [];
  console.log(`Active Pages Projects (${pagesProjects.length}): ${pagesProjects.join(', ') || 'None'}`);

  const websiteProjectPresent = pagesProjects.includes('thebreakdown-website');
  if (websiteProjectPresent) {
    console.warn(`[WARN]: Obsolete project 'thebreakdown-website' is currently PRESENT.`);
  } else {
    console.log(`✓ Confirmed: Obsolete project 'thebreakdown-website' is ABSENT.`);
  }

  // 2. Audit Worker Scripts
  console.log('\n── 2. Auditing Cloudflare Worker Scripts ──');
  const scriptsRes = await cfFetch<Array<{ id: string }>>(
    accountId,
    token,
    '/workers/scripts',
  );

  const workerScripts = scriptsRes.result?.map((s) => s.id) || [];
  console.log(`Active Worker Scripts (${workerScripts.length}): ${workerScripts.join(', ') || 'None'}`);

  const osWorkerPresent = workerScripts.includes('thebreakdown-os');
  console.log(`Status of production worker 'thebreakdown-os': ${osWorkerPresent ? 'PRESENT & PROTECTED' : 'NOT FOUND IN SCRIPTS'}`);

  // 3. Conditional Decommissioning Check (Only in armed, non-dry-run mode)
  if (!dryRun) {
    console.log('\n── 3. Evaluating Armed Decommissioning Request ──');
    const targetCheck = validateDecommissionTarget(targetProject);
    if (!targetCheck.valid) {
      throw new Error(`Execution halted: ${targetCheck.error}`);
    }

    if (!websiteProjectPresent) {
      console.log(`Target '${targetProject}' is already absent. No action required.`);
      return {
        auditStatus: 'HEALTHY',
        pagesProjects,
        workerScripts,
        websiteProjectPresent,
        osWorkerPresent,
      };
    }

    // Double check safety constraints before execution
    const projectDetail = await cfFetch<any>(accountId, token, `/pages/projects/${targetProject}`);
    const domains = projectDetail.result?.domains || [];
    const evaluation = evaluateSafetyConstraints(targetProject, domains);

    if (!evaluation.allowed) {
      throw new Error(`Safety constraint violation: ${evaluation.reason}`);
    }

    console.log(`Executing authenticated decommissioning for allowlisted target: '${targetProject}'...`);
    const delRes = await cfFetch(accountId, token, `/pages/projects/${targetProject}`, { method: 'DELETE' });
    if (!delRes.success) {
      throw new Error(`Decommission API call failed: ${JSON.stringify(delRes.errors)}`);
    }
    console.log(`✓ Successfully decommissioned '${targetProject}'.`);
    return {
      auditStatus: 'MUTATION_EXECUTED',
      pagesProjects: pagesProjects.filter((p) => p !== targetProject),
      workerScripts,
      websiteProjectPresent: false,
      osWorkerPresent,
    };
  }

  console.log('\n✓ Dry-run read-only audit complete. No mutations performed.');
  return {
    auditStatus: websiteProjectPresent ? 'DEGRADED' : 'HEALTHY',
    pagesProjects,
    workerScripts,
    websiteProjectPresent,
    osWorkerPresent,
  };
}

const isDirectCliExecution =
  (typeof require !== 'undefined' && require.main === module) ||
  (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('reconcile-cloudflare-integration.ts'));

if (isDirectCliExecution) {
  runReconciliationAudit().catch((err) => {
    console.error('Fatal reconciliation audit failure:', err.message);
    process.exit(1);
  });
}
