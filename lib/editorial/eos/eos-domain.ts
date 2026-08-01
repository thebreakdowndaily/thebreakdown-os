/**
 * ─── The Breakdown OS — EOS Research Workspace (RELEASE-4, Modules 2–3) ──────
 * Research dossiers and the Story Builder packet. The packet is assembled from
 * the canonical UP403 record only — deterministic rules, zero AI-generated copy.
 * Every fact carries field-level provenance (getProvenanceForField).
 */

import type { ConstituencyRecord } from '../../up403/types';
import type {
  ResearchDossier,
  StoryPacket,
  StoryPacketFact,
  StoryPacketSection,
} from '../../../types/editorial-newsroom';
import { getProvenanceForField } from '../../up403/provenance';
import { s } from './eos-format';

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return s(value);
}

export function createDossier(input: {
  id: string;
  title: string;
  constituencyIds: string[];
  researchQuestions: string[];
}): ResearchDossier {
  const now = new Date().toISOString();
  return {
    id: input.id,
    title: input.title,
    constituencyIds: input.constituencyIds,
    researchQuestions: input.researchQuestions,
    evidence: [],
    notes: [],
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
}

export function captureDossierEvidence(
  dossier: ResearchDossier,
  record: ConstituencyRecord,
  field: string,
  excerpt: string
): ResearchDossier {
  const value = record[field];
  const prov = getProvenanceForField(field);
  const now = new Date().toISOString();
  const item = {
    id: `ev-${dossier.id}-${field}-${String(Date.now())}`,
    dossierId: dossier.id,
    constituencyId: record.canonical_constituency_id,
    field,
    value: text(value),
    excerpt,
    provenance: prov,
    capturedAt: now,
  };
  return {
    ...dossier,
    evidence: [...dossier.evidence, item],
    status: dossier.status === 'open' ? 'in_progress' : dossier.status,
    updatedAt: now,
  };
}

export function addDossierNote(
  dossier: ResearchDossier,
  authorId: string,
  body: string,
  mentions: string[] = []
): ResearchDossier {
  const now = new Date().toISOString();
  return {
    ...dossier,
    notes: [...dossier.notes, { id: `note-${dossier.id}-${String(Date.now())}`, dossierId: dossier.id, authorId, body, mentions, createdAt: now }],
    updatedAt: now,
  };
}

function fact(label: string, value: unknown, field: string): StoryPacketFact {
  return {
    id: `fact-${field}`,
    label,
    value: text(value),
    canonicalField: field,
    provenance: getProvenanceForField(field),
  };
}

/** Module 3 — Story Builder: deterministic packet assembled from the canonical record. */
export function buildStoryPacket(record: ConstituencyRecord): StoryPacket {
  const sections: StoryPacketSection[] = [
    {
      id: 'sec-overview',
      heading: 'Constituency overview',
      canonicalFields: ['constituency_name', 'district', 'division', 'region', 'reservation_type'],
      content: [
        `${record.constituency_name} (AC ${s(record.ac_number)}) is an Assembly constituency in ${text(record.district)} district, ${text(record.division)} division, ${text(record.region)} region of Uttar Pradesh.`,
        `Reservation type recorded: ${text(record.reservation_type)}. Parliamentary seat: ${text(record.pc_name)} (PC ${text(record.pc_number)}).`,
      ],
    },
    {
      id: 'sec-electoral',
      heading: 'Electoral history (2012 → 2017 → 2022)',
      canonicalFields: ['winner_2012', 'winner_party_2012', 'winner_2017', 'winner_party_2017', 'winner_2022', 'winner_party_2022', 'victory_margin_pct_2022'],
      content: [
        `2012: ${text(record.winner_2012)} (${text(record.winner_party_2012)}), margin ${text(record.victory_margin_pct_2012)} pts.`,
        `2017: ${text(record.winner_2017)} (${text(record.winner_party_2017)}), margin ${text(record.victory_margin_pct_2017)} pts.`,
        `2022: ${text(record.winner_2022)} (${text(record.winner_party_2022)}), margin ${text(record.victory_margin_pct_2022)} pts, ${text(record.winner_vote_share_2022)}% vote share.`,
      ],
    },
    {
      id: 'sec-representation',
      heading: 'Current representation',
      canonicalFields: ['current_mla_name', 'current_mla_party', 'current_mla_status', 'current_mp_name', 'current_mp_party', 'ls2024_pc_winner'],
      content: [
        `Sitting MLA: ${text(record.current_mla_name)} (${text(record.current_mla_party)}), status ${text(record.current_mla_status)}, elected via ${text(record.current_mla_elected_via)}.`,
        `Sitting MP: ${text(record.current_mp_name)} (${text(record.current_mp_party)}), term ${text(record.current_mp_term_start)} – ${text(record.current_mp_term_end)}.`,
        `Lok Sabha 2024 winner for ${text(record.pc_name)}: ${text(record.ls2024_pc_winner)} (${text(record.ls2024_pc_winner_party)}).`,
      ],
    },
    {
      id: 'sec-dna',
      heading: 'Political DNA',
      canonicalFields: ['dna_classification', 'dna_sub_type', 'dna_reasoning', 'dna_confidence'],
      content: [
        `DNA classification: ${text(record.dna_classification)} — ${text(record.dna_sub_type)}.`,
        `Reasoning: ${text(record.dna_reasoning)}. Confidence: ${text(record.dna_confidence)} (algorithm ${text(record.dna_algorithm_version)}).`,
        `Seat volatility index: ${text(record.seat_volatility_index)} party changes across 2012–2022.`,
      ],
    },
    {
      id: 'sec-development',
      heading: 'Development & infrastructure profile',
      canonicalFields: ['development_coverage_status', 'linked_projects_count', 'national_highways_count', 'railway_stations_count', 'economy_availability_status'],
      content: [
        `Development coverage: ${text(record.development_coverage_status)} with ${s(record.linked_projects_count)} linked flagship projects (PMGSY / JJM / PMAY records: ${text(record.flagship_scheme_presence)}).`,
        `Infrastructure: ${text(record.national_highways_count)} national highway(s), ${text(record.railway_stations_count)} railway station(s).`,
        `Economy availability: ${text(record.economy_availability_status)} — ODOP product ${text(record.odop_product)}.`,
      ],
    },
  ];

  const facts: StoryPacketFact[] = [
    fact('Assembly constituency', record.constituency_name, 'constituency_name'),
    fact('District', record.district, 'district'),
    fact('Region', record.region, 'region'),
    fact('Parliamentary seat', record.pc_name, 'pc_name'),
    fact('2022 winner', record.winner_2022, 'winner_2022'),
    fact('2022 winner party', record.winner_party_2022, 'winner_party_2022'),
    fact('2022 margin (pts)', record.victory_margin_pct_2022, 'victory_margin_pct_2022'),
    fact('Current MLA', record.current_mla_name, 'current_mla_name'),
    fact('Current MLA party', record.current_mla_party, 'current_mla_party'),
    fact('Current MLA status', record.current_mla_status, 'current_mla_status'),
    fact('Current MP', record.current_mp_name, 'current_mp_name'),
    fact('LS 2024 winner', record.ls2024_pc_winner, 'ls2024_pc_winner'),
    fact('DNA classification', record.dna_classification, 'dna_classification'),
    fact('Development coverage', record.development_coverage_status, 'development_coverage_status'),
  ];

  return {
    id: `packet-${record.canonical_constituency_id}`,
    storyId: '',
    constituencyId: record.canonical_constituency_id,
    headline: `${record.constituency_name}: ${text(record.winner_party_2022)} held the seat — ${text(record.winner_2022)}`,
    dek: `Evidence-first constituency briefing assembled from the frozen UP403 dataset (v${text(record.master_dataset_version)}), research cutoff ${text(record.research_cutoff_date)}.`,
    sections,
    facts,
    generatedAt: new Date().toISOString(),
  };
}

export function buildPacketHeadline(record: ConstituencyRecord, opportunityTitle: string): string {
  return `${record.constituency_name}: ${opportunityTitle.toLowerCase().replace(record.constituency_name + ': ', '')} — current MLA ${text(record.current_mla_name)} (${text(record.current_mla_party)})`;
}
