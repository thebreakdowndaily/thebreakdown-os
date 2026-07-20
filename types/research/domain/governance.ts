import { 
  InternalPrimaryKey, 
  SystemProvenance,
  HumanReviewMetadata
} from './primitives';

export interface Correction {
  id: InternalPrimaryKey;
  targetRecordId: InternalPrimaryKey;
  targetRecordType: string;
  correctionReason: string;
  systemProvenance: SystemProvenance;
  humanReviewMetadata: HumanReviewMetadata;
}

export interface SupersessionRelationship {
  id: InternalPrimaryKey;
  supersededRecordId: InternalPrimaryKey;
  supersedingRecordId: InternalPrimaryKey;
  reason: string;
  systemProvenance: SystemProvenance;
}

export interface ResearchGap {
  id: InternalPrimaryKey;
  entityId?: InternalPrimaryKey; // E.g. constituency, candidate
  entityType?: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED';
  systemProvenance: SystemProvenance;
}
