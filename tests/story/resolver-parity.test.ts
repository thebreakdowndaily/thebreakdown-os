import { resolveCanonicalStory, resolveLegacyStory } from '../../lib/story/resolver';

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

  console.log('Running Task 7.2: Canonical Resolver Parity Tests...\n');

  const mappedSlugs = [
    'mgnrega-reform',
    'rbi-repo-rate'
  ];

  const unmappedSlugs = [
    'digital-payments-boom',
    'pm-fasal-bima-claims',
    'semiconductor-pli',
    'dpdp-bill',
    'climate-finance',
    'education-budget',
    'groundwater-depletion',
    'ration-digitization',
    'anganwadi-icds',
    'supply-chain-shift',
    'ethanol-backlash',
    'ews-quota-upsc-investigation'
  ];

  // Test Mapped Slugs
  for (const slug of mappedSlugs) {
    try {
      const canonical = await resolveCanonicalStory(slug);
      const legacy = await resolveLegacyStory(slug);

      assert(canonical.type === 'chapter', `[${slug}] Canonical resolver should return 'chapter' type`);
      assert(legacy.type === 'legacy_story', `[${slug}] Legacy resolver should return 'legacy_story' type`);

      if (canonical.type === 'chapter' && legacy.type === 'legacy_story') {
        // Assert Slug Identity Parity (Ensuring both resolvers route to the same core URL identifier)
        assert(canonical.canonicalStory?.slug === slug, `[${slug}] Canonical Story retains correct slug`);
        assert(legacy.canonicalStory?.slug === slug, `[${slug}] Legacy Story retains correct slug`);
        assert(canonical.canonicalStory?.slug === legacy.canonicalStory?.slug, `[${slug}] Cross-resolver slug parity`);

        // Assert Structural Output Parity (Ensuring both deliver the expected nested UI data arrays)
        assert(Array.isArray(canonical.candidateTimelineEvents), `[${slug}] Canonical timeline events array exists`);
        assert(Array.isArray(legacy.candidateTimelineEvents), `[${slug}] Legacy timeline events array exists`);
        
        assert(Array.isArray(canonical.relatedStories), `[${slug}] Canonical related stories array exists`);
        assert(Array.isArray(legacy.relatedStories), `[${slug}] Legacy related stories array exists`);
        
        // Assert Canonical specific rich properties exist
        assert(typeof canonical.claimCount === 'number', `[${slug}] Canonical exposes claim density`);
        assert(typeof canonical.evidenceCount === 'number', `[${slug}] Canonical exposes evidence density`);
      }
    } catch (e) {
      console.error(e);
      assert(false, `[${slug}] Unexpected error during mapped slug parity test`);
    }
  }

  // Test Unmapped Slugs
  for (const slug of unmappedSlugs) {
    try {
      const canonical = await resolveCanonicalStory(slug);
      const legacy = await resolveLegacyStory(slug);

      assert(canonical.type === 'not_found', `[${slug}] Canonical resolver safely falls back (returns not_found) for unmapped slug`);
      assert(legacy.type === 'legacy_story', `[${slug}] Legacy resolver continues to support unmapped slug normally`);
    } catch (e) {
      console.error(e);
      assert(false, `[${slug}] Unexpected error during unmapped slug test`);
    }
  }

  console.log(`\nParity Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
