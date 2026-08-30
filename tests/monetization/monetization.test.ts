import { POST } from '../../app/api/checkout/route';
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

  // 1. Verify AdSlot component is exported correctly
  runTest('AdSlot is exported as a function component', () => {
    assert(typeof AdSlot === 'function', 'AdSlot is a function component');
  });

  // Mock Request helper
  const createRequest = (body: any, ip: string = '127.0.0.1') => {
    return {
      json: async () => body,
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'x-forwarded-for') return ip;
          return null;
        }
      }
    } as unknown as Request;
  };

  // Helper to extract JSON from mocked NextResponse
  const getJson = async (res: any) => {
    return await res.json();
  };

  // 2. Test Checkout API validations
  await runTest('Checkout API returns 400 for invalid email', async () => {
    const req = createRequest({ planId: 'supporter', email: 'invalid' });
    const res: any = await POST(req);
    const data = await getJson(res);
    assert(res.status === 400, 'Status is 400 for invalid email');
    assert(data.error === 'Invalid email', 'Error message matches');
  });

  await runTest('Checkout API returns 400 for invalid planId', async () => {
    const req = createRequest({ planId: 'platinum', email: 'test@example.com' });
    const res: any = await POST(req);
    const data = await getJson(res);
    assert(res.status === 400, 'Status is 400 for invalid planId');
    assert(data.error === 'Invalid planId', 'Error message matches');
  });

  await runTest('Checkout API returns 200 and redirect URL for valid data', async () => {
    const req = createRequest({ planId: 'supporter', email: 'test@example.com' }, '1.1.1.1');
    const res: any = await POST(req);
    const data = await getJson(res);
    assert(res.status === 200, 'Status is 200 for valid input');
    assert(data.success === true, 'Success flag is true');
    assert(data.checkoutUrl.includes('planId=supporter'), 'Checkout URL contains planId');
  });

  await runTest('Checkout API enforces rate limit (returns 429)', async () => {
    // Make first request with IP '2.2.2.2' and email 'rate@example.com'
    const req1 = createRequest({ planId: 'supporter', email: 'rate@example.com' }, '2.2.2.2');
    const res1: any = await POST(req1);
    assert(res1.status === 200, 'First request succeeds');

    // Second request immediately after from same user should be blocked
    const req2 = createRequest({ planId: 'supporter', email: 'rate@example.com' }, '2.2.2.2');
    const res2: any = await POST(req2);
    const data2 = await getJson(res2);
    assert(res2.status === 429, 'Second request is rate limited');
    assert(data2.error === 'Rate limit exceeded', 'Rate limit error matches');
  });

  // Short delay to let async runTest assertions complete
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`\nMonetization Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
