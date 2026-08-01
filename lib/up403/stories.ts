import type { ConstituencyRecord } from './types';
import { buildBjpMlaIndiaLsPreset, applyQuery } from './query-builder';

export interface StoryMatch {
  record: ConstituencyRecord;
  headline: string;
  evidence: string[];
}

export interface Story {
  id: string;
  title: string;
  description: string;
  category: 'electoral' | 'representation' | 'sociology';
  priority: number;
  match: (record: ConstituencyRecord) => boolean;
  headlineFor: (record: ConstituencyRecord) => string;
  evidenceFor: (record: ConstituencyRecord) => string[];
}

export const DATA_GAPS: Array<{ dimension: string; detail: string }> = [
  {
    dimension: 'SC/ST reservation',
    detail: 'The frozen v1.1.0 dataset records all 403 constituencies as GENERAL. Scheduled Caste / Scheduled Tribe reservation is not yet captured at constituency level.',
  },
  {
    dimension: 'Governance issues',
    detail: 'governance_issue_count is 0 across all 403 seats. Constituency-level governance data has not been collected (governance_availability_status is NOT_AVAILABLE).',
  },
  {
    dimension: 'Flood / disaster risk',
    detail: 'disaster_risks_summary is empty for every seat. Disaster-risk profiles require a geospatial pipeline (WP9) and are not yet available.',
  },
];

function partyName(party: string): string {
  return party || 'unknown party';
}

export const STORIES: Story[] = [
  {
    id: 'landslide-margin',
    title: 'Landslide victories',
    description: 'Seats won by more than 20% in 2022 — dominant single-party mandate.',
    category: 'electoral',
    priority: 10,
    match: r => r.victory_margin_pct_2022 >= 20,
    headlineFor: r => `${r.constituency_name}: ${partyName(r.winner_party_2022)} won by ${r.victory_margin_pct_2022.toFixed(1)}%`,
    evidenceFor: r => [
      `Winner: ${r.winner_2022} (${r.winner_party_2022}) with ${r.winner_vote_share_2022.toFixed(1)}% vote share`,
      `Margin: ${r.victory_margin_pct_2022.toFixed(1)} points (2022)`,
      `Runner-up: ${r.runner_up_2022} (${r.runner_up_party_2022})`,
    ],
  },
  {
    id: 'split-mandate',
    title: 'Split mandates: BJP MLA, non-BJP LS seat',
    description: 'BJP holds the assembly seat but the Lok Sabha seat went non-BJP in 2024 — a voter signal worth studying.',
    category: 'representation',
    priority: 20,
    match: r => r.current_mla_party === 'BJP' && r.ls2024_pc_winner_party !== 'BJP',
    headlineFor: r => `${r.constituency_name}: BJP MLA, ${partyName(r.ls2024_pc_winner_party)} Lok Sabha seat`,
    evidenceFor: r => [
      `Current MLA: ${r.current_mla_name} (${r.current_mla_party})`,
      `2024 LS winner: ${r.ls2024_pc_winner} (${r.ls2024_pc_winner_party}) for ${r.current_mp_pc_name || r.pc_name}`,
      `2022 AC winner: ${r.winner_2022} (${r.winner_party_2022})`,
    ],
  },
  {
    id: 'handover-winner',
    title: 'MLA vacancy or by-election',
    description: 'The sitting MLA changed mid-term — vacancy, by-election, or party switch.',
    category: 'representation',
    priority: 15,
    match: r =>
      r.current_mla_status === 'VACANT' ||
      r.current_mla_status === 'BYELECTION_HELD' ||
      r.current_mla_representation_change_type === 'PARTY_SWITCH' ||
      r.current_mla_by_election_date !== '',
    headlineFor: r => `${r.constituency_name}: MLA seat changed mid-term`,
    evidenceFor: r => [
      `Current MLA: ${r.current_mla_name || 'n/a'} (${r.current_mla_party || 'n/a'}) — status: ${r.current_mla_status || 'n/a'}`,
      `Change type: ${r.current_mla_representation_change_type || 'none recorded'}`,
      r.current_mla_by_election_date ? `By-election: ${r.current_mla_by_election_date}` : 'No by-election date recorded',
      r.current_mla_vacancy_reason ? `Vacancy reason: ${r.current_mla_vacancy_reason}` : 'No vacancy reason recorded',
    ],
  },
  {
    id: 'party-dominance',
    title: 'Persistent party dominance',
    description: 'Seats where one party has won three consecutive elections (2012, 2017, 2022).',
    category: 'sociology',
    priority: 12,
    match: r =>
      r.winner_party_2012 === r.winner_party_2017 &&
      r.winner_party_2017 === r.winner_party_2022 &&
      !!r.winner_party_2022,
    headlineFor: r => `${r.constituency_name}: ${partyName(r.winner_party_2022)} won all three elections`,
    evidenceFor: r => [
      `2012: ${r.winner_party_2012} — 2017: ${r.winner_party_2017} — 2022: ${r.winner_party_2022}`,
      `Party continuity score: ${String(r.party_continuity_score)}`,
      `Most persistent party: ${r.most_persistent_party || 'n/a'}`,
    ],
  },
  {
    id: 'high-volatility',
    title: 'High seat volatility',
    description: 'Seats where the winning party changed in both 2017 and 2022 — no party held the seat across all three elections.',
    category: 'electoral',
    priority: 14,
    match: r => r.seat_volatility_index >= 2,
    headlineFor: r => `${r.constituency_name}: volatile seat (party changed twice)`,
    evidenceFor: r => [
      `Seat volatility index: ${String(r.seat_volatility_index)} party changes across 2012→2017→2022`,
      `Unique winners across elections: ${String(r.unique_winners_across_elections)}`,
      `Trajectory: ${r.trajectory_steps_compact || 'n/a'}`,
    ],
  },
];

export interface StoryReport {
  story: Story;
  matches: StoryMatch[];
}

export function runStoryDiscovery(records: ConstituencyRecord[]): StoryReport[] {
  return STORIES.map(story => {
    const matched = records.filter(story.match);
    return {
      story,
      matches: matched.map(record => ({
        record,
        headline: story.headlineFor(record),
        evidence: story.evidenceFor(record),
      })),
    };
  })
    .filter(report => report.matches.length > 0)
    .sort((a, b) => a.story.priority - b.story.priority);
}

export function storyPresetQueries(storyId: string): Record<string, unknown>[] {
  if (storyId === 'split-mandate') {
    return buildBjpMlaIndiaLsPreset().map(r => ({ ...r }));
  }
  return [];
}

export function runFloodRiskQuery(records: ConstituencyRecord[]) {
  return applyQuery(records, [
    {
      id: 'flood-1',
      field: 'disaster_risks_summary',
      operator: 'contains',
      value: 'flood',
      label: 'Disaster risk summary mentions flood',
    },
  ]);
}
