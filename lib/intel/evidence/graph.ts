import type { ConstituencyRecord } from '@/lib/up403/types';
import { getProvenanceForField } from '@/lib/up403/provenance';
import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import { confidenceFrom, hasNumber } from '@/lib/intel/scoring/util';
import { EVIDENCE_FIELDS, EVIDENCE_CATEGORY_LABELS } from './registry';
import type {
  ConstituencyEvidence,
  EvidenceCategory,
  EvidenceCategoryCoverage,
  EvidenceItem,
  EvidenceStatus,
  EvidenceTimelineEntry,
} from './types';

const QUALITY_TO_CONFIDENCE: Record<string, ConfidenceTier> = {
  AUTHENTIC: 'VERY_HIGH',
  STRUCTURED: 'HIGH',
  DERIVED: 'MEDIUM',
  METADATA: 'LOW',
  NOT_AVAILABLE: 'VERY_LOW',
};

function confidenceForQuality(quality: string): ConfidenceTier {
  return QUALITY_TO_CONFIDENCE[quality] ?? 'LOW';
}

function isPresent(rec: ConstituencyRecord, field: string, kind: string): boolean {
  const value = rec[field];
  if (value === null || value === undefined) return false;
  if (kind === 'number') return hasNumber(value as number);
  if (kind === 'string') return typeof value === 'string' && value.trim() !== '';
  if (kind === 'boolean') return typeof value === 'boolean';
  if (kind === 'object') return typeof value === 'object' && Object.keys(value).length > 0;
  return false;
}

function formatValue(rec: ConstituencyRecord, field: string, kind: string): string {
  const value = rec[field];
  if (kind === 'number') {
    const n = value as number;
    if (!hasNumber(n)) return '';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  }
  if (kind === 'boolean') return value ? 'Yes' : 'No';
  if (kind === 'object') return Object.keys(value as object).join(', ');
  return typeof value === 'string' ? value.trim() : '';
}

function buildEvidenceItem(rec: ConstituencyRecord, field: string, label: string, category: EvidenceCategory, kind: string): EvidenceItem {
  const provenance = getProvenanceForField(field);
  const present = isPresent(rec, field, kind);
  const status: EvidenceStatus = present ? 'available' : 'gap';
  return {
    id: `${rec.canonical_constituency_id}:${field}`,
    category,
    label,
    value: formatValue(rec, field, kind),
    sourceField: field,
    sourceDataset: provenance.source,
    authority: provenance.authority,
    status,
    confidence: confidenceForQuality(provenance.quality),
  };
}

function buildTimeline(rec: ConstituencyRecord): EvidenceTimelineEntry[] {
  const events: EvidenceTimelineEntry[] = [];

  const years: Array<{ year: number; field: string }> = [
    { year: 2012, field: 'winner_party_2012' },
    { year: 2017, field: 'winner_party_2017' },
    { year: 2022, field: 'winner_party_2022' },
  ];

  for (const { year, field } of years) {
    const party = rec[field];
    if (typeof party === 'string' && party.trim() !== '') {
      const margin = rec[`victory_margin_pct_${String(year)}` as keyof ConstituencyRecord];
      const marginText = hasNumber(margin as number) ? ` by ${(margin as number).toFixed(1)}pp` : '';
      events.push({
        date: String(year),
        type: 'election',
        description: `Vidhan Sabha election won by ${party}${marginText}`,
        sourceField: field,
      });
    }
  }

  if (rec.ls2024_pc_winner_party) {
    const changed = rec.ls2024_party_changed_flag ? ' (party changed vs 2022)' : '';
    events.push({
      date: '2024',
      type: 'ls2024',
      description: `Lok Sabha segment won by ${rec.ls2024_pc_winner_party}${changed}`,
      sourceField: 'ls2024_pc_winner_party',
    });
  }

  if (rec.current_mla_status && rec.current_mla_status !== 'SERVING') {
    if (rec.current_mla_status === 'BYELECTION_HELD') {
      events.push({
        date: rec.current_mla_by_election_date || 'unknown',
        type: 'by_election',
        description: `By-election held (${rec.current_mla_name})`,
        sourceField: 'current_mla_by_election_date',
      });
    }
    if (rec.current_mla_status === 'VACANT') {
      events.push({
        date: rec.current_mla_by_election_date || 'unknown',
        type: 'vacancy',
        description: rec.current_mla_vacancy_reason || 'Seat vacant',
        sourceField: 'current_mla_vacancy_reason',
      });
    }
  }

  if (rec.current_mla_representation_change_type && rec.current_mla_representation_change_type !== 'SAME_PARTY') {
    events.push({
      date: 'current',
      type: 'representation',
      description: `Representation change: ${rec.current_mla_representation_change_type} (${rec.current_mla_party})`,
      sourceField: 'current_mla_representation_change_type',
    });
  }

  if (rec.verification_date) {
    events.push({
      date: rec.verification_date,
      type: 'verification',
      description: `Records verified (dataset ${rec.master_dataset_version || '1.1.0'})`,
      sourceField: 'verification_date',
    });
  }

  return events;
}

export function buildEvidenceGraph(rec: ConstituencyRecord): ConstituencyEvidence {
  const items = EVIDENCE_FIELDS.map((def) => buildEvidenceItem(rec, def.field, def.label, def.category, def.kind));
  const available = items.filter((i) => i.status === 'available');

  const byCategory = Object.fromEntries(
    Object.keys(EVIDENCE_CATEGORY_LABELS).map((cat) => [cat, items.filter((i) => i.category === cat)]),
  ) as Record<EvidenceCategory, EvidenceItem[]>;

  const categoryCoverage: EvidenceCategoryCoverage[] = (Object.keys(EVIDENCE_CATEGORY_LABELS) as EvidenceCategory[]).map((cat) => {
    const catItems = byCategory[cat];
    const present = catItems.filter((i) => i.status === 'available').length;
    return {
      category: cat,
      label: EVIDENCE_CATEGORY_LABELS[cat],
      available: present,
      total: catItems.length,
      pct: catItems.length === 0 ? 0 : Math.round((present / catItems.length) * 100),
    };
  });

  const gaps: EvidenceItem[] = items
    .filter((i) => i.status === 'gap')
    .map((i) => ({
      ...i,
      category: 'known_data_gaps',
      label: EVIDENCE_CATEGORY_LABELS[i.category],
    }));

  const total = items.length;
  const coverage = total === 0 ? 0 : Math.round((available.length / total) * 100);
  const confidence = confidenceFrom(available.length, total, 'LOW');

  return {
    canonical_constituency_id: rec.canonical_constituency_id,
    constituency_name: rec.constituency_name,
    ac_number: rec.ac_number,
    district: rec.district,
    region: rec.region,
    current_mla_party: rec.current_mla_party,
    items,
    byCategory,
    categoryCoverage,
    coverage,
    gaps,
    debt: gaps.length,
    confidence,
    confidenceReason: `${String(available.length)} of ${String(total)} evidence fields present (${String(coverage)}%)`,
    timeline: buildTimeline(rec),
    generatedFrom: `up403-master-dataset-v1@${rec.master_dataset_version || '1.1.0'}`,
  };
}

export function buildEvidenceGraphAll(records: ConstituencyRecord[]): ConstituencyEvidence[] {
  return records.map(buildEvidenceGraph);
}
