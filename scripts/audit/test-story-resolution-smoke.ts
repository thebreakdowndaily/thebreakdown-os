import { resolveStory } from '../../lib/story/resolver';
import { isCanonicalStoryPublic } from '../../lib/story/publication';
import { getFeatureFlags } from '../../lib/feature-flags';
import { strict as assert } from 'node:assert';

async function runSmokeTest() {
  console.log('========================================================================');
  console.log('THE BREAKDOWN — STORY RESOLUTION SMOKE TEST');
  console.log('========================================================================\n');

  // 1. Configure the intended reading path
  process.env.CANONICAL_READ_PATH = 'ON';
  const flags = getFeatureFlags();
  console.log(`[Configured Flag State]: CANONICAL_READ_PATH = ${flags.CANONICAL_READ_PATH}`);
  assert.equal(flags.CANONICAL_READ_PATH, 'ON', 'Flag must be ON');

  // 2. Resolve target story
  const slug = 'bcci-domestic-mandate-ranji-economics';
  console.log(`Resolving story: ${slug}...`);
  const resolution = await resolveStory(slug);

  console.log(`Resolution outcome:`, {
    type: resolution.type,
    isChapter: resolution.type === 'chapter',
    isLegacy: resolution.type === 'legacy_story',
  });

  assert.notEqual(resolution.type, 'not_found', 'Story must not return not_found');

  const story = resolution.canonicalStory;
  assert.ok(story, 'Canonical story object must be present');
  console.log(`Story Title: "${story.title}"`);
  console.log(`Reading Time: ${story.readingTime} minutes`);

  // 3. Prove chapters, claims and evidence are present
  const chapters = story.blocks.filter((b) => b.type === 'header' || (b as any).heading);
  const narrativeParagraphs = story.blocks.filter((b) => b.type === 'paragraph');
  const claims = story.claims || [];
  const sources = story.sources || [];

  console.log(`\nIntegrity Verification:`);
  console.log(`- Narrative Blocks: ${story.blocks.length}`);
  console.log(`- Narrative Paragraphs: ${narrativeParagraphs.length}`);
  console.log(`- Claims Count: ${claims.length}`);
  console.log(`- Sources (Evidence) Count: ${sources.length}`);

  assert.ok(story.blocks.length >= 6, 'Must contain at least 6 narrative blocks/chapters');
  assert.ok(claims.length >= 5, 'Must contain at least 5 verified claims');
  assert.ok(sources.length >= 5, 'Must contain at least 5 primary sources');

  // 4. Prove publication safety (fail-closed release hold)
  const isPublic = isCanonicalStoryPublic(story);
  console.log(`\nPublication Gate Safety:`);
  console.log(`- isCanonicalStoryPublic: ${isPublic} (Expected: false while release hold is active)`);
  assert.equal(isPublic, false, 'Unauthenticated public request must fail closed while release hold is active');

  console.log('\n========================================================================');
  console.log('STORY RESOLUTION SMOKE TEST: ALL ASSERTIONS PASSED (100% OK)');
  console.log('========================================================================');
}

runSmokeTest().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
