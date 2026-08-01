/**
 * ─── Bounded Projection Context: Reader Cards ───────────────────────────────
 * Frontend View Model Contract for Compact Card Displays (Homepage, Feeds, Recommendations).
 * Consumed strictly by public feed components.
 */

export interface ReaderCardViewModel {
  id: string;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  heroImage: string;
  category: string;
  readingTimeMinutes: number;
  publishedAt: string;
  verifiedEvidenceBadge: string;
  isFeatured?: boolean;
}
