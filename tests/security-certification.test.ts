/**
 * THE BREAKDOWN OS — Release 2 Security Certification Test Suite (P2)
 *
 * Automated verification of CSP directives, CSRF tokens, secret leakage detection,
 * dependency security audit evaluation, rate limiting, and OWASP compliance.
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateContentSecurityPolicy, generateCsrfToken, validateCsrfToken } from '../lib/security/csrf-protection';
import { auditSecretLeakage, validateSecretIsolation } from '../lib/security/secret-audit';
import { evaluateDependencyAudit, SecurityVulnerability } from '../lib/security/dependency-audit';
import { checkRateLimit, sanitizeHtmlInput } from '../lib/infrastructure/security-audit';

function createFabricatedServiceRoleJwt(role = 'service_role', alg = 'HS256') {
  const header = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: 'supabase',
      ref: 'fabricated-test-ref',
      role,
      iat: 1700000000,
      exp: 2000000000,
    })
  ).toString('base64url');
  return `${header}.${payload}.fabricated_sig_signature_only_mock_12345`;
}

function runSecurityCertificationTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('--- RUNNING RELEASE 2 SECURITY CERTIFICATION TESTS (P2) ---');

  // Test 1: Content Security Policy Verification
  try {
    const csp = generateContentSecurityPolicy();
    assert(csp.includes("default-src 'self'"), 'CSP sets default-src self');
    assert(csp.includes("frame-ancestors 'none'"), 'CSP blocks clickjacking with frame-ancestors none');
    assert(csp.includes("form-action 'self'"), 'CSP restricts form submissions to self');
  } catch (err) {
    console.error('  ✗ FAIL: CSP verification test failed', err);
    failed++;
  }

  // Test 2: CSRF Token Generation & Validation
  try {
    const token = generateCsrfToken('session_user_123');
    assert(validateCsrfToken(token) === true, 'Valid CSRF token passes verification');
    assert(validateCsrfToken('') === false, 'Empty CSRF token rejected');
    assert(validateCsrfToken('invalid_token') === false, 'Malformed CSRF token rejected');
  } catch (err) {
    console.error('  ✗ FAIL: CSRF token test failed', err);
    failed++;
  }

  // Test 3: Secret Leakage Detection
  try {
    const safeText = 'Public configuration parameters';
    const leakedText = '-----BEGIN RSA PRIVATE KEY-----\nkey_contents\n-----END RSA PRIVATE KEY-----';

    const safeAudit = auditSecretLeakage(safeText);
    assert(safeAudit.clean === true, 'Clean payload passes secret leakage audit');

    const leakAudit = auditSecretLeakage(leakedText);
    assert(leakAudit.clean === false, 'Private key leak caught by scanner');

    // Test 3b: Password-bearing PostgreSQL Connection URL Detection
    const leakedPgUrl = 'TEST_DATABASE_URL=postgresql://mock_user:fabricated_password_987@db.fabricated-test.supabase.co:5432/postgres';
    const leakedPgAudit = auditSecretLeakage(leakedPgUrl);
    assert(leakedPgAudit.clean === false, 'Password-bearing PostgreSQL connection URL caught by scanner');

    const safePgTemplate = 'TEST_DATABASE_URL=postgresql://[DB_USER]:[DB_PASSWORD]@[DB_HOST]:5432/[DB_NAME]';
    const safePgAudit = auditSecretLeakage(safePgTemplate);
    assert(safePgAudit.clean === true, 'Redacted bracketed PostgreSQL placeholder template passes audit');

    const safePgAngle = 'TEST_DATABASE_URL=postgresql://postgres:<password>@db.example.com:5432/postgres';
    const safePgAngleAudit = auditSecretLeakage(safePgAngle);
    assert(safePgAngleAudit.clean === true, 'Redacted angle-bracket PostgreSQL placeholder template passes audit');

    // Test 3c: Supabase Service Role JWT Detection
    const fabricatedServiceJwt = createFabricatedServiceRoleJwt('service_role');
    const jwtAudit = auditSecretLeakage(fabricatedServiceJwt);
    assert(jwtAudit.clean === false, 'Fabricated Supabase service-role JWT caught by scanner');

    const safeJwtPlaceholder = 'SUPABASE_SERVICE_ROLE_KEY=[REDACTED_SUPABASE_SERVICE_ROLE_KEY]';
    const safeJwtAudit = auditSecretLeakage(safeJwtPlaceholder);
    assert(safeJwtAudit.clean === true, 'Redacted Supabase service-role placeholder passes audit');

    // Test 3d: Representative Unsafe HTML Fixture
    const unsafeHtmlFixture = `
      <html>
        <body>
          <div>TEST_DATABASE_URL=postgresql://mock_admin:fabricatedPass_secret@db.fabricated.supabase.co:5432/postgres</div>
          <div>SUPABASE_SERVICE_ROLE_KEY=${fabricatedServiceJwt}</div>
        </body>
      </html>
    `;
    const unsafeFixtureAudit = auditSecretLeakage(unsafeHtmlFixture);
    assert(unsafeFixtureAudit.clean === false && unsafeFixtureAudit.detectedPatterns >= 2, 'Representative unsafe fixture rejected by secret scanner');

    // Test 3e: Verify on-disk batch1-data-access.html is clean
    const batch1HtmlPath = path.resolve(__dirname, '../batch1-data-access.html');
    if (fs.existsSync(batch1HtmlPath)) {
      const batch1Html = fs.readFileSync(batch1HtmlPath, 'utf8');
      const batch1Audit = auditSecretLeakage(batch1Html);
      assert(batch1Audit.clean === true && batch1Audit.detectedPatterns === 0, 'On-disk batch1-data-access.html passes secret scanner cleanly');
    } else {
      assert(false, 'batch1-data-access.html must exist on disk for validation');
    }
  } catch (err) {
    console.error('  ✗ FAIL: Secret leakage test failed', err);
    failed++;
  }

  // Test 4: Dependency Security Evaluation
  try {
    const cleanAudit = evaluateDependencyAudit([]);
    assert(cleanAudit.status === 'passed', 'Clean dependency evaluation passes audit');

    const vuln: SecurityVulnerability = {
      packageName: 'vulnerable-pkg',
      severity: 'critical',
      title: 'Remote Code Execution',
      recommendation: 'Upgrade to 2.0.0',
    };
    const dirtyAudit = evaluateDependencyAudit([vuln]);
    assert(dirtyAudit.status === 'failed', 'Critical vulnerability flags audit failure');
  } catch (err) {
    console.error('  ✗ FAIL: Dependency audit test failed', err);
    failed++;
  }

  // Test 5: Input Sanitization (XSS) & Rate Limiting Verification
  try {
    const dirtyHtml = '<img src=x onerror=alert("xss")>';
    const cleanHtml = sanitizeHtmlInput(dirtyHtml);
    assert(cleanHtml.includes('&lt;img'), 'XSS tag brackets encoded as HTML entities');
    assert(cleanHtml.includes('&quot;xss&quot;'), 'XSS attribute quotes encoded');

    const rateRes = checkRateLimit('10.0.0.1', 5, 60000);
    assert(rateRes.allowed === true, 'Rate limiter allows traffic under cap');
  } catch (err) {
    console.error('  ✗ FAIL: XSS/Rate limit test failed', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityCertificationTests();
