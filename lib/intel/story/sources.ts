import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { VerificationStatus } from '@/lib/intel/verification';
import type { StorySourcePanelEntry } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Source Panel)
// The Source Panel is a traceability surface: every statement in the Story Builder must trace to
// a certified engine output. Each entry reports which engine produced the signal, its confidence,
// its coverage, its evidence count, and the last refresh. No unsupported statements — if a source
// is unavailable on a surface, the entry says so instead of inventing content.

export interface SourcePanelInputs {
  investigation: InvestigationCase;
  toolkit: ConstituencyToolkit | null;
  evidenceCoverage: number;
  evidenceCount: number;
  researchFindings: number;
  verificationStatus: VerificationStatus | null;
  verificationScore: number | null;
  verifiedClaims: number;
  totalClaims: number;
  generatedAt: string;
}

function confidenceFor(score: number): ConfidenceTier {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

/** Build the six-domain source panel. Every entry traces to its certified engine. */
export function buildSourcePanel(inputs: SourcePanelInputs): StorySourcePanelEntry[] {
  const { investigation, toolkit, evidenceCoverage, evidenceCount, researchFindings, verificationStatus, verificationScore, verifiedClaims, totalClaims, generatedAt } = inputs;

  const evidenceEntry: StorySourcePanelEntry = {
    domain: 'evidence_graph',
    label: 'Evidence Graph',
    source: 'lib/intel/evidence',
    confidence: confidenceFor(evidenceCoverage),
    coverage: Math.round(evidenceCoverage),
    lastUpdated: generatedAt,
    evidenceCount,
    detail: `Evidence coverage ${String(Math.round(evidenceCoverage))}% across the registered evidence fields for ${investigation.constituency_name}.`,
  };

  const researchEntry: StorySourcePanelEntry = {
    domain: 'research_kb',
    label: 'Research Knowledge Base',
    source: toolkit ? 'lib/intel/toolkit (research)' : 'lib/intel/evidence',
    confidence: researchFindings > 0 ? 'MEDIUM' : 'LOW',
    coverage: Math.round(Math.min(100, researchFindings * 12)),
    lastUpdated: generatedAt,
    evidenceCount: researchFindings,
    detail: toolkit
      ? `${String(researchFindings)} registered research finding(s) and monitoring areas from the Journalist Toolkit research summary.`
      : 'Research findings unavailable on this surface (factor-only projection); evidence coverage used instead.',
  };

  const verificationEntry: StorySourcePanelEntry = {
    domain: 'verification_workspace',
    label: 'Verification Workspace',
    source: 'lib/intel/verification',
    confidence: verificationScore === null ? 'LOW' : confidenceFor(verificationScore),
    coverage: verificationScore === null ? 0 : Math.round(verificationScore),
    lastUpdated: generatedAt,
    evidenceCount: totalClaims > 0 ? verifiedClaims : 0,
    detail: verificationStatus === null
      ? 'No verification case exists for this constituency in the top-priority set.'
      : `Verification status ${verificationStatus.replace(/_/g, ' ')} · ${String(verifiedClaims)}/${String(totalClaims)} claims verified.`,
  };

  const predictionEntry: StorySourcePanelEntry = {
    domain: 'prediction_engine',
    label: 'Prediction Engine',
    source: 'lib/intel/predictions',
    confidence: investigation.confidence,
    coverage: Math.round(investigation.winner_probability),
    lastUpdated: generatedAt,
    evidenceCount: 1,
    detail: `Predicted winner ${investigation.predicted_winner} at ${String(Math.round(investigation.winner_probability))}% probability.`,
  };

  const scenarioEntry: StorySourcePanelEntry = {
    domain: 'scenario_engine',
    label: 'Scenario Engine',
    source: toolkit ? 'lib/intel/toolkit (scenarios)' : 'lib/intel/scenarios',
    confidence: 'MEDIUM',
    coverage: 0,
    lastUpdated: generatedAt,
    evidenceCount: toolkit?.scenarios.flips.length ?? 0,
    detail: toolkit
      ? `${String(toolkit.scenarios.flips.length)} meaningful scenario flip(s) registered for this constituency.`
      : 'Scenario flips unavailable on this surface (factor-only projection).',
  };

  const toolkitEntry: StorySourcePanelEntry = {
    domain: 'toolkit',
    label: 'Journalist Toolkit',
    source: 'lib/intel/toolkit',
    confidence: toolkit ? 'HIGH' : 'LOW',
    coverage: toolkit ? 100 : 0,
    lastUpdated: generatedAt,
    evidenceCount: toolkit ? toolkit.angles.length + toolkit.interviews.length : 0,
    detail: toolkit
      ? `${String(toolkit.angles.length)} story angle(s), ${String(toolkit.interviews.length)} interview brief(s), and the field pack are available.`
      : 'Toolkit detail unavailable on this surface (factor-only projection). Open the Journalist Toolkit for the full package.',
  };

  return [evidenceEntry, researchEntry, verificationEntry, predictionEntry, scenarioEntry, toolkitEntry];
}
