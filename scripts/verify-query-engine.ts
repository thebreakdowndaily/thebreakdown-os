import { readFileSync } from 'fs';
import type { ConstituencyRecord } from '../lib/up403/types';
import {
  applyQuery,
  buildThinMarginPreset,
  buildFortressPreset,
  buildScReservedPreset,
  buildBjpMlaIndiaLsPreset,
  buildFloodRiskPreset,
  detectDataGap,
} from '../lib/up403/query-builder';
import { runStoryDiscovery, runFloodRiskQuery } from '../lib/up403/stories';

const raw = readFileSync('data/master-dataset-v1/v1.1.0/up403-master-dataset-v1.json', 'utf-8');
const records = JSON.parse(raw) as ConstituencyRecord[];

const checks: Array<[string, () => { matched: ConstituencyRecord[]; expected?: string }]> = [
  ['BJP seats won by <5% (2022)', () => ({ matched: applyQuery(records, buildThinMarginPreset(2022)) })],
  ['SP fortresses (2022, margin>=10)', () => ({ matched: applyQuery(records, buildFortressPreset(2022)) })],
  ['SC reserved seats', () => ({ matched: applyQuery(records, buildScReservedPreset()) })],
  ['BJP MLA + non-BJP LS 2024', () => ({ matched: applyQuery(records, buildBjpMlaIndiaLsPreset()) })],
  ['Flood risk', () => ({ matched: applyQuery(records, buildFloodRiskPreset()) })],
];

for (const [label, fn] of checks) {
  const { matched } = fn();
  const sample = matched.slice(0, 3).map(r => `${r.constituency_name}(2022=${r.winner_party_2022},m=${r.victory_margin_pct_2022}%)`).join(', ');
  console.log(`${label}: ${matched.length} matches | ${sample}`);
}

const storyReports = runStoryDiscovery(records);
console.log(`\nStories: ${storyReports.length} rules fired`);
for (const r of storyReports) {
  console.log(`  [${r.story.id}] ${r.story.title}: ${r.matches.length}`);
}

const flood = runFloodRiskQuery(records);
console.log(`\nFlood risk (via stories lib): ${flood.length} matches`);

const scGap = detectDataGap(records, buildScReservedPreset());
const floodGap = detectDataGap(records, buildFloodRiskPreset());
console.log(`SC gap detected: ${scGap ? `YES — ${scGap.detail}` : 'NO'}`);
console.log(`Flood gap detected: ${floodGap ? `YES — ${floodGap.detail}` : 'NO'}`);

const thinGap = detectDataGap(records, buildThinMarginPreset(2022));
console.log(`Thin-margin gap detected: ${thinGap ? 'YES (unexpected!)' : 'NO (correct)'}`);

// Sanity: confirm evaluateRule correctness for thin-margin preset sample
const thin = applyQuery(records, buildThinMarginPreset(2022));
const invalid = thin.filter(r => !(r.winner_party_2022 === 'BJP' && (r.victory_margin_pct_2022 ?? 999) < 5));
console.log(`\nThin-margin preset validity: ${invalid.length === 0 ? 'PASS' : `FAIL (${invalid.length} invalid)`}`);
