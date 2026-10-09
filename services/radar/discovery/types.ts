import type { ResearchSourceClass } from '@/types/research-intelligence';
import type { RadarBeat, RadarCollectorType, RadarOfficialStatus } from '../types';

export type CandidateValidationStatus = 'candidate' | 'validated' | 'rejected' | 'approved';

export type CandidateRejectionReason =
  | 'irrelevant_content'
  | 'duplicate_source'
  | 'mirror_domain'
  | 'content_farm'
  | 'ssrf_blocked'
  | 'unreachable'
  | 'malicious_or_unsafe'
  | 'unsupported_feed_format';

export interface SourceCandidate {
  id: string;
  geography: {
    country: string;
    state?: string;
    district?: string;
    city?: string;
    firstOrderAdmin?: string;
    secondOrderAdmin?: string;
    thirdOrderAdmin?: string;
    locality?: string;
    level?: string;
  };
  organizationName: string;
  sourceType: string;
  url: string;
  canonicalDomain: string;
  discoveredFrom: string;
  feedType: RadarCollectorType;
  beat: RadarBeat;
  authorityClass: ResearchSourceClass;
  officialStatus: RadarOfficialStatus;
  discoveryConfidence: number; // 0.0 - 1.0
  validationStatus: CandidateValidationStatus;
  rejectionReason?: CandidateRejectionReason;
  validationErrors?: string[];
  discoveredAt: string;
  validatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface DiscoveredEndpoint {
  url: string;
  type: RadarCollectorType;
  title?: string;
  confidence: number;
}
