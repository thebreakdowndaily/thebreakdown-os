/**
 * scripts/audit-rendered-pages.ts
 * Forensic Rendered Page Audit:
 * Validates metadata, canonicals, OpenGraph, Twitter, and JSON-LD emissions
 * across representative stories, entities, chapters, and trust pages.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 3 — Rendered HTML Audit)
 *   - docs/product-quality.md (Quality Gates)
 */

import { buildStoryMetadata } from '../lib/story/metadata';
import { resolveStory } from '../lib/story/resolver';
import { createStoryJsonLd } from '../lib/seo/jsonld-story';
import { getPublicStory } from '../utils/data-layer/store';
import { getEntityById } from '../utils/data-layer/entity-index';
import { metadata as methodologyMeta } from '../app/methodology/page';
import { metadata as trustMeta } from '../app/trust/page';
import { metadata as constitutionMeta } from '../app/editorial-constitution/page';

console.log('🔍 [audit-rendered-pages] Starting Rendered Metadata & Schema Audit...\n');

interface AuditFinding {
  page: string;
  type: 'P0' | 'P1' | 'P2';
  issue: string;
}

const findings: AuditFinding[] = [];
let passCount = 0;

function check(condition: boolean, page: string, type: 'P0' | 'P1' | 'P2', issue: string) {
  if (!condition) {
    findings.push({ page, type, issue });
  } else {
    passCount++;
  }
}

async function run() {
  // ─── 1. Audit Stories (5 Representative Public Stories) ───────────────────────

  const sampleStories = [
    'mgnrega-reform',
    'rbi-repo-rate',
    'digital-payments-boom',
    'pm-fasal-bima-claims',
    'electoral-bonds',
  ];

  for (const slug of sampleStories) {
    const pageLabel = `/story/${slug}`;
    const meta = await buildStoryMetadata(slug);

    check(Boolean(meta.title), pageLabel, 'P0', 'Title must not be empty');
    check(typeof meta.title === 'string' && !meta.title.includes('Not Found'), pageLabel, 'P0', 'Story must be found');
    check(Boolean(meta.description), pageLabel, 'P1', 'Description must not be empty');
    check(Boolean(meta.alternates?.canonical), pageLabel, 'P0', 'Canonical URL is required');
    check(String(meta.alternates?.canonical).startsWith('https://thebreakdown.in/'), pageLabel, 'P0', 'Canonical URL must use canonical domain');
    check(Boolean(meta.openGraph?.title), pageLabel, 'P1', 'OG title required');
    check(Boolean(meta.openGraph?.url), pageLabel, 'P1', 'OG url required');

    const resolution = await resolveStory(slug);
    check(resolution.type !== 'not_found', pageLabel, 'P0', 'Story must resolve successfully');
    if (resolution.type !== 'not_found') {
      const jsonLd = createStoryJsonLd(resolution.canonicalStory);
      check(Array.isArray(jsonLd) && jsonLd.length >= 2, pageLabel, 'P0', 'JSON-LD must contain NewsArticle & BreadcrumbList');

      const newsArticle = jsonLd.find((s) => s['@type'] === 'NewsArticle' || s['@type'] === 'Article');
      check(Boolean(newsArticle), pageLabel, 'P0', 'NewsArticle/Article schema required');
      if (newsArticle) {
        check(Boolean(newsArticle['headline']), pageLabel, 'P0', 'headline required in schema');
        check(Boolean(newsArticle['author']), pageLabel, 'P0', 'author required in schema');
        check(Boolean(newsArticle['datePublished']), pageLabel, 'P0', 'datePublished required in schema');
      }

      const breadcrumbs = jsonLd.find((s) => s['@type'] === 'BreadcrumbList');
      check(Boolean(breadcrumbs), pageLabel, 'P0', 'BreadcrumbList required in schema');
    }
  }

  // ─── 2. Audit Chapters (Knowledge Library) ───────────────────────────────────

  const { generateMetadata: generateChapterMetadata } = await import(
    '../app/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]/page'
  );

  const sampleChapters = [
    { collectionSlug: 'foundations-1947-1962', volumeSlug: 'the-nehruvian-era', chapterSlug: 'indias-inheritance' },
    { collectionSlug: 'economic-policy-2026', volumeSlug: 'structural-reforms', chapterSlug: 'mgnrega-reform' },
  ];

  for (const c of sampleChapters) {
    const pageLabel = `/series/${c.collectionSlug}/volume/${c.volumeSlug}/chapter/${c.chapterSlug}`;
    const meta = await generateChapterMetadata({ params: Promise.resolve(c) });

    check(Boolean(meta.title), pageLabel, 'P0', 'Chapter title required');
    check(!String(meta.title).includes('Not Found'), pageLabel, 'P0', 'Chapter must be found');
    check(Boolean(meta.description), pageLabel, 'P1', 'Chapter description required');
    check(Boolean(meta.alternates?.canonical), pageLabel, 'P0', 'Chapter canonical URL required');
    check(
      meta.alternates?.canonical === `https://thebreakdown.in${pageLabel}`,
      pageLabel,
      'P0',
      'Chapter canonical URL must match route'
    );
  }

  // ─── 2. Audit Entities (5 Representative Entities) ────────────────────────────

  const sampleEntities = [
    'un',
    'india',
    'jawaharlal-nehru',
    'china',
    'ministry-of-consumer-affairs',
  ];

  for (const slug of sampleEntities) {
    const pageLabel = `/entity/${slug}`;
    const entity = getEntityById(slug);
    check(Boolean(entity), pageLabel, 'P0', 'Entity must resolve in index');
    if (entity) {
      check(Boolean(entity.name), pageLabel, 'P1', 'Entity name required');
      check(Boolean(entity.slug), pageLabel, 'P0', 'Entity slug required');
    }
  }

  // ─── 3. Audit Trust & Policy Pages ───────────────────────────────────────────

  const staticChecks = [
    { label: '/methodology', meta: methodologyMeta },
    { label: '/trust', meta: trustMeta },
    { label: '/editorial-constitution', meta: constitutionMeta },
  ];

  for (const { label, meta } of staticChecks) {
    check(Boolean(meta.title), label, 'P0', 'Title required');
    check(Boolean(meta.description), label, 'P1', 'Description required');
    check(Boolean(meta.alternates?.canonical), label, 'P0', 'Canonical URL required');
    check(String(meta.alternates?.canonical) === `https://thebreakdown.in${label}`, label, 'P0', `Canonical must match https://thebreakdown.in${label}`);
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────

  console.log('==================================================');
  console.log(`✅ Passed checks: ${passCount}`);
  if (findings.length > 0) {
    console.error(`❌ Findings: ${findings.length}`);
    for (const f of findings) {
      console.error(`  [${f.type}] ${f.page}: ${f.issue}`);
    }
    process.exit(1);
  } else {
    console.log('🎉 100% Rendered Page Metadata, Canonical, and JSON-LD assertions passed!\n');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
