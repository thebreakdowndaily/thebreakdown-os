import { 
  InternalPrimaryKey, 
  ExternalIdentifier,
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface Project {
  id: InternalPrimaryKey;
  externalProjectId?: ExternalIdentifier; // e.g. state dashboard ID
  name: string;
  description: string;
  implementingAgency?: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface ProjectGeography {
  id: InternalPrimaryKey;
  projectId: InternalPrimaryKey;
  constituencyId: InternalPrimaryKey;
  attributionMode: 'EXCLUSIVE' | 'SHARED_PRIMARY' | 'SHARED_SECONDARY' | 'UNCLEAR';
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface ProjectStatusHistory {
  id: InternalPrimaryKey;
  projectId: InternalPrimaryKey;
  status: 'IDEATION' | 'PLANNED' | 'EXECUTING' | 'COMPLETED' | 'ARCHIVED';
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
