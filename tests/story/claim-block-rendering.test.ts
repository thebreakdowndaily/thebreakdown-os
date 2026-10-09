import { strict as assert } from 'node:assert';
import { resolveCanonicalStory } from '../../lib/story/resolver';
import { getBlockComponent } from '../../components/story/blocks/registry';
import { getFeatureFlags } from '../../lib/feature-flags';

async function runTests() {
  console.log('Running Claim Block Rendering Tests...');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  FAIL: ${name}`);
      console.error(e);
      failed++;
    }
  }

  await test('indias-inheritance contains claim blocks and they render through the canonical registry without Unknown block type', async () => {
    // Override feature flag for test to ensure it loads canonical story
    process.env.CANONICAL_READ_PATH = 'ON';
    
    const resolution = await resolveCanonicalStory('indias-inheritance');
    assert.ok(resolution.type === "chapter", 'indias-inheritance canonical story should be found');
    const story = resolution.canonicalStory || resolution.story;
    assert.ok(story, 'indias-inheritance story should exist');
    
    // Check that we have claim blocks
    const claimBlocks = story.blocks.filter(b => b.type === 'claim');
    assert.ok(claimBlocks.length > 0, 'Should have at least one claim block');

    // Check that the block is mapped in the registry
    for (const block of claimBlocks) {
      const Component = getBlockComponent(block.type);
      assert.ok(Component, `Block type "${block.type}" should be registered`);
    }
    
    // Check data and evidence array
    const firstClaim = claimBlocks[0];
    const data = firstClaim.data as any;
    assert.ok(data.statement, 'Claim data should contain statement');
    assert.ok(Array.isArray(data.evidence), 'Claim data should contain evidence array');
  });

  console.log(`\nTests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
