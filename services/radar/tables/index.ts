/**
 * ─── Canonical Table Extraction & Adapters (Phase 4B-3B) ──────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Exports canonical table extraction models, normalizers, and format adapters.
 */

export * from '@/types/canonical-table';
export * from './normalizer';
export * from './html-extractor';
export * from './csv-adapter';
export * from './json-adapter';
export * from './pdf-extractor';
export * from './diff-engine';
export * from './lineage';
export * from './impact-mapper';
export * from './dossier-builder';
export * from './decision-engine';
export * from './review-orchestrator';
