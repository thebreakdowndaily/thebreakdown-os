import type { ExplorerNode } from './types';
import type { SeatFacts } from './facts';
import type { PredictionEvidenceLink } from '@/lib/intel/evidence/linkage';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// The explorer renders the canonical chain: Prediction → drivers → score →
// supporting evidence → historical elections → data gaps → confidence.

function node(stage: string, label: string, detail: string, children: ExplorerNode[], confidence?: string): ExplorerNode {
  return {
    stage,
    label,
    detail,
    children,
    ...(confidence ? { confidence: confidence as ExplorerNode['confidence'] } : {}),
  };
}

export function buildExplorer(facts: SeatFacts, linkage: PredictionEvidenceLink[]): ExplorerNode {
  const prediction = facts.prediction;
  const evidence = facts.evidence;

  const driverNodes = linkage.map((link) => {
    const scoreLabel = link.viaScore ? `via ${link.viaScore.replace('_', ' ')}` : 'direct field';
    const evidenceNodes = link.supporting.map((item) =>
      node(
        'evidence',
        `${item.label}: ${item.value}`,
        `Source ${item.sourceDataset} · ${item.authority}`,
        [],
        item.confidence,
      ),
    );
    return node(
      'driver',
      `${link.factor} (${link.direction})`,
      `Source field ${link.sourceField} ${scoreLabel}. ${link.supporting.length > 0 ? `${String(link.supporting.length)} supporting evidence node(s)` : 'No evidence node currently resolves this driver — field verification required.'}`,
      evidenceNodes,
    );
  });

  const electionNodes = evidence.timeline.map((t) =>
    node(
      'timeline',
      `${t.date} — ${t.description}`,
      `Type: ${t.type} · field ${t.sourceField}`,
      [],
    ),
  );

  const gapNodes = evidence.gaps.map((g) =>
    node(
      'gap',
      g.label,
      g.sourceField,
      [],
    ),
  );

  const confidenceNode = node(
    'confidence',
    `Evidence confidence: ${evidence.confidence.replace('_', ' ')}`,
    evidence.confidenceReason,
    [],
    evidence.confidence,
  );

  const researchNodes = [
    node('research', 'Political DNA', prediction.assumptions.map((a) => a.assumption).join(' · '), [], facts.intel.scores.momentum.confidence),
  ];

  const predictionNode = node(
    'prediction',
    `${prediction.predicted_winner} at ${String(prediction.winner_probability)}%`,
    `${prediction.whyLeading} Confidence ${prediction.confidence.replace('_', ' ')} (CI ${String(prediction.winner_ci[0])}–${String(prediction.winner_ci[1])}%).`,
    [
      ...driverNodes,
      ...electionNodes,
      ...gapNodes,
      ...researchNodes,
      confidenceNode,
    ],
    prediction.confidence,
  );

  return node(
    'root',
    `Why the model predicts ${prediction.predicted_winner} here`,
    'Follow the chain: prediction → drivers → supporting evidence → history → gaps → confidence.',
    [predictionNode],
  );
}

export function explorerNodeCount(root: ExplorerNode): number {
  return root.children.reduce((sum, child) => sum + 1 + explorerNodeCount(child), 0);
}
