import { 
  InternalPrimaryKey, 
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface Issue {
  id: InternalPrimaryKey;
  constituencyId: InternalPrimaryKey;
  title: string;
  description: string;
  severity: 'BLOCKER' | 'MAJOR' | 'MINOR';
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface IssueObservation {
  id: InternalPrimaryKey;
  issueId: InternalPrimaryKey;
  observationDate: string;
  details: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface IssueStatusHistory {
  id: InternalPrimaryKey;
  issueId: InternalPrimaryKey;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface Promise {
  id: InternalPrimaryKey;
  partyId?: InternalPrimaryKey;
  personId?: InternalPrimaryKey; // Either a party promise or a specific person's promise
  title: string;
  description: string;
  targetDate?: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface PromiseStatusHistory {
  id: InternalPrimaryKey;
  promiseId: InternalPrimaryKey;
  status: 'PROMISED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'BROKEN';
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
