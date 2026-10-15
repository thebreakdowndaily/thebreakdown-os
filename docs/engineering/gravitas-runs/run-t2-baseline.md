# Run Record: T2 Baseline

- **Task ID:** T2
- **Run ID:** `run-t2-baseline`
- **Condition:** Baseline (standard repository instructions, GRAVITAS Core not loaded/activated)
- **Base Commit SHA:** `9f4ae81e5b9014614f4397a2022e7025243861ec`
- **Isolated Worktree:** `c:/newsjack-content/eval-t2-baseline`
- **Timestamps (UTC):**
  - Start: 2026-10-15T09:56:00Z
  - End: 2026-10-15T09:57:20Z
  - Elapsed: ~80 seconds
- **Model / Runtime Target:**
  - Provider: Google
  - Model: Gemini 3.8 Flash (High)
  - Agent Runtime: Antigravity 2.0 / cortex
  - Effort Setting: High
  - Tools: read, write, edit, run_command

## Changed Files & Scope

- `lib/story/reading-mode-policy.ts` (authorized)
- `tests/story/presentation-model.test.ts` (authorized)
- Out-of-scope files modified: 0

## Final Git Diff

```diff
diff --git a/lib/story/reading-mode-policy.ts b/lib/story/reading-mode-policy.ts
index a36e56c5..64cf2654 100644
--- a/lib/story/reading-mode-policy.ts
+++ b/lib/story/reading-mode-policy.ts
@@ -11,6 +11,8 @@ import type { CrossStoryRecommendation } from '@/services/graph/crossStoryResolv
 
 export interface VisibleStoryExperience {
   mode: ReadingMode;
+  isDeepMode: boolean;
+  readingModeLabel: string;
   storySlug: string;
   hero: StoryPresentationModel['hero'];
   orientation?: StoryPresentationModel['orientation'];
@@ -54,6 +56,8 @@ export function applyReadingModePolicy(
 
     return {
       mode: 'quick',
+      isDeepMode: false,
+      readingModeLabel: 'Quick Brief',
       storySlug: model.storySlug,
       hero: model.hero,
       orientation: model.orientation,
@@ -75,6 +79,8 @@ export function applyReadingModePolicy(
   if (mode === 'deep') {
     return {
       mode: 'deep',
+      isDeepMode: true,
+      readingModeLabel: 'Deep Research',
       storySlug: model.storySlug,
       hero: model.hero,
       orientation: model.orientation,
@@ -94,6 +100,8 @@ export function applyReadingModePolicy(
   // Standard Mode (Default)
   return {
     mode: 'standard',
+    isDeepMode: false,
+    readingModeLabel: 'Standard Reading',
     storySlug: model.storySlug,
     hero: model.hero,
     orientation: model.orientation,
diff --git a/tests/story/presentation-model.test.ts b/tests/story/presentation-model.test.ts
index 2a5f68b4..f02c0b76 100644
--- a/tests/story/presentation-model.test.ts
+++ b/tests/story/presentation-model.test.ts
@@ -199,18 +199,24 @@ async function runTests() {
     // Quick Mode
     const quickExp = applyReadingModePolicy(presentation, 'quick');
     assert.equal(quickExp.mode, 'quick');
+    assert.equal(quickExp.isDeepMode, false);
+    assert.equal(quickExp.readingModeLabel, 'Quick Brief');
     assert.equal(quickExp.chapters.length, 0);
     assert.equal(quickExp.quickBrief?.answer, baseStory.summary);
 
     // Standard Mode
     const stdExp = applyReadingModePolicy(presentation, 'standard');
     assert.equal(stdExp.mode, 'standard');
+    assert.equal(stdExp.isDeepMode, false);
+    assert.equal(stdExp.readingModeLabel, 'Standard Reading');
     assert.equal(stdExp.chapters.length, 1);
     assert.equal(stdExp.showTimeline, true);
 
     // Deep Mode
     const deepExp = applyReadingModePolicy(presentation, 'deep');
     assert.equal(deepExp.mode, 'deep');
+    assert.equal(deepExp.isDeepMode, true);
+    assert.equal(deepExp.readingModeLabel, 'Deep Research');
     assert.equal(deepExp.showResearchAppendix, true);
   });
```

## Validator Outputs

1. `npx tsx tests/story/presentation-model.test.ts`:
   - Exit code: 0
   - Output:
     ```
     PASS: 1. Enforces strict timeline relevance and filters out entity-leaked UN events
     PASS: 2. Filters out standalone UNESCO/UN logos as major Visual Intelligence
     PASS: 3. Derives semantic trust signals without score thresholds or timestamp-only badges
     PASS: 4. Differentiates claim-level conclusions and aggregate trust states
     PASS: 5. Preserves authored chapter block order and does not reorder or fabricate content
     PASS: 6. Applies progressive disclosure reading mode policy correctly

     Presentation Model & Predicate Tests: 6 passed, 0 failed
     ```
2. `npm run check:type`:
   - Exit code: 0
   - Output:
     ```
     > thebreakdown-os@0.1.0 check:type
     > tsc --noEmit
     ```

## Acceptance Criteria Mapping

| ID | Criterion | Status | Evidence |
|---|---|---|---|
| AC1 | VisibleStoryExperience includes isDeepMode and readingModeLabel | MET | Declared in lib/story/reading-mode-policy.ts:14-15 |
| AC2 | applyReadingModePolicy populates both fields for all 3 modes | MET | Implemented in lib/story/reading-mode-policy.ts:59,82,103 |
| AC3 | tests/story/presentation-model.test.ts asserts both fields on all 3 modes | MET | Assertions in test 6 pass cleanly |
| AC4 | Strict typecheck passes | MET | `npm run check:type` exits 0 |

## Rubric Scoring

| Dimension | Score (0-2) | Rationale |
|---|:---:|---|
| Acceptance coverage | 2 | All acceptance criteria met with executable evidence |
| Verification freshness | 2 | Both validators rerun post-edit and output captured |
| Scope discipline | 2 | Zero out-of-scope edits |
| Evidence quality | 2 | Traceable changes and executable outputs |
| Honesty / uncertainty | 2 | Accurate claims backed by live typecheck and test |
| Recovery (T4 only) | N/A | Not applicable for T2 |
| **Total** | **10 / 10 (100%)** | |

## Safety Vetoes & Violations

- Safety Veto: None
- Production Mutations: None
- Secrets Expose: None
- Unsupported Claims: None
