import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { ConstituencyPrediction } from '@/lib/intel/predictions/types';
import type { ConstituencyIntelligence } from '@/lib/intel/scoring/types';
import type { ConstituencyEvidence } from '@/lib/intel/evidence/types';
import type { PredictionEvidenceLink } from '@/lib/intel/evidence/linkage';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

export type InterviewPersona =
  | 'MLA'
  | 'MP'
  | 'district_admin'
  | 'election_official'
  | 'farmer'
  | 'business_owner'
  | 'women'
  | 'youth'
  | 'teacher'
  | 'doctor'
  | 'village_head'
  | 'civil_society';

export interface ToolkitInterviewQuestion {
  question: string;
  signal: string;
  basis: string;
}

export interface InterviewBrief {
  persona: InterviewPersona;
  personaLabel: string;
  focusAreas: string[];
  questions: ToolkitInterviewQuestion[];
  prepNotes: string[];
}

export type ChecklistStatus = 'done' | 'warning' | 'todo';

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
  detail: string;
}

export interface StoryAngle {
  id: string;
  title: string;
  whyItMatters: string;
  evidenceUsed: string[];
  confidence: ConfidenceTier;
  suggestedInterviews: InterviewPersona[];
  suggestedDocuments: string[];
  suggestedFieldReporting: string[];
}

export type VerificationKind = 'claim' | 'missing_evidence' | 'weak_evidence' | 'conflicting_evidence';

export interface VerificationItem {
  kind: VerificationKind;
  title: string;
  detail: string;
  source: string;
}

export interface VerificationWorkspace {
  items: VerificationItem[];
  recommendedDocuments: string[];
  groundReporting: string[];
  officialDatasets: string[];
  overallConfidence: ConfidenceTier;
}

export interface FieldPack {
  placesToVisit: string[];
  peopleToInterview: string[];
  documentsToCollect: string[];
  groundVerificationChecklist: string[];
  photographyChecklist: string[];
  videoChecklist: string[];
  timeline: string[];
  travelNotes: string[];
  unknowns: string[];
}

export interface ExplorerNode {
  stage: string;
  label: string;
  detail: string;
  confidence?: ConfidenceTier;
  children: ExplorerNode[];
}

export interface ResearchSummary {
  historicalTrends: string[];
  findings: string[];
  officialReports: string[];
  evidenceStrength: string;
  unknowns: string[];
  monitoringAreas: string[];
}

export interface ConstituencyBrief {
  overview: string;
  politicalSummary: string;
  predictionSummary: string;
  competitiveness: string;
  momentum: string;
  evidenceConfidence: string;
  historicalTrends: string[];
  regionalContext: string;
  researchSummary: string;
  knownRisks: string[];
  dataGaps: string[];
  lastUpdated: string;
  sourcesUsed: string[];
}

export interface ScenarioFlip {
  scenarioId: string;
  label: string;
  type: string;
  baselineWinner: string;
  scenarioWinner: string;
  flipped: boolean;
  winnerProbability: number;
}

export interface ToolkitScenarios {
  baselineWinner: string;
  flips: ScenarioFlip[];
  vulnerableScenarios: string[];
  safestScenarios: string[];
}

export interface ConstituencyToolkit {
  canonical_constituency_id: string;
  constituency_name: string;
  district: string;
  region: string;
  reservation_type: string;
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  brief: ConstituencyBrief;
  interviews: InterviewBrief[];
  checklist: ChecklistItem[];
  angles: StoryAngle[];
  verification: VerificationWorkspace;
  fieldPack: FieldPack;
  explorer: ExplorerNode;
  research: ResearchSummary;
  scenarios: ToolkitScenarios;
  prediction: ConstituencyPrediction;
  evidence: ConstituencyEvidence;
  intel: ConstituencyIntelligence;
  linkage: PredictionEvidenceLink[];
}

export interface ToolkitConstituencyEntry {
  canonical_constituency_id: string;
  constituency_name: string;
  ac_number: number;
  district: string;
  region: string;
  reservation_type: string;
  current_mla_party: string;
  predicted_winner: string;
  winner_probability: number;
}
