import { CORE_EVENTS, ALLOWED_PARAMS } from '../../lib/analytics/capture';
import { GET } from '../../app/api/data/download/route';
import { NextRequest } from 'next/server';

async function runTests() {
  console.log('Running Premium Data tests...');

  try {
    // 1. Verify Telemetry
    if (!CORE_EVENTS.includes('dataset_download_started')) throw new Error('Missing dataset_download_started');
    if (!CORE_EVENTS.includes('premium_data_viewed')) throw new Error('Missing premium_data_viewed');
    
    const dlParams = ALLOWED_PARAMS['dataset_download_started'];
    if (!dlParams || !dlParams.includes('dataset_id') || !dlParams.includes('status')) {
      throw new Error('Missing allowed params for dataset_download_started');
    }

    const viewParams = ALLOWED_PARAMS['premium_data_viewed'];
    if (!viewParams || !viewParams.includes('dataset_id')) {
      throw new Error('Missing allowed params for premium_data_viewed');
    }

    // 2. Test GET handler without cookie (403)
    const reqNoCookie = new NextRequest('http://localhost/api/data/download?datasetId=sino-indian-border');
    const resNoCookie = await GET(reqNoCookie);
    if (resNoCookie.status !== 403) throw new Error('Expected 403 when no cookie');

    // 3. Test GET handler with cookie (200)
    const reqWithCookie = new NextRequest('http://localhost/api/data/download?datasetId=sino-indian-border');
    reqWithCookie.cookies.set('tb_supporter', 'true');
    const resWithCookie = await GET(reqWithCookie);
    if (resWithCookie.status !== 200) throw new Error('Expected 200 with cookie');

    const contentType = resWithCookie.headers.get('Content-Type');
    if (contentType !== 'text/csv') throw new Error('Expected CSV content type');

    console.log('✅ Premium Data tests passed.');
  } catch (error) {
    console.error('❌ Premium Data tests failed:', error);
    process.exit(1);
  }
}

runTests();
