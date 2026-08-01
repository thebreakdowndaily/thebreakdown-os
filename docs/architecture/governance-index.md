# Governance Index

**Version:** 1.0

**Status:** Active

**Date:** 28 July 2026

**Purpose:** Map every constitutional principle to its single authoritative source. When a principle appears in multiple documents, this index identifies which document governs it. Contributors amend principles in the authoritative document only. Other documents may reference but not redefine.

**Maintenance:** Updated whenever a governance document is amended. The amendment must update this index simultaneously.

---

## How to Use This Index

**If you are amending a principle:** Find it here. Amend it in the authoritative document. Update this index if the amendment changes the principle's scope or location.

**If you are implementing a feature:** Check the authoritative document for the governing principle. This index tells you where to find the rule. The implementation document tells you how to apply it.

**If you find a principle in two documents:** This index resolves the conflict. The authoritative document governs. The other document references.

---

## Governance Documents

| Document | Level | Owns | Does Not Own |
|----------|-------|------|-------------|
| **Editorial Constitution** | 1 (Supreme) | Editorial truth, evidence methodology, publishing standards, claims, neutrality, historiography, language, visuals, quality gates, corrections, institutional memory | Reader experience, engineering architecture, visual design |
| **AGENTS.md** | 2 | Engineering workflows, architecture rules, component standards, performance, security, testing, git workflow, platform beta rules, CTO directives | Editorial standards, reader experience principles, visual design |
| **NOS Volume III** | 3 | Reader experience principles, narrative architecture, navigation, learning, AI experience, recommendations, anti-patterns, certification, accessibility experience, motion philosophy | Editorial methodology, canonical data models, engineering implementation |
| **Narrative Experience Architecture** | 3 | Design philosophy: reader psychology, emotional arc mapping, tension resolution, non-engagement metrics, minimal design extensions, Journey-as-playlist abstraction | Canonical data models, engineering implementation, navigation rules, certification framework |
| **NOS Volume I / VXS** | 3 | Visual design system, component library, interaction patterns, design tokens | Editorial standards, narrative principles, engineering architecture |
| **Baseline v1.0.0-chapter1** | 3 | Architectural contracts, frozen schemas, compatibility levels, version semantics, graph integrity | Editorial standards, reader experience, visual design |

---

## Principle Index

### Editorial Principles (Authoritative: Editorial Constitution)

| Principle | Authoritative Location | Also Appears In | Resolution |
|-----------|----------------------|-----------------|------------|
| Evidence before conclusions | Preamble, L63 | NOS Vol III §I.4 (The Irreducible Principle) | Editorial Constitution governs evidence methodology. NOS Vol III governs how that principle is expressed in narrative. |
| Truth over speed | Art. I, L83 | AGENTS.md (E5: improve Trust) | Editorial Constitution defines the editorial rule. AGENTS.md defines the engineering consequence. |
| Evidence over opinion | Art. I, L86 | NOS Vol III §V.4 (Evidence layers) | Editorial Constitution governs evidence hierarchy. NOS Vol III governs how evidence is presented in stories. |
| Context over virality | Art. I, L89 | NOS Vol III §XXIV (Anti-patterns) | Editorial Constitution defines the principle. NOS Vol III defines the implementation prohibition. |
| Transparency over certainty | Art. I, L92 | NOS Vol III §IX.5 (AI transparency) | Editorial Constitution governs editorial transparency. NOS Vol III governs AI transparency. |
| Revision over ego | Art. I, L95 | NOS Vol III §VI.3–4 (Investigation updates) | Editorial Constitution governs correction philosophy. NOS Vol III governs how revisions appear to readers. |
| Multiple perspectives | Art. I, L98 | NOS Vol III §V.6 (Counterargument) | Editorial Constitution mandates the principle. NOS Vol III mandates its narrative expression. |
| Knowledge is never finished | Art. I, L101 | NOS Vol III §XIV.7 (Verification status) | Editorial Constitution defines the lifecycle principle. NOS Vol III defines the reader-facing display. |
| Evidence Hierarchy (7 levels) | Art. III, L162 | — | Editorial Constitution only. |
| Evidence Spine | Art. III, L207 | NOS Vol III §V.4 (Evidence layers) | Editorial Constitution defines the spine. NOS Vol III governs how the spine is rendered in stories. |
| Claim fields (9 required) | Art. IV, L248 | — | Editorial Constitution only. |
| Confidence Scores (5 levels) | Art. IV, L262 | NOS Vol III §XIV.5 (Confidence indicators) | Editorial Constitution defines the scoring model. NOS Vol III governs how scores are displayed. |
| Four-Layer Structure | Art. V, L319 | NOS Vol III §II.4 (Understanding layers) | Editorial Constitution defines the layers. NOS Vol III defines how layers are experienced. |
| Neutrality rules | Art. V, L335 | — | Editorial Constitution only. |
| Historiography Constitution | Art. VI, L351 | — | Editorial Constitution only. |
| Prohibited words (9) | Art. VII, L366 | — | Editorial Constitution only. |
| Visual Constitution (8 requirements) | Art. VIII, L399 | NOS Vol III §XVI (Data experience) | Editorial Constitution governs visual evidence. NOS Vol III governs data visualisation experience. |
| Knowledge Object requirements | Art. IX, L423 | AGENTS.md (E9–10: Knowledge First) | Editorial Constitution defines the Knowledge Object. AGENTS.md defines the engineering pattern. |
| Editorial workflow (10 stages) | Art. X, L447 | — | Editorial Constitution only. |
| Gold Standard Review (7 phases) | Art. XI, L496 | — | Editorial Constitution only. |
| Freshness states (6) | Art. XII, L522 | — | Editorial Constitution only. |
| Semantic versioning | Art. XII, L556 | AGENTS.md (Version Semantics) | Editorial Constitution governs knowledge versioning. AGENTS.md governs architecture versioning. |
| Quality Gates (12) | Art. XIV, L645 | — | Editorial Constitution only. |
| Trust Score composition | Art. XIV, L668 | — | Editorial Constitution only. |
| Transparency metadata (10 fields) | Art. XIII, L620 | NOS Vol III §XIV.7 (Verification status) | Editorial Constitution defines what metadata exists. NOS Vol III defines how it is displayed. |
| Corrections policy | Art. II, L114 | NOS Vol III §XVIII.2 (Corrections) | Editorial Constitution governs correction methodology. NOS Vol III governs the reader-facing correction experience. |
| Conflicts of interest | Art. II, L108 | — | Editorial Constitution only. |
| Sponsored content prohibition | Art. II, L126 | — | Editorial Constitution only. |
| AI usage policy | Art. II, L132 | NOS Vol III §IX (AI Experience) | Editorial Constitution governs AI editorial policy. NOS Vol III governs AI interaction design. |
| Plagiarism prohibition | Art. II, L139 | — | Editorial Constitution only. |
| Attribution requirements | Art. II, L151 | — | Editorial Constitution only. |

### Engineering Principles (Authoritative: AGENTS.md)

| Principle | Authoritative Location | Also Appears In | Resolution |
|-----------|----------------------|-----------------|------------|
| Infrastructure Ban | §Platform Beta Rules, L589 | — | AGENTS.md only. |
| Experience Rule (5-minute test) | §Platform Beta Rules, L603 | — | AGENTS.md only. |
| One Capability Per Sprint | §Platform Beta Rules, L609 | — | AGENTS.md only. |
| Understanding Metrics | §Platform Beta Rules, L615 | NOS Vol III §XII (Learning) | AGENTS.md defines what metrics to track. NOS Vol III defines the learning experience those metrics measure. |
| Component size limits (250/300/500/1000) | §Component Rules, L191 | — | AGENTS.md only. |
| TypeScript strict mode | §TypeScript Rules, L283 | — | AGENTS.md only. |
| Server Components preferred | §Performance Rules, L237 | — | AGENTS.md only. |
| State management hierarchy | §State Management, L307 | — | AGENTS.md only. |
| Services own business logic | §Services, L329 | — | AGENTS.md only. |
| Never commit secrets | §Security, L359 | — | AGENTS.md only. |
| SEO requirements | §SEO, L375 | — | AGENTS.md only. |
| Testing requirements | §Testing, L393 | — | AGENTS.md only. |
| Git workflow | §Git Workflow, L452 | — | AGENTS.md only. |
| PR size (<500 lines) | §Pull Request Rules, L438 | — | AGENTS.md only. |
| Refactoring rules (incremental) | §Refactoring Rules, L539 | — | AGENTS.md only. |
| Implementation Traceability | §Implementation Traceability, L569 | — | AGENTS.md only. |
| Architecture rules (Do NOT list) | §Architecture Rules, L165 | — | AGENTS.md only. |
| Canonical source of truth | §Canonical Source of Truth, L147 | — | AGENTS.md only. |
| Design system (use existing primitives) | §Design System, L259 | — | AGENTS.md only. |
| Analytics (PluginAnalyticsService) | §Analytics, L337 | — | AGENTS.md only. |
| Accessibility (WCAG AA minimum) | §Accessibility Rules, L213 | NOS Vol III §XIX (AAA target) | AGENTS.md sets the engineering minimum (AA). NOS Vol III sets the experience aspiration (AAA). Both apply — AA is the floor, AAA is the goal. |
| Definition of Done | §Definition of Done, L409 | — | AGENTS.md only. |
| Sprint Completion Principle | §Sprint Completion, L426 | — | AGENTS.md only. |
| Review Philosophy (4 questions) | §Review Philosophy, L556 | — | AGENTS.md only. |
| Documentation requirements | §Documentation, L488 | — | AGENTS.md only. |
| AI Instructions (pre-modification checklist) | §AI Instructions, L506 | — | AGENTS.md only. |
| Platform Beta: Can a reader notice? | §Core Governance, L11 | — | AGENTS.md only. |
| Version semantics (patch/minor/major) | §Version Semantics | — | AGENTS.md only. |
| ACP process (Level A/B/C) | §Architecture Change Process | — | AGENTS.md only. |
| Fitness functions (20 checks) | `fitness-functions.md` | — | Architecture documents only. |

### Narrative Experience Principles (Authoritative: NOS Volume III)

| Principle | Authoritative Location | Also Appears In | Resolution |
|-----------|----------------------|-----------------|------------|
| Narrative emerges from evidence | §I.4 (The Irreducible Principle) | Editorial Constitution (Evidence Standard); Narrative Experience Architecture §1 | NOS Vol III governs narrative expression. Editorial Constitution governs evidence methodology. Narrative Experience Architecture provides the design philosophy. |
| Reader is investigator, not customer | §I.2 | — | NOS Vol III only. |
| Inevitability vs. manipulation tension | §I.4 (⚠ Tension callout) | Narrative Experience Architecture §1 (⚠ Tension) | Same principle, same resolution. NOS Vol III provides the constitutional statement. Narrative Experience Architecture provides the design rationale. |
| Transportation vs. critical resistance tension | §I.4 (⚠ Tension callout) | Narrative Experience Architecture §2 (Green & Brock) | NOS Vol III provides the rule. Narrative Experience Architecture provides the research grounding. |
| Reader psychology model | §2.5 | Narrative Experience Architecture §2 | Same principle, same research. NOS Vol III integrates as constitutional requirement. Narrative Experience Architecture provides the full design rationale. |
| First screen must teach | §II.1 | — | NOS Vol III only. |
| Understanding layers (4) | §II.4 | Editorial Constitution (Four-Layer Structure) | Same principle, different domains. Editorial Constitution defines the layers analytically. NOS Vol III defines how they are experienced. |
| Homepage never contains engagement bait | §III.3 | — | NOS Vol III only. |
| Story World = bounded investigation | §IV.1 | — | NOS Vol III only. |
| Story Worlds organised by questions | §IV.2 | — | NOS Vol III only. |
| Story = investigation blueprint | §V.1 | — | NOS Vol III only. |
| Every story declares its question | §V.3 | Editorial Constitution (Claim rules: specific assertions) | Editorial Constitution requires specific claims. NOS Vol III requires the question to be visible to readers. |
| Counterargument required | §V.6 | Editorial Constitution (Art. IV, L293: Evidence Challenges) | Editorial Constitution mandates the editorial requirement. NOS Vol III mandates the narrative expression. |
| Emotional arc templates (Investigation + Policy) | §5.11 | Narrative Experience Architecture §4 (⚠ Tension + two arcs) | Same principle, same resolution. NOS Vol III provides the constitutional template. Narrative Experience Architecture provides the design reasoning and tension callout. |
| Uncertainty section required | §V.9 | Editorial Constitution (Art. I: Transparency over certainty) | Same principle, different domain. |
| Investigation lifecycle | §VI.1 | — | NOS Vol III only. |
| Knowledge Graph explains, not overwhelms | §VII.1 | — | NOS Vol III only. |
| Search is inquiry, not retrieval | §VIII.1 | — | NOS Vol III only. |
| AI bounded by canonical claims | §IX.1 | Editorial Constitution (Art. II: AI usage) | Editorial Constitution governs AI editorial policy. NOS Vol III governs AI interaction design. |
| AI must never hallucinate | §IX.3 | Editorial Constitution (Art. II: AI must never fabricate) | Same principle, different domain. Editorial Constitution governs editorial consequences. NOS Vol III governs design consequences. |
| AI Red Line: say when outside knowledge base | §IX.6 | — | NOS Vol III only. |
| Reader memory stops at surveillance | §X.3 | — | NOS Vol III only. |
| Navigation is explanation | §XI.1 | — | NOS Vol III only. |
| No dead ends | §XI.3 | — | NOS Vol III only. |
| Platform is a learning system | §XII.1 | — | NOS Vol III only. |
| Learning paths editorially curated | §XII.2 | — | NOS Vol III only. |
| Annotation = rigorous as evidence | §XIII.1 | — | NOS Vol III only. |
| Private annotations encrypted | §XIII.6 | — | NOS Vol III only. |
| Evidence experience as rich as narrative | §XIV.1 | — | NOS Vol III only. |
| Provenance chains fully visible | §XIV.6 | — | NOS Vol III only. |
| Comparison: no rankings | §XV.4 | — | NOS Vol III only. |
| Data needs narrative bridge | §XVI.7 | — | NOS Vol III only. |
| Charts: colour never sole meaning | §XVI.3 | — | NOS Vol III only. |
| Maps: disputed boundaries dashed | §XVI.4 | — | NOS Vol III only. |
| Statistics: never without uncertainty | §XVI.6 | — | NOS Vol III only. |
| Recommendations from evidence, not engagement | §XVII.1 | Narrative Experience Architecture §12 (⚠ Tension) | Same principle, same resolution. NOS Vol III provides the constitutional rule. Narrative Experience Architecture provides the design rationale and tension callout. |
| Community: evidence quality > contributor identity | §XVIII.2 | — | NOS Vol III only. |
| Expert disagreement valued more than agreement | §XVIII.4 | — | NOS Vol III only. |
| Accessibility = constitutional requirement | §XIX.1 | AGENTS.md (E18: WCAG AA minimum) | NOS Vol III sets the aspiration (AAA). AGENTS.md sets the engineering floor (AA). Both apply. |
| Screen reader navigation complete | §XIX.2 | — | NOS Vol III only. |
| Keyboard-only interaction | §XIX.3 | — | NOS Vol III only. |
| Reduced motion respected | §XIX.5 | — | NOS Vol III only. |
| Offline reading = constitutional | §XIX.9 | — | NOS Vol III only. |
| Mobile adapts without shallowing | §XX.1 | Narrative Experience Architecture §15 (⚠ Tension) | Same principle. Narrative Experience Architecture adds the specific tension: cinematic transitions and parallax are performance risks on mobile; pacing and typography achieve documentary feeling without motion cost. |
| Every animation must teach | §XXI.1 | Narrative Experience Architecture §14 | Same principle. Narrative Experience Architecture provides the design test: every animation must teach, or it does not ship. |
| Motion forbidden: decorative, urgency, vestibular | §XXI.3 | — | NOS Vol III only. |
| Narrative grammar (10 primitives) | §XXII.2 | — | NOS Vol III only. |
| Narrative rhythm: density alternates | §XXIII.3 | — | NOS Vol III only. |
| Anti-patterns (10 blacklisted) | §XXIV.2 | — | NOS Vol III only. |
| Certification framework (11 areas) | §XXV.2 | — | NOS Vol III only. |
| Future evolution: principles scale-invariant | §XXVI.1 | — | NOS Vol III only. |
| Understanding metrics (6 non-engagement) | §26.8 | Narrative Experience Architecture §20 | Same principle, same metrics. NOS Vol III integrates as constitutional requirement. Narrative Experience Architecture provides the design rationale for each metric. |
| Structuring vs. persuasion | Certification statement | Narrative Experience Architecture closing | Same principle. Narrative Experience Architecture provides the formulation: "narrative as structuring device, never persuasion technique." NOS Vol III integrates as the closing constitutional principle. |

---

## Overlap Map

These principles appear in multiple documents. The table above resolves which is authoritative. This section highlights the most significant overlaps for quick reference.

### Evidence Governance

| Principle | Editorial Constitution | NOS Vol III | Resolution |
|-----------|----------------------|-------------|------------|
| Evidence Standard | Defines the standard | Implements in narrative | Editorial Constitution governs |
| Confidence model | Defines 5 levels | Displays to readers | Editorial Constitution governs display rules |
| Evidence Spine | Defines the chain | Renders in stories | Editorial Constitution governs methodology |
| Uncertainty | Requires acknowledgment | Requires section in stories | Both apply — editorial requirement + narrative expression |

### AI Governance

| Principle | Editorial Constitution | NOS Vol III | AGENTS.md | Resolution |
|-----------|----------------------|-------------|-----------|------------|
| AI usage policy | Defines editorial rules | Defines interaction design | Defines engineering layer | Three documents, three domains, one principle |
| AI must not fabricate | Editorial consequence | Design consequence | Engineering consequence | Editorial Constitution governs editorial, NOS Vol III governs design, AGENTS.md governs code |

### Accessibility

| Principle | AGENTS.md | NOS Vol III | Resolution |
|-----------|-----------|-------------|------------|
| WCAG compliance | Sets AA minimum (engineering) | Sets AAA aspiration (experience) | Both apply — AA is floor, AAA is goal |
| Keyboard navigation | Engineering implementation | Experience principle | AGENTS.md governs how, NOS Vol III governs why |
| Screen readers | Engineering implementation | Experience principle | AGENTS.md governs how, NOS Vol III governs why |

### Transparency

| Principle | Editorial Constitution | NOS Vol III | Resolution |
|-----------|----------------------|-------------|------------|
| Transparency metadata | Defines 10 required fields | Defines how displayed | Editorial Constitution governs what, NOS Vol III governs how |
| Corrections | Defines methodology | Defines reader experience | Editorial Constitution governs process, NOS Vol III governs presentation |
| Version history | Defines versioning system | Defines reader-facing version display | Editorial Constitution governs the system, NOS Vol III governs the UI |

### Narrative Experience (NOS Vol III ↔ Narrative Experience Architecture)

| Principle | NOS Vol III | Narrative Experience Architecture | Resolution |
|-----------|-------------|-----------------------------------|------------|
| Reader psychology | §2.5 (constitutional requirement) | §2 (full design rationale with research citations) | NOS Vol III governs as constitutional rule. Narrative Experience Architecture provides the research grounding and design reasoning. |
| Emotional arc templates | §5.11 (two templates as constitutional requirement) | §4 (tension callout + design rationale for why one arc fails for trauma content) | Same principle, same resolution. NOS Vol III provides the rule. Narrative Experience Architecture provides the tension callout and design reasoning. |
| Inevitability vs. manipulation | §I.4 (⚠ tension callout) | §1 (⚠ tension with resolution) | Same principle, same resolution. NOS Vol III integrates the tension. Narrative Experience Architecture originated the formulation. |
| Transportation vs. critical resistance | §I.4 (⚠ tension callout) | §2 (Green & Brock research) | NOS Vol III provides the constitutional rule. Narrative Experience Architecture provides the research grounding. |
| Understanding metrics | §26.8 (6 metrics as constitutional requirement) | §20 (design rationale for each metric) | NOS Vol III governs as constitutional requirement. Narrative Experience Architecture provides the design rationale for why each metric matters. |
| Structuring vs. persuasion | Certification statement (closing principle) | Closing note (formulation) | Same principle. Narrative Experience Architecture originated the "structuring device, never persuasion technique" formulation. NOS Vol III integrates as closing constitutional principle. |
| Recommendations from evidence | §XVII.1 (constitutional rule) | §12 (⚠ tension + three-signal priority) | NOS Vol III governs the rule. Narrative Experience Architecture provides the tension callout and the specific three-signal priority ordering. |
| Mobile narrative | §XX.1 (constitutional rule) | §15 (⚠ tension: cinematic transitions are performance risks) | Same principle. Narrative Experience Architecture adds the specific performance tension for mobile. |
| Animation must teach | §XXI.1 (constitutional rule) | §14 (design test) | Same principle. Narrative Experience Architecture provides the concrete design test. |
| AI bounded by Claim Registry | §IX.1 (constitutional rule) | §17 (design rationale: unregistered fact = unreviewed AI authorship) | NOS Vol III governs the rule. Narrative Experience Architecture provides the strongest formulation of why this matters. |

---

## Maintenance Protocol

1. **When amending a governance document:** Check this index for overlapping principles. Update the index entry for any changed principle.

2. **When adding a new principle:** Add it to the appropriate governance document. Add an entry to this index. Check for overlaps with existing principles.

3. **When resolving a conflict:** This index is the tiebreaker. The authoritative document governs. If a conflict exists between documents at the same level, the more specific document governs.

4. **Review schedule:** This index is reviewed whenever any governance document is amended, and quarterly as a standing review.
