import type { ConstituencyRecord } from '@/lib/up403/types';
import { toConstituencyIntelligence } from '@/lib/intel/scoring';
import { predictRecord } from '@/lib/intel/predictions';
import { buildEvidenceGraph } from '@/lib/intel/evidence';
import { linkPredictionToEvidence } from '@/lib/intel/evidence/linkage';
import { SCENARIOS } from '@/lib/intel/scenarios/definitions';
import { projectSeat } from '@/lib/intel/scenarios/engine';
import { buildSeatFacts } from './facts';
import { buildBrief } from './brief';
import { buildInterviewBriefs } from './interviews';
import { buildChecklist } from './checklist';
import { buildStoryAngles } from './angles';
import { buildVerificationWorkspace } from './verification';
import { buildFieldPack } from './field-pack';
import { buildExplorer } from './explorer';
import { buildResearchSummary } from './research';
import { buildScenarios } from './scenarios';
import type { ConstituencyToolkit, ToolkitConstituencyEntry } from './types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

export type { ConstituencyToolkit, ToolkitConstituencyEntry } from './types';
export type { InterviewBrief, StoryAngle, FieldPack, VerificationWorkspace, ChecklistItem } from './types';
export { buildInterviewBriefs, interviewQuestionCount } from './interviews';
export { buildStoryAngles } from './angles';
export { buildVerificationWorkspace } from './verification';
export { buildFieldPack } from './field-pack';
export { buildExplorer } from './explorer';
export { buildResearchSummary } from './research';
export { buildScenarios } from './scenarios';

export function buildConstituencyToolkit(rec: ConstituencyRecord): ConstituencyToolkit {
  const intel = toConstituencyIntelligence(rec);
  const prediction = predictRecord(rec);
  const evidence = buildEvidenceGraph(rec);
  const linkage = linkPredictionToEvidence(prediction, intel, evidence);
  const facts = buildSeatFacts(rec, intel, prediction, evidence);

  const scenarioOutcomes = SCENARIOS.map((def) => ({
    def,
    outcome: projectSeat(prediction, def.swings),
  }));

  return {
    canonical_constituency_id: rec.canonical_constituency_id,
    constituency_name: rec.constituency_name,
    district: rec.district,
    region: rec.region,
    reservation_type: rec.reservation_type,
    generatedAt: new Date().toISOString(),
    dataSource: `up403-master-dataset-v1@${rec.master_dataset_version || '1.1.0'}`,
    researchCutoff: rec.research_cutoff_date || '2026-07-30',
    brief: buildBrief(facts),
    interviews: buildInterviewBriefs(facts),
    checklist: buildChecklist(facts),
    angles: buildStoryAngles(facts),
    verification: buildVerificationWorkspace(facts),
    fieldPack: buildFieldPack(facts),
    explorer: buildExplorer(facts, linkage),
    research: buildResearchSummary(facts),
    scenarios: buildScenarios(prediction.predicted_winner, scenarioOutcomes),
    prediction,
    evidence,
    intel,
    linkage,
  };
}

export function toConstituencyEntry(rec: ConstituencyRecord, predictedWinner: string, winnerProbability: number): ToolkitConstituencyEntry {
  return {
    canonical_constituency_id: rec.canonical_constituency_id,
    constituency_name: rec.constituency_name,
    ac_number: rec.ac_number,
    district: rec.district,
    region: rec.region,
    reservation_type: rec.reservation_type,
    current_mla_party: rec.current_mla_party || '',
    predicted_winner: predictedWinner,
    winner_probability: winnerProbability,
  };
}
