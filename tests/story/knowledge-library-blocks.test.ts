import { strict as assert } from 'node:assert';
import { resolveCanonicalStory } from '../../lib/story/resolver';
import { getBlockComponent } from '../../components/story/blocks/registry';

async function runTests() {
  console.log('Running Knowledge Library Blocks Tests...');
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

  await test('indias-inheritance renders learning, list, and document blocks without Unknown block type', async () => {
    process.env.CANONICAL_READ_PATH = 'ON';
    
    const resolution = await resolveCanonicalStory('indias-inheritance');
    assert.ok(resolution.type === "chapter", 'indias-inheritance canonical story should be found');
    const story = resolution.canonicalStory || resolution.story;
    assert.ok(story, 'indias-inheritance story should exist');
    
    // Check that we have the specific blocks
    const learningBlocks = story.blocks.filter(b => b.type === 'learning');
    const listBlocks = story.blocks.filter(b => b.type === 'list');
    const documentBlocks = story.blocks.filter(b => b.type === 'document');

    assert.ok(learningBlocks.length > 0, 'Should have at least one learning block');
    assert.ok(listBlocks.length > 0, 'Should have at least one list block');
    assert.ok(documentBlocks.length > 0, 'Should have at least one document block');

    const expectedBlocks = ['learning', 'list', 'document'];

    for (const blockType of expectedBlocks) {
      const Component = getBlockComponent(blockType);
      assert.ok(Component, `Block type "${blockType}" should be registered`);
    }

    // Verify all blocks from indias-inheritance have registered components (no Unknown block types)
    const unknownBlocks = new Set<string>();
    for (const block of story.blocks) {
      const Component = getBlockComponent(block.type);
      if (!Component) {
        unknownBlocks.add(block.type);
      }
    }

    assert.equal(unknownBlocks.size, 0, `There should be zero unknown block types, but found: ${Array.from(unknownBlocks).join(', ')}`);
  });

  console.log(`\nTests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
