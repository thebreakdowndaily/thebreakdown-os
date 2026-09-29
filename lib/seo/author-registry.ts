/**
 * lib/seo/author-registry.ts
 * Minimal static author registry for The Breakdown.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 9 — Author Entity)
 *   - docs/aeo-geo/05-entity-audit.md (Author Entity gap)
 *   - Editorial Constitution §XIII (transparency)
 *
 * Purpose:
 *   Provide stable canonical identity data for named journalists so that
 *   NewsArticle JSON-LD can emit `Person` schema with a real URL.
 *
 * Policy:
 *   - Only include real, verifiable team members with their consent
 *   - `sameAs` links must be verified official profiles only
 *   - NEVER fabricate sameAs links or credentials
 *   - Update this file when team composition changes
 *
 * How to add a new author:
 *   1. Confirm the author's canonical name (as it appears on bylines)
 *   2. Create (or confirm) their profile page at /author/[slug]
 *   3. Add their entry below — sameAs is optional
 *   4. Run `npm run check:type` to verify
 */

export interface Author {
  /** Unique slug — must match /author/[slug] route if it exists */
  id: string;
  /** Canonical display name — must match the byline string used in Story.author */
  name: string;
  /** Short editorial role */
  role: string;
  /** Short bio for structured data and author page */
  bio?: string;
  /** Canonical URL on The Breakdown — https://thebreakdown.in/author/[id] */
  url: string;
  /**
   * Verified external profiles only. Links must be personally controlled
   * official profiles. No speculation, no third-party bio pages.
   */
  sameAs?: string[];
}

/** All known team members with stable bylines. */
export const AUTHORS: readonly Author[] = [
  {
    id: 'the-breakdown-editorial',
    name: 'The Breakdown Editorial',
    role: 'Editorial Team',
    bio: 'The Breakdown Editorial covers policy, politics, and society across India.',
    url: 'https://thebreakdown.in',
    // No sameAs for org-level byline
  },
] as const;

/** Fast lookup by canonical byline name. */
const BY_NAME = new Map<string, Author>(
  AUTHORS.map((a) => [a.name.toLowerCase().trim(), a]),
);

/** Fast lookup by author ID / slug. */
const BY_ID = new Map<string, Author>(AUTHORS.map((a) => [a.id, a]));

/**
 * Look up an author by their byline name (case-insensitive).
 * Returns undefined for unknown authors — callers should fall back to
 * the Organisation schema in that case.
 */
export function getAuthorByName(name: string | undefined | null): Author | undefined {
  if (!name) return undefined;
  return BY_NAME.get(name.toLowerCase().trim());
}

/**
 * Look up an author by their slug / ID.
 */
export function getAuthorById(id: string): Author | undefined {
  return BY_ID.get(id);
}

/**
 * Return all authors for sitemap / listing pages.
 */
export function getAllAuthors(): readonly Author[] {
  return AUTHORS;
}
