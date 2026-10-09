import { strict as assert } from 'node:assert';
import { resolveCanonicalStory } from '../../lib/story/resolver';
import { normalizeChartBlockData } from '../../lib/story/chart-contract';

async function runTests() {
  console.log('Running Sankey Canonical Block Tests...');
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

  await test('indias-inheritance canonical visual block resolves to sankey with correct data', async () => {
    // Override feature flag for test to ensure it loads canonical story
    process.env.CANONICAL_READ_PATH = 'ON';
    
    const resolution = await resolveCanonicalStory('indias-inheritance');
    assert.ok(resolution.type === "chapter", 'indias-inheritance canonical story should be found');
    const story = resolution.canonicalStory || resolution.story;
    assert.ok(story, 'indias-inheritance story should exist');
    
    // Find the chart block for Refugee flows
    const sankeyBlock = story.blocks.find(b => b.type === 'chart' && (b.data as any).chartType === 'sankey');
    assert.ok(sankeyBlock, 'Should find the Sankey chart block in the canonical story');

    // Normalize data contract
    const normalized = normalizeChartBlockData(sankeyBlock.data);
    assert.ok(normalized, 'Chart block data should be valid');
    assert.equal(normalized.type, 'sankey', 'Normalized block should be of type sankey');

    if (normalized.type === 'sankey') {
        assert.equal(normalized.data.length, 4, 'Should contain exactly 4 flow records');
        
        const flows = normalized.data;
        assert.equal(flows[0].volume, 4.7, 'Volume should be 4.7');
        assert.equal(flows[1].volume, 6.5, 'Volume should be 6.5');
        assert.equal(flows[2].volume, 2.6, 'Volume should be 2.6');
        assert.equal(flows[3].volume, 0.7, 'Volume should be 0.7');

        assert.equal(flows[0].origin, 'West Pakistan', 'Origin should be West Pakistan');
        assert.equal(flows[1].destination, 'West Pakistan', 'Destination should be West Pakistan');
    }
  });

  console.log(`\nTests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
