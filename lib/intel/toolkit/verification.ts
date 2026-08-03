import type { VerificationItem, VerificationKind, VerificationWorkspace } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

function claim(title: string, detail: string, source: string): VerificationItem {
  return { kind: 'claim', title, detail, source };
}

function missing(title: string, detail: string, source: string): VerificationItem {
  return { kind: 'missing_evidence', title, detail, source };
}

function weak(title: string, detail: string, source: string): VerificationItem {
  return { kind: 'weak_evidence', title, detail, source };
}

function conflict(title: string, detail: string, source: string): VerificationItem {
  return { kind: 'conflicting_evidence', title, detail, source };
}

export function buildVerificationWorkspace(facts: SeatFacts): VerificationWorkspace {
  const items: VerificationItem[] = [];
  const rec = facts.record;
  const ev = facts.evidence;

  // Claims derived from prediction drivers and DNA reasoning — to be verified on the ground
  for (const d of facts.prediction.drivers) {
    items.push(claim(
      d.factor,
      d.evidence,
      d.sourceField,
    ));
  }

  if (rec.dna_reasoning) {
    items.push(claim(
      'Political DNA reasoning',
      rec.dna_reasoning,
      'dna_reasoning',
    ));
  }

  if (facts.ls2024Changed && facts.ls2024Party) {
    items.push(claim(
      'LS2024 segment party change',
      `The parent Lok Sabha segment switched to ${facts.ls2024Party} in 2024.`,
      'ls2024_party_changed_flag',
    ));
  }

  // Conflicting evidence: LS segment vs assembly seat alignment
  if (facts.ls2024Party && facts.incumbentParty && facts.ls2024Party !== facts.incumbentParty) {
    items.push(conflict(
      'LS2024 segment vs current MLA party',
      `The parent LS segment voted ${facts.ls2024Party} in 2024 while the sitting MLA is ${facts.incumbentParty}. The split signals may be transient.`,
      'ls2024_pc_winner_party vs current_mla_party',
    ));
  }

  if (rec.trajectory_total_shifts && rec.trajectory_total_shifts > 1) {
    items.push(conflict(
      'Party turnover across cycles',
      `${String(rec.trajectory_total_shifts)} party shifts recorded (${facts.historyLine}). Persistent-winner assumptions are weak here.`,
      'trajectory_total_shifts',
    ));
  }

  // Missing evidence: registered gaps (development, governance, health, education)
  for (const c of ev.categoryCoverage) {
    if (c.pct < 100 && c.total > 0) {
      items.push(missing(
        `${c.label} incomplete`,
        `${String(c.available)} of ${String(c.total)} fields present (${String(c.pct)}%).`,
        c.category,
      ));
    }
  }

  // Weak evidence: available fields whose provenance quality is derived/metadata
  for (const i of ev.items) {
    if (i.status === 'available' && (i.confidence === 'LOW' || i.confidence === 'VERY_LOW')) {
      items.push(weak(
        i.label,
        `Available but low-confidence: ${i.value} (${i.confidence.replace('_', ' ')}, ${i.sourceDataset}).`,
        i.sourceField,
      ));
    }
  }

  const recommendedDocuments = [
    'ECI official result sheets 2012 / 2017 / 2022',
    'Candidate affidavit (ADRs) for the sitting MLA',
    `Census of India 2011 PCA tables for ${rec.district || 'the district'}`,
    'District statistical handbook / development reports',
    'Data.gov.in flagship scheme datasets (PMGSY, Jal Jeevan, PMAY)',
    facts.ls2024Changed ? 'LS2024 election result by assembly segment' : '',
  ].filter(Boolean);

  const groundReporting = [
    'Visit polling booths to verify turnout and infrastructure claims',
    'Collect district-level development figures to test the constituency-level gap',
    'Interview scheme beneficiaries for flagship projects (PMGSY/JJM/PMAY)',
    'Cross-check MLA-reported achievements against fund-utilisation records',
  ];

  const officialDatasets = ev.items
    .filter((i) => i.status === 'available' && i.sourceDataset)
    .map((i) => i.sourceDataset)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return {
    items,
    recommendedDocuments,
    groundReporting,
    officialDatasets,
    overallConfidence: ev.confidence,
  };
}

export function verificationCounts(items: VerificationItem[]): Record<VerificationKind, number> {
  const counts: Record<VerificationKind, number> = {
    claim: 0,
    missing_evidence: 0,
    weak_evidence: 0,
    conflicting_evidence: 0,
  };
  for (const i of items) counts[i.kind] += 1;
  return counts;
}
