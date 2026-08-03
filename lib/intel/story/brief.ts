import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { VerificationStatus } from '@/lib/intel/verification';
import type { StoryBrief, StoryBriefSection } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Story Brief)
// The Story Brief is a structured editorial brief derived from certified engine outputs. Every
// section links back to its source — nothing here is invented. Where toolkit detail is unavailable
// (factor-only projections), sections state the proxy they used instead.

export interface StoryBriefInputs {
  investigation: InvestigationCase;
  toolkit: ConstituencyToolkit | null;
  evidenceCoverage: number;
  dataGaps: string[];
  verificationStatus: VerificationStatus | null;
  confidence: ConfidenceTier;
}

function firstReason(investigation: InvestigationCase): string {
  return investigation.topReasons.length > 0 ? investigation.topReasons[0].why : 'priority signal';
}

function firstFactorLabel(investigation: InvestigationCase): string {
  return investigation.topReasons.length > 0 ? investigation.topReasons[0].label : 'investigation priority';
}

/** Build the Story Brief. Each section is a projection of a certified engine output. */
export function buildStoryBrief(inputs: StoryBriefInputs): StoryBrief {
  const { investigation, toolkit, evidenceCoverage, dataGaps, verificationStatus, confidence } = inputs;

  const winner = `${investigation.predicted_winner} favoured in ${investigation.constituency_name} at ${String(Math.round(investigation.winner_probability))}% (IPI ${String(Math.round(investigation.ipi))}).`;

  const executiveSummary = `${investigation.constituency_name} (AC ${String(investigation.ac_number)}) is a ${firstFactorLabel(investigation).toLowerCase()} seat: ${winner} ${firstReason(investigation)}`;

  const whyItMatters = investigation.topReasons.map((r) => r.why);

  const keyFindings = [
    winner,
    firstReason(investigation),
    ...(toolkit ? toolkit.brief.historicalTrends.slice(0, 2) : []),
  ];

  const editorialImportance =
    investigation.ipi >= 70
      ? 'Critical priority seat — highest tier of investigation attention.'
      : investigation.ipi >= 55
        ? 'High-priority seat requiring active editorial attention.'
        : investigation.ipi >= 40
          ? 'Medium-priority seat — monitor but do not pre-empt higher tiers.'
          : 'Low-priority seat; cover reactively.';

  const primaryEvidence = toolkit
    ? toolkit.brief.sourcesUsed.slice(0, 5)
    : [`Evidence coverage ${String(Math.round(evidenceCoverage))}% across registered fields.`];

  const researchSummary = toolkit
    ? toolkit.research.findings.slice(0, 5)
    : [`Research findings unavailable on this surface; evidence coverage ${String(Math.round(evidenceCoverage))}% is the proxy.`];

  const predictionSummary = toolkit
    ? toolkit.brief.predictionSummary
    : `Prediction engine: ${investigation.predicted_winner} at ${String(Math.round(investigation.winner_probability))}% probability.`;

  const scenarioImplications = toolkit
    ? toolkit.scenarios.flips.slice(0, 5).map((f) => `${f.label}: ${f.baselineWinner} → ${f.scenarioWinner}`)
    : ['Scenario flips unavailable on this surface (factor-only projection).'];

  const knownLimitations = investigation.limitations.length > 0
    ? investigation.limitations.slice(0, 4)
    : ['Limitations not registered for this investigation on this surface.'];

  const recommendedPublicationTiming =
    verificationStatus === 'verified'
      ? 'Verification is complete. The story may move toward publication once drafting and editorial review finish.'
      : 'Not before verification. The linked constituency case must reach Verified before the story can advance past verification_required.';

  const sections: StoryBriefSection[] = [
    {
      key: 'executive_summary',
      title: 'Executive summary',
      items: [{ text: executiveSummary, source: 'lib/intel/editorial' }],
    },
    {
      key: 'why_it_matters',
      title: 'Why this story matters',
      items: whyItMatters.map((t) => ({ text: t, source: 'lib/intel/editorial (topReasons)' })),
    },
    {
      key: 'key_findings',
      title: 'Key findings',
      items: keyFindings.map((t, i) => ({
        text: t,
        source: i === 0 ? 'lib/intel/predictions + lib/intel/editorial' : i === 1 ? 'lib/intel/editorial' : 'lib/intel/toolkit (research)',
      })),
    },
    {
      key: 'editorial_importance',
      title: 'Editorial importance',
      items: [{ text: editorialImportance, source: 'lib/intel/editorial (IPI tier)' }],
    },
    {
      key: 'primary_evidence',
      title: 'Primary evidence',
      items: primaryEvidence.map((t) => ({ text: t, source: 'lib/intel/toolkit (sources) or lib/intel/evidence' })),
    },
    {
      key: 'research_summary',
      title: 'Research summary',
      items: researchSummary.map((t) => ({ text: t, source: 'lib/intel/toolkit (research) or lib/intel/evidence' })),
    },
    {
      key: 'prediction_summary',
      title: 'Prediction summary',
      items: [{ text: predictionSummary, source: 'lib/intel/predictions' }],
    },
    {
      key: 'scenario_implications',
      title: 'Scenario implications',
      items: scenarioImplications.map((t) => ({ text: t, source: 'lib/intel/scenarios' })),
    },
    {
      key: 'known_limitations',
      title: 'Known limitations',
      items: knownLimitations.map((t) => ({ text: t, source: 'lib/intel/editorial (limitations)' })),
    },
    {
      key: 'data_gaps',
      title: 'Data gaps',
      items: dataGaps.length > 0 ? dataGaps.map((t) => ({ text: t, source: 'lib/intel/evidence (missing categories)' })) : [{ text: 'No registered data gaps on this surface.', source: 'lib/intel/evidence' }],
    },
    {
      key: 'recommended_publication_timing',
      title: 'Recommended publication timing',
      items: [{ text: recommendedPublicationTiming, source: 'lib/intel/verification' }],
    },
  ];

  return {
    executiveSummary,
    whyItMatters,
    keyFindings,
    editorialImportance,
    primaryEvidence,
    researchSummary,
    predictionSummary,
    scenarioImplications,
    knownLimitations,
    dataGaps,
    confidence,
    recommendedPublicationTiming,
    sections,
  };
}
