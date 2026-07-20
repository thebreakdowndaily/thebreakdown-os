import { 
  InternalPrimaryKey, 
  CanonicalResearchId, 
  SystemProvenance,
  HumanReviewMetadata,
  PublicationMetadata
} from './primitives';

export type ResearchConfidence = 'C5' | 'C4' | 'C3' | 'C2' | 'C1' | 'C0';

export interface Source {
  id: InternalPrimaryKey;
  title: string;
  url?: string;
  publicationDate?: string;
  sourceType: 'OFFICIAL_DOCUMENT' | 'AUDIT_FINDING' | 'COURT_RECORD' | 'SCIENTIFIC_STUDY' | 'GOVERNMENT_RESPONSE' | 'RTI_RESPONSE' | 'PARLIAMENT_RECORD' | 'FIELD_REPORTING' | 'VERIFIED_DATASET';
  systemProvenance: SystemProvenance;
}

export interface EvidenceItem {
  id: InternalPrimaryKey;
  sourceId: InternalPrimaryKey;
  extractedText: string;
  pageNumber?: string;
  locationDetails?: string;
  systemProvenance: SystemProvenance;
  humanReviewMetadata: HumanReviewMetadata;
}

export interface Claim {
  id: InternalPrimaryKey;
  canonicalId: CanonicalResearchId;
  statement: string;
  claimType: 'FACT' | 'ANALYSIS' | 'INTERPRETATION' | 'OPINION' | 'HYPOTHESIS';
  confidence: ResearchConfidence;
  systemProvenance: SystemProvenance;
  humanReviewMetadata: HumanReviewMetadata;
  publicationMetadata: PublicationMetadata;
}

export type ClaimScope = 'PRIMARY_SUBJECT' | 'RELATED_ENTITY' | 'GEOGRAPHIC_SCOPE';

export interface ClaimSubjectRelationship {
  id: InternalPrimaryKey;
  claimId: InternalPrimaryKey;
  
  // Option B: Typed nullable foreign keys enforcing strict referential integrity
  // Exactly one of these must be present per relationship
  personId?: InternalPrimaryKey;
  partyId?: InternalPrimaryKey;
  constituencyId?: InternalPrimaryKey;
  projectId?: InternalPrimaryKey;
  promiseId?: InternalPrimaryKey;
  financialRecordId?: InternalPrimaryKey;
  electionId?: InternalPrimaryKey;

  scope: ClaimScope;
  systemProvenance: SystemProvenance;
}

export interface ClaimEvidenceRelationship {
  id: InternalPrimaryKey;
  claimId: InternalPrimaryKey;
  evidenceItemId: InternalPrimaryKey;
  relationshipType: 'SUPPORTS' | 'CONTRADICTS' | 'QUALIFIES' | 'SUPERSEDES' | 'CONTEXTUALIZES';
  systemProvenance: SystemProvenance;
}

export interface Contradiction {
  id: InternalPrimaryKey;
  primaryClaimId: InternalPrimaryKey;
  contradictingClaimId: InternalPrimaryKey;
  description: string;
  status: 'UNRESOLVED' | 'RESOLVED';
  systemProvenance: SystemProvenance;
}
