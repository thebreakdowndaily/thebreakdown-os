import { 
  InternalPrimaryKey, 
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance,
  ValueAvailabilityStatus
} from './primitives';

export type FinancialStage = 
  | 'ANNOUNCEMENT' 
  | 'BUDGET_PROVISION' 
  | 'ADMIN_APPROVAL' 
  | 'FINANCIAL_SANCTION' 
  | 'FUNDS_RELEASED' 
  | 'TENDER_VALUE' 
  | 'CONTRACT_AWARD' 
  | 'PAYMENT' 
  | 'REPORTED_EXPENDITURE' 
  | 'UTILIZATION_REPORTED' 
  | 'FINAL_COST';

export interface FinancialRecord {
  id: InternalPrimaryKey;
  projectId: InternalPrimaryKey;
  stage: FinancialStage;
  amountStatus: ValueAvailabilityStatus;
  amountValue?: number; // Only present if amountStatus === 'KNOWN'
  currency: string;
  isCumulative: boolean;
  referenceDate?: string;
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
