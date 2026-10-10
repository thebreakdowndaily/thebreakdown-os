/**
 * Production & Staging Edge Deployment Health Verification Script
 *
 * Governing Document: AGENTS.md (Operating Doctrine - Platform Beta)
 * Purpose:
 *  - Verifies live deployment health over HTTP/HTTPS.
 *  - Distinguishes liveness and readiness from edge SSO interception.
 *  - Enforces mandatory commit-SHA parity against the expected release revision.
 *  - Strictly classifies Vercel SSO redirects as PROTECTED_BUT_UNVERIFIED.
 *  - Fails closed with non-zero exit code if health verification fails.
 */

export interface HealthResponse {
  status: string;
  check?: string;
  timestamp: string;
  commitSha?: string;
  version?: string;
  subsystems?: Record<string, string>;
  uptimeSeconds?: number;
}

export type DeploymentHealthState =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'UNHEALTHY'
  | 'NOT_READY'
  | 'MISMATCHED_REVISION'
  | 'MISSING_REVISION'
  | 'PROTECTED_BUT_UNVERIFIED'
  | 'ERROR';

export interface VerificationOptions {
  baseUrl?: string;
  expectedCommit?: string;
  maxAttempts?: number;
  intervalMs?: number;
  timeoutMs?: number;
  checkCommitParity?: boolean;
  bypassToken?: string;
}

export function parseArgs(args: string[]): VerificationOptions {
  const options: VerificationOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      options.baseUrl = args[++i];
    } else if (arg === '--commit' && args[i + 1]) {
      options.expectedCommit = args[++i];
      // Supplying --commit enables exact deployment-revision verification
      options.checkCommitParity = true;
    } else if (arg === '--attempts' && args[i + 1]) {
      options.maxAttempts = parseInt(args[++i], 10);
    } else if (arg === '--interval' && args[i + 1]) {
      options.intervalMs = parseInt(args[++i], 10) * 1000;
    } else if (arg === '--bypass-token' && args[i + 1]) {
      options.bypassToken = args[++i];
    } else if (arg === '--strict-commit') {
      options.checkCommitParity = true;
    }
  }
  return options;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskSecret(val?: string): string {
  if (!val || val.length < 8) return '****';
  return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
}

export async function verifyDeployment(opts: VerificationOptions = {}): Promise<{
  success: boolean;
  state: DeploymentHealthState;
  health: HealthResponse;
  homepageStatus: number;
  newsroomRedirectStatus: number;
  hstsPresent: boolean;
}> {
  const baseUrl = (opts.baseUrl || process.env.DEPLOYMENT_URL || 'https://thebreakdown.in').replace(/\/+$/, '');
  const expectedCommit = opts.expectedCommit || process.env.EXPECTED_COMMIT_SHA || process.env.GITHUB_SHA;
  // If expectedCommit is supplied via opts or env, checkCommitParity is enabled
  const checkCommitParity = opts.checkCommitParity ?? Boolean(expectedCommit);
  const maxAttempts = opts.maxAttempts || 30;
  const intervalMs = opts.intervalMs || 10000;
  const timeoutMs = opts.timeoutMs || 15000;
  const bypassToken = opts.bypassToken || process.env.VERCEL_PROTECTION_BYPASS || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('EDGE DEPLOYMENT HEALTH VERIFICATION');
  console.log(`Target URL:      ${baseUrl}`);
  console.log(`Expected Commit: ${expectedCommit ? expectedCommit.substring(0, 7) : 'any'}`);
  console.log(`Commit Parity:   ${checkCommitParity ? 'MANDATORY' : 'OPTIONAL'}`);
  console.log(`Max Retries:     ${maxAttempts} (Interval: ${intervalMs / 1000}s)`);
  console.log(`Bypass Token:    ${bypassToken ? maskSecret(bypassToken) : 'None'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const requestHeaders: Record<string, string> = {
    'User-Agent': 'TheBreakdown-DeploymentHealthVerifier/1.0',
    'Accept': 'application/json',
  };
  if (bypassToken) {
    requestHeaders['x-vercel-protection-bypass'] = bypassToken;
  }

  let currentState: DeploymentHealthState = 'NOT_READY';
  let lastErrorDetail = '';
  let healthyData: HealthResponse | null = null;

  // 1. Polling /api/health
  console.log(`[1/3] Probing health endpoint: ${baseUrl}/api/health`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: requestHeaders,
        redirect: 'manual',
      });

      const locationHeader = res.headers.get('location') || '';

      // Check for Vercel SSO / Edge protection interception
      const isSsoRedirect =
        (res.status === 302 || res.status === 307) &&
        (locationHeader.includes('vercel.com/sso') || locationHeader.includes('sso-api'));

      if (isSsoRedirect) {
        currentState = 'PROTECTED_BUT_UNVERIFIED';
        lastErrorDetail =
          'Vercel SSO intercept (302 -> SSO). Application health and commit SHA cannot be verified without a valid Vercel protection-bypass token.';
        console.log(
          `[Attempt ${attempt}/${maxAttempts}] State: PROTECTED_BUT_UNVERIFIED. Request redirected to SSO at ${locationHeader.substring(0, 50)}...`,
        );

        if (attempt < maxAttempts) {
          await delay(intervalMs);
        }
        continue;
      }

      if (res.status === 200) {
        const rawText = await res.text();
        let data: HealthResponse;
        try {
          data = JSON.parse(rawText) as HealthResponse;
        } catch {
          currentState = 'NOT_READY';
          lastErrorDetail = `Malformed non-JSON response from /api/health: ${rawText.substring(0, 80)}`;
          console.log(`[Attempt ${attempt}/${maxAttempts}] State: NOT_READY (${lastErrorDetail}). Retrying...`);
          if (attempt < maxAttempts) await delay(intervalMs);
          continue;
        }

        if (data.status !== 'healthy' && data.status !== 'live') {
          currentState = 'DEGRADED';
          lastErrorDetail = `Health check reported '${data.status}'`;
          console.log(`[Attempt ${attempt}/${maxAttempts}] State: DEGRADED (${lastErrorDetail}). Retrying...`);
          if (attempt < maxAttempts) await delay(intervalMs);
          continue;
        }

        // Commit SHA Parity Enforcement
        if (checkCommitParity && expectedCommit) {
          const deployedSha = (data.commitSha || '').trim();
          if (!deployedSha || deployedSha === 'unspecified' || deployedSha === 'unknown') {
            currentState = 'MISSING_REVISION';
            lastErrorDetail = `Deployed application returned missing or undefined commitSha (got: '${deployedSha}')`;
            console.log(`[Attempt ${attempt}/${maxAttempts}] State: MISSING_REVISION (${lastErrorDetail}). Retrying...`);
            if (attempt < maxAttempts) await delay(intervalMs);
            continue;
          }

          const shortExpected = expectedCommit.trim().substring(0, 7).toLowerCase();
          const shortDeployed = deployedSha.substring(0, 7).toLowerCase();

          if (shortDeployed !== shortExpected && deployedSha.toLowerCase() !== expectedCommit.toLowerCase()) {
            currentState = 'MISMATCHED_REVISION';
            lastErrorDetail = `Expected revision ${shortExpected}, but edge reported revision ${shortDeployed}`;
            console.log(`[Attempt ${attempt}/${maxAttempts}] State: MISMATCHED_REVISION (${lastErrorDetail}). Still deploying...`);
            if (attempt < maxAttempts) await delay(intervalMs);
            continue;
          }
        }

        // Verified real application response
        currentState = 'HEALTHY';
        healthyData = data;
        console.log(`✓ Real application health verified 200 OK (Attempt ${attempt}/${maxAttempts})`);
        console.log(`  - Status:     ${data.status}`);
        console.log(`  - Check Type: ${data.check || 'readiness'}`);
        console.log(`  - Commit SHA: ${data.commitSha || 'unspecified'}`);
        if (data.subsystems) {
          console.log(`  - Subsystems: ${JSON.stringify(data.subsystems)}`);
        }
        break;
      } else {
        currentState = 'NOT_READY';
        lastErrorDetail = `Health endpoint returned HTTP ${res.status}`;
        console.log(`[Attempt ${attempt}/${maxAttempts}] State: NOT_READY (${lastErrorDetail}). Retrying...`);
      }
    } catch (err: any) {
      currentState = 'ERROR';
      lastErrorDetail = err.message;
      console.log(`[Attempt ${attempt}/${maxAttempts}] State: ERROR (${lastErrorDetail}). Retrying...`);
    }

    if (attempt < maxAttempts) {
      await delay(intervalMs);
    }
  }

  if (currentState === 'PROTECTED_BUT_UNVERIFIED') {
    throw new Error(
      `Application-verification gate failed: Deployment is protected by Vercel SSO (PROTECTED_BUT_UNVERIFIED). Cannot verify real application health or commit SHA without an approved protection-bypass credential.`,
    );
  }

  if (currentState === 'MISMATCHED_REVISION') {
    throw new Error(
      `Deployment verification failed: Commit SHA mismatch after ${maxAttempts} attempts. Expected revision '${expectedCommit?.substring(0, 7)}', but edge reported '${lastErrorDetail}'.`,
    );
  }

  if (currentState === 'MISSING_REVISION') {
    throw new Error(
      `Strict release verification failed: Deployed application returned missing commit SHA (${lastErrorDetail}).`,
    );
  }

  if (!healthyData || currentState !== 'HEALTHY') {
    throw new Error(`Deployment health verification failed after ${maxAttempts} attempts: ${lastErrorDetail}`);
  }

  // 2. Verify Canonical Homepage & Security Headers
  console.log(`\n[2/3] Probing canonical homepage: ${baseUrl}/`);
  const homeRes = await fetch(`${baseUrl}/`, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: requestHeaders,
    redirect: 'manual',
  });

  if (homeRes.status !== 200) {
    throw new Error(`Homepage check failed: expected HTTP 200, got ${homeRes.status}`);
  }
  const hstsHeader = homeRes.headers.get('strict-transport-security') || '';
  const hstsPresent = hstsHeader.includes('max-age');
  console.log(`✓ Homepage edge reachability confirmed: HTTP 200 (HSTS: ${hstsPresent ? 'Present' : 'Not Present'})`);

  // 3. Verify Edge Middleware Security Gate (/newsroom redirect)
  console.log(`\n[3/3] Probing protected route: ${baseUrl}/newsroom`);
  const newsroomRes = await fetch(`${baseUrl}/newsroom`, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: requestHeaders,
    redirect: 'manual',
  });
  const redirectLoc = newsroomRes.headers.get('location') || '';
  const isRedirect = newsroomRes.status === 307 || newsroomRes.status === 308 || newsroomRes.status === 302;
  const redirectsToLogin = redirectLoc.includes('/login');

  if (!isRedirect || !redirectsToLogin) {
    throw new Error(
      `Protected route verification failed: expected redirect to /login, got HTTP ${newsroomRes.status} Location: '${redirectLoc}'`,
    );
  }
  console.log(`✓ Protected route correctly enforced: HTTP ${newsroomRes.status} -> ${redirectLoc}`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ ALL DEPLOYMENT HEALTH CHECKS PASSED');
  console.log('═══════════════════════════════════════════════════════════\n');

  return {
    success: true,
    state: currentState,
    health: healthyData,
    homepageStatus: homeRes.status,
    newsroomRedirectStatus: newsroomRes.status,
    hstsPresent,
  };
}

const isDirectCliExecution =
  (typeof require !== 'undefined' && require.main === module) ||
  (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('verify-deployment-health.ts'));

if (isDirectCliExecution) {
  const cliOptions = parseArgs(process.argv.slice(2));
  verifyDeployment(cliOptions).catch((err) => {
    console.error('\n❌ Deployment verification failed:', err.message);
    process.exit(1);
  });
}
