import { CORE_EVENTS, ALLOWED_PARAMS } from '../../lib/analytics/capture';
import { GET, POST } from '../../app/api/institution/licenses/route';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function runTest(name: string, testFn: () => void | Promise<void>) {
    try {
      await testFn();
      passed++;
    } catch (e) {
      console.error(`  FAIL: ${name}`, e);
      failed++;
    }
  }

  await runTest('citation_exported in CORE_EVENTS', () => {
    assert(CORE_EVENTS.includes('citation_exported' as any), 'citation_exported is in CORE_EVENTS');
    assert(ALLOWED_PARAMS['citation_exported'] !== undefined, 'citation_exported params defined');
    assert(ALLOWED_PARAMS['citation_exported'].includes('format'), 'has format');
    assert(ALLOWED_PARAMS['citation_exported'].includes('story_slug'), 'has story_slug');
  });

  await runTest('license_seat_invited in CORE_EVENTS', () => {
    assert(CORE_EVENTS.includes('license_seat_invited' as any), 'license_seat_invited is in CORE_EVENTS');
    assert(ALLOWED_PARAMS['license_seat_invited'] !== undefined, 'license_seat_invited params defined');
    assert(ALLOWED_PARAMS['license_seat_invited'].includes('role'), 'has role');
  });

  await runTest('GET should return 403 when no supporter cookie is set', async () => {
    const req = new Request('http://localhost/api/institution/licenses');
    const res = await GET(req);
    assert(res.status === 403, 'status is 403');
  });

  await runTest('POST should return 403 when no supporter cookie is set', async () => {
    const req = new Request('http://localhost/api/institution/licenses', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', role: 'editor' })
    });
    const res = await POST(req);
    assert(res.status === 403, 'status is 403');
  });

  await runTest('POST should validate email syntax', async () => {
    const req = new Request('http://localhost/api/institution/licenses', {
      method: 'POST',
      headers: {
        'cookie': 'tb_supporter=true; tb_plan_type=institutional',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ email: 'invalid-email', role: 'reader' })
    });
    const res = await POST(req);
    assert(res.status === 400, 'status is 400');
    const data = await res.json();
    assert(data.error === 'Invalid email', 'correct error message');
  });

  await runTest('POST should allow valid invite', async () => {
    const req = new Request('http://localhost/api/institution/licenses', {
      method: 'POST',
      headers: {
        'cookie': 'tb_supporter=true; tb_plan_type=institutional',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ email: 'valid@example.com', role: 'editor' })
    });
    const res = await POST(req);
    assert(res.status === 200, 'status is 200');
    const data = await res.json();
    assert(data.success === true, 'success is true');
    assert(data.email === 'valid@example.com', 'email matches');
  });

  console.log(`\nInstitutional B2B Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
