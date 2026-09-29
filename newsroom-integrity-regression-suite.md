# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 7: Integrity & Verification Regression Suite Specification

**Document ID:** NOS-TEST-007  
**Status:** Verification Suite Specification  
**Date:** 2026-09-28  
**Scope:** Automated test definitions ensuring fail-closed publication, claim traceability, state machine compliance, and change propagation.

---

### Regression Test Suite Inventory

| Test Group | Suite Name | Runner | Target Invariant | Fail-Closed Assertion |
|---|---|---|---|---|
| **GATE-REG** | `publication-gate.test.ts` | Vitest / Tsx | 11/11 Publication Gates | A story lacking title, claims, sources, or Gold Standard signoff is rejected |
| **AUTH-REG** | `newsroom-auth-api.test.ts` | Vitest | Zero Public API Bypass | Unauthenticated `POST /api/v1/stories` or `POST /api/v2/stories` returns 401/403 |
| **SRC-REG** | `source-integrity.test.ts` | Tsx | F-12 Canonical Source Integrity | 100% of published claim `sourceIds` resolve in `source-registry.ts` |
| **STATE-REG**| `workflow-state-machine.test.ts` | Tsx | Editorial State Machine | Direct transition from `draft` to `published` is strictly rejected |
| **CONC-REG** | `newsroom-concurrency.test.ts` | Vitest | Optimistic Locking | Stale signal mutation with outdated version returns `HTTP 409 Conflict` |
| **CORR-REG** | `cross-system-corrections.test.ts`| Vitest | Public Corrections Pipeline | Reader correction emits `correction:published` and updates story errata |
| **PROP-REG** | `change-propagation.test.ts` | Vitest | Source Invalidation | Modified source flags all dependent claims as `needs_verification` |
| **ROLE-REG** | `editorial-roles.test.ts` | Vitest | Editorial Authority Matrix | Reporter cannot approve; Editor cannot publish without Gold Standard audit |

---

### Detailed Test Invariant Definitions

#### 1. GATE-REG: Fail-Closed Publication Gate
```typescript
it('GATE-REG-01: Rejects publication when claims are absent', () => {
  const story = createMockStory({ claims: [], status: 'scheduled' });
  const result = validateStoryForPublication({ storyId: story.id, scheduleId: 's1' }, story);
  expect(result.passed).toBe(false);
  expect(result.checks.find(c => c.name === 'has_claims')?.passed).toBe(false);
});

it('GATE-REG-02: Rejects publication when gold standard audit has unresolved blockers', () => {
  const audit = createDefaultGoldStandardAudit('story-1');
  audit.phases.phase7DefensibilityAudit.blockingIssues = ['Unverified claim regarding casualty count'];
  const story = createMockStory({ goldStandardAudit: audit, status: 'scheduled' });
  const result = validateStoryForPublication({ storyId: story.id, scheduleId: 's1' }, story);
  expect(result.passed).toBe(false);
});
```

#### 2. AUTH-REG: API Publication Lockdown (P0)
```typescript
it('AUTH-REG-01: Rejects unauthenticated story creation on /api/v1/stories', async () => {
  const res = await fetch('http://localhost:3000/api/v1/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Unauthenticated Story', status: 'published' })
  });
  expect([401, 403]).toContain(res.status);
});

it('AUTH-REG-02: Rejects unauthorized status=published on /api/v2/stories', async () => {
  const session = createReporterSession(); // Reporter role, not editor
  const res = await callV2StoriesPost(session, { title: 'Reporter Story', status: 'published' });
  expect(res.status).toBe(403);
  expect(res.error).toMatch(/forbidden: editor role required to publish/i);
});
```

#### 3. SRC-REG: Source Reference Integrity (F-12)
```typescript
it('SRC-REG-01: Enforces that 100% of published sources resolve in canonical registry', () => {
  const inventory = runSourceIntegrityScan();
  expect(inventory.unresolvedSourceIds).toBe(0);
  expect(inventory.errors.length).toBe(0);
});
```

#### 4. STATE-REG: State Machine Invariant
```typescript
it('STATE-REG-01: Blocks illegal direct jump from draft to published', () => {
  const record = createEditorialRecord({ currentStage: 'draft' });
  const result = transitionEditorialState(record, 'published', 'editor-1', 'editor');
  expect(result.success).toBe(false);
  expect(result.error).toMatch(/Invalid transition from draft to published/);
});
```

#### 5. CONC-REG: Concurrency & Idempotency
```typescript
it('CONC-REG-01: Throws 409 conflict when mutation version is stale', async () => {
  const signal = newsroomIntelligenceCore.getSignal('sig-test-1');
  const res = await newsroomIntelligenceCore.executeAction({
    signalId: 'sig-test-1',
    action: 'VERIFY',
    actorId: 'editor-1',
    actorName: 'Editor One',
    expectedVersion: signal.version - 1 // Stale version
  }, 'editor');
  expect(res.error).toMatch(/Version conflict/);
});
```

#### 6. PROP-REG: Change Propagation
```typescript
it('PROP-REG-01: Retracted source triggers review tasks for dependent stories', async () => {
  const source = sourceRegistry.getSource('s1')!;
  const diffResult = await changeDetector.compare(source, { ...source, status: 'retracted' });
  const tasks = await impactAnalyzer.analyze(diffResult);
  
  expect(tasks.length).toBeGreaterThan(0);
  expect(tasks[0].affectedContent.stories).toContain('kl-ch-1');
});
```

---

### Command Execution Script for CI/CD

To guarantee zero regression in GitHub Actions or GitLab CI, these tests must execute in the unified pipeline:

```bash
# 1. Typecheck and Lint
npm run check:type
npm run check:lint

# 2. Source Integrity Fail-Closed Gate
npx tsx scripts/check-source-integrity.ts --fail-on-error

# 3. Newsroom Smoke and Concurrency Tests
npm run smoke:newsroom
npx vitest run tests/newsroom-concurrency-idempotency.test.ts

# 4. Publication Gate and Editorial State Machine
npx tsx tests/editorial-operating-system.test.ts
npx tsx tests/editorial-calendar-worker.test.ts

# 5. Cross-System Corrections & Event Bus
npx vitest run tests/vs8-cross-system-corrections.test.ts
```
