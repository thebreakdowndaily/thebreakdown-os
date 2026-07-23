import { 
  InternalPrimaryKey, 
  CanonicalResearchId, 
  Slug,
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface Person {
  id: InternalPrimaryKey;
  canonicalId: CanonicalResearchId;
  slug: Slug;
  legalName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface PersonAlias {
  id: InternalPrimaryKey;
  personId: InternalPrimaryKey;
  alias: string;
  context?: string;
  systemProvenance: SystemProvenance;
}

export interface PoliticalParty {
  id: InternalPrimaryKey;
  canonicalId: CanonicalResearchId;
  slug: Slug;
  officialName: string;
  abbreviation: string;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface PartyAlias {
  id: InternalPrimaryKey;
  partyId: InternalPrimaryKey;
  alias: string;
  systemProvenance: SystemProvenance;
}

export type AffiliationType = 
  | 'FORMAL_MEMBERSHIP' 
  | 'LEGISLATIVE_PARTY' 
  | 'ELECTORAL_ALLIANCE' 
  | 'POLITICAL_SUPPORT';

export type AffiliationStatus = 
  | 'ACTIVE' 
  | 'SUSPENDED' 
  | 'EXPELLED' 
  | 'RESIGNED' 
  | 'DISPUTED';

export interface PartyAffiliationHistory {
  id: InternalPrimaryKey;
  personId: InternalPrimaryKey;
  partyId: InternalPrimaryKey;
  affiliationType: AffiliationType;
  affiliationStatus: AffiliationStatus;
  roleDescription?: string;
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface OfficeHolding {
  id: InternalPrimaryKey;
  personId: InternalPrimaryKey;
  officeTitle: string; // e.g. "Chief Minister", "Cabinet Minister"
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
