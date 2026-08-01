/**
 * ─── The Breakdown OS — EOS Story Discovery Engine (RELEASE-4, Module 5) ─────
 * Deterministic discovery over the canonical UP403 dataset. Extends the existing
 * lib/up403/stories.ts rules (landslide, split mandate, handover, dominance,
 * volatility) with newsroom-grade signals: close contests, party realignment,
 * development gaps, infrastructure projects, long-term incumbency.
 *
 * No AI. No duplicate calculations — every signal reads canonical dataset fields
 * directly (margins, flags, derived persistence/volatility indexes already in
 * the frozen v1.1.0 dataset).
 */

import type { ConstituencyRecord } from '../../up403/types';
import type { DiscoveryOpportunity } from '../../../types/editorial-newsroom';
import { getProvenanceForField } from '../../up403/provenance';
import { runStoryDiscovery } from '../../up403/stories';
import { s } from './eos-format';

const CLOSE_MARGIN_THRESHOLD = 3; // percentage points in 2022
const INCUMBENCY_THRESHOLD = 0.8; // normalized winner persistence score (0–1)

function text(value: unknown): string {
  if (value === null || value === undefined) return 'n/a';
  return s(value);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildOpportunity(
  id: string,
  record: ConstituencyRecord,
  title: string,
  category: DiscoveryOpportunity['category'],
  description: string,
  evidence: string[],
  priority: number,
  signal: string
): DiscoveryOpportunity {
  return {
    id: `${id}-${slugify(record.constituency_name)}`,
    title,
    category,
    constituencyId: record.canonical_constituency_id,
    description,
    evidence,
    priority,
    signal,
  };
}

export function runEosDiscovery(records: ConstituencyRecord[]): DiscoveryOpportunity[] {
  const opportunities: DiscoveryOpportunity[] = [];

  // 1. Close contests (2022 margins under threshold) — electoral
  for (const rec of records) {
    const margin = rec.victory_margin_pct_2022;
    if (typeof margin === 'number' && Number.isFinite(margin) && margin < CLOSE_MARGIN_THRESHOLD) {
      const prov = getProvenanceForField('victory_margin_pct_2022');
      opportunities.push(
        buildOpportunity(
          'eos-close-contest',
          rec,
          `${rec.constituency_name}: cliffhanger 2022 result`,
          'electoral',
          `The seat was decided by ${margin.toFixed(2)} points in 2022 — among the closest contests in the state.`,
          [
            `Winner: ${rec.winner_2022} (${rec.winner_party_2022}) with ${s(rec.winner_vote_share_2022)}% vote share`,
            `Margin: ${margin.toFixed(2)} points (source: ${prov.source})`,
            `Runner-up: ${rec.runner_up_2022} (${rec.runner_up_party_2022})`,
            `2024 LS winner here: ${rec.ls2024_pc_winner} (${rec.ls2024_pc_winner_party})`,
          ],
          30,
          'close-contest'
        )
      );
    }
  }

  // 2. Party realignment (Lok Sabha seat changed party in 2024) — representation
  for (const rec of records) {
    if (rec.ls2024_party_changed_flag && rec.ls2024_pc_winner_party) {
      opportunities.push(
        buildOpportunity(
          'eos-party-realignment',
          rec,
          `${rec.constituency_name}: Lok Sabha seat realigned to ${rec.ls2024_pc_winner_party}`,
          'representation',
          'The Lok Sabha constituency changed party hands in 2024 — a measurable realignment signal. (Provenance: LS 2024 results, dataset UP403-DATA-06.)',
          [
            `2024 LS winner: ${rec.ls2024_pc_winner} (${rec.ls2024_pc_winner_party})`,
            `Winner changed flag: ${text(rec.ls2024_winner_changed_flag)}`,
            `2022 AC winner: ${rec.winner_2022} (${rec.winner_party_2022})`,
            `Sitting MLA: ${rec.current_mla_name} (${rec.current_mla_party})`,
          ],
          25,
          'party-realignment'
        )
      );
    }
  }

  // 3. Sparse flagship-project linkage — development
  //    (development_coverage_status is not yet captured at constituency level;
  //     linked_projects_count is the available canonical signal.)
  for (const rec of records) {
    const projects = rec.linked_projects_count;
    if (projects <= 1) {
      opportunities.push(
        buildOpportunity(
          'eos-development-gap',
          rec,
          `${rec.constituency_name}: sparse flagship-project linkage`,
          'development',
          'Few flagship-scheme linkages recorded versus the state pattern. Note: constituency-level development coverage status is not yet captured in the frozen dataset.',
          [
            `Linked flagship projects: ${s(projects)}`,
            `Development coverage status: ${text(rec.development_coverage_status || 'not captured')}`,
            `National highways: ${text(rec.national_highways_count)}`,
            `Railway stations: ${text(rec.railway_stations_count)}`,
            `Economy status: ${text(rec.economy_availability_status)}`,
          ],
          35,
          'development-gap'
        )
      );
    }
  }

  // 4. Infrastructure footprint (multiple national highways + rail) — infrastructure
  for (const rec of records) {
    const highways = Number(rec.national_highways_count || 0);
    const rail = Number(rec.railway_stations_count || 0);
    if (highways >= 2 && rail >= 1) {
      opportunities.push(
        buildOpportunity(
          'eos-infrastructure',
          rec,
          `${rec.constituency_name}: transport corridor constituency`,
          'infrastructure',
          `The seat sits on a transport corridor (${s(highways)} national highway(s), ${s(rail)} railway station(s)) — a structural economic signal.`,
          [
            `National highways: ${s(highways)}`,
            `Railway stations: ${s(rail)}`,
            `Major industries: ${text(rec.major_industries_summary)}`,
            `ODOP product: ${text(rec.odop_product)}`,
            `Economy status: ${text(rec.economy_availability_status)}`,
          ],
          45,
          'infrastructure-corridor'
        )
      );
    }
  }

  // 5. Long-term incumbency (derived winner persistence score) — sociology
  for (const rec of records) {
    const score = rec.derived_winner_persistence_score;
    if (score >= INCUMBENCY_THRESHOLD) {
      opportunities.push(
        buildOpportunity(
          'eos-incumbency',
          rec,
          `${rec.constituency_name}: long-term incumbent seat`,
          'sociology',
          `High winner-persistence score (${s(score)}) — the same representative or party has won repeatedly.`,
          [
            `Winner persistence score: ${s(score)}`,
            `Most persistent party: ${text(rec.most_persistent_party)}`,
            `Winner continuity score: ${text(rec.derived_winner_persistence_score)}`,
            `Party continuity score: ${text(rec.party_continuity_score)}`,
            `Seat history: ${text(rec.seat_history_summary)}`,
          ],
          20,
          'long-term-incumbency'
        )
      );
    }
  }

  return opportunities;
}

/**
 * Full discovery report: canonical stories (lib/up403) + EOS signals.
 * Governance stories are surfaced ONLY as an honest data-gap dimension —
 * the frozen dataset records governance_issue_count = 0 for every seat.
 */
export function buildDiscoveryReport(records: ConstituencyRecord[]) {
  const canonicalReports = runStoryDiscovery(records);
  const eosOpportunities = runEosDiscovery(records);
  const governanceGap =
    records.length > 0 && records.every(r => r.governance_issue_count === 0);

  return {
    canonical: canonicalReports,
    eos: eosOpportunities,
    governanceGap,
    dataGaps: [
      {
        dimension: 'Governance issues',
        detail:
          governanceGap
            ? 'governance_issue_count is 0 across all seats — constituency-level governance data not yet collected (UP403-DATA-10, availability NOT_AVAILABLE).'
            : 'Partial governance data present.',
      },
    ],
  };
}
