// ─── The Breakdown OS — Canonical Data Models ──────────────────────────────
// Single source of truth for every content type. No other file defines these shapes.
// Everything else (services, view models, API, graph) derives from these.

// ─── Primitives ─────────────────────────────────────────────────────────────

export type EntityKind =
  | 'person' | 'organization' | 'policy' | 'scheme' | 'budget'
  | 'report' | 'dataset' | 'source' | 'country';

export type StoryStatus = 'draft' | 'review' | 'fact_check' | 'scheduled' | 'published' | 'updated';

export type StoryType = 'standard' | 'investigation_chapter' | 'explainer' | 'analysis' | 'briefing';

export type EvidenceTier =
  | 'official_document' | 'audit_finding' | 'court_record'
  | 'scientific_study' | 'government_response' | 'rti_response'
  | 'parliament_record' | 'field_reporting' | 'verified_dataset';

export interface EvidenceBadge {
  tier: EvidenceTier;
  confidence: number;
  verifiedAt: string;
  sourceCount: number;
}

export interface InvestigationChapter {
  id: string;
  slug: string;
  storySlug: string;
  title: string;
  subtitle?: string;
  summary: string;
  order: number;
  estimatedReadingTime?: number;
  evidenceScore?: number;
  icon?: string;
}

export interface Investigation {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  heroImage: string;
  publishedAt: string;
  updatedAt: string;
  status: StoryStatus;
  chapters: InvestigationChapter[];
  keyFindings: string[];
  tags: string[];
  relatedEntityIds: string[];
  relatedTopicIds: string[];
  sources: Source[];
  faq: FAQItem[];
  timeline: TimelineEvent[];
  statistics: StatItem[];
  freshness?: FreshnessMetadata;
}

export type RelationType =
  | 'mentions' | 'belongs_to' | 'implemented_by' | 'announced_by'
  | 'funded_by' | 'affects' | 'related_to' | 'part_of' | 'located_in'
  | 'published_by' | 'criticized_by' | 'supports' | 'opposes'
  | 'covers' | 'analyzes' | 'references';

export type ConfidenceTier = 1 | 2 | 3 | 4 | 5;

export type UserRole = 'admin' | 'editor' | 'writer' | 'researcher' | 'designer' | 'reader';

// ─── Content Models ─────────────────────────────────────────────────────────

export type FreshnessStatus = 'Fresh' | 'Monitoring' | 'Changed' | 'Review Required' | 'Approved' | 'Archived';

export interface FreshnessMetadata {
  status: FreshnessStatus;
  lastVerified: string;
  confidence: number;
  primarySourcesCount: number;
  secondarySourcesCount?: number;
  nextCheckAt?: string;
  pendingUpdates?: number;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  headline: string;
  summary: string;
  heroImage: string;
  author: string;
  category: string;
  status: StoryStatus;
  storyType: StoryType;
  evidenceScore: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  blocks: StoryBlock[];
  sources: Source[];
  claims: Claim[];
  timeline: TimelineEvent[];
  faq: FAQItem[];
  charts: ChartDef[];
  primaryEntityId?: string;
  relatedStoryIds: string[];
  relatedEntityIds: string[];
  relatedTopicIds: string[];
  notes?: string;
  updatedBy?: string;
  takeaway?: string;
  whoIsAffected?: string;
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  stakeholderNames?: string[];
  legislation?: string;
  costValue?: string;
  versionHistory?: Array<{ date: string; description: string }>;
  freshness?: FreshnessMetadata;
  confidenceBreakdown?: {
    overallScore: number;
    sourceQuality: number;
    confirmations: number;
    dataAvailability: number;
    verificationStatus: number;
  };
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  overview?: string;
  image?: string;
  storyIds: string[];
  relatedEntityIds: string[];
  featuredStoryIds: string[];
  countries: string[];
  faq: FAQItem[];
  timeline: TimelineEvent[];
  statistics: StatItem[];
  freshness?: FreshnessMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  type: EntityKind;
  name: string;
  slug: string;
  description: string;
  aliases: string[];
  image?: string;
  storyCount: number;
  evidenceScore: number;
  relatedEntityIds: string[];
  relatedStoryIds: string[];
  relatedTopicIds: string[];
  statistics: StatItem[];
  timeline: TimelineEvent[];
  faq: FAQItem[];
  assets?: AssetReference[];
  claims?: Claim[];
  createdAt: string;
  updatedAt: string;
}

// ─── Entity Models (Phase 1) ────────────────────────────────────────────────────────────

export interface EntityRelationship {
  targetId: string;
  role: string; // e.g., 'founder', 'subsidiary', 'critic', 'supporter'
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface EntityUsageGraph {
  stories: string[];
  topics: string[];
  collections: string[];
}

export interface EntityBase {
  id: string;
  slug: string;
  type: EntityKind;
  name: string;
  description: string;
  aliases: string[];
  
  // Richer Asset Integration
  assets: AssetReference[]; 
  
  // Knowledge Graph Relationships
  relationships: EntityRelationship[];
  
  // Metadata & Analytics
  evidenceScore: number;
  statistics: StatItem[];
  timeline: TimelineEvent[];
  faq: FAQItem[];
  claims: Claim[];
  
  // --- Legacy Compatibility ---
  /** @deprecated use AssetResolver and ImageAsset instead */
  image?: string;
  /** @deprecated use usageGraph.stories length or Pipeline instead */
  storyCount: number;
  /** @deprecated use relationships instead */
  relatedEntityIds: string[];
  /** @deprecated use relationships instead */
  relatedStoryIds: string[];
  /** @deprecated use relationships instead */
  relatedTopicIds: string[];

  version: number;
  usageGraph: EntityUsageGraph;
  freshness?: FreshnessMetadata;
  
  createdAt: string;
  updatedAt: string;
}

export interface PersonEntity extends EntityBase { type: 'person'; }
export interface OrganizationEntity extends EntityBase { type: 'organization'; }
export interface PolicyEntity extends EntityBase { type: 'policy'; }
export interface SchemeEntity extends EntityBase { type: 'scheme'; }
export interface BudgetEntity extends EntityBase { type: 'budget'; }
export interface ReportEntity extends EntityBase { type: 'report'; }
export interface DatasetEntity extends EntityBase { type: 'dataset'; }
export interface SourceEntity extends EntityBase { type: 'source'; }
export interface CountryEntity extends EntityBase { type: 'country'; }

export type KnowledgeEntity = PersonEntity | OrganizationEntity | PolicyEntity | SchemeEntity | BudgetEntity | ReportEntity | DatasetEntity | SourceEntity | CountryEntity;

export interface Timeline {
  id: string;
  title: string;
  description: string;
  category: string;
  storyIds: string[];
  entityIds: string[];
  topicIds: string[];
  events: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}


export type ImageCategory = 'PHOTO' | 'ILLUSTRATION' | 'INFOGRAPHIC' | 'MAP' | 'CHART' | 'DIAGRAM' | 'DOCUMENT' | 'SCREENSHOT' | 'SATELLITE' | 'LOGO';
export type EditorialPriority = 'PRIMARY' | 'SECONDARY' | 'SUPPORTING' | 'THUMBNAIL' | 'HERO';
export type VerificationStatus = 'PENDING' | 'EDITOR_VERIFIED' | 'SOURCE_VERIFIED' | 'AI_REVIEWED' | 'REJECTED' | 'ARCHIVED';
export type LicenseType = 'EDITORIAL' | 'OFFICIAL' | 'PUBLIC_DOMAIN' | 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'COMMERCIAL' | 'LICENSED' | 'FAIR_USE' | 'AI';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'chart' | 'document' | 'svg' | 'map';
  src: string;
  alt: string;
  caption: string;
  tags: string[];
  credit: string;
  width?: number;
  height?: number;
  fileSize?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  
  // Editorial & Copyright
  agency?: string;
  copyrightOwner?: string;
  photographer?: string;
  capturedAt?: string;
  sourceUrl?: string;
  licenseType?: LicenseType;
  
  // Taxonomy & Accessibility
  imageCategory?: ImageCategory;
  editorialPriority?: EditorialPriority;
  longDescription?: string;
  
  // Technical & Automation
  sha256Hash?: string;
  blurHash?: string;
  focusPointX?: number;
  focusPointY?: number;
  dominantColor?: string;
  verificationStatus?: VerificationStatus;
  
  // AI Provenance
  isAiGenerated?: boolean;
  aiModel?: string;
  aiPrompt?: string;
  aiProvider?: string;
  generatedAt?: string;
  
  // EXIF
  orientation?: string;
  camera?: string;
  lens?: string;
  iso?: string;
  gps?: string;
}

// ─── Asset Models (Phase 1) ─────────────────────────────────────────────────────────────

export interface EntityRef { id: string; role?: string; confidence?: number; }
export interface TopicRef { id: string; role?: string; confidence?: number; }
export interface StoryRef { id: string; role?: string; confidence?: number; }
export interface CollectionRef { id: string; role?: string; confidence?: number; }

export interface AssetRelationships {
  entities: EntityRef[];
  topics: TopicRef[];
  stories: StoryRef[];
  collections: CollectionRef[];
}

export interface AssetAttribution {
  caption?: string;
  credit?: string;
  license: string;
  copyright?: string;
  displayText?: string;
  citation?: string;
}

export interface AssetOptimization {
  cdnUrl: string;
  webpUrl?: string;
  avifUrl?: string;
  thumbnailUrl?: string;
  cacheKey?: string;
}

export interface AssetMetadata {
  width?: number;
  height?: number;
  aspectRatio?: number;
  mimeType: string;
  fileSize?: number;
  sha256?: string;
  perceptualHash?: string;
  dominantColor?: string;
  blurHash?: string;
  focusPoint?: { x: number; y: number };
  aiGenerated: boolean;
}

export interface AssetVersion {
  id: string;
  assetId: string;
  versionNumber: number;
  metadata: AssetMetadata;
  optimization: AssetOptimization;
  createdAt: string;
  createdBy: string;
  reason?: string;
}

export interface AssetUsageGraph {
  stories: string[];
  topics: string[];
  entities: string[];
  homepages: string[];
  newsletters: string[];
  collections: string[];
}

export interface AssetBase {
  id: string;
  slug: string;
  type: string;
  title: string;
  altText: string;
  longDescription?: string;
  metadata: AssetMetadata;
  attribution: AssetAttribution;
  optimization: AssetOptimization;
  relationships: AssetRelationships;
  
  // Versioning
  currentVersion: number;
  versions: AssetVersion[];
  
  // CMS Usage Graph
  usageGraph: AssetUsageGraph;
  
  // Analytics & State
  priority: 'hero' | 'editorial' | 'commons' | 'ai' | 'placeholder';
  confidence: number;
  usageCount: number;
  verificationStatus: 'verified' | 'unverified' | 'flagged';
  uploadedAt: string;
}

export interface ImageAsset extends AssetBase { type: 'image'; }
export interface LogoAsset extends AssetBase { type: 'logo'; }
export interface ChartAsset extends AssetBase { type: 'chart'; }
export interface MapAsset extends AssetBase { type: 'map'; }
export interface DocumentAsset extends AssetBase { type: 'document'; }
export interface VideoAsset extends AssetBase { type: 'video'; }
export interface AudioAsset extends AssetBase { type: 'audio'; }
export interface DatasetPreviewAsset extends AssetBase { type: 'dataset_preview'; }

export type KnowledgeAsset = ImageAsset | LogoAsset | ChartAsset | MapAsset | DocumentAsset | VideoAsset | AudioAsset | DatasetPreviewAsset;

export interface AssetReference {
  assetId: string;
  role?: string;
  resolvedAsset?: AssetBase;
  crop?: string;
  priority?: 'hero' | 'editorial' | 'thumbnail' | 'social';
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReaderProfile {
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface Bookmark {
  id: string;
  userId: string;
  storyId: string;
  storySlug: string;
  storyTitle: string;
  createdAt: string;
}

export interface ReadingHistoryEntry {
  id: string;
  userId: string;
  storyId: string;
  storySlug: string;
  storyTitle: string;
  progress: number;
  lastReadAt: string;
}

export interface Follow {
  id: string;
  userId: string;
  entityId?: string;
  entityType?: string;
  entitySlug?: string;
  entityName: string;
  createdAt: string;
}

// ─── Sub-models ─────────────────────────────────────────────────────────────

export interface StoryBlock {
  id: string;
  type: string;
  region?: 'hero' | 'header' | 'main' | 'footer' | 'sidebar' | 'metadata';
  data: Record<string, unknown>;
  collapsed?: boolean;
}

export interface Source {
  title: string;
  url: string;
  accessedAt: string;
  tier: ConfidenceTier;
}

export interface Claim {
  id: string;
  claim: string;
  data: string;
  source: string;
  sourceUrl: string;
  tier: ConfidenceTier;
  evidenceTier?: EvidenceTier;
  confidence: number;
  status: 'verified' | 'strong' | 'moderate' | 'unverified';
  verificationLevel?: 'primary' | 'secondary';
  verifiedAt?: string;
  sourceCount?: number;
}

export interface TimelineEvent {
  id?: string;
  date: string;
  title: string;
  description: string;
  storyId?: string;       // Linked story
  evidenceId?: string;    // Specific claim/evidence node
  sourceUrl?: string;     // Raw source
  confidence?: number;    // Git-style confidence node
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChartDef {
  type: string;
  chartType?: string; // For backward compatibility if needed
  title: string;
  description?: string;
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  caption?: string;
}

export interface StatItem {
  label: string;
  value: string;
  trend?: string;
  change?: string;
}





// ─── Graph ──────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: EntityKind | 'story' | 'topic' | 'timeline' | 'fix' | 'dataset';
  title: string;
  slug: string;
  subtitle?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: RelationType;
  confidence: number;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

// ─── Dataset & Intelligence Engine ───────────────────────────────────────────

export type DatasetCategory =
  | 'economy' | 'climate' | 'health' | 'education' | 'demographics'
  | 'energy' | 'trade' | 'governance' | 'technology' | 'military'
  | 'infrastructure' | 'social' | 'environment' | 'finance';

export type DatasetFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'adhoc';

export type DataType = 'number' | 'percentage' | 'currency' | 'ratio' | 'index' | 'count' | 'text';

export interface Dataset {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: DatasetCategory;
  frequency: DatasetFrequency;
  unitLabel: string;
  source: string;
  sourceUrl: string;
  methodology: string;
  tags: string[];
  versions: DatasetVersion[];
  metrics: Metric[];
  dimensions: Dimension[];
  visualizations: Visualization[];
  relatedEntityIds: string[];
  relatedStoryIds: string[];
  relatedTopicIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatasetVersion {
  id: string;
  version: string;
  publishedAt: string;
  notes: string;
  series: Series[];
  metadata: Record<string, string>;
}

export interface Metric {
  id: string;
  name: string;
  label: string;
  description: string;
  dataType: DataType;
  unit: string;
  decimalPlaces: number;
  isPrimary: boolean;
}

export interface Dimension {
  id: string;
  name: string;
  label: string;
  values: string[];
}

export interface Series {
  id: string;
  metricId: string;
  dimensionFilters: Record<string, string>;
  observations: Observation[];
}

export interface Observation {
  period: string;
  value: number | null;
  annotation?: string;
}

export interface Visualization {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'table' | 'heatmap';
  metricIds: string[];
  dimensionFilter?: Record<string, string>;
  config: Record<string, unknown>;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchIndexEntry {
  id: string;
  type: 'story' | 'topic' | 'entity' | 'organization' | 'country' | 'timeline' | 'fix' | 'dataset';
  title: string;
  slug: string;
  description: string;
  tags: string[];
  content: string; // indexable text
  score: number;
  updatedAt: string;
}

// ─── Events ─────────────────────────────────────────────────────────────────

export type EventType =
  | 'story:created' | 'story:updated' | 'story:published' | 'story:deleted'
  | 'topic:created' | 'topic:updated' | 'topic:deleted'
  | 'entity:created' | 'entity:updated' | 'entity:deleted'
  | 'timeline:created' | 'timeline:updated' | 'timeline:deleted'
  | 'fix:created' | 'fix:updated' | 'fix:deleted'
  | 'dataset:created' | 'dataset:updated' | 'dataset:deleted'
  | 'media:uploaded' | 'media:updated' | 'media:deleted'
  | 'search:indexed'
  | 'graph:updated';

export interface Event {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

// ─── Knowledge Lifecycle & Editorial Workflow ─────────────────────────────────

export interface RegisteredSource {
  id: string;
  name: string;
  provider: string;
  trustScore: number;
  refreshFrequency: string; // CRON expression
  country?: string;
  domain?: string;
  categories: string[];
  topics: string[];
  entities: string[];
  stories: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  lastSuccess?: string;
  lastFailure?: string;
  failureCount: number;
  status: 'active' | 'failing' | 'paused' | 'archived';
}

export interface EditorialTask {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  severity: 'blocker' | 'major' | 'minor';
  owner?: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  evidence: {
    sourceId: string;
    diffSummary: string;
    url?: string;
  };
  affectedContent: {
    stories: string[];
    topics: string[];
    entities: string[];
    claims: string[];
  };
  resolution?: string;
  status: 'pending' | 'assigned' | 'in_review' | 'approved' | 'dismissed' | 'resolved';
}

// ─── ViewModels (page-level) ────────────────────────────────────────────────

export interface HomepageViewModel {
  seo: SEOData;
  sections: PageSection[];
}

// ─── Reading Mode View Models (derived, never stored) ──────────────────

export interface QuickStoryViewModel {
  summary: string;
  keyPoints: string[];
  readingTime: number;
}

export interface DeepStoryViewModel {
  methodology: string;
  expandedSources: ExpandedSource[];
  readingTime: number;
  sourceCount: number;
  claimCount: number;
  faqCount: number;
}

export interface ExpandedSource {
  name: string;
  url: string;
  description: string;
  tier: number;
}

export interface StoryPageViewModel {
  story: Story;
  relatedStories: Story[];
  relatedTopics: Topic[];
  relatedEntities: Entity[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
  tableOfContents: TOCItem[];
  snapshot?: StorySnapshot;
  executiveBrief?: ExecutiveBrief;
  evidenceSummary?: EvidenceSummary;
  quickView: QuickStoryViewModel;
  deepView: DeepStoryViewModel;
}

export interface StorySnapshot {
  status: string;
  category: string;
  location?: string;
  stakeholders: string[];
  costValue?: string;
  impactLevel?: string;
  legislation?: string;
  lastUpdated: string;
}

export interface ExecutiveBrief {
  takeaway: string;
  keyPoints: string[];
  whoIsAffected?: string;
  impactLevel?: string;
}

export interface EvidenceSummary {
  overallScore: number;
  sourceQuality: number;
  confirmations: number;
  dataAvailability: number;
  verificationStatus: number;
  totalClaims: number;
  verified: number;
  misleading: number;
  unverifiable: number;
  sourceTierBreakdown: Record<number, number>;
}

export interface TOCItem {
  id: string;
  label: string;
  level: number;
}

export interface TopicTerminalViewModel {
  topic: Topic;
  storyGroups: {
    latest: Story[];
    important: Story[];
    highestEvidence: Story[];
    trending: Story[];
    historical: Story[];
    recommended: Story[];
  };
  rankedEntities: {
    entity: Entity;
    score: number;
    importance: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
  unifiedTimeline: TimelineEvent[];
  statistics: {
    coverageTrend: number;
    evidenceGrowth: number;
    averageConfidence: number;
    totalEntities: number;
    totalClaims: number;
    totalMediaAssets: number;
    totalSources: number;
    totalCountries: number;
    totalOrganizations: number;
    totalPeople: number;
  };
  qualityScore: {
    score: number;
    status: 'Excellent' | 'Good' | 'Needs Review';
    coverageCompleteness: number;
    missingStories: string[];
    weakEvidence: string[];
    missingTimeline: string[];
    missingMedia: string[];
    brokenLinks: string[];
  };
  freshness?: FreshnessMetadata;
  seo: SEOData;
  breadcrumbs: { label: string; href: string }[];
}

export interface EntitySignals {
  lastMentioned: string;
  mentionVelocity: number; // e.g. +14
  coverageTrend: 'up' | 'down' | 'flat';
  rank: number;
}

export interface EntityPageViewModel {
  entity: EntityBase;
  stories: Story[];
  relatedEntities: EntityBase[];
  relatedTopics: Topic[];
  signals: EntitySignals;
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface ResolvedRelationship {
  entity: EntityBase;
  confidence: number;
  role: string;
  evidence: number;
  stories: string[];
  latestMention: string;
  sharedTopics: string[];
}

export interface EntityTerminalViewModel {
  id: string;
  slug: string;
  name: string;
  type: string;
  aliases: string[];
  description: string;
  
  // Flattened Media
  hero?: AssetBase;
  logo?: AssetBase;
  media: AssetBase[];
  documents: AssetBase[];
  
  // Flattened Data
  signals: EntitySignals;
  statistics: StatItem[];
  timeline: TimelineEvent[];
  claims: Claim[];
  relationships: ResolvedRelationship[];
  
  // Health/Trust Metrics
  evidenceScore: number;
  health: {
    confidence: number;
    evidenceCount: number;
    sourceCount: number;
    relationshipCount: number;
    mediaCount: number;
    claimCount: number;
    coverageTrend: string;
  };
  
  freshness?: FreshnessMetadata;
  seo: SEOData;
}

export interface EntityCopilotContext {
  id: string;
  name: string;
  type: string;
  description: string;
  aliases: string[];
  timeline: TimelineEvent[];
  relationships: {
    targetName: string;
    role: string;
    confidence: number;
    evidenceCount: number;
  }[];
  claims: Claim[];
  statistics: StatItem[];
  signals: EntitySignals;
  health: {
    confidence: number;
    evidenceCount: number;
  };
}

export interface StoryQualityScore {
  score: number;
  issues: string[];
  status: 'Excellent' | 'Good' | 'Needs Review';
}

export interface StoryTerminalViewModel {
  story: Story;
  relatedStories: Story[];
  relatedTopics: Topic[];
  relatedEntities: Entity[];
  seo: SEOData;
  breadcrumbs: { label: string; href: string }[];
  tableOfContents: TOCItem[];
  snapshot: any;
  executiveBrief: any;
  evidenceSummary: any;
  quickView: any;
  deepView: any;
  visualAssets: {
    hero?: AssetReference;
    primary: AssetReference[];
    supporting: AssetReference[];
    gallery: AssetReference[];
    logos: AssetReference[];
    portraits: AssetReference[];
    maps: AssetReference[];
    charts: AssetReference[];
    documents: AssetReference[];
  };
  unifiedTimeline: TimelineEvent[];
  qualityScore: any;
}

export interface SearchTerminalViewModel {
  query: string;
  intent: {
    primaryType: string;
    confidence: number;
  };
  spotlight: any; // Knowledge Card for direct match
  results: SearchIndexEntry[];
  grouped: {
    latestStories: SearchIndexEntry[];
    entities: SearchIndexEntry[];
    topics: SearchIndexEntry[];
    documents: SearchIndexEntry[];
    media: SearchIndexEntry[];
  };
  suggestions: {
    relatedSearches: string[];
    relatedTopics: string[];
    relatedEntities: string[];
  };
  quality: {
    exactMatch: boolean;
    confidence: number;
    coverage: number;
    reason: string;
  };
  total: number;
}

export interface DatasetPageViewModel {
  dataset: Dataset;
  relatedStories: Story[];
  relatedTopics: Topic[];
  relatedEntities: Entity[];
  versions: DatasetVersion[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface FixPageViewModel {
  fixJSON: Record<string, unknown>;
  headline: string;
  summary: string;
  tags: string[];
  heroImage?: string;
  publishedAt: string;
  evidenceScore: number;
  readingTime: number;
  storySlug: string;
  relatedStories: Story[];
  relatedEntities: Entity[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface PageSection {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

export interface SEOData {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface APIResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}

export interface APIListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  filter?: Record<string, string>;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  type: string;
  storyId?: string;
  entityId?: string;
  topicId?: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalStories: number;
  totalTopics: number;
  totalEntities: number;
  totalTimelines: number;
  totalFixes: number;
  totalMedia: number;
  totalDatasets: number;
  drafts: number;
  review: number;
  scheduled: number;
  published: number;
  recentActivity: ActivityEntry[];
  topStories: Array<{ id: string; title: string; views: number }>;
  topTopics: Array<{ id: string; name: string; count: number }>;
  searchQueries: Array<{ query: string; count: number }>;
}

export interface ActivityEntry {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  userId?: string;
  link?: string;
}

// ─── Monitoring ──────────────────────────────────────────────────────────────

export type WatcherSource =
  | 'supreme-court' | 'pib' | 'parliament' | 'rbi'
  | 'who' | 'election-commission' | 'oecd' | 'imf'
  | 'world-bank' | 'un' | 'cag' | 'press-releases'
  | 'state-govts';

export type AlertSeverity = 'critical' | 'major' | 'minor' | 'informational';

export type AlertAction = 'update_and_republish' | 'update_only' | 'log_only' | 'dismiss';

export interface MonitorAlert {
  id: string;
  source: WatcherSource;
  severity: AlertSeverity;
  title: string;
  summary: string;
  detectedAt: string;
  affectedStoryIds: string[];
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  action: AlertAction;
  url?: string;
}

export interface WatcherStatus {
  id: string;
  source: WatcherSource;
  name: string;
  description: string;
  enabled: boolean;
  lastCheckAt: string | null;
  lastAlertAt: string | null;
  alertCount: number;
  criticalAlertCount: number;
  status: 'active' | 'error' | 'idle';
  errorMessage?: string;
}

export interface MonitorSummary {
  totalWatchers: number;
  activeWatchers: number;
  totalAlerts: number;
  unacknowledgedAlerts: number;
  criticalAlerts: number;
  watcherStatuses: WatcherStatus[];
  recentAlerts: MonitorAlert[];
}

// ── The Fix Types ─────────────────────────────────────────────────────────

export interface Fix {
  id: string;
  slug: string;
  storySlug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  author: { name: string; role: string; bio?: string };
  evidenceScore: number;
  tags: string[];

  problem: FixSection;
  whoIsAffected: FixSection;
  rootCauses: FixSection;
  evidence: FixSection;
  stakeholders: Stakeholder[];
  existingSolutions: ExistingSolution[];
  globalExamples: GlobalExample[];
  recommendedActions: FixAction[];
  citizenActions: FixAction[];
  governmentActions: FixAction[];
  metricsToTrack: FixMetric[];

  relatedStories: Story[];
  relatedEntities: Entity[];
  sources: Source[];
}

export interface FixSection {
  title: string;
  content: string;
  supportingData?: Array<{ label: string; value: string }>;
}

export interface Stakeholder {
  name: string;
  type: 'government' | 'citizen' | 'private-sector' | 'civil-society' | 'international';
  role: string;
  interest: string;
  stance?: 'supports' | 'opposes' | 'neutral' | 'mixed';
}

export interface ExistingSolution {
  name: string;
  description: string;
  status: 'active' | 'proposed' | 'expired' | 'failed';
  effectiveness?: 'high' | 'medium' | 'low' | 'unknown';
  source?: string;
}

export interface GlobalExample {
  country: string;
  policy: string;
  description: string;
  outcome: string;
  source?: string;
  applicableToIndia?: boolean;
}

export interface FixAction {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  actors: string[];
}

export interface FixMetric {
  name: string;
  currentValue: string;
  targetValue: string;
  dataSource: string;
  updateFrequency: string;
}


// ─── Visual Intelligence ───────────────────────────────────────────────────────────

export type ChartType =
  | 'line' | 'bar' | 'horizontal-bar' | 'pie' | 'area' | 'scatter' | 'bubble'
  | 'treemap' | 'sankey' | 'network' | 'radar' | 'heatmap' | 'sunburst' | 'table'
  | 'waterfall' | 'histogram' | 'box-plot' | 'violin' | 'slope' | 'calendar'
  | 'dot-plot' | 'lollipop' | 'ridgeline' | 'chord';

export interface ChartSpec {
  chartId: string;
  type: ChartType;
  purpose: string;
  question?: string;
  xAxis: { label: string; field: string; type: 'category' | 'numeric' | 'time' | 'ordinal' };
  yAxis: { label: string; field: string; type: 'category' | 'numeric' | 'ordinal' };
  dataset: { source: string; fields: string[]; filters?: Record<string, unknown>; transformations?: string[] };
  colorField?: string;
  sizeField?: string;
  facetField?: string;
  interactive?: boolean;
  caption: string;
  altText: string;
  annotations?: Array<{ label: string; description: string }>;
  sortOrder?: 'ascending' | 'descending' | 'none';
  zeroBaseline?: boolean;
  theme?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
}

export type MapType = 'india-state' | 'india-district' | 'world-choropleth' | 'trade-routes' | 'migration' | 'conflict' | 'infrastructure' | 'river-basin' | 'rail-network' | 'air-routes' | 'heatmap';

export interface MapSpec {
  mapId: string;
  type: MapType;
  purpose: string;
  geography: { scope: string; projection?: string; center?: [number, number]; zoom?: number };
  data?: { source?: string; valueField?: string; joinKey?: string; colorScale?: { type: 'sequential' | 'diverging' | 'categorical'; steps?: number } };
  interaction?: { hover?: string; click?: string };
  caption: string;
  altText: string;
  theme?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface AccessibilitySpec {
  altText: string;
  longDescription?: string;
  keyboardNavigation?: boolean;
  focusable?: boolean;
  ariaLabel?: string;
  highContrast?: boolean;
  reducedMotion?: boolean;
  colorBlindSafe?: boolean;
  textZoom?: string;
}

export interface VisualPlan {
  storySlug: string;
  gateResult: 'visual_required' | 'text_only';
  gateReason?: string;
  primaryVisual?: { type: string; purpose: string; reason: string };
  secondaryVisuals?: Array<{ type: string; purpose: string; reason: string }>;
  heroVisual?: { type: 'hero'; heroImage?: string; caption?: string; altText?: string };
  charts?: ChartSpec[];
  maps?: MapSpec[];
  globes?: GlobeSpec[];
  svgs?: SVGSpec[];
  animations?: AnimationSpec[];
  infographics?: InfographicSpec[];
  cards?: CardSpec[];
  storyFlow?: Array<{ position: number; type: string; visualId: string }>;
  assets?: Array<{ id: string; type: string; lazyLoad: boolean }>;
  captions?: Array<{ visualId: string; caption: string; altText: string; longDescription?: string }>;
}

export interface GlobeSpec {
  globeId: string;
  type: string;
  purpose: string;
  features: Record<string, unknown>;
  technologies?: string[];
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  pov?: { lat: number; lng: number; altitude: number };
  caption: string;
  altText: string;
  theme?: string;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface SVGSpec {
  svgId: string;
  type: 'org-tree' | 'flowchart' | 'decision-tree' | 'sankey' | 'treemap' | 'timeline' | 'comparison-matrix';
  purpose: string;
  question?: string;
  structure: {
    layout: 'top-to-bottom' | 'left-to-right' | 'radial' | 'nested';
    nodes: Array<{ id: string; label: string; type?: string; children?: string[] }>;
    edges?: Array<{ from: string; to: string; label?: string; value?: number }>;
    levels?: number;
    orientation?: 'vertical' | 'horizontal';
  };
  styling?: Record<string, string | number>;
  caption: string;
  altText: string;
  interactive?: boolean;
  responsive?: boolean;
  theme?: string;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface AnimationSpec {
  animationId: string;
  type: 'cascade' | 'progressive-reveal' | 'data-animation' | 'map-animation';
  purpose: string;
  duration: number;
  steps: Array<{
    step: number; time: number; duration: number; action: string;
    target?: string; description: string; easing?: string; transition?: string;
  }>;
  controls?: { autoplay?: boolean; loop?: boolean; showTimeline?: boolean; playPauseButton?: boolean; speedControl?: number[] };
  caption: string;
  altText: string;
  theme?: string;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface InfographicSpec {
  infographicId: string;
  purpose?: string;
  cards: CardSpec[];
  theme?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
}

export type CardSpec =
  | FactCard | ComparisonCard | TimelineCard | StatisticsCard | CountryCard | QuoteCard | ExplainerCard;

export interface FactCard {
  cardId: string; type: 'fact'; value: string; label: string;
  context?: string; icon?: string; caption?: string; altText?: string;
}

export interface ComparisonCard {
  cardId: string; type: 'comparison'; purpose: string;
  items: Array<{ label: string; color?: string; metrics: Array<{ label: string; value: string }> }>;
  caption?: string; altText?: string;
}

export interface TimelineCard {
  cardId: string; type: 'timeline'; purpose: string;
  events: Array<{ date: string; title: string; description?: string }>;
  orientation?: 'vertical' | 'horizontal';
}

export interface StatisticsCard {
  cardId: string; type: 'statistics'; purpose: string;
  stats: Array<{ value: string; label: string; change?: string }>;
  columns?: number; caption?: string;
}

export interface CountryCard {
  cardId: string; type: 'country'; purpose: string;
  country: { name: string; iso?: string; stats?: Array<{ label: string; value: string }>; highlight?: string };
}

export interface QuoteCard {
  cardId: string; type: 'quote'; quote: string; attribution: string; source?: string;
}

export interface ExplainerCard {
  cardId: string; type: 'explainer'; purpose: string;
  steps: Array<{ number: number; title: string; description: string }>;
  showConnector?: boolean;
}
