export interface StoryContextInput {
  slug: string;
  headline?: string;
  title?: string;
  category: string;
  tags?: string[];
  primaryEntityId?: string;
  relatedEntityIds?: string[];
}

export interface ContextMatchResult {
  isMatch: boolean;
  aligned: boolean;
  score: number; // 0 to 1
  reason: string;
  matchType: 'EXACT_MANIFEST' | 'AUTHENTIC_KEYWORD_MATCH' | 'CATEGORY_PLACEHOLDER_MATCH' | 'MISMATCH';
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
  geopolitics: 'policy-placeholder.svg',
  diplomacy: 'policy-placeholder.svg',
  education: 'education-placeholder.svg',
  investigation: 'environment-placeholder.svg', // default investigation placeholder
  agriculture: 'economy-placeholder.svg',
  story: 'story-placeholder.svg',
};

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

  // Check if placeholder matches a specific tag or subtopic (e.g. education tag under policy section)
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
  manifestLookup?: (slug: string) => { approvedImage: string } | null
): ContextMatchResult {
  // 1. Check if registered in verified manifest
  if (manifestLookup) {
    const entry = manifestLookup(story.slug);
    if (entry && entry.approvedImage === imagePath) {
      return {
        isMatch: true,
        aligned: true,
        score: 1.0,
        reason: 'Image is authoritatively registered in Verified Story Image Manifest.',
        matchType: 'EXACT_MANIFEST',
      };
    }
  }

  // 2. Check if it's a category placeholder
  if (imagePath.includes('/images/placeholders/')) {
    const isAligned = isPlaceholderAligned(imagePath, story.category, story.tags, story.slug);
    if (isAligned) {
      return {
        isMatch: true,
        aligned: true,
        score: 0.85,
        reason: `Branded vector placeholder correctly matches story category "${story.category}" or topical needs.`,
        matchType: 'CATEGORY_PLACEHOLDER_MATCH',
      };
    } else {
      const fileName = imagePath.split('/').pop() || '';
      return {
        isMatch: false,
        aligned: false,
        score: 0.2,
        reason: `Placeholder "${fileName}" does not match story category "${story.category}" or tags.`,
        matchType: 'MISMATCH',
      };
    }
  }

  // 3. For authentic photographic or library media, check semantic token overlap
  const imageTokens = extractStemTokens(imagePath);
  const storyTokens = new Set<string>([
    ...extractStemTokens(story.slug),
    ...extractStemTokens(story.headline || story.title || ''),
    ...(story.tags ? story.tags.flatMap((t) => Array.from(extractStemTokens(t))) : []),
    ...(story.primaryEntityId ? Array.from(extractStemTokens(story.primaryEntityId)) : []),
    ...(story.relatedEntityIds ? story.relatedEntityIds.flatMap((e) => Array.from(extractStemTokens(e))) : []),
  ]);

  let overlapCount = 0;
  for (const token of imageTokens) {
    // Exclude generic tokens
    if (['images', 'stories', 'library', 'maps', 'jpg', 'png', 'svg', 'chapter'].includes(token)) {
      continue;
    }
    if (storyTokens.has(token)) {
      overlapCount++;
    }
  }

  // Known cross-topic synergies (e.g. Aadhaar Supreme Court photo for judicial pendency, crop insurance for farm income)
  const isSynergistic =
    (story.slug === 'fix-judicial-pendency' && imagePath.includes('aadhaar-sc')) ||
    (story.slug === '81-crore-data-breach' && imagePath.includes('aadhaar-sc')) ||
    (story.slug === 'fix-farm-income' && imagePath.includes('fasal-bima')) ||
    (story.slug === 'india-china-relations' && imagePath.includes('india-china-border-tensions')) ||
    (story.slug === 'fix-air-pollution' && imagePath.includes('climate-finance'));

  if (overlapCount >= 1 || isSynergistic) {
    return {
      isMatch: true,
      aligned: true,
      score: 0.95,
      reason: `Authentic asset matches story semantic tokens (${overlapCount} matching terms) or verified thematic synergy.`,
      matchType: 'AUTHENTIC_KEYWORD_MATCH',
    };
  }

  // Otherwise, flag as mismatch
  return {
    isMatch: false,
    aligned: false,
    score: 0.1,
    reason: `Image path "${imagePath}" has no semantic keyword or entity overlap with story "${story.slug}".`,
    matchType: 'MISMATCH',
  };
}
