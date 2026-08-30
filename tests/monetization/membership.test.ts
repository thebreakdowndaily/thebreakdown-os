import { CORE_EVENTS, ALLOWED_PARAMS } from '../../lib/analytics/capture';
import { PaywallOverlay } from '../../components/monetization/PaywallOverlay';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function runTests() {
  let passed = 0;
  let failed = 0;

  function runTest(name: string, testFn: () => void) {
    try {
      testFn();
      passed++;
    } catch (e) {
      console.error(`  FAIL: ${name}`, e);
      failed++;
    }
  }

  runTest('paywall_viewed in CORE_EVENTS', () => {
    assert(CORE_EVENTS.includes('paywall_viewed' as any), 'paywall_viewed is in CORE_EVENTS');
    assert(ALLOWED_PARAMS['paywall_viewed'] !== undefined, 'paywall_viewed params defined');
    assert(ALLOWED_PARAMS['paywall_viewed'].includes('placement'), 'has placement');
    assert(ALLOWED_PARAMS['paywall_viewed'].includes('story_slug'), 'has story_slug');
  });

  runTest('paywall_action_clicked in CORE_EVENTS', () => {
    assert(CORE_EVENTS.includes('paywall_action_clicked' as any), 'paywall_action_clicked is in CORE_EVENTS');
    assert(ALLOWED_PARAMS['paywall_action_clicked'] !== undefined, 'paywall_action_clicked params defined');
    assert(ALLOWED_PARAMS['paywall_action_clicked'].includes('placement'), 'has placement');
    assert(ALLOWED_PARAMS['paywall_action_clicked'].includes('action_type'), 'has action_type');
  });

  runTest('PaywallOverlay is exported as a function component', () => {
    assert(typeof PaywallOverlay === 'function', 'PaywallOverlay is a function component');
  });

  console.log(`\nMembership Telemetry Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
