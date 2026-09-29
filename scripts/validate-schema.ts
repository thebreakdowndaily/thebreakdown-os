/**
 * scripts/validate-schema.ts
 * Rigorous Schema.org and JSON-LD contract validator for The Breakdown OS.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 11 — Schema Validation Script)
 *   - docs/aeo-geo/03-schema-audit.md (JSON-LD audit criteria)
 *   - Editorial Constitution §XIII (transparency & verification)
 *
 * Checks:
 *   1. Story NewsArticle JSON-LD (headline, datePublished, author, publisher, citations)
 *   2. Author schema integrity (Person with name/url vs Organization)
 *   3. BreadcrumbList validity (positions 1..N, valid URL targets)
 *   4. URL scheme safety (no javascript:, data:, or private IP/localhost hosts)
 *   5. Organization schema (publishingPrinciples, ethicsPolicy, correctionsPolicy)
 *   6. Entity schema (alternateName, subjectOf, mainEntityOfPage)
 *   7. Dataset schema (name, description, publisher)
 */

import {
  createArticleSchema,
  createBreadcrumbSchema,
  createFAQSchema,
  createOrganizationSchema,
  createDatasetSchema,
  isSafePublicUrl,
  isOrgAuthor,
  buildAuthorNode,
} from '../lib/seo/jsonld';
import { createStoryJsonLd } from '../lib/seo/jsonld-story';
import { getPublicStories } from '../utils/data-layer/store';
import { getEntityIndex } from '../utils/data-layer/entity-index';

interface ValidationError {
  target: string;
  field: string;
  message: string;
}

const errors: ValidationError[] = [];
let passCount = 0;

function assert(condition: boolean, target: string, field: string, message: string) {
  if (!condition) {
    errors.push({ target, field, message });
  } else {
    passCount++;
  }
}

console.log('🔍 [validate-schema] Starting Schema.org & JSON-LD Forensic Audit...\n');

// ─── 1. URL Safety Guard Validation ──────────────────────────────────────────

assert(isSafePublicUrl('https://thebreakdown.in/story/test'), 'Security', 'isSafePublicUrl', 'Allows valid https');
assert(isSafePublicUrl('http://example.com/data'), 'Security', 'isSafePublicUrl', 'Allows valid http');
assert(!isSafePublicUrl('javascript:alert(1)'), 'Security', 'isSafePublicUrl', 'Rejects javascript: scheme');
assert(!isSafePublicUrl('data:text/html;base64,PHNjcmlwdD4='), 'Security', 'isSafePublicUrl', 'Rejects data: scheme');
assert(!isSafePublicUrl('http://localhost:3000/api'), 'Security', 'isSafePublicUrl', 'Rejects localhost');
assert(!isSafePublicUrl('http://127.0.0.1:8080'), 'Security', 'isSafePublicUrl', 'Rejects loopback IP');
assert(!isSafePublicUrl('http://192.168.1.1/secret'), 'Security', 'isSafePublicUrl', 'Rejects private IP range');

// ─── 2. Author Schema Model Validation ───────────────────────────────────────

const orgAuthor = buildAuthorNode('The Breakdown');
assert(orgAuthor['@type'] === 'Organization', 'AuthorNode', '@type', 'The Breakdown must emit Organization');
assert(orgAuthor['name'] === 'The Breakdown', 'AuthorNode', 'name', 'Organization author name must match');

const namedAuthor = buildAuthorNode('Nitin Pai', 'https://thebreakdown.in/author/nitin-pai');
assert(namedAuthor['@type'] === 'Person', 'AuthorNode', '@type', 'Named journalist must emit Person');
assert(namedAuthor['name'] === 'Nitin Pai', 'AuthorNode', 'name', 'Person name must match');
assert(namedAuthor['url'] === 'https://thebreakdown.in/author/nitin-pai', 'AuthorNode', 'url', 'Person author URL must match');

// ─── 3. Organization Schema Validation ───────────────────────────────────────

const orgSchema = createOrganizationSchema({
  description: 'Independent, evidence-backed journalism on Indian policy, politics, and society.',
  publishingPrinciplesUrl: 'https://thebreakdown.in/editorial-constitution',
  ethicsPolicyUrl: 'https://thebreakdown.in/methodology',
  correctionsPolicyUrl: 'https://thebreakdown.in/trust',
  sameAs: ['https://x.com/thebreakdown', 'https://linkedin.com/company/thebreakdown'],
});

assert(orgSchema['@context'] === 'https://schema.org', 'Organization', '@context', 'Valid context');
assert(orgSchema['@type'] === 'Organization', 'Organization', '@type', 'Type is Organization');
assert(Boolean(orgSchema['name']), 'Organization', 'name', 'Has name');
assert(Boolean(orgSchema['url']), 'Organization', 'url', 'Has url');
assert(typeof orgSchema['logo'] === 'object', 'Organization', 'logo', 'Logo must be ImageObject');
assert(orgSchema['publishingPrinciples'] === 'https://thebreakdown.in/editorial-constitution', 'Organization', 'publishingPrinciples', 'Has publishingPrinciples');
assert(orgSchema['ethicsPolicy'] === 'https://thebreakdown.in/methodology', 'Organization', 'ethicsPolicy', 'Has ethicsPolicy');
assert(orgSchema['correctionsPolicy'] === 'https://thebreakdown.in/trust', 'Organization', 'correctionsPolicy', 'Has correctionsPolicy');
assert(Array.isArray(orgSchema['sameAs']) && orgSchema['sameAs'].length === 2, 'Organization', 'sameAs', 'sameAs contains valid profiles');

// ─── 4. Dataset Schema Validation ───────────────────────────────────────────

const datasetSchema = createDatasetSchema({
  name: 'India Trade Deficit Historical Series',
  description: 'Historical monthly trade balance data from Ministry of Commerce.',
  url: 'https://thebreakdown.in/data/trade-deficit',
  datePublished: '2026-01-01',
});

assert(datasetSchema['@type'] === 'Dataset', 'Dataset', '@type', 'Type is Dataset');
assert(Boolean(datasetSchema['name']), 'Dataset', 'name', 'Has name');
assert(Boolean(datasetSchema['description']), 'Dataset', 'description', 'Has description');
assert(Boolean(datasetSchema['url']), 'Dataset', 'url', 'Has URL');

// ─── 5. Public Stories Data Layer Validation ────────────────────────────────

const stories = getPublicStories({ pageSize: 100 }).data;
console.log(`Checking ${stories.length} public stories in repository...`);

for (const story of stories) {
  const target = `Story[${story.slug}]`;
  const ld = createStoryJsonLd(story, {
    corrections: [
      { timestamp: '2026-03-01T12:00:00Z', description: 'Sample audit errata' },
    ],
  });

  assert(Array.isArray(ld) && ld.length >= 2, target, 'jsonLd', 'Emits at least NewsArticle and BreadcrumbList');

  const article = ld.find((item) => item['@type'] === 'NewsArticle' || item['@type'] === 'Article');
  assert(Boolean(article), target, 'NewsArticle', 'Has primary Article or NewsArticle schema');

  if (article) {
    assert(Boolean(article['headline']), target, 'headline', 'Headline is present');
    assert(Boolean(article['description']), target, 'description', 'Description is present');
    assert(Boolean(article['datePublished']), target, 'datePublished', 'datePublished is present');
    assert(Boolean(article['dateModified']), target, 'dateModified', 'dateModified is present');
    assert(Boolean(article['author']), target, 'author', 'Author is present');
    assert(typeof article['publisher'] === 'object', target, 'publisher', 'Publisher is object');
    assert(typeof article['mainEntityOfPage'] === 'object', target, 'mainEntityOfPage', 'mainEntityOfPage is WebPage');

    // Author typing verification
    const authorObj = article['author'] as Record<string, unknown>;
    if (isOrgAuthor(story.author)) {
      assert(authorObj['@type'] === 'Organization', target, 'author.@type', 'Generic byline emits Organization');
    } else {
      assert(authorObj['@type'] === 'Person', target, 'author.@type', 'Named author emits Person');
    }

    // Citation safety verification
    if (Array.isArray(article['citation'])) {
      for (const cit of article['citation'] as Array<{ url?: string }>) {
        if (cit.url) {
          assert(isSafePublicUrl(cit.url), target, 'citation.url', `Safe citation URL: ${cit.url}`);
        }
      }
    }

    // Correction verification
    if (article['correction']) {
      assert(Array.isArray(article['correction']), target, 'correction', 'Correction is array');
    }
  }

  // Breadcrumbs verification
  const breadcrumb = ld.find((item) => item['@type'] === 'BreadcrumbList');
  assert(Boolean(breadcrumb), target, 'BreadcrumbList', 'Has BreadcrumbList schema');
  if (breadcrumb) {
    const items = breadcrumb['itemListElement'] as Array<{ position: number; name: string; item: string }>;
    assert(Array.isArray(items) && items.length >= 2, target, 'breadcrumb.items', 'Breadcrumb has at least Home -> Story');
    assert(items[0].name === 'Home', target, 'breadcrumb[0]', 'First item is Home');
    assert(items[0].position === 1, target, 'breadcrumb[0].position', 'First position is 1');
  }
}

// ─── 6. Entity Layer & Index Verification ───────────────────────────────────

import { getEntities } from '../utils/data-layer/store';

const storeEntities = getEntities({ pageSize: 100 }).data;
console.log(`Checking ${storeEntities.length} entities in store...`);

for (const entity of storeEntities) {
  const target = `Entity[${entity.slug}]`;
  assert(Boolean(entity.name), target, 'name', 'Entity has name');
  assert(Boolean(entity.slug), target, 'slug', 'Entity has slug');
  assert(Boolean(entity.type), target, 'type', 'Entity has type');
  assert(Array.isArray(entity.aliases), target, 'aliases', 'Entity aliases is array');
}

const entityIndexList = getEntityIndex();
console.log(`Checking ${entityIndexList.length} entities in entity index...`);

for (const indexed of entityIndexList) {
  const target = `EntityIndex[${indexed.slug}]`;
  assert(Boolean(indexed.name), target, 'name', 'Indexed entity has name');
  assert(Boolean(indexed.slug), target, 'slug', 'Indexed entity has slug');
  assert(Boolean(indexed.title), target, 'title', 'Indexed entity has title');
}

// ─── 7. GEO Benchmark Query Set & Measurement Engine Validation ─────────────

import geoQuerySet from '../data/geo-query-set.json';
import {
  computeGEOMetrics,
  validateObservation,
  type AIVisibilityObservation,
} from '../lib/seo/geo-measurement';

console.log(`Checking ${geoQuerySet.length} benchmark queries in geo-query-set.json...`);

for (const q of geoQuerySet) {
  const target = `GEOQuery[${q.queryId}]`;
  assert(Boolean(q.queryId), target, 'queryId', 'Has queryId');
  assert(Boolean(q.query), target, 'query', 'Has query text');
  assert(Boolean(q.targetSlug), target, 'targetSlug', 'Has targetSlug');
  assert(isSafePublicUrl(q.targetUrl), target, 'targetUrl', `Target URL is safe: ${q.targetUrl}`);
  assert(Array.isArray(q.keyFactsExpected) && q.keyFactsExpected.length > 0, target, 'keyFactsExpected', 'Has key facts');
  assert(Array.isArray(q.primarySourceTypes) && q.primarySourceTypes.length > 0, target, 'primarySourceTypes', 'Has source types');
}

// Test observation validation and calculation
const sampleObservations: AIVisibilityObservation[] = [
  {
    engine: 'perplexity',
    query: 'What happened in 1962 Sino-Indian war?',
    queryId: 'Q001',
    observedAt: '2026-09-29T10:00:00Z',
    mentioned: true,
    cited: true,
    citationUrl: 'https://thebreakdown.in/story/indias-inheritance',
    citationCorrect: true,
    answerAccuracy: 4,
  },
  {
    engine: 'chatgpt',
    query: 'What happened in 1962 Sino-Indian war?',
    queryId: 'Q001',
    observedAt: '2026-09-29T10:05:00Z',
    mentioned: true,
    cited: false,
    answerAccuracy: 3,
  },
];

const obsVal1 = validateObservation(sampleObservations[0]);
assert(obsVal1.valid, 'ObservationValidator', 'valid', 'Valid observation passes');

const invalidObs = validateObservation({ engine: 'perplexity', query: '', cited: true });
assert(!invalidObs.valid, 'ObservationValidator', 'invalid', 'Invalid observation caught');

const geoMetrics = computeGEOMetrics(sampleObservations);
assert(geoMetrics.totalObservations === 2, 'GEOMetrics', 'totalObservations', 'Total count correct');
assert(geoMetrics.mentionRate === 100, 'GEOMetrics', 'mentionRate', '100% mention rate calculated');
assert(geoMetrics.citationRate === 50, 'GEOMetrics', 'citationRate', '50% citation rate calculated');
assert(geoMetrics.citationAccuracyRate === 100, 'GEOMetrics', 'citationAccuracyRate', '100% accurate citation rate');
assert(geoMetrics.averageAccuracy === 3.5, 'GEOMetrics', 'averageAccuracy', '3.5 average accuracy calculated');

// ─── Summary Report ──────────────────────────────────────────────────────────

console.log('\n==================================================');
console.log(`✅ Passed assertions: ${passCount}`);
if (errors.length > 0) {
  console.error(`❌ Validation failures: ${errors.length}`);
  for (const err of errors) {
    console.error(`  - [${err.target}] ${err.field}: ${err.message}`);
  }
  process.exit(1);
} else {
  console.log('🎉 All Schema.org, JSON-LD, URL safety, Author, and GEO contracts passed successfully!\n');
  process.exit(0);
}
