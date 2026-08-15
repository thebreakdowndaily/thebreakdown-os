/**
 * ─── Research Intelligence Engine — barrel ───────────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Pure, deterministic research intelligence engines. No I/O, no network, no
 * AI dependency — every function is stateless and unit-testable.
 */

export * from './ids';
export * from './normalization';
export * from './topic-expansion';
export * from './query-generation';
export * from './deduplication';
export * from './source-quality';
export * from './claim-extraction';
export * from './evidence-linking';
export * from './corroboration';
export * from './contradiction';
export * from './timeline';
export * from './gap-detection';
export * from './priority-scoring';
export * from './social-signals';
