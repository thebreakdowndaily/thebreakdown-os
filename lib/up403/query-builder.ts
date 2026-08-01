import type { ConstituencyRecord } from './types';

export type FieldRef =
  | 'winner_party'
  | 'winner_name'
  | 'victory_margin_pct'
  | 'total_valid_votes'
  | 'total_candidates'
  | 'reservation_type'
  | 'district'
  | 'division'
  | 'region'
  | 'dna_classification'
  | 'competitiveness_class'
  | 'current_mla_party'
  | 'current_mp_party'
  | 'ls2024_pc_winner_party'
  | 'governance_issue_count'
  | 'linked_projects_count'
  | 'winner_continuity_score'
  | 'party_continuity_score'
  | 'seat_volatility_index'
  | 'trajectory_unique_parties'
  | 'sociology_dominant_party_by_avg_share'
  | 'disaster_risks_summary'
  | 'environmental_issues_summary';

export type QueryOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'not_contains';

export type QueryYear = 2012 | 2017 | 2022;

export interface QueryRule {
  id: string;
  field: FieldRef;
  operator: QueryOperator;
  value: string | number | string[] | null;
  year?: QueryYear;
  label: string;
  group?: string;
}

export interface QueryResult {
  matched: ConstituencyRecord[];
  ruleSummary: string;
}

const YEAR_FIELDS: Array<{ ref: FieldRef; suffix: string; type: 'number' | 'string' }> = [
  { ref: 'winner_party', suffix: 'winner_party_', type: 'string' },
  { ref: 'winner_name', suffix: 'winner_', type: 'string' },
  { ref: 'victory_margin_pct', suffix: 'victory_margin_pct_', type: 'number' },
  { ref: 'total_valid_votes', suffix: 'total_valid_votes_', type: 'number' },
  { ref: 'total_candidates', suffix: 'total_candidates_', type: 'number' },
];

function getFieldValue(record: ConstituencyRecord, field: FieldRef, year?: QueryYear): string | number | null {
  if (year) {
    const yearField = YEAR_FIELDS.find(f => f.ref === field);
    if (yearField) {
      const key = `${yearField.suffix}${String(year)}`;
      return record[key as keyof ConstituencyRecord] as string | number | null;
    }
  }

  switch (field) {
    case 'reservation_type': return record.reservation_type;
    case 'district': return record.district;
    case 'division': return record.division;
    case 'region': return record.region;
    case 'dna_classification': return record.dna_classification;
    case 'competitiveness_class': return record.competitiveness_class;
    case 'current_mla_party': return record.current_mla_party || null;
    case 'current_mp_party': return record.current_mp_party || null;
    case 'ls2024_pc_winner_party': return record.ls2024_pc_winner_party || null;
    case 'governance_issue_count': return record.governance_issue_count;
    case 'linked_projects_count': return record.linked_projects_count;
    case 'winner_continuity_score': return record.winner_continuity_score;
    case 'party_continuity_score': return record.party_continuity_score;
    case 'seat_volatility_index': return record.seat_volatility_index;
    case 'trajectory_unique_parties': return record.trajectory_unique_parties;
    case 'sociology_dominant_party_by_avg_share': return record.sociology_dominant_party_by_avg_share || null;
    case 'disaster_risks_summary': return record.disaster_risks_summary || null;
    case 'environmental_issues_summary': return record.environmental_issues_summary || null;
    default: return null;
  }
}

function evaluateOperator(actual: string | number | null, operator: QueryOperator, expected: string | number | string[] | null): boolean {
  if (actual === null) return false;
  if (actual === '' && operator !== 'not_contains') return false;

  switch (operator) {
    case 'eq':
      return String(actual).toLowerCase() === String(expected).toLowerCase();
    case 'neq':
      return String(actual).toLowerCase() !== String(expected).toLowerCase();
    case 'gt':
      return Number(actual) > Number(expected);
    case 'lt':
      return Number(actual) < Number(expected);
    case 'gte':
      return Number(actual) >= Number(expected);
    case 'lte':
      return Number(actual) <= Number(expected);
    case 'in':
      return Array.isArray(expected) && expected.some(e => String(actual).toLowerCase() === e.toLowerCase());
    case 'contains':
      return String(actual).toLowerCase().includes(String(expected).toLowerCase());
    case 'not_contains':
      return !String(actual).toLowerCase().includes(String(expected).toLowerCase());
    default:
      return false;
  }
}

export function evaluateRule(record: ConstituencyRecord, rule: QueryRule): boolean {
  const actual = getFieldValue(record, rule.field, rule.year);
  return evaluateOperator(actual, rule.operator, rule.value);
}

export function applyQuery(records: ConstituencyRecord[], rules: QueryRule[]): ConstituencyRecord[] {
  if (rules.length === 0) return [];
  return records.filter(rec => rules.every(rule => evaluateRule(rec, rule)));
}

export function rulesToSummary(rules: QueryRule[]): string {
  return rules.map(r => r.label).join(' AND ');
}

// ---------- Preset query builders (the 5 example queries) ----------

export function buildThinMarginPreset(year: QueryYear = 2022): QueryRule[] {
  return [
    { id: 'thin-1', field: 'winner_party', operator: 'eq', value: 'BJP', year, label: `BJP won ${String(year)}` },
    { id: 'thin-2', field: 'victory_margin_pct', operator: 'lt', value: 5, year, label: `Victory margin < 5% (${String(year)})` },
  ];
}

export function buildFortressPreset(year: QueryYear = 2022): QueryRule[] {
  return [
    { id: 'fort-1', field: 'winner_party', operator: 'eq', value: 'SP', year, label: `SP won ${String(year)}` },
    { id: 'fort-2', field: 'victory_margin_pct', operator: 'gte', value: 10, year, label: `Victory margin >= 10% (${String(year)})` },
  ];
}

export function buildScReservedPreset(): QueryRule[] {
  return [
    { id: 'sc-1', field: 'reservation_type', operator: 'eq', value: 'SC', label: 'SC reserved constituency' },
  ];
}

export function buildBjpMlaIndiaLsPreset(): QueryRule[] {
  return [
    { id: 'split-1', field: 'current_mla_party', operator: 'eq', value: 'BJP', label: 'Current MLA is BJP' },
    { id: 'split-2', field: 'ls2024_pc_winner_party', operator: 'neq', value: 'BJP', label: '2024 LS seat won by non-BJP' },
  ];
}

export function buildFloodRiskPreset(): QueryRule[] {
  return [
    { id: 'flood-1', field: 'disaster_risks_summary', operator: 'contains', value: 'flood', label: 'Disaster risk summary mentions flood' },
  ];
}

export interface PresetDefinition {
  id: string;
  title: string;
  description: string;
  build: () => QueryRule[];
}

export const PRESETS: PresetDefinition[] = [
  {
    id: 'thin-margin',
    title: 'BJP seats won by <5%',
    description: 'Seats where BJP won the 2022 election by a margin under 5% — vulnerable seats.',
    build: () => buildThinMarginPreset(2022),
  },
  {
    id: 'fortresses',
    title: 'SP fortresses',
    description: 'Constituencies SP won in 2022 with a margin of 10% or more.',
    build: () => buildFortressPreset(2022),
  },
  {
    id: 'sc-reserved',
    title: 'SC reserved constituencies',
    description: 'All assembly constituencies reserved for Scheduled Castes. (Data gap: v1.1.0 records every AC as GENERAL — the query returns 0 honestly.)',
    build: () => buildScReservedPreset(),
  },
  {
    id: 'bjp-mla-india-ls',
    title: 'BJP MLA but INDIA LS lead',
    description: 'BJP holds the MLA seat but the corresponding Lok Sabha seat was won by a non-BJP (INDIA bloc) candidate in 2024.',
    build: () => buildBjpMlaIndiaLsPreset(),
  },
  {
    id: 'flood-issues',
    title: 'Active flood issues',
    description: 'Constituencies whose disaster-risk profile references flooding. (Data gap: disaster-risk data not yet collected at constituency level — the query returns 0 honestly.)',
    build: () => buildFloodRiskPreset(),
  },
];

export interface DataGapNotice {
  field: string;
  dimension: string;
  detail: string;
}

export function detectDataGap(records: ConstituencyRecord[], rules: QueryRule[]): DataGapNotice | null {
  if (records.length === 0 || rules.length === 0) return null;
  for (const rule of rules) {
    const values = records
      .map(rec => getFieldValue(rec, rule.field, rule.year))
      .filter(v => v !== null && v !== '');
    const unique = new Set(values.map(v => String(v).toLowerCase()));
    if (unique.size <= 1) {
      const dimension = FIELD_LABELS[rule.field];
      const actual = unique.size === 0 ? 'no values present' : `all values are "${[...unique][0]}"`;
      return {
        field: rule.field,
        dimension,
        detail: `${dimension} data gap: across all ${String(records.length)} constituencies, ${actual}. The dataset does not yet capture this dimension at constituency level.`,
      };
    }
  }
  return null;
}

// ---------- Human-readable rule display ----------

export const FIELD_LABELS: Record<FieldRef, string> = {
  winner_party: 'Winning party',
  winner_name: 'Winner name',
  victory_margin_pct: 'Victory margin (%)',
  total_valid_votes: 'Total valid votes',
  total_candidates: 'Number of candidates',
  reservation_type: 'Reservation type',
  district: 'District',
  division: 'Division',
  region: 'Region',
  dna_classification: 'Political DNA',
  competitiveness_class: 'Competitiveness class',
  current_mla_party: 'Current MLA party',
  current_mp_party: 'Current MP party',
  ls2024_pc_winner_party: '2024 LS winner party',
  governance_issue_count: 'Governance issue count',
  linked_projects_count: 'Linked projects count',
  winner_continuity_score: 'Winner continuity',
  party_continuity_score: 'Party continuity',
  seat_volatility_index: 'Seat volatility index',
  trajectory_unique_parties: 'Parties that have won seat',
  sociology_dominant_party_by_avg_share: 'Dominant party by avg share',
  disaster_risks_summary: 'Disaster risk profile',
  environmental_issues_summary: 'Environmental issues',
};

export const OPERATOR_LABELS: Record<QueryOperator, string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'greater than',
  lt: 'less than',
  gte: 'at least',
  lte: 'at most',
  in: 'in',
  contains: 'contains',
  not_contains: 'does not contain',
};

export const PARTY_LIST = ['BJP', 'SP', 'INC', 'BSP', 'AAP', 'RLD', 'SBSP', 'ADAL', 'NISHAD', 'SUHELDEV', 'OTHER'];

export function ruleToSentence(rule: QueryRule): string {
  const fieldLabel = FIELD_LABELS[rule.field];
  const opLabel = OPERATOR_LABELS[rule.operator];
  const yearSuffix = rule.year ? ` (${String(rule.year)})` : '';
  const val = Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value);
  return `${fieldLabel}${yearSuffix} ${opLabel} ${val}`;
}
