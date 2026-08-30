import { CORE_EVENTS, ALLOWED_PARAMS } from '../../lib/analytics/capture';
import { AdSlot } from '../../components/monetization/AdSlot';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function runTest(name: string, testFn: () => void | Promise<void>) {
    try {
      const res = testFn();
      if (res instanceof Promise) {
        res.then(() => {
          passed++;
        }).catch(e => {
          console.error(`  FAIL: ${name}`, e);
          failed++;
        });
      } else {
        passed++;
      }
    } catch (e) {
      console.error(`  FAIL: ${name}`, e);
      failed++;
    }
  }

  runTest('Registers ad_slot_rendered in CORE_EVENTS', () => {
    assert(CORE_EVENTS.includes('ad_slot_rendered'), 'ad_slot_rendered is in CORE_EVENTS');
    assert(ALLOWED_PARAMS['ad_slot_rendered'].includes('placement'), 'placement is in ALLOWED_PARAMS for ad_slot_rendered');
  });

  runTest('Registers ad_clicked in CORE_EVENTS', () => {
    assert(CORE_EVENTS.includes('ad_clicked'), 'ad_clicked is in CORE_EVENTS');
    assert(ALLOWED_PARAMS['ad_clicked'].includes('placement'), 'placement is in ALLOWED_PARAMS for ad_clicked');
  });

  runTest('AdSlot is exported as a function component', () => {
    assert(typeof AdSlot === 'function', 'AdSlot is a function component');
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`\nAdvertising Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
