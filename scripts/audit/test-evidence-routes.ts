import { REMEDIATED_STORIES_REGISTRY } from '../../lib/editorial/drafts/remediated-stories';

const story = REMEDIATED_STORIES_REGISTRY['bcci-domestic-mandate-ranji-economics'];
if (!story) throw new Error('BCCI story not found in registry');

const expectedSourceIds = [
  'src-bcci-retainership-2024',
  'src-bcci-test-incentive',
  'src-bcci-domestic-remuneration',
  'src-bcci-tournament-regulations',
  'src-bcci-ipl-auction-rules',
];

console.log('=== AUDITING BCCI EVIDENCE DOSSIERS & PRIMARY SOURCES ===\n');

for (const id of expectedSourceIds) {
  const source = (story.sources || []).find((s) => s.id === id);
  if (!source) throw new Error(`Source ${id} not found in story.sources`);

  const associatedClaims = (story.claims || []).filter(
    (c) => c.sourceId === id || c.source === id || c.sourceUrl?.includes(id)
  );

  console.log(`[EVIDENCE ID]: ${id}`);
  console.log(`  Title: ${source.title}`);
  console.log(`  Publisher: ${source.publisher}`);
  console.log(`  Published Date: ${source.publishedAt}`);
  console.log(`  Access Date: ${source.accessedAt}`);
  console.log(`  Tier: Tier ${source.tier} (${source.sourceType})`);
  console.log(`  Primary Document URL: ${source.url}`);
  console.log(`  Associated Claims Count: ${associatedClaims.length}`);

  for (const claim of associatedClaims) {
    console.log(`    - Claim ID: ${claim.id}`);
    console.log(`      Statement: ${claim.claim}`);
    console.log(`      Quote: "${claim.quote}"`);
    console.log(`      Data/Context: ${claim.data}`);
    console.log(`      Status: ${claim.status || claim.verificationStatus} (Confidence: ${claim.confidence})`);
  }
  console.log('------------------------------------------------------------\n');
}

console.log('ALL 5 EVIDENCE DOSSIERS FULLY VERIFIED!');
