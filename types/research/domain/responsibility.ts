import { 
  InternalPrimaryKey, 
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface ResponsibilityAttribution {
  id: InternalPrimaryKey;
  personId?: InternalPrimaryKey;
  partyId?: InternalPrimaryKey;
  projectId?: InternalPrimaryKey;
  issueId?: InternalPrimaryKey;
  responsibilityType: 'LEGAL' | 'ADMINISTRATIVE' | 'FINANCIAL' | 'IMPLEMENTING' | 'REGULATORY' | 'POLITICAL';
  description: string;
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
