export type AssetClassification =
  | 'authentic-photo'
  | 'official-document'
  | 'editorial-chart'
  | 'illustration'
  | 'generic-placeholder';

export interface StoryContextInput {
  slug: string;
  headline?: string;
  title?: string;
  category: string;
  tags?: string[];
  storyType?: string;
  isFeatureStory?: boolean;
  primaryEntityId?: string;
  relatedEntityIds?: string[];
}

export interface ContextMatchResult {
  isMatch: boolean;
  aligned: boolean;
  score: number; // 0 to 1
  reason: string;
  matchType: 'EXACT_MANIFEST' | 'AUTHENTIC_KEYWORD_MATCH' | 'CATEGORY_PLACEHOLDER_MATCH' | 'MISMATCH';
  classification: AssetClassification;
  isEditorialBlocker?: boolean;
}

// Known category alias mappings for placeholders
const CATEGORY_PLACEHOLDER_MAP: Record<string, string> = {
  economy: 'economy-placeholder.svg',
  employment: 'economy-placeholder.svg',
  finance: 'economy-placeholder.svg',
  technology: 'technology-placeholder.svg',
  cybersecurity: 'technology-placeholder.svg',
  health: 'health-placeholder.svg',
  healthcare: 'health-placeholder.svg',
  environment: 'environment-placeholder.svg',
  climate: 'environment-placeholder.svg',
  policy: 'policy-placeholder.svg',
  politics: 'policy-placeholder.svg',
  governance: 'governance-placeholder.svg',
  institutions: 'governance-placeholder.svg',
  geopolitics: 'policy-placeholder.svg',
  diplomacy: 'policy-placeholder.svg',
  education: 'education-placeholder.svg',
  investigation: 'environment-placeholder.svg',
  agriculture: 'economy-placeholder.svg',
  story: 'story-placeholder.svg',
};

// Generic stop tokens that cannot constitute a meaningful multi-token match alone
const GENERIC_STOP_TOKENS = new Set([
  'images', 'stories', 'library', 'maps', 'charts', 'jpg', 'png', 'svg', 'jpeg', 'webp',
  'chapter', 'india', 'indian', 'report', 'reform', 'policy', 'state', 'national',
  'central', 'government', 'public', 'standard', 'story', 'article', 'news', 'daily',
  'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'from', 'with', 'into', 'relations', 'relation', 'between'
]);

/**
 * Checks if a placeholder SVG matches the story's category or topical needs.
 */
export function isPlaceholderAligned(
  imagePath: string,
  storyCategory: string,
  tags?: string[],
  slug?: string
): boolean {
  if (!imagePath.includes('/images/placeholders/')) return false;

  const fileName = imagePath.split('/').pop() || '';
  const expectedPlaceholder = CATEGORY_PLACEHOLDER_MAP[storyCategory.toLowerCase()] || 'story-placeholder.svg';

  // Exact category match or generic story fallback is acceptable
  if (fileName === expectedPlaceholder || fileName === 'story-placeholder.svg') {
    return true;
  }

  // Check if placeholder matches a specific tag or subtopic
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      const tagPlaceholder = CATEGORY_PLACEHOLDER_MAP[tag.toLowerCase()];
      if (tagPlaceholder && fileName === tagPlaceholder) {
        return true;
      }
    }
  }

  // Check if slug contains key topical stems
  if (slug) {
    if (slug.includes('education') && fileName === 'education-placeholder.svg') return true;
    if ((slug.includes('health') || slug.includes('cancer')) && fileName === 'health-placeholder.svg') return true;
    if ((slug.includes('ev') || slug.includes('pollution') || slug.includes('climate') || slug.includes('water')) && fileName === 'environment-placeholder.svg') return true;
  }

  return false;
}

/**
 * Extracts normalized stem words from a string or path.
 */
function extractStemTokens(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[._\-\/]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '');
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
  return new Set(tokens);
}

/**
 * Evaluates whether an image asset matches the editorial context and needs of a story.
 */
export function matchImageToStoryContext(
  imagePath: string,
  story: StoryContextInput,
  manifestLookup?: (slug: string) => { approvedImage: string; assetType?: string; approvalStatus?: 'approved' | 'pending' | 'rejected' } | null
): ContextMatchResult {
  const isFeatureStory = Boolean(
    story.isFeatureStory ||
    story.storyType === 'feature' ||
    story.storyType === 'investigation' ||
    story.storyType === 'explainer' ||
    (story.storyType === 'standard' && ['ai-literacy-india-students-verify-ai', 'india-semiconductor-mission-fab-reality', 'bcci-domestic-mandate-ranji-economics'].includes(story.slug))
  );

  // 1. Check if registered in verified manifest
  if (manifestLookup) {
    const entry = manifestLookup(story.slug);
    if (entry && entry.approvedImage === imagePath) {
      const isPlaceholder = entry.approvedImage.includes('/images/placeholders/');

      // A matching filename/path is not approval. Explicitly pending or
      // rejected real assets must not fall through to semantic keyword matching.
      if (entry.approvalStatus !== 'approved' && !isPlaceholder) {
        return {
          isMatch: false,
          aligned: false,
          score: 0,
          reason: `Manifest asset for "${story.slug}" is ${entry.approvalStatus || 'missing approval status'} and cannot be treated as publication-approved.`,
          matchType: 'MISMATCH',
          classification: 'authentic-photo',
          isEditorialBlocker: true,
        };
      }

      if (entry.approvalStatus === 'approved') {
      const classification: AssetClassification = isPlaceholder
        ? 'generic-placeholder'
        : entry.assetType === 'authentic-photo'
        ? 'authentic-photo'
        : entry.assetType === 'authentic-map'
        ? 'official-document'
        : 'authentic-photo';

      if (isPlaceholder && isFeatureStory) {
        return {
          isMatch: false,
          aligned: false,
          score: 0.3,
          reason: `Manifest references generic placeholder for feature story "${story.slug}". Verified authentic hero visual is required.`,
          matchType: 'MISMATCH',
          classification: 'generic-placeholder',
          isEditorialBlocker: true,
        };
      }

      return {
        isMatch: true,
        aligned: true,
        score: 1.0,
        reason: 'Image is authoritatively registered in Verified Story Image Manifest.',
        matchType: 'EXACT_MANIFEST',
        classification,
      };
      }
      // Pending/rejected placeholders fall through to the category-placeholder
      // policy below; they are never classified as approved manifest assets.
    }
  }

  // 2. Check if it's a category placeholder
  if (imagePath.includes('/images/placeholders/')) {
    if (isFeatureStory) {
      return {
        isMatch: false,
        aligned: false,
        score: 0.2,
        reason: `Generic placeholder "${imagePath.split('/').pop()}" cannot satisfy hero media requirements for feature/investigative journalism.`,
        matchType: 'MISMATCH',
        classification: 'generic-placeholder',
        isEditorialBlocker: true,
      };
    }

    const isAligned = isPlaceholderAligned(imagePath, story.category, story.tags, story.slug);
    if (isAligned) {
      return {
        isMatch: true,
        aligned: true,
        score: 0.85,
        reason: `Branded vector placeholder correctly matches story category "${story.category}" or topical needs.`,
        matchType: 'CATEGORY_PLACEHOLDER_MATCH',
        classification: 'generic-placeholder',
      };
    } else {
      const fileName = imagePath.split('/').pop() || '';
      return {
        isMatch: false,
        aligned: false,
        score: 0.2,
        reason: `Placeholder "${fileName}" does not match story category "${story.category}" or tags.`,
        matchType: 'MISMATCH',
        classification: 'generic-placeholder',
      };
    }
  }

  // 3. Check authentic topic backdrop images (/images/topics/*.jpg)
  if (imagePath.includes('/images/topics/')) {
    const topicStem = imagePath.split('/').pop()?.replace(/\.[^/.]+$/, '').toLowerCase() || '';
    const categoryLower = story.category.toLowerCase();
    const tagsLower = (story.tags || []).map((t) => t.toLowerCase());
    if (topicStem === categoryLower || tagsLower.includes(topicStem)) {
      return {
        isMatch: true,
        aligned: true,
        score: 0.90,
        reason: `Authentic topic backdrop image matches story category "${story.category}".`,
        matchType: 'AUTHENTIC_KEYWORD_MATCH',
        classification: 'authentic-photo',
      };
    }
  }

  // 4. For authentic photographic, charts or library media, check semantic multi-token overlap
  const imageTokens = extractStemTokens(imagePath);
  const storyTokens = new Set<string>([
    ...extractStemTokens(story.slug),
    ...extractStemTokens(story.headline || story.title || ''),
    ...(story.tags ? story.tags.flatMap((t) => Array.from(extractStemTokens(t))) : []),
    ...(story.primaryEntityId ? Array.from(extractStemTokens(story.primaryEntityId)) : []),
    ...(story.relatedEntityIds ? story.relatedEntityIds.flatMap((e) => Array.from(extractStemTokens(e))) : []),
  ]);

  const nonGenericMatchingTokens: string[] = [];
  for (const token of imageTokens) {
    if (GENERIC_STOP_TOKENS.has(token)) {
      continue;
    }
    if (storyTokens.has(token)) {
      nonGenericMatchingTokens.push(token);
    }
  }

  // Known cross-topic synergies
  const isSynergistic =
    (story.slug === 'fix-judicial-pendency' && imagePath.includes('aadhaar-sc')) ||
    (story.slug === '81-crore-data-breach' && imagePath.includes('aadhaar-sc')) ||
    (story.slug === 'fix-farm-income' && imagePath.includes('fasal-bima')) ||
    (story.slug === 'fix-air-pollution' && imagePath.includes('climate-finance')) ||
    (story.slug.includes('ranji') && (imagePath.includes('ranji') || imagePath.includes('bcci')));

  const isChart = imagePath.includes('/images/charts/');
  const classification: AssetClassification = isChart ? 'editorial-chart' : 'authentic-photo';

  // Distinctive single token (>= 5 characters matching slug or title directly)
  const isDistinctiveSingleToken =
    nonGenericMatchingTokens.length === 1 &&
    nonGenericMatchingTokens[0].length >= 6 &&
    !['relations', 'relation', 'reform', 'policy', 'mission', 'status', 'future', 'review', 'system'].includes(nonGenericMatchingTokens[0]) &&
    (story.slug.includes(nonGenericMatchingTokens[0]) || (story.headline || story.title || '').toLowerCase().includes(nonGenericMatchingTokens[0]));

  // Require at least 2 distinct semantic tokens OR distinctive single token OR documented domain synergy
  if (nonGenericMatchingTokens.length >= 2 || isDistinctiveSingleToken || isSynergistic) {
    return {
      isMatch: true,
      aligned: true,
      score: 0.95,
      reason: `Authentic asset matches story semantic tokens (${nonGenericMatchingTokens.join(', ')}) or verified thematic synergy.`,
      matchType: 'AUTHENTIC_KEYWORD_MATCH',
      classification,
    };
  }

  // If only 1 weak match and not synergistic, reject weak 1-word false positive
  if (nonGenericMatchingTokens.length === 1) {
    return {
      isMatch: false,
      aligned: false,
      score: 0.4,
      reason: `Weak single-token overlap ("${nonGenericMatchingTokens[0]}") is insufficient for reliable image relevance. Multi-token context required.`,
      matchType: 'MISMATCH',
      classification,
      isEditorialBlocker: true,
    };
  }

  // Otherwise, flag as mismatch
  return {
    isMatch: false,
    aligned: false,
    score: 0.1,
    reason: `Image path "${imagePath}" has no semantic keyword or entity overlap with story "${story.slug}".`,
    matchType: 'MISMATCH',
    classification,
    isEditorialBlocker: true,
  };
}
