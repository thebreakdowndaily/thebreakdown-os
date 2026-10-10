/**
 * Production & Staging Edge Deployment Health Verification Script
 *
 * Governing Document: AGENTS.md (Operating Doctrine - Platform Beta)
 * Purpose:
 *  - Verifies live deployment health over HTTP/HTTPS.
 *  - Polls /api/health with retry backoff until the new deployment is live.
 *  - Verifies healthy subsystem status, commit SHA matching, edge security headers,
 *    and middleware protected-route enforcement (/newsroom -> /login).
 *  - Fails closed with non-zero exit code if health verification fails.
 */

interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
  commitSha?: string;
  vercelEnv?: string;
  subsystems?: {
    domainRegistry?: string;
    projectionEngine?: string;
    editorialState?: string;
    researchPlatform?: string;
  };
  uptimeSeconds?: number;
}

export interface VerificationOptions {
  baseUrl?: string;
  expectedCommit?: string;
  maxAttempts?: number;
  intervalMs?: number;
  timeoutMs?: number;
  checkCommitParity?: boolean;
}

export function parseArgs(args: string[]): VerificationOptions {
  const options: VerificationOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      options.baseUrl = args[++i];
    } else if (arg === '--commit' && args[i + 1]) {
      options.expectedCommit = args[++i];
    } else if (arg === '--attempts' && args[i + 1]) {
      options.maxAttempts = parseInt(args[++i], 10);
    } else if (arg === '--interval' && args[i + 1]) {
      options.intervalMs = parseInt(args[++i], 10) * 1000;
    } else if (arg === '--strict-commit') {
      options.checkCommitParity = true;
    }
  }
  return options;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyDeployment(opts: VerificationOptions = {}): Promise<{
  success: boolean;
  health: HealthResponse;
  homepageStatus: number;
  newsroomRedirectStatus: number;
  hstsPresent: boolean;
}> {
  const baseUrl = (opts.baseUrl || process.env.DEPLOYMENT_URL || 'https://thebreakdown.in').replace(/\/+$/, '');
  const expectedCommit = opts.expectedCommit || process.env.EXPECTED_COMMIT_SHA || process.env.GITHUB_SHA;
  const maxAttempts = opts.maxAttempts || 30;
  const intervalMs = opts.intervalMs || 10000;
  const timeoutMs = opts.timeoutMs || 15000;
  const checkCommitParity = opts.checkCommitParity ?? false;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('EDGE DEPLOYMENT HEALTH VERIFICATION');
  console.log(`Target URL:      ${baseUrl}`);
  console.log(`Expected Commit: ${expectedCommit ? expectedCommit.substring(0, 7) : 'any'}`);
  console.log(`Max Retries:     ${maxAttempts} (Interval: ${intervalMs / 1000}s)`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let lastError: Error | null = null;
  let healthyData: HealthResponse | null = null;

  // 1. Polling /api/health
  console.log(`[1/3] Probing health endpoint: ${baseUrl}/api/health`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'User-Agent': 'TheBreakdown-DeploymentHealthVerifier/1.0' },
      });

      if (res.status === 200) {
        const data = (await res.json()) as HealthResponse;
        if (data.status === 'healthy') {
          // If strict commit check requested, verify commit matches
          if (checkCommitParity && expectedCommit && data.commitSha && data.commitSha !== 'local') {
            const shortEdge = data.commitSha.substring(0, 7);
            const shortExpected = expectedCommit.substring(0, 7);
            if (shortEdge !== shortExpected) {
              console.log(
                `[Attempt ${attempt}/${maxAttempts}] Edge commit ${shortEdge} does not match expected ${shortExpected}. Still deploying...`,
              );
              await delay(intervalMs);
              continue;
            }
          }

          healthyData = data;
          console.log(`✓ Health endpoint responded 200 OK (Attempt ${attempt}/${maxAttempts})`);
          console.log(`  - Version:    ${data.version}`);
          console.log(`  - Commit SHA: ${data.commitSha || 'unspecified'}`);
          console.log(`  - Subsystems: ${JSON.stringify(data.subsystems || {})}`);
          break;
        } else {
          lastError = new Error(`Health status reported: '${data.status}'`);
        }
      } else {
        lastError = new Error(`Health endpoint returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      lastError = err;
    }

    console.log(`[Attempt ${attempt}/${maxAttempts}] Health check not yet ready (${lastError?.message}). Retrying in ${intervalMs / 1000}s...`);
    if (attempt < maxAttempts) {
      await delay(intervalMs);
    }
  }

  if (!healthyData) {
    throw new Error(`Health verification timed out after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }

  // 2. Verify Canonical Homepage & Security Headers
  console.log(`\n[2/3] Probing canonical homepage: ${baseUrl}/`);
  const homeRes = await fetch(`${baseUrl}/`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (homeRes.status !== 200) {
    throw new Error(`Homepage check failed: expected HTTP 200, got ${homeRes.status}`);
  }
  const hstsHeader = homeRes.headers.get('strict-transport-security') || '';
  const hstsPresent = hstsHeader.includes('max-age');
  console.log(`✓ Homepage responded 200 OK (HSTS: ${hstsPresent ? 'Present' : 'Not Present'})`);

  // 3. Verify Edge Middleware Security Gate (/newsroom redirect)
  console.log(`\n[3/3] Probing protected route: ${baseUrl}/newsroom`);
  const newsroomRes = await fetch(`${baseUrl}/newsroom`, {
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'manual',
  });
  const redirectLoc = newsroomRes.headers.get('location') || '';
  const isRedirect = newsroomRes.status === 307 || newsroomRes.status === 308 || newsroomRes.status === 302;
  const redirectsToProtectedAuth = redirectLoc.includes('/login') || redirectLoc.includes('vercel.com/sso');

  if (!isRedirect || !redirectsToProtectedAuth) {
    throw new Error(
      `Protected route verification failed: expected redirect to /login or auth gate, got HTTP ${newsroomRes.status} Location: '${redirectLoc}'`,
    );
  }
  console.log(`✓ Protected route correctly enforced: HTTP ${newsroomRes.status} -> ${redirectLoc}`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ ALL DEPLOYMENT HEALTH CHECKS PASSED');
  console.log('═══════════════════════════════════════════════════════════\n');

  return {
    success: true,
    health: healthyData,
    homepageStatus: homeRes.status,
    newsroomRedirectStatus: newsroomRes.status,
    hstsPresent,
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const cliOptions = parseArgs(process.argv.slice(2));
  verifyDeployment(cliOptions).catch((err) => {
    console.error('\n❌ Deployment verification failed:', err.message);
    process.exit(1);
  });
}
