/**
 * THE BREAKDOWN — API Platform Types
 *
 * Public-facing API response types (enriched versions of internal types).
 */

export interface APIStory {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  wordCount?: number;
  author: APIAuthor;
  evidenceScore: number;
  category: string;
  tags: string[];
  keyPoints: string[];
  timeline: APITimelineEvent[];
  facts: APIFact[];
  claims: APIClaim[];
  sources: APISource[];
  charts: APIChart[];
  geoData?: APIGeoData;
  faq: APIFAQItem[];
  relatedTopicIds?: string[];
  relatedEntityIds?: string[];
  relatedStories: APIRelatedStory[];
  relatedEntities: APIRelatedEntity[];
  organisations?: APIRelatedEntity[];
  countries?: APIRelatedEntity[];
  status?: 'breaking' | 'developing' | 'verified' | 'explainer' | 'archive';
  versionHistory?: Array<{ date: string; description: string }>;
  confidenceBreakdown?: {
    overallScore: number;
    sourceQuality: number;
    confirmations: number;
    dataAvailability: number;
    verificationStatus: number;
  };
  location?: string;
  stakeholderNames?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
  legislation?: string;
  costValue?: string;
  takeaway?: string;
  whoIsAffected?: string;
}

export interface APIAuthor {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface APITimelineEvent {
  date: string;
  title: string;
  description: string;
  source?: string;
  category?: string;
}

export interface APIFact {
  label: string;
  value: string;
  source?: string;
}

export interface APIClaim {
  claim: string;
  source: string;
  verification: string;
  explanation: string;
  confidence: number;
}

export interface APISource {
  name: string;
  url: string;
  type: string;
  tier: number;
}

export interface APIChart {
  type: string;
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
}

export interface APIGeoData {
  type: string;
  regions: Array<{ id: string; name: string; value: number }>;
}

export interface APIFAQItem {
  question: string;
  answer: string;
}

export interface APIRelatedStory {
  slug: string;
  headline: string;
  summary: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

export interface APIRelatedEntity {
  id: string;
  slug: string;
  name: string;
  type: string;
  description?: string;
  relationship?: string;
}

export interface APIEntity {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  aliases: string[];
  storyCount: number;
  updatedAt: string;
  timeline: APITimelineEvent[];
  statistics: Record<string, string | number>;
  relatedStories: APIRelatedStory[];
  relatedEntities: APIRelatedEntity[];
  faq: APIFAQItem[];
  image?: string;
  evidenceScore?: number;
  datasets?: Array<{ label: string; description: string; data: Record<string, unknown>[]; source: string }>;
  sources?: Array<{ name: string; url: string; type: string; description: string }>;
  relatedTopics?: APIRelatedEntity[];
  overview?: string;
  population?: number;
  gdp?: number;
  capital?: string;
}

export interface APITopic {
  id: string;
  slug: string;
  name: string;
  description: string;
  storyCount: number;
  entityCount: number;
  updatedAt: string;
  stories: APIRelatedStory[];
  entities: APIRelatedEntity[];
}

export interface APITimeline {
  id: string;
  title: string;
  description: string;
  category: string;
  events: APITimelineEvent[];
  storySlugs: string[];
  dateRange: { start: string; end: string };
}

export type APICountry = APIEntity;

export type APIOrganization = APIEntity;

export interface APIFix {
  id: string;
  slug: string;
  storySlug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  author: APIAuthor;
  evidenceScore: number;
  tags: string[];
  problem: APIFixSection;
  whoIsAffected: APIFixSection;
  rootCauses: APIFixSection;
  evidence: APIFixSection;
  stakeholders: APIStakeholder[];
  existingSolutions: APIExistingSolution[];
  globalExamples: APIGlobalExample[];
  recommendedActions: APIFixAction[];
  citizenActions: APIFixAction[];
  governmentActions: APIFixAction[];
  metricsToTrack: APIMetric[];
  relatedStories: APIRelatedStory[];
  relatedEntities: APIRelatedEntity[];
}

export interface APIFixSection {
  title: string;
  content: string;
  supportingData?: Array<{ label: string; value: string }>;
}

export interface APIStakeholder {
  name: string;
  type:
    | 'government'
    | 'citizen'
    | 'private-sector'
    | 'civil-society'
    | 'international';
  role: string;
  interest: string;
  stance?: 'supports' | 'opposes' | 'neutral' | 'mixed';
}

export interface APIExistingSolution {
  name: string;
  description: string;
  status:
    | 'active'
    | 'proposed'
    | 'expired'
    | 'failed';
  effectiveness?: string;
  source?: string;
}

export interface APIGlobalExample {
  country: string;
  policy: string;
  description: string;
  outcome: string;
  source?: string;
  applicableToIndia?: boolean;
}

export interface APIFixAction {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  actors: string[];
}

export interface APIMetric {
  name: string;
  currentValue: string;
  targetValue: string;
  dataSource: string;
  updateFrequency: string;
}

export interface APIGraphQuery {
  nodes: APIGraphNode[];
  links: APIGraphLink[];
}

export interface APIGraphNode {
  id: string;
  label: string;
  type: string;
  group?: string;
  size?: number;
}

export interface APIGraphLink {
  source: string;
  target: string;
  type: string;
  weight?: number;
  sourceType?: string;
  targetType?: string;
}

export interface APIStatistics {
  totalStories: number;
  totalEntities: number;
  totalTopics: number;
  totalCountries: number;
  totalOrganizations: number;
  totalTimelines: number;
  storiesByCategory: Record<string, number>;
  storiesByMonth: Record<string, number>;
  averageEvidenceScore: number;
  topTags: Array<{ tag: string; count: number }>;
  topAuthors: Array<{ name: string; count: number }>;
}

export interface APIListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface APIError {
  error: string;
  status: number;
  details?: string;
}
export const __TEST__ = "DATA_LAYER_TYPES";