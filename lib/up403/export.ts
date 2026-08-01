import type { ConstituencyRecord } from './types';

export const EXPORT_FIELDS: Array<{ key: keyof ConstituencyRecord; label: string }> = [
  { key: 'canonical_constituency_id', label: 'Constituency ID' },
  { key: 'constituency_name', label: 'Constituency' },
  { key: 'ac_number', label: 'AC Number' },
  { key: 'pc_name', label: 'Parliamentary Constituency' },
  { key: 'district', label: 'District' },
  { key: 'division', label: 'Division' },
  { key: 'region', label: 'Region' },
  { key: 'reservation_type', label: 'Reservation' },
  { key: 'winner_2022', label: 'Winner 2022' },
  { key: 'winner_party_2022', label: 'Winner Party 2022' },
  { key: 'winner_vote_share_2022', label: 'Winner Vote Share 2022' },
  { key: 'victory_margin_pct_2022', label: 'Margin 2022 (%)' },
  { key: 'winner_party_2017', label: 'Winner Party 2017' },
  { key: 'victory_margin_pct_2017', label: 'Margin 2017 (%)' },
  { key: 'winner_party_2012', label: 'Winner Party 2012' },
  { key: 'victory_margin_pct_2012', label: 'Margin 2012 (%)' },
  { key: 'dna_classification', label: 'Political DNA' },
  { key: 'competitiveness_class', label: 'Competitiveness' },
  { key: 'seat_volatility_index', label: 'Seat Volatility' },
  { key: 'current_mla_name', label: 'Current MLA' },
  { key: 'current_mla_party', label: 'Current MLA Party' },
  { key: 'current_mp_name', label: 'Current MP' },
  { key: 'current_mp_party', label: 'Current MP Party' },
  { key: 'ls2024_pc_winner_party', label: '2024 LS Winner Party' },
  { key: 'governance_issue_count', label: 'Governance Issues' },
  { key: 'linked_projects_count', label: 'Linked Projects' },
  { key: 'verification_date', label: 'Verification Date' },
];

export function csvEscape(value: unknown): string {
  let str: string;
  if (typeof value === 'string') {
    str = value;
  } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint' || typeof value === 'symbol') {
    str = String(value);
  } else if (value === null || value === undefined) {
    str = '';
  } else {
    str = JSON.stringify(value) || '';
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function recordsToCsv(records: ConstituencyRecord[], fields: Array<{ key: keyof ConstituencyRecord; label: string }> = EXPORT_FIELDS): string {
  const header = fields.map(f => csvEscape(f.label)).join(',');
  const rows = records.map(rec =>
    fields.map(f => csvEscape(rec[f.key])).join(','),
  );
  return [header, ...rows].join('\r\n');
}

export function recordsToJson(records: ConstituencyRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(records: ConstituencyRecord[], filename: string): void {
  downloadBlob(new Blob([recordsToCsv(records)], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function downloadJson(records: ConstituencyRecord[], filename: string): void {
  downloadBlob(new Blob([recordsToJson(records)], { type: 'application/json' }), filename);
}

export function buildCitationReport(records: ConstituencyRecord[]): string {
  const fmtMargin = (v: number): string => `${v.toFixed(1)}%`;
  const rows = records.map(rec => {
    const party2022 = rec.winner_party_2022 || 'n/a';
    const party2017 = rec.winner_party_2017 || 'n/a';
    const party2012 = rec.winner_party_2012 || 'n/a';
    return [
      rec.constituency_name,
      `AC-${String(rec.ac_number)}`,
      rec.pc_name,
      rec.district,
      rec.reservation_type || 'GEN',
      `${party2012} (${fmtMargin(rec.victory_margin_pct_2012)})`,
      `${party2017} (${fmtMargin(rec.victory_margin_pct_2017)})`,
      `${party2022} (${fmtMargin(rec.victory_margin_pct_2022)})`,
      rec.current_mla_name || 'n/a',
      rec.current_mla_party || 'n/a',
      rec.ls2024_pc_winner_party || 'n/a',
    ].join(' | ');
  });
  const header = [
    'The Breakdown — UP403 Constituency Intelligence',
    `Generated: ${new Date().toISOString()}`,
    `Dataset: UP403 Master Dataset v1.1.0 (research cutoff 2026-07-30)`,
    `Evidence: every field traces Source → Authority → Dataset → Original field → Verification date.`,
    '',
    'Constituency | AC | PC | District | Reservation | 2012 (margin) | 2017 (margin) | 2022 (margin) | Current MLA | MLA Party | 2024 LS Party',
  ];
  return [...header, ...rows].join('\n');
}

export function buildEvidenceReport(record: ConstituencyRecord): string {
  const lines = [
    `EVIDENCE REPORT — ${record.constituency_name} (AC-${String(record.ac_number)})`,
    `Dataset: UP403 Master Dataset v1.1.0`,
    `Canonical ID: ${record.canonical_constituency_id}`,
    `Verification date: ${record.verification_date || 'n/a'}`,
    `Research cutoff: ${record.research_cutoff_date || 'n/a'}`,
    `Sources: ${record.source_datasets || 'n/a'}`,
    '',
    'Electoral',
    `  2022: ${record.winner_2022 || 'n/a'} (${record.winner_party_2022 || 'n/a'}) — ${String(record.winner_vote_share_2022)}% — margin ${String(record.victory_margin_pct_2022)}%`,
    `  2017: ${record.winner_2017 || 'n/a'} (${record.winner_party_2017 || 'n/a'}) — margin ${String(record.victory_margin_pct_2017)}%`,
    `  2012: ${record.winner_2012 || 'n/a'} (${record.winner_party_2012 || 'n/a'}) — margin ${String(record.victory_margin_pct_2012)}%`,
    'Representation',
    `  Current MLA: ${record.current_mla_name || 'n/a'} (${record.current_mla_party || 'n/a'}) — ${record.current_mla_status || 'n/a'}`,
    `  Current MP: ${record.current_mp_name || 'n/a'} (${record.current_mp_party || 'n/a'})`,
    `  2024 LS: ${record.ls2024_pc_winner || 'n/a'} (${record.ls2024_pc_winner_party || 'n/a'})`,
    'Analysis',
    `  Political DNA: ${record.dna_classification || 'n/a'} (${record.dna_sub_type || ''}) — confidence ${record.dna_confidence || 'n/a'}`,
    `  Competitiveness: ${record.competitiveness_class || 'n/a'} — avg margin ${String(record.competitiveness_avg_margin_pct)}%`,
    `  Seat volatility: ${String(record.seat_volatility_index)} | Party continuity: ${String(record.party_continuity_score)}`,
    `  Trajectory: ${record.trajectory_steps_compact || 'n/a'}`,
    'Governance',
    `  Issues: ${String(record.governance_issue_count)} — ${record.governance_issue_summary || 'no summary recorded'}`,
    `  Availability: ${record.governance_availability_status || 'n/a'}`,
    '',
    'Evidence chain: Source → Authority → Dataset → Original field → Verification date.',
  ];
  return lines.join('\n');
}
