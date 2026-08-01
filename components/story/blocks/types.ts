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

export interface StakeholderItem {
  name: string;
  type: 'government' | 'institution' | 'individual' | 'community' | 'private_sector';
  position: string;
  interest: string;
  stance: 'support' | 'oppose' | 'neutral' | 'conditional';
}

export interface StakeholdersData {
  headline: string;
  stakeholders: StakeholderItem[];
  summary?: string;
}

export interface PerspectiveItem {
  label: string;
  source: string;
  quote: string;
  stance: string;
}

export interface PerspectivesData {
  headline: string;
  perspectives: PerspectiveItem[];
  note?: string;
}

export interface FutureOutlookData {
  headline: string;
  scenarios: Array<{
    label: string;
    description: string;
    probability?: string;
    source?: string;
  }>;
  uncertainty?: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface SystemExplanationData {
  headline: string;
  summary: string;
  steps: Array<{
    label: string;
    description: string;
    actor?: string;
    input?: string;
    output?: string;
  }>;
  diagram?: string;
  diagramAlt?: string;
}

export interface TBSStory {
  id: string;
  slug: string;
  storyType: string;
  title: string;
  subtitle?: string;
  hero: {
    image: string;
    statistic?: string;
    statisticSource?: string;
    caption?: string;
    altText?: string;
    credit?: string;
    aspectRatio?: string;
  };
  metadata: {
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    confidence: 'High' | 'Medium' | 'Low' | 'Insufficient';
    confidenceRationale: string;
    updateRequired: boolean;
    readingTimeMinutes: number;
    tags: string[];
    entities: Array<{ name: string; type: string; role: string }>;
    lastVerified: string;
    nextVerificationDue: string | null;
  };
  summary: string;
  keyFacts: Array<{ claim: string; source: string; confidence: number }>;
  whyItMatters: string;
  narrative: string;
  timeline: Array<{ date: string; event: string; source: string; significance: string }>;
  systemExplanation?: SystemExplanationData;
  evidence: Array<{ claim: string; source: string; confidence: number; verifiedAt: string }>;
  charts: Array<{ title: string; type: string; data: Array<Record<string, unknown>>; source: string }>;
  maps?: Array<{ title: string; type: string; data: Record<string, unknown>; source: string }>;
  stakeholders?: StakeholdersData;
  perspectives?: PerspectivesData;
  tradeoffs?: Array<{ option: string; benefits: string[]; risks: string[]; evidence: string }>;
  futureOutlook?: FutureOutlookData;
  faq: Array<{ question: string; answer: string; source?: string }>;
  takeaways: string[];
  sources: Array<{ title: string; author?: string; date?: string; url?: string; reliability: string }>;
  relatedKnowledge: Array<{ title: string; slug: string; relation: string }>;
  visuals: Array<{ section: string; type: string; placement: string; aspectRatio: string; caption: string; altText: string; credit: string }>;
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

export interface LegendItem {
  label: string;
  color: string;
  type?: 'solid' | 'dashed' | 'dotted';
}

export interface MapProvenance {
  creator?: string;
  source: string;
  reference?: string;
  date?: string;
}

export interface MapBlockData {
  title: string;
  caption: string;
  altText?: string;
  url?: string;
  mapType: string;
  dataSource: string;
  disputedBoundaries?: boolean;
  legend?: LegendItem[];
  scale?: string;
  projection?: string;
  linkedTimelineId?: string;
  linkedDocuments?: string[];
  license?: string;
  credit?: string;
  status: 'archived' | 'requested' | 'draft' | 'recreated';
  provenance?: MapProvenance;
  linkedClaims?: string[];
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
  'map': MapBlockData;
  'quote': { text: string; attribution?: string };
  'dataset-reference': import('./DatasetReferenceBlock').DatasetReferenceData;
  'hero': HeroBlockData;
  'author-box': AuthorBoxBlockData;
  'story-snapshot': StorySnapshotBlockData;
  'confidence-meter': ConfidenceMeterBlockData;
  'system-explanation': SystemExplanationData;
  'stakeholders': StakeholdersData;
  'perspectives': PerspectivesData;
  'future-outlook': FutureOutlookData;
}

export type BlockType = keyof BlockMap;
