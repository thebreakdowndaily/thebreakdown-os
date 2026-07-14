import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { seedAll, getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { RepositoryFactory } from '@/services/factory/repository';
import type {
  KnowledgeLibrary, KnowledgeCollection, Volume, Chapter,
  BlockType, ReadingDepth, KnowledgeBlock,
} from '@/types/canonical';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface KnowledgeTreeItem {
  id: string;
  slug: string;
  title: string;
  type: 'library' | 'collection' | 'volume' | 'chapter';
  status?: string;
  children: KnowledgeTreeItem[];
  metrics?: ChapterMetrics;
}

export interface ChapterMetrics {
  status: string;
  wordCount: number;
  sourceCount: number;
  evidenceCount: number;
  claimCount: number;
  lastVerifiedAt: string | undefined;
  version: string;
  blockCount: number;
  blockTypes: string[];
  missingSections: string[];
}

export interface QualityScores {
  overall: number;
  coverage: number;
  evidence: number;
  neutrality: number;
  sources: number;
  learning: number;
  visuals: number;
  freshness: number;
}

export interface PublishChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}

export interface KnowledgeDashboardData {
  tree: KnowledgeTreeItem[];
  chapters: ChapterEntry[];
}

export interface InstitutionalTrustIndex {
  score: number;
  components: {
    label: string;
    weight: number;
    value: number;
    weighted: number;
  }[];
  publishedChapters: number;
  reviewComplete: number;
  reviewTotal: number;
  belowThreshold: boolean;
}

export interface ChapterEntry {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  librarySlug: string;
  metrics: ChapterMetrics;
  quality: QualityScores;
  checklist: PublishChecklistItem[];
}

// ─── Required sections for Knowledge Completeness ──────────────────────────

const REQUIRED_BLOCK_TYPES: Record<string, { label: string; type: BlockType; description?: string }> = {
  'historical-context': { label: 'Historical Context', type: 'paragraph', description: 'Paragraphs covering historical context' },
  'primary-sources': { label: 'Primary Sources', type: 'learning', description: 'Primary sources section' },
  'multiple-perspectives': { label: 'Multiple Perspectives', type: 'thinker', description: 'Thinker blocks showing multiple viewpoints' },
  'timeline': { label: 'Timeline', type: 'timeline', description: 'Timeline of events' },
  'claims': { label: 'Claims Linked', type: 'claim', description: 'Claims linked from the registry' },
  'evidence': { label: 'Evidence Verified', type: 'evidence-summary', description: 'Evidence summary blocks' },
  'counterarguments': { label: 'Counterarguments', type: 'counterfactual', description: 'Counterfactual or counterargument sections' },
  'thinkers': { label: 'Thinkers', type: 'thinker', description: 'Thinker profiles' },
  'learning': { label: 'Learning Section', type: 'learning', description: 'Learning blocks (quiz, flashcards, etc.)' },
  'glossary': { label: 'Glossary', type: 'paragraph', description: 'Key terms defined' },
  'further-reading': { label: 'Further Reading', type: 'learning', description: 'Recommended reading' },
  'maps': { label: 'Maps / Visuals', type: 'map', description: 'Maps, images, or visual assets' },
  'decision-matrix': { label: 'Decision Matrix', type: 'decision-matrix', description: 'Decision analysis' },
  'historiography': { label: 'Historiography', type: 'historiography', description: 'Historiographical analysis' },
  'relationship-explorer': { label: 'Relationship Explorer', type: 'relationship-card', description: 'Relationship diagrams' },
};

const LEARNING_VARIANTS = ['key-takeaways', 'quiz', 'flashcards', 'research-questions', 'recommended-reading'] as const;

// ─── Service Functions ─────────────────────────────────────────────────────

let cached: KnowledgeDashboardData | null = null;

export function buildKnowledgeDashboard(): KnowledgeDashboardData {
  if (cached) return cached;

  seedAll();
  const core = getKnowledgeCore();
  const libs = getKnowledgeLibrarySeedData();
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(libs);

  const chapters: ChapterEntry[] = [];

  for (const library of libs) {
    for (const collection of library.collections) {
      for (const volume of collection.volumes) {
        for (const chapter of volume.chapters) {
          chapters.push({
            chapter,
            collectionSlug: collection.slug,
            volumeSlug: volume.slug,
            librarySlug: library.slug,
            metrics: computeChapterMetrics(chapter, core),
            quality: computeQualityScores(chapter, core),
            checklist: buildPublishChecklist(chapter, core),
          });
        }
      }
    }
  }

  const tree = buildTree(libs);

  cached = { tree, chapters };
  return cached;
}

export function getChapterEntry(librarySlug: string, collectionSlug: string, volumeSlug: string, chapterSlug: string): ChapterEntry | undefined {
  const data = buildKnowledgeDashboard();
  return data.chapters.find(
    c => c.librarySlug === librarySlug && c.collectionSlug === collectionSlug && c.volumeSlug === volumeSlug && c.chapter.slug === chapterSlug
  );
}

// ─── Institutional Trust Index ──────────────────────────────────────────────────────

const PUBLICATION_THRESHOLD_SCORE = 80;

/**
 * The Institutional Trust Index is the single most important metric for the platform.
 * It is computed automatically from the canonical data layer and reflects institution-wide
 * trust, not just the trust of any single chapter.
 *
 * Composition (see AGENTS.md — Operational Cycles):
 *   Evidence Quality        25%
 *   Primary Source Ratio    15%
 *   Review Completion      15%
 *   Freshness             10%
 *   Correction Quality    10%
 *   Transparency         10%
 *   Reader Trust         10%
 *   Expert Review         5%
 *   Total                100%
 *
 * If the index drops below PUBLICATION_THRESHOLD_SCORE (80), publishing halts.
 */
export function computeInstitutionalTrustIndex(): InstitutionalTrustIndex {
  const data = buildKnowledgeDashboard();
  const chapters = data.chapters;

  const published = chapters.filter(c => c.chapter.status === 'published').length;
  const totalChecks = chapters.reduce((sum, c) => sum + c.checklist.length, 0);
  const passedChecks = chapters.reduce((sum, c) => sum + c.checklist.filter(i => i.passed).length, 0);
  const reviewComplete = totalChecks === 0 ? 0 : Math.round((passedChecks / totalChecks) * 100);

  // Evidence Quality — average chapter quality overall (covers evidence coverage, sources, neutrality)
  const evidenceQuality =
    chapters.length === 0
      ? 0
      : Math.round(chapters.reduce((s, c) => s + c.quality.evidence, 0) / chapters.length);

  // Primary Source Ratio — published chapters must cite at least one Level 1 source (gate 2)
  const primarySourceRatio =
    chapters.length === 0
      ? 0
      : Math.round(
          (chapters.filter(c => c.checklist.some(i => i.id === 'primary-sources' && i.passed)).length /
            chapters.length) *
            100
        );

  // Freshness — chapters verified within the review window
  const now = Date.now();
  const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;
  const freshChapters = chapters.filter(c => {
    if (!c.metrics.lastVerifiedAt) return false;
    return now - new Date(c.metrics.lastVerifiedAt).getTime() <= SIX_MONTHS;
  }).length;
  const freshness = chapters.length === 0 ? 0 : Math.round((freshChapters / chapters.length) * 100);

  // Correction Quality — corrections issued and logged in Book of Record (proxy: open questions acknowledged)
  const correctionQuality = 100; // No corrections yet issued; process is in place. 100 when clean.

  // Transparency — chapters exposing required metadata (version, lastVerified, sources)
  const transparentChapters = chapters.filter(
    c => c.metrics.version && c.metrics.sourceCount > 0 && c.chapter.lastVerifiedAt
  ).length;
  const transparency = chapters.length === 0 ? 0 : Math.round((transparentChapters / chapters.length) * 100);

  // Reader Trust — placeholder until Phase 4 (Public Validation) instrumentation exists
  const readerTrust = 0;

  // Expert Review — completion of Gold Standard Phase 1 review
  const expertReview = 0; // Pending external peer review (Operational Cycle 1)

  const components = [
    { label: 'Evidence Quality', weight: 25, value: evidenceQuality },
    { label: 'Primary Source Ratio', weight: 15, value: primarySourceRatio },
    { label: 'Review Completion', weight: 15, value: reviewComplete },
    { label: 'Freshness', weight: 10, value: freshness },
    { label: 'Correction Quality', weight: 10, value: correctionQuality },
    { label: 'Transparency', weight: 10, value: transparency },
    { label: 'Reader Trust', weight: 10, value: readerTrust },
    { label: 'Expert Review', weight: 5, value: expertReview },
  ];

  const score = Math.round(
    components.reduce((s, c) => s + (c.weight / 100) * c.value, 0)
  );

  return {
    score,
    components: components.map(c => ({
      label: c.label,
      weight: c.weight,
      value: c.value,
      weighted: Math.round((c.weight / 100) * c.value * 10) / 10,
    })),
    publishedChapters: published,
    reviewComplete,
    reviewTotal: totalChecks,
    belowThreshold: score < PUBLICATION_THRESHOLD_SCORE,
  };
}

// ─── Metrics ────────────────────────────────────────────────────────────────

function computeChapterMetrics(chapter: Chapter, core: ReturnType<typeof getKnowledgeCore>): ChapterMetrics {
  const blockTypes = [...new Set(chapter.content.map(b => b.type))];
  const missingSections = findMissingSections(chapter);

  const claimIds = chapter.relatedConceptIds?.flatMap(
    cid => core.claims.byConcept(cid)
  ).map(c => c.id) || [];

  const evidenceCount = claimIds.reduce((sum, cid) => {
    return sum + core.evidence.byClaim(cid).length;
  }, 0);

  return {
    status: chapter.status,
    wordCount: chapter.metadata.wordCount || 0,
    sourceCount: chapter.sources.length,
    evidenceCount,
    claimCount: claimIds.length,
    lastVerifiedAt: chapter.lastVerifiedAt,
    version: `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`,
    blockCount: chapter.content.length,
    blockTypes,
    missingSections,
  };
}

function findMissingSections(chapter: Chapter): string[] {
  const missing: string[] = [];
  const types = new Set(chapter.content.map(b => b.type));
  const learningVariants = new Set(
    chapter.content
      .filter(b => b.type === 'learning')
      .map(b => (b.data as any)?.variant)
  );

  if (!hasHistoricalContext(chapter)) missing.push('Historical Context');
  if (!types.has('timeline')) missing.push('Timeline');
  if (!types.has('thinker')) missing.push('Thinkers');
  if (!types.has('decision-matrix')) missing.push('Decision Matrix');
  if (!types.has('counterfactual')) missing.push('Counterfactual');
  if (!types.has('historiography')) missing.push('Historiography');
  if (!types.has('relationship-card')) missing.push('Relationship Explorer');
  if (!types.has('map') && !types.has('image')) missing.push('Maps / Visuals');
  if (!types.has('evidence-summary')) missing.push('Evidence Summary');
  if (!chapter.keyTerms.length) missing.push('Glossary (Key Terms)');
  if (!chapter.keyQuestions.length) missing.push('Key Questions');
  if (!chapter.misconceptions.length) missing.push('Common Misconceptions');

  const hasPrimarySources = chapter.content.some(b =>
    b.type === 'learning' && (b.data as any)?.variant === 'recommended-reading'
  );
  if (!hasPrimarySources) missing.push('Primary Sources');

  const allLearningPresent = LEARNING_VARIANTS.every(v => learningVariants.has(v));
  if (!allLearningPresent) {
    const missingVariants = LEARNING_VARIANTS.filter(v => !learningVariants.has(v));
    missing.push(`Learning: ${missingVariants.join(', ')}`);
  }

  return missing;
}

function hasHistoricalContext(chapter: Chapter): boolean {
  return chapter.content.some(b =>
    (b.type === 'heading' && (b.data as any)?.text?.toLowerCase().includes('historical context')) ||
    (b.type === 'callout' && (b.data as any)?.text?.toLowerCase().includes('historical context'))
  );
}

// ─── Quality Scores ─────────────────────────────────────────────────────────

function computeQualityScores(chapter: Chapter, core: ReturnType<typeof getKnowledgeCore>): QualityScores {
  const blockTypes = new Set(chapter.content.map(b => b.type));
  const learningVariants = new Set(
    chapter.content
      .filter(b => b.type === 'learning')
      .map(b => (b.data as any)?.variant)
  );

  // Coverage: what fraction of required sections are present
  const requiredCount = Object.keys(REQUIRED_BLOCK_TYPES).length;
  const presentCount = Object.entries(REQUIRED_BLOCK_TYPES).filter(([key, spec]) => {
    if (spec.label === 'Historical Context') return hasHistoricalContext(chapter);
    if (spec.label === 'Glossary') return chapter.keyTerms.length > 0;
    if (spec.type === 'learning') {
      if (spec.label === 'Primary Sources') return chapter.content.some(b => b.type === 'learning' && (b.data as any)?.variant === 'recommended-reading');
      if (spec.label === 'Further Reading') return chapter.content.some(b => b.type === 'learning' && (b.data as any)?.variant === 'recommended-reading');
      return blockTypes.has('learning');
    }
    if (spec.label === 'Evidence Verified') return blockTypes.has('evidence-summary') || chapter.content.some(b => b.type === 'claim');
    if (spec.label === 'Claims Linked') return chapter.claims.length > 0 || (chapter.relatedConceptIds?.length || 0) > 0;
    return blockTypes.has(spec.type);
  }).length;
  const coverage = Math.round((presentCount / requiredCount) * 100);

  // Evidence: claims with supporting evidence
  const claimIds = chapter.relatedConceptIds?.flatMap(
    cid => core.claims.byConcept(cid)
  ).map(c => c.id) || [];
  const claimsWithEvidence = claimIds.filter(cid => core.evidence.byClaim(cid).length > 0).length;
  const evidence = claimIds.length > 0 ? Math.round((claimsWithEvidence / claimIds.length) * 100) : 0;

  // Neutrality: ratio of debated to established claims
  const allClaims = claimIds.map(id => core.claims.get(id)).filter(Boolean);
  const debatedClaims = allClaims.filter(c => c?.confidence === 'debated' || c?.confidence === 'contested').length;
  const totalClaims = allClaims.length;
  const neutrality = totalClaims > 0 ? Math.round((debatedClaims / totalClaims) * 100) : 0;
  // Normalize: 0% debated = low neutrality, 50% debated = ideal, 100% = too contested
  const neutralityScore = neutrality >= 20 && neutrality <= 60 ? 100 : neutrality > 60
    ? Math.round(100 - (neutrality - 60) * 2.5)
    : Math.round(neutrality * 5);

  // Sources
  const sourceCount = chapter.sources.length;
  const sources = Math.min(100, Math.round((sourceCount / 30) * 100));

  // Learning: all 5 variants present
  const learningPresent = LEARNING_VARIANTS.filter(v => learningVariants.has(v)).length;
  const learning = Math.round((learningPresent / LEARNING_VARIANTS.length) * 100);

  // Visuals: maps or images
  const hasVisuals = blockTypes.has('map') || blockTypes.has('image') || blockTypes.has('chart');
  const visuals = hasVisuals ? 100 : 0;

  // Freshness
  let freshness = 0;
  if (chapter.lastVerifiedAt) {
    const daysSince = Math.floor((Date.now() - new Date(chapter.lastVerifiedAt).getTime()) / 86400000);
    freshness = daysSince <= 7 ? 100 : daysSince <= 30 ? 80 : daysSince <= 90 ? 60 : daysSince <= 180 ? 40 : 20;
  }

  const overall = Math.round((coverage + evidence + neutralityScore + sources + learning + visuals + freshness) / 7);

  return { overall, coverage, evidence, neutrality: neutralityScore, sources, learning, visuals, freshness };
}

// ─── Publish Checklist ──────────────────────────────────────────────────────

function buildPublishChecklist(chapter: Chapter, core: ReturnType<typeof getKnowledgeCore>): PublishChecklistItem[] {
  const blockTypes = new Set(chapter.content.map(b => b.type));
  const learningVariants = new Set(
    chapter.content
      .filter(b => b.type === 'learning')
      .map(b => (b.data as any)?.variant)
  );
  const claimIds = chapter.relatedConceptIds?.flatMap(
    cid => core.claims.byConcept(cid)
  ).map(c => c.id) || [];

  return [
    {
      id: 'historical-context',
      label: 'Historical Context',
      passed: hasHistoricalContext(chapter),
      details: hasHistoricalContext(chapter) ? 'Historical context section present' : 'Missing historical context section',
    },
    {
      id: 'primary-sources',
      label: 'Primary Sources',
      passed: chapter.content.some(b => b.type === 'learning' && (b.data as any)?.variant === 'recommended-reading'),
      details: 'Primary source documents should be listed',
    },
    {
      id: 'multiple-perspectives',
      label: 'Multiple Perspectives',
      passed: blockTypes.has('thinker') || blockTypes.has('historiography'),
      details: blockTypes.has('thinker') ? 'Thinker profiles present' : 'Missing multiple perspectives',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      passed: blockTypes.has('timeline'),
      details: blockTypes.has('timeline') ? 'Timeline block present' : 'Missing timeline',
    },
    {
      id: 'maps',
      label: 'Maps / Visual Assets',
      passed: blockTypes.has('map') || blockTypes.has('image'),
      details: blockTypes.has('map') ? 'Maps present' : blockTypes.has('image') ? 'Images present' : 'Missing maps or visual assets',
    },
    {
      id: 'claims-linked',
      label: 'Claims Linked',
      passed: claimIds.length > 0,
      details: `${claimIds.length} claims linked to this chapter`,
    },
    {
      id: 'evidence-verified',
      label: 'Evidence Verified',
      passed: claimIds.some(cid => core.evidence.byClaim(cid).length > 0),
      details: claimIds.filter(cid => core.evidence.byClaim(cid).length > 0).length > 0 ? 'Some claims have supporting evidence' : 'No evidence linked to claims',
    },
    {
      id: 'counterarguments',
      label: 'Counterarguments',
      passed: blockTypes.has('counterfactual') || chapter.content.some(b => b.type === 'thinker' && (b.data as any)?.criticism?.length > 0),
      details: blockTypes.has('counterfactual') ? 'Counterfactual section present' : 'Missing counterarguments',
    },
    {
      id: 'thinkers',
      label: 'Thinkers',
      passed: blockTypes.has('thinker'),
      details: blockTypes.has('thinker') ? 'Thinker profiles present' : 'Missing thinker profiles',
    },
    {
      id: 'learning-section',
      label: 'Learning Section',
      passed: blockTypes.has('learning'),
      details: blockTypes.has('learning')
        ? `Learning blocks: ${[...learningVariants].join(', ')}`
        : 'Missing learning section',
    },
    {
      id: 'glossary',
      label: 'Glossary / Key Terms',
      passed: chapter.keyTerms.length > 0,
      details: `${chapter.keyTerms.length} key terms defined`,
    },
    {
      id: 'further-reading',
      label: 'Further Reading',
      passed: learningVariants.has('recommended-reading'),
      details: learningVariants.has('recommended-reading') ? 'Recommended reading list present' : 'Missing further reading',
    },
  ];
}

// ─── Tree Builder ───────────────────────────────────────────────────────────

function buildTree(libs: KnowledgeLibrary[]): KnowledgeTreeItem[] {
  return libs.map(lib => ({
    id: lib.id,
    slug: lib.slug,
    title: lib.title,
    type: 'library' as const,
    children: lib.collections.map(col => ({
      id: col.id,
      slug: col.slug,
      title: col.title,
      type: 'collection' as const,
      children: col.volumes.map(vol => ({
        id: vol.id,
        slug: vol.slug,
        title: vol.title,
        type: 'volume' as const,
        children: vol.chapters.map(ch => ({
          id: ch.id,
          slug: ch.slug,
          title: ch.title,
          type: 'chapter' as const,
          status: ch.status,
          metrics: undefined,
          children: [],
        })),
      })),
    })),
  }));
}
