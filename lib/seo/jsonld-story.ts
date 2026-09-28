/**
 * lib/seo/jsonld-story.ts
 * Builds JSON-LD structured data for Story pages.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 1 — P0 schema bug fixes)
 *   - docs/aeo-geo/03-schema-audit.md (Bug 1: author, Bug 2: breadcrumb)
 *   - Editorial Constitution §XIII
 */

import type { Story } from '@/types/canonical';
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createFAQSchema,
  isSafePublicUrl,
} from '@/lib/seo/jsonld';

const SITE_URL = 'https://thebreakdown.in';

/**
 * Derives the author profile URL from the author name string.
 * Returns undefined if the author is the generic newsroom identity.
 * Only call when you have a named journalist — not a team/editorial credit.
 */
function resolveAuthorUrl(authorName: string | undefined): string | undefined {
  if (!authorName || authorName.trim() === '' || authorName === 'The Breakdown' || authorName === 'The Breakdown Editorial') {
    return undefined;
  }
  // Derive a slug from the author name: "Nitin Pai" → "nitin-pai"
  const slug = authorName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${SITE_URL}/author/${slug}`;
}

/**
 * Build the BreadcrumbList for a story page.
 * Uses the story's category as the section name.
 * If the category maps to a known public section URL, use it;
 * otherwise emit a 2-item breadcrumb (Home → Article).
 */
function buildStoryBreadcrumb(story: Story): Record<string, unknown> {
  // Only use category as a section crumb if it is a simple label.
  // We don't have a guarantee that /story?category=X is a valid route,
  // so we use a 2-item breadcrumb (Home → Story) which is always correct.
  // Editors can enrich this in the future once section routes are confirmed.
  return createBreadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: story.headline.slice(0, 70), url: `${SITE_URL}/story/${story.slug}` },
  ]);
}

/**
 * Main entry point: builds the JSON-LD array for a story page.
 * Returns an array of schema objects ready for serialisation.
 */
export function createStoryJsonLd(
  story: Story,
  options?: {
    corrections?: Array<{ timestamp: string; description: string }>;
  },
): Record<string, unknown>[] {
  const storyUrl = `${SITE_URL}/story/${story.slug}`;

  // Collect validated source citations — URL safety enforced here
  const citations = (story.sources ?? [])
    .filter((s) => isSafePublicUrl(s.url))
    .map((s) => ({ title: s.title, url: s.url }));

  // Collect entity references for `about` and `mentions`
  // story.tags serve as broad topic references when no canonical entity data is available.
  const aboutEntities =
    story.tags && story.tags.length > 0
      ? story.tags.slice(0, 5).map((t) => ({ name: t }))
      : undefined;

  const wordCount =
    story.blocks?.reduce((sum, b) => sum + Math.round(JSON.stringify(b).length / 5), 0) ?? 0;

  const ld: Record<string, unknown>[] = [
    // 1. NewsArticle — primary schema
    createArticleSchema({
      headline: story.headline,
      summary: story.summary,
      url: storyUrl,
      image: story.heroImage,
      publishedAt: story.publishedAt,
      updatedAt: story.updatedAt,
      authorName: story.author,
      authorUrl: resolveAuthorUrl(story.author),
      wordCount,
      category: story.category,
      tags: story.tags,
      isNews: true,
      aboutEntities,
      citations,
      corrections: options?.corrections,
    }),

    // 2. BreadcrumbList — corrected (no more slug-fragment heuristic)
    buildStoryBreadcrumb(story),
  ];

  // 3. FAQPage — conditional on presence of FAQ blocks with real content
  const faqBlocks = story.blocks?.filter((b) => b.type === 'faq') ?? [];
  if (faqBlocks.length > 0) {
    const questions: Array<{ question: string; answer: string }> = [];
    for (const block of faqBlocks) {
      const data = block.data as { questions?: Array<{ question: string; answer: string }> };
      if (Array.isArray(data.questions)) {
        for (const q of data.questions) {
          if (q.question && q.answer) {
            questions.push({ question: q.question, answer: q.answer });
          }
        }
      }
    }
    const faqSchema = createFAQSchema(questions);
    if (faqSchema) {
      ld.push(faqSchema);
    }
  }

  // Also consider story.faq (canonical FAQ array, separate from blocks)
  if (story.faq && story.faq.length > 0 && faqBlocks.length === 0) {
    const faqSchema = createFAQSchema(
      story.faq.map((f) => ({ question: f.question, answer: f.answer })),
    );
    if (faqSchema) {
      ld.push(faqSchema);
    }
  }

  return ld;
}
