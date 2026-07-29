/**
 * THE BREAKDOWN — Golden Story Test
 *
 * The RBI Monetary Policy story is the golden story.
 * Whenever TSPE, TBSS, TBSRenderer, or block components change,
 * this story must still render correctly.
 *
 * If this test fails, the change must be reverted or the story updated.
 */

import storyData from '../lib/story/tspe-stories/rbi-monetary-policy';
import { storyToBlocks, validateStory } from '../lib/story/tbs-converter';

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

  console.log('Golden Story: RBI Monetary Policy');
  console.log('');

  // Test 1: Story data is defined
  assert(storyData !== undefined, 'Story data is defined');
  assert(storyData !== null, 'Story data is not null');

  // Test 2: Required fields are present
  assert(!!storyData.id, 'Has id');
  assert(!!storyData.slug, 'Has slug');
  assert(!!storyData.title, 'Has title');
  assert(storyData.title !== 'Why the RBI Is Expected to Keep Rates Unchanged', 'Title is improved (not generic)');
  assert(!!storyData.summary, 'Has summary');
  assert(storyData.summary.includes('reducing inflation too early'), 'Summary includes one-sentence takeaway');
  assert(!!storyData.whyItMatters, 'Has whyItMatters');
  assert(!!storyData.narrative, 'Has narrative');

  // Test 3: Metadata is valid
  assert(storyData.metadata.confidence !== 'Insufficient', 'Confidence is not Insufficient');
  assert(storyData.metadata.readingTimeMinutes > 0, 'Has reading time');
  assert(storyData.metadata.tags.length > 0, 'Has tags');
  assert(storyData.metadata.entities.length > 0, 'Has entities');
  assert(!!storyData.metadata.lastVerified, 'Has lastVerified date');

  // Test 4: Hero is valid
  assert(storyData.hero.image !== undefined, 'Has hero image field');
  assert(!!storyData.hero.statistic, 'Has hero statistic');

  // Test 5: Arrays are populated
  assert(storyData.keyFacts.length >= 3, 'Has at least 3 key facts');
  assert(storyData.timeline.length >= 3, 'Has at least 3 timeline events');
  assert(storyData.evidence.length >= 3, 'Has at least 3 evidence entries');
  assert(storyData.sources.length >= 3, 'Has at least 3 sources');
  assert(storyData.faq.length >= 3, 'Has at least 3 FAQ items');
  assert(storyData.takeaways.length >= 3, 'Has at least 3 takeaways');

  // Test 6: Understanding the System section is present (signature section)
  assert(!!storyData.systemExplanation, 'Has systemExplanation section');
  assert(!!storyData.systemExplanation?.headline, 'System explanation has headline');
  assert(storyData.systemExplanation?.steps.length >= 3, 'System explanation has at least 3 steps');

  // Test 7: Stakeholder analysis is present
  assert(!!storyData.stakeholders, 'Has stakeholders section');
  assert(storyData.stakeholders?.stakeholders.length >= 5, 'Has at least 5 stakeholders');

  // Test 8: Multiple perspectives are present
  assert(!!storyData.perspectives, 'Has perspectives section');
  assert(storyData.perspectives?.perspectives.length >= 3, 'Has at least 3 perspectives');

  // Test 9: Trade-offs are present
  assert(storyData.tradeoffs.length >= 2, 'Has at least 2 trade-offs');

  // Test 10: Future outlook is present
  assert(!!storyData.futureOutlook, 'Has futureOutlook section');
  assert(storyData.futureOutlook?.scenarios.length >= 3, 'Has at least 3 scenarios');

  // Test 11: storyToBlocks produces valid output
  const blocks = storyToBlocks(storyData);
  assert(blocks.length > 0, 'storyToBlocks produces blocks');

  const blockTypes = blocks.map(b => b.type);
  assert(blockTypes.includes('executive-summary'), 'Has executive-summary block');
  assert(blockTypes.includes('callout'), 'Has callout block');
  assert(blockTypes.includes('timeline'), 'Has timeline block');
  assert(blockTypes.includes('system-explanation'), 'Has system-explanation block');
  assert(blockTypes.includes('evidence'), 'Has evidence block');
  assert(blockTypes.includes('stakeholders'), 'Has stakeholders block');
  assert(blockTypes.includes('perspectives'), 'Has perspectives block');
  assert(blockTypes.includes('faq'), 'Has faq block');
  assert(blockTypes.includes('sources'), 'Has sources block');

  // Test 12: validateStory produces no errors
  const validation = validateStory(storyData);
  assert(validation.errors.length === 0, 'Validation has no errors');

  // Test 13: Evidence block claims have correct shape
  const evidenceBlock = blocks.find(b => b.type === 'evidence');
  assert(!!evidenceBlock, 'Evidence block exists');
  if (evidenceBlock) {
    const data = evidenceBlock.data as { claims: Array<{ id: string; text: string; confidence: number; status: string; sources: unknown[]; supportingEvidence: string[] }> };
    assert(data.claims.length > 0, 'Evidence block has claims');
    const firstClaim = data.claims[0];
    assert(!!firstClaim.text, 'Claim has text');
    assert(!!firstClaim.confidence, 'Claim has confidence');
    assert(!!firstClaim.status, 'Claim has status');
    assert(Array.isArray(firstClaim.sources), 'Claim has sources array');
    assert(Array.isArray(firstClaim.supportingEvidence), 'Claim has supportingEvidence array');
  }

  // Test 14: Visuals are specified
  assert(storyData.visuals.length >= 3, 'Has at least 3 visual specifications');

  // Test 15: Related knowledge is present
  assert(storyData.relatedKnowledge.length >= 2, 'Has at least 2 related knowledge links');

  console.log('');
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('GOLDEN STORY TEST FAILED — the RBI story is broken');
    process.exit(1);
  } else {
    console.log('GOLDEN STORY TEST PASSED — the RBI story is intact');
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
