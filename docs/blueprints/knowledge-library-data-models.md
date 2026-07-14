---
title: Knowledge Library — Canonical Data Models
status: draft
owner: engineering
last_updated: 2026-07-12
---

# Knowledge Library — Canonical Data Models

## Overview

These types define the entire Knowledge Library ecosystem. They are designed to be collection-agnostic — "India and the World" is the first instance, but the models support any future collection.

## How to Read This Model

```typescript
interface HowToReadThis {
  collectionSlug: string;
  concepts: HowToReadConcept[];
}

interface HowToReadConcept {
  term: string;              // "Fact", "Analysis", "Perspective", etc.
  definition: string;
  example: string;
  icon: string;              // Emoji or icon identifier
}
```

## Research Methodology

```typescript
interface ResearchMethodology {
  collectionSlug: string;
  researchScope: {
    temporal: string;         // "1947–Present"
    geographic: string;       // "Global — focus on India's bilateral and multilateral relations"
    thematic: string;         // "Diplomatic, military, economic, and cultural relations"
    exclusions: string[];     // What is deliberately excluded and why
  };
  selectionCriteria: {
    inclusionRules: string[];
    exclusionRules: string[];
    conflictingEvidence: string;  // How conflicts are resolved
    confidenceAssignment: string; // How confidence is determined
    unknowns: string[];           // What cannot be known
  };
  sourceHierarchy: SourceTierDefinition[];
  biasMitigation: {
    strategies: string[];
    nonEnglishSources: string[];  // Languages covered
    reviewProcess: string;
    disclosures: string[];
  };
  knownLimitations: {
    gaps: string[];
    languageBarriers: string[];
    classificationGaps: string[];
    scholarlyDisagreements: string[];
  };
}

interface SourceTierDefinition {
  tier: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
  trust: string;
  examples: string[];
}
```

## Historiography

```typescript
interface Historiography {
  id: string;
  eventSlug: string;         // e.g., "1962-war"
  title: string;
  interpretations: Interpretation[];
  timelineOfInterpretation: { date: string; shift: string; cause: string }[];
  unresolvedDebates: string[];
}

interface Interpretation {
  school: string;            // "Official Indian", "Chinese", "Western", "Postcolonial", etc.
  summary: string;
  keyProponents: string[];
  keyWorks: string[];
  sources: string[];
}
```

## Core Types

### KnowledgeLibrary

Top-level container for a knowledge domain.

```typescript
interface KnowledgeLibrary {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  heroImage: AssetReference;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  relatedEntityIds: string[];
  freshness: FreshnessMetadata;
  createdAt: string;       // ISO 8601
  updatedAt: string;
}
```

### KnowledgeCollection

A major topic area within a library. For India and the World: "Foundations 1947–1962", "Wars and Crises", etc.

```typescript
interface KnowledgeCollection {
  id: string;
  librarySlug: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  order: number;
  dateRange: DateRange;
  volumes: Volume[];
  documents: PrimarySource[];
  maps: MapAsset[];
  videos: VideoAsset[];
  thinkers: Thinker[];
  timelines: TimelineEvent[];
  debates: Debate[];
  datasets: DatasetReference[];
  readingPaths: ReadingPath[];
  status: 'draft' | 'published' | 'archived';
  freshness: FreshnessMetadata;
}
```

### Volume

A major structural division within a collection.

```typescript
interface Volume {
  id: string;
  collectionSlug: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  order: number;
  dateRange: DateRange;
  chapters: Chapter[];
  chaptersCount: number;
  estimatedReadingTime: Record<ReadingDepth, number>; // minutes
  status: 'draft' | 'published' | 'archived';
  freshness: FreshnessMetadata;
}
```

### Chapter

The core content unit.

```typescript
interface Chapter {
  id: string;
  collectionSlug: string;
  volumeSlug: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  content: ChapterContent;
  keyQuestions: KeyQuestion[];
  misconceptions: Misconception[];
  timelineContext: TimelineContext[];
  multiplePerspectives: Perspective[];
  keyTerms: GlossaryTerm[];
  learningSection: LearningSection;
  sources: Source[];
  claims: Claim[];
  relatedEntityIds: string[];
  relatedChapterIds: string[];
  status: ChapterStatus;
  readingTime: Record<ReadingDepth, number>;
  freshness: FreshnessMetadata;
  changelog: ChangeEntry[];
}
```

### ChapterContent

The chapter body structured as sections.

```typescript
interface ChapterContent {
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  level: 1 | 2 | 3;         // h1/h2/h3
  body: ContentBlock[];
}

type ContentBlock =
  | ParagraphBlock
  | ClaimBlock
  | EvidenceBlock
  | ThinkerBlock
  | TimelineEmbed
  | MapEmbed
  | ImageBlock
  | QuoteBlock
  | TableBlock
  | DataBlock;

interface ParagraphBlock {
  type: 'paragraph';
  text: string;              // Rich text with inline citations [1]
  citations: string[];       // Citation IDs
}

interface ClaimBlock {
  type: 'claim';
  claim: string;
  evidence: EvidenceRef[];
  confidence: 'established' | 'debated' | 'contested';
}
```

### Claim and Evidence

```typescript
interface Claim {
  id: string;
  chapterId: string;
  statement: string;
  confidence: 'established' | 'debated' | 'contested';
  evidence: EvidenceRef[];
  counterClaims: string[];     // IDs of counter-claims
  lastVerifiedAt: string;
}

interface EvidenceRef {
  sourceId: string;
  relevance: 'direct' | 'supporting' | 'contextual';
  excerpt: string;
  pageNumber?: string;
  timestamp?: string;          // For video/audio sources
}

interface Source {
  id: string;
  title: string;
  authors: string[];
  type: SourceType;
  tier: 1 | 2 | 3 | 4 | 5;
  publication: string;
  date: string;
  url?: string;
  archiveUrl?: string;
  accessedAt: string;
  license?: string;
}
```

### Thinker Models

```typescript
interface Thinker {
  id: string;
  name: string;
  slug: string;
  school: ThinkerSchool;
  bio: string;
  keyWorks: string[];
  avatar?: AssetReference;
}

type ThinkerSchool =
  | 'realist'
  | 'liberal'
  | 'constructivist'
  | 'marxist'
  | 'postcolonial'
  | 'indian-realist'
  | 'indian-nationalist'
  | 'indian-liberal'
  | 'strategic-culture'
  | 'other';

interface ThinkerArgument {
  id: string;
  chapterId: string;
  thinkerId: string;
  position: string;
  summary: string;
  evidence: EvidenceRef[];
  counterarguments: Counterargument[];
}

interface Counterargument {
  id: string;
  argumentId: string;
  criticId: string;         // Thinker ID
  summary: string;
  evidence: EvidenceRef[];
}

interface Debate {
  id: string;
  collectionSlug: string;
  title: string;
  question: string;
  arguments: DebateArgument[];
  summary: string;
}

interface DebateArgument {
  thinkerId: string;
  position: 'for' | 'against' | 'nuanced';
  statement: string;
}
```

### Learning Models

```typescript
interface LearningSection {
  summary: string;
  keyConcepts: Concept[];
  quiz: Quiz;
  flashcards: Flashcard[];
  relatedChapters: RelatedChapter[];
  readingPaths: string[];      // ReadingPath IDs
  discussionQuestions: string[];
}

interface Concept {
  term: string;
  definition: string;
  relatedEntityId?: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface ReadingPath {
  id: string;
  collectionSlug: string;
  title: string;
  description: string;
  chapters: string[];         // Ordered chapter IDs
  estimatedTime: number;      // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface RelatedChapter {
  chapterId: string;
  relationship: 'prerequisite' | 'follow-up' | 'parallel' | 'alternative-perspective';
}
```

### Interactive Models

```typescript
interface MapAsset {
  id: string;
  collectionSlug: string;
  title: string;
  description: string;
  data: GeoJSON;               // or url to GeoJSON
  layers: MapLayer[];
  sources: string[];
  projection: string;
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  data: GeoJSON;
  style: Record<string, unknown>;
}

interface TimelineEvent {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  description: string;
  category: TimelineCategory;
  location?: GeoLocation;
  relatedEntityIds: string[];
  sources: string[];
}

type TimelineCategory =
  | 'treaty'
  | 'war'
  | 'diplomatic-visit'
  | 'un-vote'
  | 'summit'
  | 'crisis'
  | 'domestic'
  | 'economic'
  | 'cultural';

interface TimelineContext {
  date: string;
  events: {
    region: 'india' | 'usa' | 'ussr-russia' | 'china' | 'europe' | 'un' | 'global';
    event: string;
  }[];
}
```

### Decision Scenario

```typescript
interface DecisionScenario {
  id: string;
  chapterId: string;
  title: string;                 // "You are Indira Gandhi. Pakistan attacks..."
  context: string;               // Background narrative
  role: string;                  // "Indira Gandhi", "Jawaharlal Nehru", etc.
  dilemma: string;               // The core choice
  options: DecisionOption[];
  actualOutcome: {
    choice: string;              // What India actually did
    reasoning: string;           // Why
    alternatives: string;        // What alternatives existed
    consequences: string;
  };
  sources: string[];
}

interface DecisionOption {
  id: string;
  label: string;                 // "Sign the USSR Treaty"
  summary: string;
  advantages: string[];
  risks: string[];
  selectedBy?: string;           // "reader" | "actual" | "counterfactual"
}
```

### Decision Matrix

```typescript
interface DecisionMatrix {
  id: string;
  chapterId: string;
  title: string;                 // "Non-Alignment Decision Matrix"
  dimensions: MatrixDimension[];
}

interface MatrixDimension {
  option: string;                // "Join NATO", "Join Warsaw Pact", "Remain NAM"
  advantages: string[];
  risks: string[];
  outcome: 'chosen' | 'rejected' | 'considered-but-rejected';
  rationale: string;             // Why India chose or did not choose
  sources: string[];
}
```

### Counterfactual

```typescript
interface Counterfactual {
  id: string;
  chapterId: string;
  question: string;              // "What if India joined NATO in 1949?"
  methodology: string;           // How this counterfactual is constructed
  scenario: string;              // Narrative of the counterfactual
  likelyOutcome: string;         // Based on scholarship
  scholarship: string[];         // Academic works on this counterfactual
  label: 'analytical-exercise';  // Fixed — never presented as history
}
```

### Primary Document

```typescript
interface PrimaryDocument {
  id: string;
  collectionSlug: string;
  title: string;
  documentType: DocumentType;
  originalUrl?: string;          // Link to original PDF/scan
  ocrText?: string;              // OCR text layer
  annotations: DocumentAnnotation[];
  keyClauses: { clause: string; explanation: string }[];
  relatedChapterIds: string[];
  relatedEntityIds: string[];
  timelineEventIds: string[];
  date: string;
  source: string;                // Archive, file number
  license: string;
}

type DocumentType =
  | 'treaty'
  | 'un-resolution'
  | 'parliamentary-debate'
  | 'mea-note'
  | 'declassified-cable'
  | 'speech'
  | 'letter'
  | 'agreement'
  | 'memorandum'
  | 'press-release'
  | 'report';

interface DocumentAnnotation {
  id: string;
  startChar: number;
  endChar: number;
  note: string;
  category: 'define' | 'context' | 'cross-ref' | 'contradiction' | 'key-clause';
  relatedEntityId?: string;
  relatedChapterId?: string;
}
```

### Comparative Timeline

```typescript
interface ComparativeTimeline {
  id: string;
  collectionSlug: string;
  title: string;
  regions: ComparativeRegion[];
  events: ComparativeTimelineEvent[];
}

type ComparativeRegion =
  | 'india'
  | 'usa'
  | 'china'
  | 'ussr-russia'
  | 'pakistan'
  | 'un'
  | 'europe'
  | 'global';

interface ComparativeTimelineEvent {
  date: string;
  endDate?: string;
  region: ComparativeRegion;
  title: string;
  description: string;
  relatedEntityIds: string[];
  sources: string[];
}
```

### Confidence Score

```typescript
interface ConfidenceScore {
  chapterId: string;
  overall: number;               // 0–100 percentage
  breakdown: {
    primarySourceCount: number;
    academicSourceCount: number;
    contradictorySourceCount: number;
    verifiedClaims: number;
    totalClaims: number;
  };
  lastVerifiedAt: string;
  verifiedBy: string;
}
```

### Reading Difficulty

```typescript
interface ReadingDifficulty {
  chapterId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];       // Topic names
  recommendedChapters: string[];
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced' | 'specialist';
}
```

### Research Workspace

```typescript
interface ResearchWorkspace {
  userId?: string;               // Optional — anonymous via localStorage
  bookmarks: Bookmark[];
  highlights: Highlight[];
  annotations: Annotation[];
  collections: ReaderCollection[];
  progress: ReaderProgress[];
  exportFormats: ('pdf' | 'markdown' | 'csv' | 'json')[];
}

interface Bookmark {
  chapterId: string;
  sectionId?: string;
  label: string;
  createdAt: string;
}

interface Highlight {
  chapterId: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  note?: string;
  createdAt: string;
}

interface ReaderCollection {
  id: string;
  name: string;
  description?: string;
  chapterIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReaderProgress {
  chapterId: string;
  readPercentage: number;
  quizScore?: number;
  flashcardsReviewed: number;
  lastReadAt: string;
}
```

### Perspective Model

```typescript
interface Perspective {
  actor: string;
  role: 'government' | 'opposition' | 'international' | 'academic' | 'media';
  position: string;
  source: string;
  date: string;
}
```

### Supporting Types

```typescript
interface KeyQuestion {
  question: string;
  answer: string;
  sources: string[];
}

interface Misconception {
  misconception: string;
  correction: string;
  explanation: string;
  sources: string[];
}

interface GlossaryTerm {
  term: string;
  definition: string;
  seeAlso?: string[];
}

interface DateRange {
  start: string;
  end?: string;
}

interface FreshnessMetadata {
  lastVerifiedAt: string;
  verifiedBy: string;
  status: ChapterStatus;
  changeSummary?: string;
}

type ChapterStatus =
  | 'draft'
  | 'review'
  | 'published'
  | 'verified'
  | 'updated'
  | 'archived';

type ReadingDepth = 'explorer' | 'scholar' | 'researcher';

type SourceType =
  | 'treaty'
  | 'un-record'
  | 'parliamentary-debate'
  | 'mea-statement'
  | 'government-paper'
  | 'declassified-document'
  | 'white-paper'
  | 'academic-journal'
  | 'book'
  | 'report'
  | 'news-article'
  | 'speech'
  | 'interview'
  | 'video'
  | 'dataset';

interface ChangeEntry {
  date: string;
  summary: string;
  author: string;
  type: 'content' | 'correction' | 'update' | 'freshness';
}
```

## Entity Relationships

The Knowledge Library connects to the existing entity system through `relatedEntityIds`:

```
Chapter.relatedEntityIds → Entity[] (countries, people, orgs, treaties, etc.)
Thinker → optional entity link
Source → optional entity link
MapAsset → related entities
TimelineEvent.relatedEntityIds → Entity[]
```

This enables:

- Knowledge graph visualizations per chapter
- Cross-linking between chapters and published stories
- Entity pages showing which chapters reference them
- Global search across the entire library content

## Data Storage

Phase 1 uses the **memory repository pattern** (seed data in `utils/data-layer/`) consistent with the existing codebase. Supabase migration follows when data volume requires it.

The repository interface mirrors the existing pattern:

```typescript
interface KnowledgeLibraryRepository {
  getLibrary(slug: string): Promise<KnowledgeLibrary | null>;
  getCollection(librarySlug: string, collectionSlug: string): Promise<KnowledgeCollection | null>;
  getChapter(collectionSlug: string, volumeSlug: string, chapterSlug: string): Promise<Chapter | null>;
  getAllCollections(librarySlug: string): Promise<KnowledgeCollection[]>;
}
```

---

*These models are canonical. Do not duplicate. Extend via composition, not modification.*
