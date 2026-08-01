import type { CounterArgument } from '@/types/canonical';

export type ClaimStatus = 'verified' | 'strong' | 'moderate' | 'unverified';

export interface StoryClaim {
  id: string;
  text: string;
  confidence: number;
  status: ClaimStatus;
  sources: EvidenceSource[];
  supportingEvidence: string[];
  counterArguments?: CounterArgument[];
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
  verified: { label: 'Verified', wrapperClass: 'bg-success/10 text-success border-success/20', dotClass: 'bg-success' },
  strong: { label: 'Strong', wrapperClass: 'bg-info/10 text-info border-info/20', dotClass: 'bg-info' },
  moderate: { label: 'Moderate', wrapperClass: 'bg-warning/10 text-warning border-warning/20', dotClass: 'bg-warning' },
  unverified: { label: 'Unverified', wrapperClass: 'bg-error/10 text-error border-error/20', dotClass: 'bg-error' },
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
