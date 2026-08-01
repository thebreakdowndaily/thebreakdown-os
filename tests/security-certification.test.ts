/**
 * THE BREAKDOWN OS — Release 2 Security Certification Test Suite (P2)
 *
 * Automated verification of CSP directives, CSRF tokens, secret leakage detection,
 * dependency security audit evaluation, rate limiting, and OWASP compliance.
 */

import { generateContentSecurityPolicy, generateCsrfToken, validateCsrfToken } from '../lib/security/csrf-protection';
import { auditSecretLeakage, validateSecretIsolation } from '../lib/security/secret-audit';
import { evaluateDependencyAudit, SecurityVulnerability } from '../lib/security/dependency-audit';
import { checkRateLimit, sanitizeHtmlInput } from '../lib/infrastructure/security-audit';

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
