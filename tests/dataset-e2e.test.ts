import { NextRequest } from 'next/server';
import { bootstrapServices } from '../lib/bootstrap';
import { getServices } from '../services/registry';
import type { Dataset, APIResponse } from '../types/canonical';

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

  interface ResponseLike {
    status: number;
    data?: unknown;
    error?: string;
    success?: boolean;
    headers?: Headers;
  }

  async function parseResponse(res: Response): Promise<ResponseLike> {
    const cloned = res.clone();
    const text = await cloned.text();
    try {
      return { status: res.status, data: JSON.parse(text), headers: res.headers };
    } catch {
      return { status: res.status, data: text, headers: res.headers };
    }
  }

  // Bootstrap services with seed datasets
  await bootstrapServices();

  // ── GET /api/v1/datasets ──────────────────────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets');
    const res = await GET(req);
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'GET /api/v1/datasets returns 200');
    assert(parsed.data !== undefined, 'GET /api/v1/datasets returns data');
    const body = parsed.data as { data: Dataset[]; meta: { total: number } };
    assert(body.data.length >= 5, 'GET /api/v1/datasets returns at least 5 seed datasets');
    assert(body.meta.total >= 5, 'GET /api/v1/datasets meta total >= 5');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets with search ──────────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets?search=gdp');
    const res = await GET(req);
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'GET /api/v1/datasets?search=gdp returns 200');
    const body = parsed.data as { data: Dataset[]; meta: { total: number } };
    assert(body.data.length >= 1, 'Search finds GDP dataset');
    assert(body.data[0].slug === 'gdp-growth', 'First result is gdp-growth');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets?search=gdp threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets with pagination ──────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets?page=1&pageSize=2');
    const res = await GET(req);
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'GET /api/v1/datasets?page=1&pageSize=2 returns 200');
    const body = parsed.data as { data: Dataset[]; meta: { total: number } };
    assert(body.data.length <= 2, 'Pagination limits results to 2');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets pagination threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug} ───────────────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth');
    const res = await GET(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'GET /api/v1/datasets/gdp-growth returns 200');
    const body = parsed.data as { data: Dataset };
    assert(body.data.slug === 'gdp-growth', 'Returns correct dataset');
    assert(body.data.title === 'India GDP Growth Rate', 'Title matches');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets/{slug} threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug} — 404 ─────────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/nonexistent');
    const res = await GET(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 404, 'GET /api/v1/datasets/nonexistent returns 404');
    const body = parsed.data as { error: string };
    assert(body.error === 'Not found', 'Error message is correct');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets/{slug} 404 threw exception', e);
    failed++;
  }

  // ── POST /api/v1/datasets ──────────────────────────────────────────────
  try {
    const { POST } = await import('../app/api/v1/datasets/route');
    const newDataset = {
      slug: 'e2e-test',
      title: 'E2E Test Dataset',
      description: 'Created during e2e tests.',
      category: 'economy',
      frequency: 'annual',
      unitLabel: 'Units',
      source: 'E2E Test',
      sourceUrl: 'https://example.com',
      methodology: 'E2E test methodology.',
      tags: ['e2e', 'test'],
      metrics: [{ id: 'm1', name: 'metric_one', label: 'Metric One', description: '', dataType: 'number', unit: '', decimalPlaces: 0, isPrimary: true }],
    } as Partial<Dataset>;
    const req = new NextRequest('http://localhost:3000/api/v1/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDataset),
    });
    const res = await POST(req);
    const parsed = await parseResponse(res);
    assert(parsed.status === 201, 'POST /api/v1/datasets returns 201');
    const body = parsed.data as APIResponse<Dataset>;
    assert(body.data.slug === 'e2e-test', 'Created dataset has correct slug');
    assert(body.data.id.length > 0, 'Created dataset has an ID');
  } catch (e) {
    console.error('  FAIL: POST /api/v1/datasets threw exception', e);
    failed++;
  }

  // ── PUT /api/v1/datasets/{slug} ────────────────────────────────────────
  try {
    const { PUT } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated GDP Growth Title' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'PUT /api/v1/datasets/gdp-growth returns 200');
    const body = parsed.data as { data: Dataset };
    assert(body.data.title === 'Updated GDP Growth Title', 'Dataset title updated');
  } catch (e) {
    console.error('  FAIL: PUT /api/v1/datasets/{slug} threw exception', e);
    failed++;
  }

  // ── PUT /api/v1/datasets/{slug} — 404 ──────────────────────────────────
  try {
    const { PUT } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Nope' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 404, 'PUT /api/v1/datasets/nonexistent returns 404');
  } catch (e) {
    console.error('  FAIL: PUT /api/v1/datasets/{slug} 404 threw exception', e);
    failed++;
  }

  // ── DELETE /api/v1/datasets/{slug} ─────────────────────────────────────
  try {
    const { DELETE } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/e2e-test', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ slug: 'e2e-test' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'DELETE /api/v1/datasets/e2e-test returns 200');
    const body = parsed.data as { success: boolean };
    assert(body.success === true, 'Delete returns success: true');

    // Verify deletion
    const exists = await getServices().datasets.getDatasetBySlug('e2e-test');
    assert(exists === undefined, 'Dataset no longer exists after delete');
  } catch (e) {
    console.error('  FAIL: DELETE /api/v1/datasets/{slug} threw exception', e);
    failed++;
  }

  // ── DELETE /api/v1/datasets/{slug} — 404 ───────────────────────────────
  try {
    const { DELETE } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/nonexistent', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 404, 'DELETE /api/v1/datasets/nonexistent returns 404');
  } catch (e) {
    console.error('  FAIL: DELETE /api/v1/datasets/{slug} 404 threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug}/series ─────────────────────────────────
  try {
    const { GET: GetSeries } = await import('../app/api/v1/datasets/[slug]/series/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth/series?metricId=gdp-q-growth');
    const res = await GetSeries(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 200, 'GET series returns 200');
    const body = parsed.data as { data: unknown };
    assert(Array.isArray(body.data), 'Series response is an array');
    assert((body.data as unknown[]).length >= 1, 'Series has at least 1 entry');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets/{slug}/series threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug}/series — missing metricId ──────────────
  try {
    const { GET: GetSeries } = await import('../app/api/v1/datasets/[slug]/series/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth/series');
    const res = await GetSeries(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 400, 'GET series without metricId returns 400');
    const body = parsed.data as { error: string };
    assert(body.error.includes('metricId'), 'Error mentions metricId');
  } catch (e) {
    console.error('  FAIL: GET series missing metricId threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug}/series — 404 ───────────────────────────
  try {
    const { GET: GetSeries } = await import('../app/api/v1/datasets/[slug]/series/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/nonexistent/series?metricId=m1');
    const res = await GetSeries(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    const parsed = await parseResponse(res);
    assert(parsed.status === 404, 'GET series for nonexistent dataset returns 404');
  } catch (e) {
    console.error('  FAIL: GET series 404 threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug}/download ───────────────────────────────
  try {
    const { GET: GetDownload } = await import('../app/api/v1/datasets/[slug]/download/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth/download');
    const res = await GetDownload(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    assert(res.status === 200, 'GET download returns 200');
    const text = await res.text();
    assert(text.includes('Period'), 'CSV contains Period header');
    assert(text.includes('2022-Q1'), 'CSV contains data point 2022-Q1');
    const contentType = res.headers.get('Content-Type') || '';
    assert(contentType.includes('text/csv'), 'Content-Type is text/csv');
    const disposition = res.headers.get('Content-Disposition') || '';
    assert(disposition.includes('gdp-growth-data.csv'), 'Content-Disposition has filename');
  } catch (e) {
    console.error('  FAIL: GET /api/v1/datasets/{slug}/download threw exception', e);
    failed++;
  }

  // ── GET /api/v1/datasets/{slug}/download — 404 ─────────────────────────
  try {
    const { GET: GetDownload } = await import('../app/api/v1/datasets/[slug]/download/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/nonexistent/download');
    const res = await GetDownload(req, { params: Promise.resolve({ slug: 'nonexistent' }) });
    assert(res.status === 404, 'GET download for nonexistent dataset returns 404');
  } catch (e) {
    console.error('  FAIL: GET download 404 threw exception', e);
    failed++;
  }

  // ── Dataset response shape ─────────────────────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth');
    const res = await GET(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    const parsed = await parseResponse(res);
    const body = parsed.data as { data: Dataset };
    const ds = body.data;

    assert(typeof ds.id === 'string', 'Dataset has id (string)');
    assert(typeof ds.slug === 'string', 'Dataset has slug (string)');
    assert(typeof ds.title === 'string', 'Dataset has title (string)');
    assert(typeof ds.description === 'string', 'Dataset has description (string)');
    assert(typeof ds.category === 'string', 'Dataset has category (string)');
    assert(typeof ds.frequency === 'string', 'Dataset has frequency (string)');
    assert(typeof ds.unitLabel === 'string', 'Dataset has unitLabel (string)');
    assert(typeof ds.source === 'string', 'Dataset has source (string)');
    assert(Array.isArray(ds.tags), 'Dataset has tags array');
    assert(Array.isArray(ds.versions), 'Dataset has versions array');
    assert(ds.versions.length >= 1, 'Dataset has at least 1 version');
    assert(Array.isArray(ds.metrics), 'Dataset has metrics array');
    assert(ds.metrics.length >= 1, 'Dataset has at least 1 metric');
    assert(Array.isArray(ds.visualizations), 'Dataset has visualizations array');
    assert(typeof ds.createdAt === 'string', 'Dataset has createdAt (string)');
    assert(typeof ds.updatedAt === 'string', 'Dataset has updatedAt (string)');

    // Check metric shape
    const metric = ds.metrics[0];
    assert(typeof metric.id === 'string', 'Metric has id');
    assert(typeof metric.label === 'string', 'Metric has label');
    assert(typeof metric.dataType === 'string', 'Metric has dataType');
    assert(typeof metric.unit === 'string', 'Metric has unit');

    // Check version shape
    const version = ds.versions[0];
    assert(typeof version.id === 'string', 'Version has id');
    assert(typeof version.version === 'string', 'Version has version string');
    assert(typeof version.publishedAt === 'string', 'Version has publishedAt');
    assert(Array.isArray(version.series), 'Version has series array');

    // Check observation shape
    if (version.series.length > 0) {
      const obs = version.series[0].observations[0];
      assert(typeof obs.period === 'string', 'Observation has period (string)');
      assert(typeof obs.value === 'number', 'Observation has value (number)');
    }
  } catch (e) {
    console.error('  FAIL: Dataset response shape threw exception', e);
    failed++;
  }

  // ── Dataset linked entities/stories/topics ─────────────────────────────
  try {
    const { GET } = await import('../app/api/v1/datasets/[slug]/route');
    const req = new NextRequest('http://localhost:3000/api/v1/datasets/gdp-growth');
    const res = await GET(req, { params: Promise.resolve({ slug: 'gdp-growth' }) });
    const parsed = await parseResponse(res);
    const body = parsed.data as { data: Dataset };
    const ds = body.data;

    assert(ds.relatedEntityIds.length >= 1, 'Dataset has related entities');
    assert(ds.relatedEntityIds.includes('rbi'), 'Related to RBI entity');
    assert(ds.relatedStoryIds.length >= 1, 'Dataset has related stories');
    assert(ds.relatedTopicIds.length >= 1, 'Dataset has related topics');
    assert(ds.relatedTopicIds.includes('economy'), 'Related to economy topic');
  } catch (e) {
    console.error('  FAIL: Dataset linked entities/stories/topics threw exception', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Dataset E2E Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
