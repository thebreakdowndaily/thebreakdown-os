import * as fs from 'fs';
import * as path from 'path';

function runTests() {
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

  console.log('── Legal Compliance: Boundary Representation & Attribution ──');

  // Verify MapRenderer.tsx has the disclaimer
  const mapRendererPath = path.join(__dirname, '../components/maps/MapRenderer.tsx');
  const mapRendererContent = fs.readFileSync(mapRendererPath, 'utf8');
  assert(
    mapRendererContent.includes('Boundary representations shown on this map are for illustrative and editorial purposes only'),
    'MapRenderer.tsx contains the neutral boundary representation disclaimer'
  );
  assert(
    !mapRendererContent.includes('Criminal Law Amendment Act') && !mapRendererContent.includes('1961'),
    'MapRenderer.tsx does NOT hardcode specific statute names in the UI text'
  );

  // Verify MapBlock.tsx has the disclaimer
  const mapBlockPath = path.join(__dirname, '../components/story/blocks/MapBlock.tsx');
  const mapBlockContent = fs.readFileSync(mapBlockPath, 'utf8');
  assert(
    mapBlockContent.includes('Boundary representations shown on this map are for illustrative and editorial purposes only'),
    'MapBlock.tsx contains the neutral boundary representation disclaimer'
  );
  assert(
    !mapBlockContent.includes('Criminal Law Amendment Act') && !mapBlockContent.includes('1961'),
    'MapBlock.tsx does NOT hardcode specific statute names in the UI text'
  );

  console.log(`\nLegal Compliance Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
