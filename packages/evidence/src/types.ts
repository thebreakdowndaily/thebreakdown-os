export type ClaimStatus = 'verified' | 'strong' | 'moderate' | 'contested' | 'debunked';

export interface EvidenceSource {
  name: string;
  url?: string;
  group: 'primary' | 'secondary';
  tier?: number;
  reliability?: string;
}

export interface ClaimData {
  id: string;
  text: string;
  confidence: number; // 0 to 100
  status: ClaimStatus;
  sources: EvidenceSource[];
  supportingEvidence?: string[];
  verifiedAt?: string;
  explanation?: string;
}

export interface VerificationEvent {
  date: string;
  status: ClaimStatus;
  notes: string;
  author: string;
}
