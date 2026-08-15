import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

async function runAuthSimulation() {
  console.log('================================================================');
  console.log('THE BREAKDOWN — CRON EDGE AUTHENTICATION SIMULATION');
  console.log('================================================================');

  process.env.CRON_SECRET = 'test_cron_secret_abc123';

  // Case 1: Missing credentials
  const req1 = new NextRequest(new URL('http://localhost:3000/api/v2/newsroom/observations/pull'), {
    method: 'POST',
  });
  const res1 = await middleware(req1);
  const status1 = res1.status;
  console.log(`Case 1: Missing credentials -> Status: ${status1} (Expected: 401)`);
  if (status1 === 401) {
    console.log('  ✓ PASS');
  } else {
    console.log('  ❌ FAIL');
  }

  // Case 2: Wrong credentials (wrong secret)
  const req2 = new NextRequest(new URL('http://localhost:3000/api/v2/newsroom/observations/pull'), {
    method: 'POST',
    headers: {
      'x-vercel-cron': '1',
      'authorization': 'Bearer wrong_secret_here',
    },
  });
  const res2 = await middleware(req2);
  const status2 = res2.status;
  console.log(`Case 2: Wrong credentials -> Status: ${status2} (Expected: 401)`);
  if (status2 === 401) {
    console.log('  ✓ PASS');
  } else {
    console.log('  ❌ FAIL');
  }

  // Case 3: Valid credentials
  const req3 = new NextRequest(new URL('http://localhost:3000/api/v2/newsroom/observations/pull'), {
    method: 'POST',
    headers: {
      'x-vercel-cron': '1',
      'authorization': `Bearer ${process.env.CRON_SECRET}`,
    },
  });
  const res3 = await middleware(req3);
  const status3 = res3.status;
  const isNext = res3.headers.get('x-middleware-next') === '1' || status3 === 200;
  console.log(`Case 3: Valid credentials -> Status: ${status3} (Expected: 200/next, isNext: ${isNext})`);
  if (isNext) {
    console.log('  ✓ PASS');
  } else {
    console.log('  ❌ FAIL');
  }
  console.log('================================================================\n');
}

runAuthSimulation().catch(console.error);
