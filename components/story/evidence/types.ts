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

export const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string }> = {
  verified: { label: 'Verified', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  strong: { label: 'Strong', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  moderate: { label: 'Moderate', color: '#D4A843', bg: 'rgba(212,168,67,0.1)' },
  unverified: { label: 'Unverified', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
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
