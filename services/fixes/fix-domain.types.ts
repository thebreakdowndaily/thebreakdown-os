// ── Canonical Fix Domain DTOs and Projections (AR-13A.0 Specification) ─────

import {
  Fix,
  InterventionType,
  PolicyMaturity,
  EvidenceGrade,
  TimeHorizon,
  TradeOffItem,
  RiskItem,
  CostEstimate,
  LegalBasis,
  UncertaintyNote,
  FixSection,
  FixAction,
  FixMetric,
  GlobalExample,
  StoryStatus,
  PublicationStatus,
} from '../../types/canonical';

export type {
  Fix,
  InterventionType,
  PolicyMaturity,
  EvidenceGrade,
  TimeHorizon,
  TradeOffItem,
  RiskItem,
  CostEstimate,
  LegalBasis,
  UncertaintyNote,
  FixSection,
  FixAction,
  FixMetric,
  GlobalExample,
  StoryStatus,
  PublicationStatus,
};

export interface CreateFixDTO {
  slug: string;
  title: string;
  summary: string;
  primaryCategory: InterventionType;
  secondaryCategories?: InterventionType[];
  maturityStatus: PolicyMaturity;
  problemStatement: string;
  rootCauses: FixSection[];
  recommendedActions: FixAction[];
  responsibleActorIds: string[];
  beneficiaryGroups: string[];
  disadvantagedGroups: string[];
  fiscalCost: CostEstimate;
  timeToImpact: TimeHorizon;
  globalPrecedents?: GlobalExample[];
  tradeOffs: TradeOffItem[];
  risksAndFailures: RiskItem[];
  constitutionalBasis?: LegalBasis;
  evidenceGrade: EvidenceGrade;
  unknownsAndGaps: UncertaintyNote[];
  successMetrics: FixMetric[];
  sourceIds: string[];
  lastVerified?: string;
  version?: string;
}

export interface UpdateFixDTO extends Partial<CreateFixDTO> {
  editorialStatus?: StoryStatus;
  publicationStatus?: PublicationStatus;
  supersededByFixId?: string;
}

export interface FixFilterParams {
  primaryCategory?: InterventionType;
  maturityStatus?: PolicyMaturity;
  evidenceGrade?: EvidenceGrade;
  publicationStatus?: PublicationStatus;
  responsibleActorId?: string;
  sourceId?: string;
  searchQuery?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Internal Editorial Projection — full access for editors & verification bureau */
export interface InternalFixViewModel extends Fix {
  auditTrailSummary: {
    lastEventId?: string;
    totalEdits: number;
    lastEditorId?: string;
  };
}

/** Public Reader Projection — stripped internal notes & verified public fields */
export interface PublicFixViewModel {
  id: string;
  slug: string;
  title: string;
  summary: string;
  primaryCategory: InterventionType;
  secondaryCategories?: InterventionType[];
  maturityStatus: PolicyMaturity;
  problemStatement: string;
  rootCauses: FixSection[];
  recommendedActions: FixAction[];
  responsibleActorIds: string[];
  beneficiaryGroups: string[];
  disadvantagedGroups: string[];
  fiscalCost: CostEstimate;
  timeToImpact: TimeHorizon;
  globalPrecedents?: GlobalExample[];
  tradeOffs: TradeOffItem[];
  risksAndFailures: RiskItem[];
  constitutionalBasis?: LegalBasis;
  evidenceGrade: EvidenceGrade;
  unknownsAndGaps: UncertaintyNote[];
  successMetrics: FixMetric[];
  sourceIds: string[];
  supersededByFixId?: string;
  lastVerified: string;
  version: string;
}
