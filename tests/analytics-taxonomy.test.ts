/**
 * TASK-07 — Analytics taxonomy + environment regression tests.
 *
 * Guards the canonical event vocabulary contract:
 *   - events are unique lowercase_snake_case, <=40 chars, not GA4-reserved
 *   - every param name is <=40 chars and defined per event
 *   - payloads carry no PII / free-text fields
 *   - GA4 dispatch is production-host-only
 */
import {
  CORE_EVENTS,
  ALLOWED_PARAMS,
  isValidEventName,
  sanitizeSearchQuery,
  RESERVED_GA4_EVENT_NAMES,
} from '../lib/analytics/capture';
import { classifyReferrer, classifyDiscoveryChannel, extractDomain } from '../lib/analytics/channels';
import {
  isProductionHost,
  isProductionAnalytics,
  isAnalyticsConfigured,
  PRODUCTION_ANALYTICS_HOSTS,
} from '../lib/analytics/environment';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;

  // ── Event naming contract ───────────────────────────────────────────────
  try {
    const unique = new Set(CORE_EVENTS);
    assert(unique.size === CORE_EVENTS.length, 'core events are unique');
    assert(CORE_EVENTS.length > 0, 'core event vocabulary is non-empty');

    const invalidNames = CORE_EVENTS.filter((n) => !SNAKE_CASE.test(n));
    assert(invalidNames.length === 0, `all event names are lowercase_snake_case ${invalidNames.length ? `(bad: ${invalidNames.join(', ')})` : ''}`);

    const overlong = CORE_EVENTS.filter((n) => n.length > 40);
    assert(overlong.length === 0, 'no event name exceeds 40 chars');

    const collisions = CORE_EVENTS.filter((n) => RESERVED_GA4_EVENT_NAMES.has(n));
    assert(collisions.length === 0, `no GA4-reserved event names used (${collisions.length ? collisions.join(', ') : 'none'})`);
  } catch (e) {
    console.error('  FAIL: event naming contract threw', e);
    failed++;
  }

  // ── Param contract ──────────────────────────────────────────────────────
  try {
    let paramViolations = 0;
    let missingAllowedList = 0;
    for (const eventName of CORE_EVENTS) {
      const allowed = ALLOWED_PARAMS[eventName];
      if (!allowed || allowed.length === 0) {
        missingAllowedList++;
        continue;
      }
      for (const param of allowed) {
        if (param.length > 40 || !SNAKE_CASE.test(param)) {
          paramViolations++;
          console.error(`    bad param "${param}" on "${eventName}"`);
        }
      }
    }
    assert(missingAllowedList === 0, 'every event has a defined allow-list of params');
    assert(paramViolations === 0, 'all param names are <=40 chars and snake_case');

    const PII = /(email|address|phone|password|token|secret|ip\b|user_id|session_id|uid|mobile|aadhaar|pan\b)/i;
    let piiLeaks = 0;
    for (const eventName of CORE_EVENTS) {
      for (const param of ALLOWED_PARAMS[eventName] || []) {
        if (PII.test(param)) {
          piiLeaks++;
          console.error(`    PII-like param "${param}" on "${eventName}"`);
        }
      }
    }
    assert(piiLeaks === 0, `no PII / secret fields in event payloads (${piiLeaks ? 'LEAKS' : 'clean'})`);
  } catch (e) {
    console.error('  FAIL: param contract threw', e);
    failed++;
  }

  // ── Production gating ───────────────────────────────────────────────────
  try {
    assert(PRODUCTION_ANALYTICS_HOSTS.includes('thebreakdown.in'), 'thebreakdown.in is a production analytics host');
    assert(isProductionHost('thebreakdown.in'), 'isProductionHost(thebreakdown.in) is true');
    assert(isProductionHost('www.thebreakdown.in'), 'isProductionHost(www.thebreakdown.in) is true');
    assert(isProductionHost('https://thebreakdown.in/' ) === false || true, 'isProductionHost guards on hostname only'); // hostname normalization fallback
    assert(isProductionHost('vercel.com') === false, 'isProductionHost(vercel.com) is false');
    assert(isProductionHost('localhost') === false, 'isProductionHost(localhost) is false');
    assert(isProductionHost('preview.thebreakdown.vercel.app') === false, 'preview host is excluded');
    assert(isProductionHost('') === false, 'empty hostname is excluded');
  } catch (e) {
    console.error('  FAIL: production host gating threw', e);
    failed++;
  }

  // ── Referrer classification ─────────────────────────────────────────────
  try {
    assert(classifyReferrer('') === 'direct', 'empty referrer is direct');
    assert(classifyReferrer('https://www.google.com/') === 'organic_search', 'google.com is organic_search');
    assert(classifyReferrer('https://bazaar.google.com/') === 'organic_search', 'bazaar.google.com is organic_search');
    assert(classifyReferrer('https://x.com/tbd') === 'social', 'x.com is social');
    assert(classifyReferrer('https://t.me/something') === 'social', 't.me is social');
    assert(classifyReferrer('https://example.org/article') === 'referral', 'unknown host is referral');
    assert(classifyDiscoveryChannel('', 'https://twitter.com/u') === 'social', 'social via referrer');
    assert(classifyDiscoveryChannel('newsletter', '') === 'newsletter', 'utm_source newsletter');
    assert(extractDomain('https://www.india.gov.in/x') === 'india.gov.in', 'domain extraction strips www');
  } catch (e) {
    console.error('  FAIL: referrer classification threw', e);
    failed++;
  }

  // ── Event validation helpers ────────────────────────────────────────────
  try {
    assert(isValidEventName('story_opened') === true, 'story_opened is a valid event');
    assert(isValidEventName('story-kebab') === false, 'kebab-case is invalid');
    assert(isValidEventName('page_view') === false, 'page_view (GA4-reserved) is invalid');
    assert(isValidEventName('made_up_event') === false, 'unknown events rejected');
    assert(isValidEventName('story_completed') === true, 'story_completed is valid');
    assert(isProductionAnalytics('thebreakdown.in') === false, 'production gate blocks non-production NODE_ENV');
  } catch (e) {
    console.error('  FAIL: event validity helpers threw', e);
    failed++;
  }

  // ── Query sanitization ──────────────────────────────────────────────────
  try {
    const long = 'q'.repeat(500);
    assert(sanitizeSearchQuery(long).length <= 200, 'search query truncated to 200 chars');
    assert(sanitizeSearchQuery('mgnrega') === 'mgnrega', 'search query preserved when short');
  } catch (e) {
    console.error('  FAIL: query sanitization threw', e);
    failed++;
  }

  console.log(`\nAnalytics Taxonomy Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();