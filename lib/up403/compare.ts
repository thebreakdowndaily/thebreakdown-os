import type { ConstituencyRecord, PersonRecord } from './types';
import { getCachedData, getDataById } from './loader';

const COMPARISON_CATEGORIES = [
  'election_history',
  'current_representation',
  'political_dna',
  'economy',
  'development',
  'governance',
  'issues',
  'timeline',
] as const;

export type ComparisonCategory = typeof COMPARISON_CATEGORIES[number];

export function compareConstituencies(ids: string[], categories?: ComparisonCategory[]): Record<string, unknown> {
  const byId = getDataById();
  const selected = ids.map(id => byId.get(id)).filter(Boolean) as ConstituencyRecord[];

  const cats = categories || [...COMPARISON_CATEGORIES];
  const result: Record<string, unknown> = {};

  if (cats.includes('election_history')) {
    const eh: Record<string, unknown> = {};
    for (const rec of selected) {
      eh[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        2012: { winner: rec.winner_2012, party: rec.winner_party_2012, margin: rec.victory_margin_pct_2012 },
        2017: { winner: rec.winner_2017, party: rec.winner_party_2017, margin: rec.victory_margin_pct_2017 },
        2022: { winner: rec.winner_2022, party: rec.winner_party_2022, margin: rec.victory_margin_pct_2022 },
      };
    }
    result.election_history = eh;
  }

  if (cats.includes('current_representation')) {
    const cr: Record<string, unknown> = {};
    for (const rec of selected) {
      cr[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        mla: { name: rec.current_mla_name, party: rec.current_mla_party, status: rec.current_mla_status },
        mp: { name: rec.current_mp_name, party: rec.current_mp_party },
      };
    }
    result.current_representation = cr;
  }

  if (cats.includes('political_dna')) {
    const dna: Record<string, unknown> = {};
    for (const rec of selected) {
      dna[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        classification: rec.dna_classification,
        sub_type: rec.dna_sub_type,
        competitiveness: rec.competitiveness_class,
        trend: rec.competitiveness_trend,
        avg_margin: rec.competitiveness_avg_margin_pct,
        continuity_score: rec.party_continuity_score,
        most_persistent_party: rec.most_persistent_party,
      };
    }
    result.political_dna = dna;
  }

  if (cats.includes('economy')) {
    const eco: Record<string, unknown> = {};
    for (const rec of selected) {
      eco[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        availability: rec.economy_availability_status,
        crops: rec.major_crops_summary,
        industries: rec.major_industries_summary,
        odop: rec.odop_product !== 'not identified' ? rec.odop_product : null,
      };
    }
    result.economy = eco;
  }

  if (cats.includes('development')) {
    const dev: Record<string, unknown> = {};
    for (const rec of selected) {
      dev[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        flagships: rec.flagship_scheme_presence,
        linked_projects: rec.linked_projects_count,
        development_coverage: rec.development_coverage_status,
      };
    }
    result.development = dev;
  }

  if (cats.includes('governance')) {
    const gov: Record<string, unknown> = {};
    for (const rec of selected) {
      gov[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        availability: rec.governance_availability_status,
        issue_count: rec.governance_issue_count,
        issue_summary: rec.governance_issue_summary,
      };
    }
    result.governance = gov;
  }

  if (cats.includes('issues')) {
    const iss: Record<string, unknown> = {};
    for (const rec of selected) {
      iss[rec.canonical_constituency_id] = {
        name: rec.constituency_name,
        governance_issues: rec.governance_issue_summary || null,
        environmental_issues: rec.environmental_issues_summary || null,
        disaster_risks: rec.disaster_risks_summary || null,
      };
    }
    result.issues = iss;
  }

  return result;
}

export function buildPersonRecord(name: string): PersonRecord | null {
  const d = getCachedData();
  const lowerName = name.toLowerCase().trim();

  const matchedConstituencies = d.filter(rec => {
    const allNames = [
      rec.current_mla_name, rec.current_mp_name,
      rec.winner_2022, rec.runner_up_2022,
      rec.winner_2017, rec.runner_up_2017,
      rec.winner_2012, rec.runner_up_2012,
      rec.ls2024_pc_winner,
    ];
    return allNames.some(n => n.toLowerCase().trim() === lowerName);
  });

  if (matchedConstituencies.length === 0) return null;

  const firstRec = matchedConstituencies[0];
  const isCurrentMla = firstRec.current_mla_name.toLowerCase().trim() === lowerName;
  const isCurrentMp = firstRec.current_mp_name.toLowerCase().trim() === lowerName;

  const role: 'MLA' | 'MP' = isCurrentMp ? 'MP' : 'MLA';
  const party = isCurrentMla ? firstRec.current_mla_party
    : isCurrentMp ? firstRec.current_mp_party
    : firstRec.winner_party_2022;

  const electionHistory: PersonRecord['election_history'] = [];

  for (const rec of matchedConstituencies) {
    if (rec.winner_2022.toLowerCase().trim() === lowerName) {
      electionHistory.push({ year: 2022, constituency_id: rec.canonical_constituency_id, constituency_name: rec.constituency_name, position: 'winner', party: rec.winner_party_2022, votes: rec.winner_votes_2022, vote_share: rec.winner_vote_share_2022 });
    }
    if (rec.runner_up_2022.toLowerCase().trim() === lowerName) {
      electionHistory.push({ year: 2022, constituency_id: rec.canonical_constituency_id, constituency_name: rec.constituency_name, position: 'runner_up', party: rec.runner_up_party_2022, votes: 0, vote_share: 0 });
    }
    if (rec.winner_2017.toLowerCase().trim() === lowerName) {
      electionHistory.push({ year: 2017, constituency_id: rec.canonical_constituency_id, constituency_name: rec.constituency_name, position: 'winner', party: rec.winner_party_2017, votes: rec.winner_votes_2017, vote_share: rec.winner_vote_share_2017 });
    }
    if (rec.runner_up_2017.toLowerCase().trim() === lowerName) {
      electionHistory.push({ year: 2017, constituency_id: rec.canonical_constituency_id, constituency_name: rec.constituency_name, position: 'runner_up', party: rec.runner_up_party_2017, votes: 0, vote_share: 0 });
    }
    if (rec.winner_2012.toLowerCase().trim() === lowerName) {
      electionHistory.push({ year: 2012, constituency_id: rec.canonical_constituency_id, constituency_name: rec.constituency_name, position: 'winner', party: rec.winner_party_2012, votes: rec.winner_votes_2012, vote_share: rec.winner_vote_share_2012 });
    }
    if (rec.runner_up_2012.toLowerCase().trim() === lowerName) {
      electionHistory.push({ year: 2012, constituency_id: rec.canonical_constituency_id, constituency_name: rec.constituency_name, position: 'runner_up', party: rec.runner_up_party_2012, votes: 0, vote_share: 0 });
    }
  }

  electionHistory.sort((a, b) => b.year - a.year);

  return {
    person_id: `person:${name}`,
    name,
    role,
    party,
    constituencies: matchedConstituencies.map(rec => ({
      canonical_id: rec.canonical_constituency_id,
      name: rec.constituency_name,
      role: rec.current_mp_name.toLowerCase().trim() === lowerName ? 'MP' : 'MLA',
      year: rec.current_mp_name.toLowerCase().trim() === lowerName ? 2024 : 2022,
    })),
    election_history: electionHistory,
  };
}

export function listPeople(page: number = 1, limit: number = 50): { people: PersonRecord[]; total: number } {
  const d = getCachedData();
  const names = new Set<string>();

  for (const rec of d) {
    const candidates = [rec.current_mla_name, rec.current_mp_name, rec.winner_2022, rec.winner_2017, rec.winner_2012, rec.ls2024_pc_winner];
    for (const n of candidates) {
      if (n && n.trim()) names.add(n.trim());
    }
  }

  const sorted = [...names].sort();
  const total = sorted.length;
  const start = (page - 1) * limit;
  const sliced = sorted.slice(start, start + limit);
  const people = sliced.map(n => buildPersonRecord(n)).filter(Boolean) as PersonRecord[];

  return { people, total };
}
