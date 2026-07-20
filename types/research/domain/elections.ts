import { 
  InternalPrimaryKey, 
  ExternalIdentifier,
  BitemporalInterval,
  SystemProvenance,
  EvidenceProvenance
} from './primitives';

export interface Candidate {
  id: InternalPrimaryKey;
  personId: InternalPrimaryKey;
  partyId?: InternalPrimaryKey; // Current or most recent affiliation context
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface CandidateStatusHistory {
  id: InternalPrimaryKey;
  candidateId: InternalPrimaryKey;
  status: 'PROPOSED' | 'CONFIRMED' | 'REJECTED' | 'WITHDRAWN';
  bitemporal: BitemporalInterval;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface Election {
  id: InternalPrimaryKey;
  electionType: 'ASSEMBLY' | 'LOK_SABHA' | 'LOCAL_BODY';
  year: number;
  description: string;
  systemProvenance: SystemProvenance;
}

export interface ElectionContest {
  id: InternalPrimaryKey;
  electionId: InternalPrimaryKey;
  constituencyId: InternalPrimaryKey;
  dateOfPoll?: string;
  dateOfCounting?: string;
  systemProvenance: SystemProvenance;
}

export interface ElectionCandidate {
  id: InternalPrimaryKey;
  electionContestId: InternalPrimaryKey;
  candidateId: InternalPrimaryKey;
  eciCandidateId?: ExternalIdentifier;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface ElectionResult {
  id: InternalPrimaryKey;
  electionCandidateId: InternalPrimaryKey;
  votesObtained: number;
  isWinner: boolean;
  margin?: number;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}

export interface TurnoutRecord {
  id: InternalPrimaryKey;
  electionContestId: InternalPrimaryKey;
  totalElectors: number;
  totalVotesPolled: number;
  turnoutPercentage: number;
  systemProvenance: SystemProvenance;
  evidenceProvenance: EvidenceProvenance;
}
