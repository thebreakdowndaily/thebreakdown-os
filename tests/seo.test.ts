import { createArticleSchema, createBreadcrumbSchema, createFAQSchema } from '../lib/seo/jsonld';

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

  // ── Article Schema ────────────────────────────────────────────────
  try {
    const schema = createArticleSchema({
      headline: 'Test Headline',
      summary: 'Test Summary',
      url: '/test-url',
      publishedAt: '2023-01-01',
      updatedAt: '2023-01-02'
    });
    
    assert(schema['@type'] === 'Article', 'Article schema type is Article');
    assert(schema.headline === 'Test Headline', 'Article headline matches');
    assert((schema.mainEntityOfPage as any)['@id'] === '/test-url', 'Article url matches');
  } catch (e) {
    console.error('  FAIL: Article schema threw exception', e);
    failed++;
  }

  // ── Breadcrumb Schema ────────────────────────────────────────────────
  try {
    const schema = createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Test', url: '/test' }
    ]);
    
    assert(schema['@type'] === 'BreadcrumbList', 'Breadcrumb schema type is BreadcrumbList');
    assert(Array.isArray(schema.itemListElement), 'Breadcrumb schema has itemListElement');
  } catch (e) {
    console.error('  FAIL: Breadcrumb schema threw exception', e);
    failed++;
  }

  // ── FAQ Schema ────────────────────────────────────────────────
  try {
    const schema = createFAQSchema([
      { question: 'Q1', answer: 'A1' }
    ]);
    
    assert(schema && schema['@type'] === 'FAQPage', 'FAQ schema type is FAQPage');
  } catch (e) {
    console.error('  FAIL: FAQ schema threw exception', e);
    failed++;
  }

  console.log(`\nSEO Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
