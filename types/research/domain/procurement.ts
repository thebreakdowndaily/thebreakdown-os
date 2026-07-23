import { 
  InternalPrimaryKey, 
  ExternalIdentifier,
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface ProcuringAuthority {
  id: InternalPrimaryKey;
  name: string;
  departmentName?: string;
  systemProvenance: SystemProvenance;
}

export interface VendorContractor {
  id: InternalPrimaryKey;
  legalName: string;
  gstin?: ExternalIdentifier;
  systemProvenance: SystemProvenance;
}

export interface TenderPackage {
  id: InternalPrimaryKey;
  projectId: InternalPrimaryKey;
  procuringAuthorityId: InternalPrimaryKey;
  tenderNumber: ExternalIdentifier;
  description: string;
  estimatedValue?: number;
  publishedDate?: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface ContractAward {
  id: InternalPrimaryKey;
  tenderPackageId: InternalPrimaryKey;
  vendorId: InternalPrimaryKey;
  contractValue: number;
  awardDate: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface ContractAmendment {
  id: InternalPrimaryKey;
  contractAwardId: InternalPrimaryKey;
  revisedValue: number;
  amendDate: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface PhysicalProgress {
  id: InternalPrimaryKey;
  projectId: InternalPrimaryKey;
  percentageComplete: number;
  reportDate: string;
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
