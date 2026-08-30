import { NextRequest } from 'next/server';
import { GET } from '../../app/api/v2/explorer/route';
import { bootstrapServices } from '../../services/bootstrap';

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

  // Pre-initialize services
  await bootstrapServices();

  // Test 1: Empty Query
  try {
    const req = new NextRequest('http://localhost:3000/api/v2/explorer');
    const res = await GET(req);
    const json = await res.json();
    assert(res.status === 200, 'Empty query returns 200');
    assert(json.data.length === 0, 'Empty query returns no data');
    assert(json.meta.total === 0, 'Empty query returns total 0');
  } catch (e) {
    console.error(e);
    failed++;
  }

  // Test 2: Search with keyword
  try {
    const req = new NextRequest('http://localhost:3000/api/v2/explorer?q=mgnrega');
    const res = await GET(req);
    const json = await res.json();
    assert(res.status === 200, 'Keyword search returns 200');
    assert(Array.isArray(json.data), 'Keyword search returns an array');
    assert(json.meta.total !== undefined, 'Keyword search returns total');
    assert(json.meta.typeCounts !== undefined, 'Keyword search returns typeCounts');
  } catch (e) {
    console.error(e);
    failed++;
  }

  // Test 3: Filter by type
  try {
    const req = new NextRequest('http://localhost:3000/api/v2/explorer?q=a&type=claim');
    const res = await GET(req);
    const json = await res.json();
    assert(res.status === 200, 'Type filter returns 200');
    let allClaims = true;
    for (const item of json.data) {
      if (item.type !== 'claim') allClaims = false;
    }
    assert(allClaims, 'Type filter returns only matching type');
  } catch (e) {
    console.error(e);
    failed++;
  }

  // Test 4: Pagination
  try {
    const req = new NextRequest('http://localhost:3000/api/v2/explorer?q=e&page=1&pageSize=2');
    const res = await GET(req);
    const json = await res.json();
    assert(res.status === 200, 'Pagination returns 200');
    assert(json.data.length <= 2, 'Pagination respects pageSize');
    assert(json.meta.page === 1, 'Pagination returns correct page');
    assert(json.meta.pageSize === 2, 'Pagination returns correct pageSize');
  } catch (e) {
    console.error(e);
    failed++;
  }

  console.log(`\nExplorer Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
