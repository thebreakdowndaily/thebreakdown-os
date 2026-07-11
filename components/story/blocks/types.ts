export interface StoryBlock<T = unknown> {
  id: string;
  type: string;
  data: T;
}

/* ── Individual block data shapes ────────────────────────── */

export interface ExecutiveSummaryData {
  summary: string;
  keyPoints: string[];
}

export interface EvidenceClaim {
  claim: string;
  source: string;
  verification: 'true' | 'false' | 'misleading' | 'unverifiable';
  explanation: string;
  confidence: number;
}

export interface EvidencePanelData {
  overallScore: number;
  verifiedClaims: number;
  claims: import('@/components/story/evidence/types').StoryClaim[];
  primarySources: number;
  verification?: import('@/components/story/evidence/types').VerificationTimelineData;
}

export interface KeyNumberItem {
  value: string;
  label: string;
  source?: string;
}

export interface KeyNumbersData {
  items: KeyNumberItem[];
}

export interface ComparisonData {
  metric: string;
  before: { label: string; value: string };
  after: { label: string; value: string };
  description?: string;
}

export interface TimelineData {
  events: Array<{ date: string; title: string; description: string; source?: string }>;
}

export interface RelatedIntelligenceData {
  topics?: Array<{ slug: string; name: string }>;
  entities?: Array<{ slug: string; name: string; type: string }>;
  countries?: Array<{ slug: string; name: string }>;
  organizations?: Array<{ slug: string; name: string }>;
  stories?: Array<{ slug: string; headline: string }>;
}

export interface FAQData {
  questions: Array<{ question: string; answer: string }>;
}

export interface SourceItem {
  name: string;
  url: string;
  type: string;
  tier: number;
}

export interface SourcesData {
  sources: SourceItem[];
}

export interface CalloutData {
  variant: 'context' | 'definition' | 'why-it-matters' | 'what-changed' | 'warning';
  title?: string;
  content: string;
}

export interface EvidenceInlineData {
  claimIndex: number;
  claim: string;
  source: string;
  verification: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence: number;
  explanation: string;
}

export interface ImageBlockData {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  width?: 'narrow' | 'full' | 'wide';
}

export interface ChapterHeadingData {
  title: string;
  anchorId: string;
}

export interface HeroBlockData {
  headline: string;
  summary: string;
  heroImage: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  author: string;
  evidenceScore: number;
  sources: import('@/types/canonical').Source[];
  tags: string[];
  category: string;
  slug: string;
  versionHistory?: Array<{ date: string; description: string }>;
}

export interface AuthorBoxBlockData {
  author: { name: string; avatar?: string; bio?: string; url?: string };
}

export interface StorySnapshotBlockData {
  status?: string;
  category?: string;
  location?: string;
  stakeholderNames?: string[];
  impactLevel?: string;
  legislation?: string;
  costValue?: string;
  updatedAt?: string;
  evidenceScore?: number;
  sourceCount?: number;
}

export interface ConfidenceMeterBlockData {
  overallScore: number;
  sourceQuality: number;
  confirmations: number;
  dataAvailability: number;
  verificationStatus: number;
  totalClaims: number;
  verified: number;
  misleading: number;
  unverifiable: number;
}

export interface BlockMap {
  'executive-summary': ExecutiveSummaryData;
  'evidence': EvidencePanelData;
  'key-numbers': KeyNumbersData;
  'comparison': ComparisonData;
  'timeline': TimelineData;
  'related-intelligence': RelatedIntelligenceData;
  'faq': FAQData;
  'sources': SourcesData;
  'callout': CalloutData;
  'evidence-inline': EvidenceInlineData;
  'image': ImageBlockData;
  'chapter-heading': ChapterHeadingData;
  'text': { content: string };
  'chart': {
    chartId: string;
    type: string;
    title: string;
    data: Array<Record<string, unknown>>;
    xKey: string;
    yKey: string;
  };
  'quote': { text: string; attribution?: string };
  'dataset-reference': import('./DatasetReferenceBlock').DatasetReferenceData;
  'hero': HeroBlockData;
  'author-box': AuthorBoxBlockData;
  'story-snapshot': StorySnapshotBlockData;
  'confidence-meter': ConfidenceMeterBlockData;
}

export type BlockType = keyof BlockMap;
