/**
 * ─── The Breakdown OS — Public Demand & Search Intelligence — Domain Types ────
 *
 * Governing document: docs/editorial/story-selection-framework.md (Reader demand criterion)
 *
 * Models public search demand as editorial intelligence. Every type here describes
 * what the public is searching for and where The Breakdown has (or lacks) coverage.
 * This is a read-only editorial surface — no mutations, no backend persistence,
 * no modifications to RIE contracts or canonical types.
 *
 * Fixture-first: the initial data is authored from AnswerThePublic-style patterns
 * for Indian policy, governance, and foreign-policy topics.
 */

// ── 1. Language & Trend ──────────────────────────────────────────────────────

export type DemandLanguage = 'en' | 'hi' | 'mixed';

export type DemandTrend = 'rising' | 'stable' | 'declining' | 'spike';

// ── 2. Category & Intent ─────────────────────────────────────────────────────

export type DemandCategory =
  | 'foreign_policy'
  | 'defence'
  | 'economy'
  | 'governance'
  | 'judiciary'
  | 'history'
  | 'elections'
  | 'society';

export type DemandIntent =
  | 'what'
  | 'why'
  | 'how'
  | 'who'
  | 'when'
  | 'comparison'
  | 'list'
  | 'explainer';

// ── 3. Coverage assessment ───────────────────────────────────────────────────

export type DemandCoverageState =
  | 'fully_covered'
  | 'partially_covered'
  | 'gap'
  | 'uncovered';

// ── 4. Individual demand query ───────────────────────────────────────────────

export interface DemandQuery {
  /** Display text — the actual search query as typed by users. */
  text: string;
  /** ISO language code. */
  language: DemandLanguage;
  /** Romanized / translated version for Hindi queries. */
  transliteration?: string;
  /** Estimated monthly search volume. */
  monthlyVolume: number;
}

// ── 5. Demand opportunity (editorial-facing cluster) ─────────────────────────

export interface DemandOpportunity {
  id: string;
  /** Primary query representing this demand cluster. */
  primaryQuery: DemandQuery;
  /** Related long-tail queries in the same demand cluster. */
  relatedQueries: DemandQuery[];
  /** Estimated total monthly volume across all queries in the cluster. */
  totalMonthlyVolume: number;
  /** Volume trend direction. */
  trend: DemandTrend;
  /** Editorial category. */
  category: DemandCategory;
  /** Reader intent classification. */
  intent: DemandIntent;
  /** Current coverage assessment. */
  coverageState: DemandCoverageState;
  /** Human-readable explanation of the coverage assessment. */
  coverageReason: string;
  /** Which existing stories/chapters partially address this (slugs or titles). */
  existingCoverage: string[];
  /** Gap score: 0 (fully covered) – 100 (critical uncovered demand). */
  gapScore: number;
  /** Pre-formatted research brief for RIE handoff. */
  suggestedResearchBrief: string;
  /** Suggested research questions for the RIE project. */
  suggestedResearchQuestions: string[];
  /** When this demand signal was last assessed. */
  lastAssessedAt: string;
}

// ── 6. Filter state ──────────────────────────────────────────────────────────

export interface DemandFilterState {
  categories: DemandCategory[];
  languages: DemandLanguage[];
  coverageStates: DemandCoverageState[];
  intents: DemandIntent[];
  trends: DemandTrend[];
  searchText: string;
}

// ── 7. Summary metrics ───────────────────────────────────────────────────────

export interface DemandSummaryMetrics {
  totalQueries: number;
  totalMonthlyVolume: number;
  gapCount: number;
  uncoveredCount: number;
  risingCount: number;
  spikeCount: number;
  topCategory: DemandCategory;
  topCategoryVolume: number;
  hindiQueryCount: number;
  englishQueryCount: number;
}
