/**
 * THE BREAKDOWN OS — Production Readiness & Security Audit Test Suite
 *
 * Verifies security rate limiting, HTML input sanitization, environment
 * validation, operational telemetry logging, and performance budgets.
 */

import { checkRateLimit, sanitizeHtmlInput, validateRequiredEnvironmentVariables } from '../lib/infrastructure/security-audit';
import { logStructured, recordPerformanceMetric } from '../lib/infrastructure/telemetry';

function runProductionReadinessTests() {
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

  console.log('--- RUNNING PRODUCTION READINESS & SECURITY AUDIT TESTS ---');

  // Test 1: Rate Limiter Execution
  try {
    const res1 = checkRateLimit('192.168.1.1', 2, 60000);
    assert(res1.allowed === true, 'First request allowed under rate limit');

    const res2 = checkRateLimit('192.168.1.1', 2, 60000);
    assert(res2.allowed === true, 'Second request allowed under rate limit');

    const res3 = checkRateLimit('192.168.1.1', 2, 60000);
    assert(res3.allowed === false, 'Third request blocked by rate limit');
  } catch (err) {
    console.error('  ✗ FAIL: Rate limiter test threw exception', err);
    failed++;
  }

  // Test 2: Input Sanitization (XSS Defense)
  try {
    const dangerousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeHtmlInput(dangerousInput);
    assert(!sanitized.includes('<script>'), 'Dangerous script tag sanitized');
    assert(sanitized.includes('&lt;script&gt;'), 'HTML entities properly encoded');
  } catch (err) {
    console.error('  ✗ FAIL: Sanitization test threw exception', err);
    failed++;
  }

  // Test 3: Environment Variable Validation
  try {
    const envCheck = validateRequiredEnvironmentVariables(['NODE_ENV']);
    assert(envCheck.valid === true, 'Required environment variables present');
  } catch (err) {
    console.error('  ✗ FAIL: Environment validation test threw exception', err);
    failed++;
  }

  // Test 4: Structured Telemetry Logging
  try {
    const log = logStructured('info', 'security', 'Rate limiter executed', { ip: '127.0.0.1' });
    assert(log.subsystem === 'security', 'Subsystem recorded in telemetry log');
    assert(typeof log.timestamp === 'string', 'ISO timestamp present in log entry');
  } catch (err) {
    console.error('  ✗ FAIL: Telemetry logging test threw exception', err);
    failed++;
  }

  // Test 5: Performance Metric Budget Verification
  try {
    const perfResult = recordPerformanceMetric('LCP', 950, 1200);
    assert(perfResult.compliant === true, 'LCP 950ms is compliant with 1200ms budget');

    const badPerf = recordPerformanceMetric('LCP', 1500, 1200);
    assert(badPerf.compliant === false, 'LCP 1500ms flagged as non-compliant');
  } catch (err) {
    console.error('  ✗ FAIL: Performance budget test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runProductionReadinessTests();
