export type ClaimStatus = 'verified' | 'strong' | 'moderate' | 'unverified';

export interface StoryClaim {
  id: string;
  text: string;
  confidence: number;
  status: ClaimStatus;
  sources: EvidenceSource[];
  supportingEvidence: string[];
}

export interface EvidenceSource {
  name: string;
  url: string;
  group: 'government' | 'academic' | 'research' | 'news' | 'primary' | 'report';
}

export interface VerificationTimelineData {
  createdAt: string;
  reviewedAt?: string;
  updatedAt?: string;
  verifiedAt?: string;
}

export interface EvidencePanelData {
  overallScore: number;
  verifiedClaims: number;
  primarySources: number;
  claims: StoryClaim[];
  verification?: VerificationTimelineData;
}

export const STATUS_CONFIG: Record<ClaimStatus, { label: string; wrapperClass: string; dotClass: string }> = {
  verified: { label: 'Verified', wrapperClass: 'bg-green-500/10 text-green-500 border-green-500/20', dotClass: 'bg-green-500' },
  strong: { label: 'Strong', wrapperClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', dotClass: 'bg-blue-500' },
  moderate: { label: 'Moderate', wrapperClass: 'bg-brand-400/10 text-brand-400 border-brand-400/20', dotClass: 'bg-brand-400' },
  unverified: { label: 'Unverified', wrapperClass: 'bg-red-500/10 text-red-500 border-red-500/20', dotClass: 'bg-red-500' },
};

export function getStatus(confidence: number): ClaimStatus {
  if (confidence >= 95) return 'verified';
  if (confidence >= 80) return 'strong';
  if (confidence >= 60) return 'moderate';
  return 'unverified';
}

export function groupSources(sources: EvidenceSource[]): Record<string, EvidenceSource[]> {
  const groups: Record<string, EvidenceSource[]> = {};
  for (const s of sources) {
    (groups[s.group] ??= []).push(s);
  }
  return groups;
}

export const GROUP_LABELS: Record<string, string> = {
  government: 'Government',
  academic: 'Academic',
  research: 'Research',
  news: 'News',
  primary: 'Primary',
  report: 'Report',
};
