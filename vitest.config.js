const path = require('path');

/**
 * Vitest configuration — scoped to the genuine vitest suite only.
 *
 * The repository mixes three test styles under *.test.ts names:
 *   1. Real vitest tests (this suite) — import from 'vitest' or rely on globals.
 *   2. tsx runTests() harnesses — self-executing scripts run via `npx tsx`,
 *      enumerated individually in package.json test scripts.
 *      DO NOT run these under vitest (they call process.exit / runTests).
 *   3. Playwright specs under tests/e2e/ — run via the playwright runner.
 *      DO NOT run these under vitest.
 *
 * Because tests/ mixes styles with no filename convention that separates
 * them, the include list below enumerates every vitest test explicitly.
 * Add new vitest tests to this list; tsx harnesses and playwright specs
 * stay out by construction.
 *
 * EXCLUDED despite matching *.test.ts — pre-existing audit-framework
 * defects or environment-dependent suites (reproduce in a clean checkout,
 * unrelated to this config):
 *   - packages/plugin-sdk/tests/contract.test.ts  — shared helper library,
 *     0 tests, nothing imports it.
 *   - audit/tests/loader.test.ts                  — asserts data.error but
 *     the loader stores errors at top-level error.
 *   - audit/tests/manifest-validation.test.ts     — hello-world fixture uses
 *     capabilities not in the schema enum.
 *   - audit/plugins/architecture/tests/architecture.test.ts — fixture repo
 *     lacks the unknown-dir directory the test asserts.
 *   - audit/plugins/operations/tests/operations.test.ts — asserts the real
 *     repo passes the operations audit; repo is not compliant.
 *   - tests/research/db-integration.test.ts      — requires a live
 *     PostgreSQL/Supabase instance; skips when unconfigured, fails with
 *     ENOTFOUND when .env.test points at an unreachable host.
 * Repair these under the W6 audit-framework workstream, then re-add them.
 *
 * Governing document: AGENTS.md — Testing (npm run lint / typecheck / build).
 */
module.exports = {
  test: {
    globals: true,
    environment: 'node',
    include: [
      'audit/plugins/accessibility-audit/tests/accessibility.test.ts',
      'audit/plugins/editorial-audit/tests/editorial.test.ts',
      'audit/plugins/knowledge-graph-audit/tests/knowledge-graph.test.ts',
      'audit/plugins/performance-audit/tests/performance.test.ts',
      'audit/plugins/security-audit/tests/security.test.ts',
      'audit/plugins/seo-audit/tests/seo.test.ts',
      'tests/chapter-1-founding.test.ts',
      'tests/chapter-factory.test.ts',
      'tests/compare-helpers.test.ts',
      'tests/control-plane.test.ts',
      'tests/editorial-decision-intelligence.test.ts',
      'tests/editorial-mission-control.test.ts',
      'tests/evidence-evolution.test.ts',
      'tests/evolution.test.ts',
      'tests/excellence.test.ts',
      'tests/extensibility.test.ts',
      'tests/fix-domain.test.ts',
      'tests/fix-editorial-intelligence.test.ts',
      'tests/fix-graph.test.ts',
      'tests/fix-helpers.test.ts',
      'tests/fix-hub.test.ts',
      'tests/fix-integration.test.ts',
      'tests/fix-metadata.test.ts',
      'tests/fix-repository.test.ts',
      'tests/fix-validation.test.ts',
      'tests/fix-workflow.test.ts',
      'tests/governance.test.ts',
      'tests/infrastructure.test.ts',
      'tests/jobs.test.ts',
      'tests/knowledge-explorer.test.ts',
      'tests/knowledge-intelligence.test.ts',
      'tests/knowledge-preservation.test.ts',
      'tests/observability.test.ts',
      'tests/outcome-tracking.test.ts',
      'tests/performance.test.ts',
      'tests/platform-integration.test.ts',
      'tests/platform-operations.test.ts',
      'tests/precedent-explorer.test.ts',
      'tests/problem-helpers.test.ts',
      'tests/public-platform.test.ts',
      'tests/research-workspace.test.ts',
      'tests/research/invariant.test.ts',
      'tests/resilience.test.ts',
      'tests/security.test.ts',
      'tests/solution-comparison.test.ts',
      'tests/story/canonical-adapter.test.ts',
      'tests/certification/canonical-certification.test.ts',
      'tests/telemetry.test.ts',
    ],
    exclude: ['node_modules/**', 'tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
};
