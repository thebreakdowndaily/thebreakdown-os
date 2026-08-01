/**
 * ─── The Breakdown OS — EOS Evidence Review & Fact Check (RELEASE-4, M4/M8) ──
 * Evidence review assigns every claim a verification status
 * (Verified / Partially Verified / Needs Verification / Unsupported).
 *
 * The Fact Check Console verifies each claim against the canonical record —
 * MLA names, MP names, election results, vote margins, party names, dates,
 * political DNA, representation status, administrative & development details.
 * Every failed verification becomes a blocking issue.
 */

import type { ConstituencyRecord } from '../../up403/types';
import type {
  FactCheckReport,
  NewsroomClaim,
  VerificationStatus,
} from '../../../types/editorial-newsroom';
import { getProvenanceForField } from '../../up403/provenance';
import { s } from './eos-format';

function norm(value: unknown): string {
  return s(value).trim().toLowerCase();
}

function toComparable(value: unknown): string {
  return norm(value).replace(/\s+/g, ' ');
}

function looksEqual(a: unknown, b: unknown): boolean {
  return toComparable(a) === toComparable(b);
}

function numberMatch(a: unknown, b: unknown, tolerance: number): boolean {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return Math.abs(na - nb) <= tolerance;
}

export interface FieldCheck {
  canonicalField: string;
  expected: unknown;
}

/**
 * Resolve the canonical value(s) a claim asserts, from the record.
 * Returns undefined when the dataset cannot support the claim (Needs Verification).
 */
export function resolveField(claim: NewsroomClaim, record: ConstituencyRecord): FieldCheck | undefined {
  switch (claim.category) {
    case 'MLA name':
      return { canonicalField: 'current_mla_name', expected: record.current_mla_name };
    case 'MP name':
      return { canonicalField: 'current_mp_name', expected: record.current_mp_name };
    case 'Election result':
      return { canonicalField: 'winner_2022', expected: record.winner_2022 };
    case 'Vote margin':
      return { canonicalField: 'victory_margin_pct_2022', expected: record.victory_margin_pct_2022 };
    case 'Party name':
      return { canonicalField: 'current_mla_party', expected: record.current_mla_party };
    case 'Date':
      return { canonicalField: 'verification_date', expected: record.verification_date };
    case 'Political DNA':
      return { canonicalField: 'dna_classification', expected: record.dna_classification };
    case 'Representation status':
      return { canonicalField: 'current_mla_status', expected: record.current_mla_status };
    case 'Administrative detail':
      return { canonicalField: 'district', expected: record.district };
    case 'Development detail':
      return { canonicalField: 'development_coverage_status', expected: record.development_coverage_status };
    default:
      return undefined;
  }
}

/** Module 8 — deterministic fact check of one claim against the canonical record. */
export function verifyClaim(
  claim: NewsroomClaim,
  record: ConstituencyRecord
): { status: VerificationStatus; blocking: boolean; canonicalValue: string; basis: string } {
  const field = resolveField(claim, record);
  if (!field || field.expected === undefined || field.expected === null || field.expected === '') {
    return {
      status: 'Needs Verification',
      blocking: true,
      canonicalValue: '—',
      basis: 'Dataset has no canonical value for this field.',
    };
  }
  const prov = getProvenanceForField(field.canonicalField);
  const basis = `${field.canonicalField} (${prov.source}, ${prov.quality})`;

  if (claim.category === 'Vote margin') {
    const asserted = Number(claim.assertedValue.replace(/[^\d.%-]/g, ''));
    const expected = Number(field.expected);
    if (numberMatch(asserted, expected, 0.05)) {
      return { status: 'Verified', blocking: false, canonicalValue: s(field.expected), basis };
    }
    return { status: 'Unsupported', blocking: true, canonicalValue: s(field.expected), basis };
  }

  if (looksEqual(claim.assertedValue, field.expected)) {
    return { status: 'Verified', blocking: false, canonicalValue: s(field.expected), basis };
  }
  if (toComparable(claim.assertedValue).includes(toComparable(field.expected))) {
    return { status: 'Partially Verified', blocking: false, canonicalValue: s(field.expected), basis };
  }
  return { status: 'Unsupported', blocking: true, canonicalValue: s(field.expected), basis };
}

/** Module 8 — run the fact check over every claim in a story. */
export function runFactCheck(
  claims: NewsroomClaim[],
  record: ConstituencyRecord,
  checkerId: string
): FactCheckReport {
  const now = new Date().toISOString();
  const checked: NewsroomClaim[] = claims.map(c => {
    const result = verifyClaim(c, record);
    return {
      ...c,
      ...result,
      checkedBy: checkerId,
      checkedAt: now,
    };
  });
  const blockingIssues = checked
    .filter(c => c.blocking)
    .map(c => `${c.id}: "${c.text}" — ${c.status} (asserted "${c.assertedValue}"; canonical "${c.canonicalValue}"). ${c.basis ?? 'no basis recorded'}`);
  return {
    storyId: claims[0]?.storyId ?? '',
    checkedAt: now,
    checkedBy: checkerId,
    claims: checked,
    blockingIssues,
    passed: blockingIssues.length === 0,
  };
}

/** Module 4 — evidence review: an editor assigns/adjusts a claim's verification status. */
export function reviewClaim(
  claim: NewsroomClaim,
  status: VerificationStatus,
  reviewerId: string,
  notes?: string
): NewsroomClaim {
  return {
    ...claim,
    status,
    blocking: status === 'Unsupported' || status === 'Needs Verification',
    checkedBy: reviewerId,
    checkedAt: new Date().toISOString(),
    notes: notes ?? claim.notes,
  };
}
