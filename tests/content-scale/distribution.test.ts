import { CORE_EVENTS, ALLOWED_PARAMS } from '../../lib/analytics/capture';
import { GET } from '../../app/feed.xml/route';

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

  // Test 1: Telemetry config
  try {
    assert(CORE_EVENTS.includes('share_clicked' as any), 'share_clicked is in CORE_EVENTS');
    assert(
      JSON.stringify(ALLOWED_PARAMS['share_clicked' as keyof typeof ALLOWED_PARAMS]) === JSON.stringify(['platform', 'story_slug']),
      'share_clicked has correct ALLOWED_PARAMS'
    );
  } catch (e) {
    console.error('  FAIL: Telemetry tests threw exception', e);
    failed++;
  }

  // Test 2: RSS feed endpoint
  try {
    const response = await GET();
    assert(response.status === 200, 'RSS endpoint returns 200');
    assert(response.headers.get('Content-Type') === 'application/xml', 'RSS endpoint has correct content type');
    
    const xml = await response.text();
    assert(xml.includes('<rss version="2.0">'), 'XML contains rss version 2.0 tag');
    assert(xml.includes('<channel>'), 'XML contains channel tag');
  } catch (e) {
    console.error('  FAIL: RSS endpoint tests threw exception', e);
    failed++;
  }

  console.log(`\nDistribution Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
