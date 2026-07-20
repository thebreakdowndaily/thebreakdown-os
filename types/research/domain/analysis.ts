import { 
  InternalPrimaryKey, 
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface AnalyticalFinding {
  id: InternalPrimaryKey;
  title: string;
  findingText: string;
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance; // Needs claims that support this analysis
}

export interface Assessment {
  id: InternalPrimaryKey;
  title: string;
  assessmentText: string;
  score?: number; // e.g. out of 10
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface Forecast {
  id: InternalPrimaryKey;
  targetDate: string; // The date this forecast applies to
  forecastText: string;
  probabilityScore?: number; // 0-100
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
