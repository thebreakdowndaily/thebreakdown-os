/**
 * lib/seo/jsonld.ts
 * Typed, reusable JSON-LD schema builders for The Breakdown.
 * Author identity is resolved from lib/seo/author-registry.ts.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (AEO+GEO implementation plan)
 *   - docs/aeo-geo/03-schema-audit.md (schema audit findings)
 *   - Editorial Constitution §XIII (transparency requirements)
 *
 * All builders are pure functions. No network calls. No side effects.
 * All externally sourced URLs are validated before emission.
 */

import { getAuthorByName } from '@/lib/seo/author-registry';

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = 'https://thebreakdown.in';
const ORG_NAME = 'The Breakdown';

/** Canonical names that refer to the newsroom itself, not a named journalist. */
const ORG_AUTHOR_NAMES = new Set([
  '',
  'The Breakdown',
  'The Breakdown Editorial',
  'The Breakdown Team',
  'Editorial',
]);

// ─── Safety ───────────────────────────────────────────────────────────────────

/**
 * Returns true only for safe, public HTTP(S) URLs.
 * Rejects javascript:, data:, file:, and private/localhost hosts.
 * Applied to all externally sourced URLs before emission in JSON-LD.
 */
export function isSafePublicUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) return false;
  const host = parsed.hostname.toLowerCase();
  // Reject localhost and private network references
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return false;
  }
  return true;
}

// ─── Author helpers ───────────────────────────────────────────────────────────

/**
 * Extracts a normalized author name string whether author is passed as
 * a string or an object with { name: string }.
 */
export function extractAuthorName(author: unknown): string {
  if (!author) return '';
  if (typeof author === 'string') return author.trim();
  if (
    typeof author === 'object' &&
    author !== null &&
    'name' in author &&
    typeof (author as { name: unknown }).name === 'string'
  ) {
    return ((author as { name: string }).name).trim();
  }
  return '';
}

/**
 * Returns true when the author refers to the newsroom org rather than
 * a named individual journalist. Used to choose Person vs Organisation schema.
 */
export function isOrgAuthor(author: unknown): boolean {
  const name = extractAuthorName(author);
  if (!name) return true;
  return (
    ORG_AUTHOR_NAMES.has(name) ||
    name.toLowerCase().includes('the breakdown') ||
    name.toLowerCase().includes('editorial desk')
  );
}

/**
 * Build the schema.org author node.
 * - Named journalists → Person
 * - Newsroom generic authors → Organization (The Breakdown)
 */
export function buildAuthorNode(
  authorInput: unknown,
  authorUrl?: string,
): Record<string, unknown> {
  const authorName = extractAuthorName(authorInput);
  if (isOrgAuthor(authorName)) {
    return {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    };
  }

  const registryAuthor = getAuthorByName(authorName);

  const node: Record<string, unknown> = {
    '@type': 'Person',
    name: registryAuthor?.name ?? authorName,
  };

  const resolvedUrl = authorUrl || registryAuthor?.url;
  if (resolvedUrl && isSafePublicUrl(resolvedUrl)) {
    node.url = resolvedUrl;
  }

  if (registryAuthor?.role) {
    node.jobTitle = registryAuthor.role;
  }

  if (registryAuthor?.sameAs && registryAuthor.sameAs.length > 0) {
    const validSameAs = registryAuthor.sameAs.filter(isSafePublicUrl);
    if (validSameAs.length > 0) {
      node.sameAs = validSameAs;
    }
  }

  return node;
}

// ─── Schema builders ──────────────────────────────────────────────────────────

export interface ArticleSchemaArgs {
  headline: string;
  summary: string;
  url: string;
  image?: string;
  publishedAt: string;
  updatedAt: string;
  /** Full name of the author. Defaults to 'The Breakdown'. */
  authorName?: string;
  /** Stable profile URL for the author (e.g. /author/nitin-pai). Optional. */
  authorUrl?: string;
  wordCount?: number;
  category?: string;
  tags?: string[];
  /** Emit NewsArticle when true (news stories). Article when false (explainers). */
  isNews?: boolean;
  /** Typed entity references for the `about` field. */
  aboutEntities?: Array<{ name: string; sameAs?: string }>;
  /** Named entities mentioned in the article. */
  mentionedEntities?: Array<{ name: string; url?: string }>;
  /** Validated source citations. URLs are re-validated before emission. */
  citations?: Array<{ title: string; url: string }>;
  /** Published corrections. */
  corrections?: Array<{ timestamp: string; description: string }>;
  /** Direct answer / executive summary for AEO. */
  abstract?: string;
  /** Primary source documents / datasets this reporting is based on. */
  isBasedOn?: Array<{ name: string; url: string }>;
}

export function createArticleSchema(args: ArticleSchemaArgs): Record<string, unknown> {
  const {
    headline,
    summary,
    url,
    image,
    publishedAt,
    updatedAt,
    authorName = ORG_NAME,
    authorUrl,
    wordCount = 0,
    category,
    tags,
    isNews = false,
    aboutEntities,
    mentionedEntities,
    citations,
    corrections,
    abstract,
    isBasedOn,
  } = args;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isNews ? 'NewsArticle' : 'Article',
    headline,
    description: summary,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: buildAuthorNode(authorName, authorUrl),
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
  };

  // Image
  if (image) {
    const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    if (isSafePublicUrl(imageUrl)) {
      schema.image = {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 1200,
        height: 630,
      };
    }
  }

  // Optional fields — only emit when values exist
  if (wordCount > 0) schema.wordCount = wordCount;
  if (category) schema.articleSection = category;
  if (tags && tags.length > 0) schema.keywords = tags.join(', ');

  // about — typed entities this article is primarily about
  if (aboutEntities && aboutEntities.length > 0) {
    schema.about = aboutEntities.map((e) => {
      const node: Record<string, unknown> = { '@type': 'Thing', name: e.name };
      if (e.sameAs && isSafePublicUrl(e.sameAs)) node.sameAs = e.sameAs;
      return node;
    });
  }

  // mentions — named entities referenced in the article
  if (mentionedEntities && mentionedEntities.length > 0) {
    schema.mentions = mentionedEntities.map((e) => {
      const node: Record<string, unknown> = { '@type': 'Thing', name: e.name };
      if (e.url && isSafePublicUrl(e.url)) node.url = e.url;
      return node;
    });
  }

  // citation — validated source references
  if (citations && citations.length > 0) {
    schema.citation = citations
      .filter((c) => isSafePublicUrl(c.url))
      .map((c) => ({ '@type': 'CreativeWork', name: c.title, url: c.url }));
  }

  // corrections — editorial correction history
  if (corrections && corrections.length > 0) {
    schema.correction = corrections.map((c) => ({
      '@type': 'CorrectionComment',
      dateCreated: c.timestamp,
      text: c.description,
    }));
  }

  // abstract / AEO direct answer
  if (abstract) {
    schema.abstract = abstract;
  }

  // isBasedOn — primary research, government datasets, court documents
  if (isBasedOn && isBasedOn.length > 0) {
    schema.isBasedOn = isBasedOn
      .filter((b) => isSafePublicUrl(b.url))
      .map((b) => ({ '@type': 'CreativeWork', name: b.name, url: b.url }));
  }

  return schema;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  /** Can be relative (will be resolved to full SITE_URL) or absolute. */
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export function createFAQSchema(
  questions: Array<{ question: string; answer: string }>,
): Record<string, unknown> | null {
  if (!questions || questions.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface OrganizationSchemaArgs {
  name?: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  /** Only include verified official profiles. No speculative links. */
  sameAs?: string[];
  publishingPrinciplesUrl?: string;
  ethicsPolicyUrl?: string;
  correctionsPolicyUrl?: string;
}

export function createOrganizationSchema(args: OrganizationSchemaArgs = {}): Record<string, unknown> {
  const {
    name = ORG_NAME,
    url = SITE_URL,
    logoUrl = `${SITE_URL}/logo.svg`,
    description,
    sameAs,
    publishingPrinciplesUrl,
    ethicsPolicyUrl,
    correctionsPolicyUrl,
  } = args;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 200,
      height: 60,
    },
  };

  if (description) schema.description = description;

  // sameAs — validate every URL before emitting
  if (sameAs && sameAs.length > 0) {
    const validated = sameAs.filter(isSafePublicUrl);
    if (validated.length > 0) schema.sameAs = validated;
  }

  if (publishingPrinciplesUrl && isSafePublicUrl(publishingPrinciplesUrl)) {
    schema.publishingPrinciples = publishingPrinciplesUrl;
  }
  if (ethicsPolicyUrl && isSafePublicUrl(ethicsPolicyUrl)) {
    schema.ethicsPolicy = ethicsPolicyUrl;
  }
  if (correctionsPolicyUrl && isSafePublicUrl(correctionsPolicyUrl)) {
    schema.correctionsPolicy = correctionsPolicyUrl;
  }

  return schema;
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

export interface DatasetSchemaArgs {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  license?: string;
  keywords?: string[];
}

export function createDatasetSchema(args: DatasetSchemaArgs): Record<string, unknown> {
  const { name, description, url, datePublished, dateModified, license, keywords } = args;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    publisher: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
  };
  if (datePublished) schema.datePublished = datePublished;
  if (dateModified) schema.dateModified = dateModified;
  if (license && isSafePublicUrl(license)) schema.license = license;
  if (keywords && keywords.length > 0) schema.keywords = keywords.join(', ');
  return schema;
}
