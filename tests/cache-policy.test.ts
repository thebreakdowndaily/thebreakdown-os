/**
 * THE BREAKDOWN OS — Infrastructure Cache Policy Test Suite (Phase 3)
 */

import {
  PUBLIC_CACHE_POLICY,
  PUBLIC_UNINDEXED_HEADER,
  AUTHENTICATED_HEADER_POLICY,
  SECURITY_HEADERS,
  applyHeaders,
} from '../lib/infrastructure/cache-policy';

function runCachePolicyTests() {
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

  console.log('--- RUNNING INFRASTRUCTURE CACHE & SECURITY POLICY TESTS ---');

  // Test 1: Security Headers
  try {
    assert(SECURITY_HEADERS['X-Frame-Options'] === 'DENY', 'X-Frame-Options is DENY');
    assert(SECURITY_HEADERS['X-Content-Type-Options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
  } catch (err) {
    console.error('  ✗ FAIL: Security headers test threw exception', err);
    failed++;
  }

  // Test 2: Public Cache Policy
  try {
    assert(PUBLIC_CACHE_POLICY['Cache-Control'].includes('s-maxage=300'), 'Public Cache-Control sets 300s edge max age');
    assert(PUBLIC_CACHE_POLICY['X-Frame-Options'] === 'DENY', 'Public cache policy includes security headers');
  } catch (err) {
    console.error('  ✗ FAIL: Public cache policy test threw exception', err);
    failed++;
  }

  // Test 3: Authenticated & Unindexed Headers
  try {
    assert(AUTHENTICATED_HEADER_POLICY['X-Robots-Tag'] === 'noindex, nofollow', 'Authenticated pages set noindex, nofollow');
    assert(PUBLIC_UNINDEXED_HEADER['X-Robots-Tag'] === 'noindex, nofollow', 'Public unindexed pages set noindex, nofollow');
  } catch (err) {
    console.error('  ✗ FAIL: Authenticated header test threw exception', err);
    failed++;
  }

  // Test 4: Header Application Helper
  try {
    const headers = new Headers();
    applyHeaders(headers, PUBLIC_CACHE_POLICY);
    assert(headers.get('X-Frame-Options') === 'DENY', 'applyHeaders applies security headers to Web Headers object');
  } catch (err) {
    console.error('  ✗ FAIL: applyHeaders helper test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runCachePolicyTests();
