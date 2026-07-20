import { 
  InternalPrimaryKey, 
  CanonicalResearchId, 
  Slug,
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface State {
  id: InternalPrimaryKey;
  canonicalId: CanonicalResearchId;
  slug: Slug;
  name: string;
  code: string; // e.g. UP
  systemProvenance: SystemProvenance;
}

export interface Constituency {
  id: InternalPrimaryKey;
  stateId: InternalPrimaryKey;
  canonicalId: CanonicalResearchId;
  slug: Slug;
  name: string;
  districtName: string;
  systemProvenance: SystemProvenance;
}

export interface BoundaryVersion {
  id: InternalPrimaryKey;
  delimitationYear: number;
  description: string;
  systemProvenance: SystemProvenance;
}

export interface ConstituencyBoundaryHistory {
  id: InternalPrimaryKey;
  constituencyId: InternalPrimaryKey;
  boundaryVersionId: InternalPrimaryKey;
  geoJsonShapeUrl?: string; // Reference to external storage
  isReservedSc: boolean;
  isReservedSt: boolean;
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
