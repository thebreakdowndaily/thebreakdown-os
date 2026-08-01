/**
 * ─── The Breakdown OS — EOS Editorial Collections (RELEASE-4, Module 6) ───────
 * Dynamic, rule-based collections over the canonical dataset. Rules are plain
 * deterministic queries (region, reservation, party hold, competitiveness,
 * margins, volatility) — no editorial hand-picking, fully reproducible.
 */

import type { ConstituencyRecord } from '../../up403/types';
import type { EditorialCollection } from '../../../types/editorial-newsroom';

const BUNDELKHAND_DISTRICTS = ['Jhansi', 'Jalaun', 'Hamirpur', 'Banda', 'Chitrakoot', 'Lalitpur', 'Mahoba'];

export interface CollectionRule {
  id: string;
  name: string;
  description: string;
  rule: string;
  signal: string;
  match: (r: ConstituencyRecord) => boolean;
}

export const COLLECTION_RULES: CollectionRule[] = [
  {
    id: 'western-up',
    name: 'Western UP',
    description: 'Assembly seats in the Western UP (NCR + Western) region.',
    rule: "region === 'Western UP (NCR + Western)'",
    signal: 'regional-batch',
    match: r => r.region === 'Western UP (NCR + Western)',
  },
  {
    id: 'purvanchal',
    name: 'Purvanchal',
    description: 'Assembly seats in the Eastern UP (Gangetic Plain) region.',
    rule: "region === 'Eastern UP (Gangetic Plain)'",
    signal: 'regional-batch',
    match: r => r.region === 'Eastern UP (Gangetic Plain)',
  },
  {
    id: 'central-up',
    name: 'Central UP',
    description: 'Assembly seats in the Central UP region.',
    rule: "region === 'Central UP'",
    signal: 'regional-batch',
    match: r => r.region === 'Central UP',
  },
  {
    id: 'bundelkhand',
    name: 'Bundelkhand',
    description: 'Assembly seats across the Bundelkhand cultural-geographic belt.',
    rule: `district in ${BUNDELKHAND_DISTRICTS.join(', ')}`,
    signal: 'cultural-belt',
    match: r => BUNDELKHAND_DISTRICTS.includes(r.district),
  },
  {
    id: 'bjp-strongholds',
    name: 'BJP strongholds',
    description: 'Seats where BJP won the 2022 Assembly seat and still holds the MLA position.',
    rule: "current_mla_party === 'BJP' && winner_party_2022 === 'BJP'",
    signal: 'party-hold',
    match: r => r.current_mla_party === 'BJP' && r.winner_party_2022 === 'BJP',
  },
  {
    id: 'sp-strongholds',
    name: 'SP strongholds',
    description: 'Seats where SP won the 2022 Assembly seat and still holds the MLA position.',
    rule: "current_mla_party === 'SP' && winner_party_2022 === 'SP'",
    signal: 'party-hold',
    match: r => r.current_mla_party === 'SP' && r.winner_party_2022 === 'SP',
  },
  {
    id: 'swing-seats',
    name: 'Swing / marginal seats',
    description: 'Seats classified SWING or MARGINAL by the competitiveness algorithm.',
    rule: "competitiveness_class in ('SWING', 'MARGINAL')",
    signal: 'electoral-swing',
    match: r => r.competitiveness_class === 'SWING' || r.competitiveness_class === 'MARGINAL',
  },
  {
    id: 'close-contests',
    name: 'Close contests 2022',
    description: 'Seats decided by fewer than 3 percentage points in 2022.',
    rule: 'victory_margin_pct_2022 < 3',
    signal: 'electoral-close',
    match: r => typeof r.victory_margin_pct_2022 === 'number' && r.victory_margin_pct_2022 < 3,
  },
  {
    id: 'volatile-seats',
    name: 'Volatile seats',
    description: 'Seats where the winning party changed twice across 2012→2017→2022.',
    rule: 'seat_volatility_index >= 2',
    signal: 'electoral-volatility',
    match: r => r.seat_volatility_index >= 2,
  },
  {
    id: 'ls-realignment',
    name: 'Lok Sabha realignment',
    description: 'Constituencies whose Lok Sabha seat changed party in 2024.',
    rule: 'ls2024_party_changed_flag === true',
    signal: 'representation-realignment',
    match: r => r.ls2024_party_changed_flag,
  },
];

export function buildCollections(records: ConstituencyRecord[]): EditorialCollection[] {
  return COLLECTION_RULES.map(rule => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    rule: rule.rule,
    signal: rule.signal,
    constituencyIds: records.filter(rule.match).map(r => r.canonical_constituency_id).sort(),
  }));
}
