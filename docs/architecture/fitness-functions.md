# Architectural Fitness Functions

Fitness functions are repeatable checks that verify the architecture still conforms to its contracts. Unlike ACPs (which evaluate proposed changes) or ADRs (which record past decisions), fitness functions continuously validate that the platform's invariants hold.

These are permanent architectural expectations, not release-specific checklists.

---

## 1. Canonical Integrity

**Contract:** Canonical objects are the only source of truth.

| Check | Method | Frequency |
|-------|--------|-----------|
| No duplicate canonical objects | Code review: no parallel persistence models | Every PR |
| No competing schemas | `types/canonical.ts` is the single type authority | Every build |
| Problems derive from Fixes | `extractProblems()` uses only Fix data | Every test run |
| Search index matches canonical types | `SearchIndexEntry` type covers all indexed entities | Every build |

**Failure mode:** Two surfaces hold the same data and eventually disagree.

---

## 2. Knowledge Graph Integrity

**Contract:** Relationships are governed and traversable.

| Check | Method | Frequency |
|-------|--------|-----------|
| No orphaned published entities | Every public slug is in its type's public set | Every build |
| All declared relationships resolve | `relatedStoryIds` slugs exist in store | Every test run |
| No broken public graph edges | Graph traversal completes without dead ends | Before every release |
| Fix→Story links are bidirectional | `fix.storySlug` points to a real story | Every test run |
| Problem→Fix links resolve | `extractProblems()` produces valid fix references | Every test run |

**Failure mode:** Reader clicks a relationship link and gets a 404.

---

## 3. Reader Journey Integrity

**Contract:** Core reader journeys remain functional after every release.

| Check | Method | Frequency |
|-------|--------|-----------|
| Story → Fix journey works | `NextExploration` renders related Fixes | Every test run |
| Fix → Story journey works | `FixHeroStrip` renders "Read Story" when `storySlug` exists | Every build |
| Problem → Fix journey works | `RelatedFixGrid` renders linked Fixes | Every test run |
| Search returns Problems | Problems indexed in search pipeline | Every build |
| Navigation links resolve | Header, footer, homepage links point to valid routes | Every build |
| No navigation dead ends | Every route has at least one inbound link | Before every release |

**Failure mode:** Reader follows a journey and encounters a dead end.

---

## 4. Trust Integrity

**Contract:** Trust state is explicit and consistent.

| Check | Method | Frequency |
|-------|--------|-----------|
| Every Fix has a trust state | TrustStateIndicator computes from `maturityStatus` + `evidenceGrade` | Every build |
| Trust state matches data | `expert_reviewed` + `High` → Verified; `pilot` → In Development | Every test run |
| Empty sourceIds show graceful degradation | TrustCard renders "Under editorial review" not "0" | Every build |
| No misleading defaults | Missing fields fall through to honest state, not fake verification | Every build |

**Failure mode:** Reader sees "Verified" on incomplete data or "0 sources" on work-in-progress.

---

## 5. Compatibility Integrity

**Contract:** Changes to frozen baselines follow the compatibility process.

| Check | Method | Frequency |
|-------|--------|-----------|
| Frozen schemas unchanged without ACP | `types/canonical.ts` diff against baseline | Before every release |
| Frozen navigation unchanged without ACP | Route diff against baseline | Before every release |
| Breaking changes trigger new baseline | Level C changes produce a new git tag | Every release |
| Version semantics followed | Patch/minor/major align to change type | Every release |

**Failure mode:** Silent breaking changes invalidate existing content or reader models.

---

## Running Fitness Functions

### Automated (every build/test)

These checks run as part of `npx tsc --noEmit` and `npx vitest run`:

- TypeScript compilation (canonical type consistency)
- Test suite (graph relationships, trust states, journey logic)
- Build success (navigation routes resolve)

### Semi-automated (before every release)

These require a human spot-check but follow a repeatable process:

- Knowledge graph sample (10 objects per type)
- Reader journey walkthrough (5 representative paths)
- Trust state verification (all Fixtures checked)

### Manual (before every baseline)

These are architectural reviews that require judgment:

- Baseline Review (is a new baseline needed?)
- ACP review (does the proposal respect contracts?)
- ADR update (should this decision be recorded?)

---

## Adding New Fitness Functions

When a new fitness function is needed:

1. Identify the contract it protects
2. Define the check (what to verify)
3. Define the method (how to verify)
4. Define the frequency (when to verify)
5. Add it to this document

Fitness functions are living expectations. They grow as the architecture grows.
