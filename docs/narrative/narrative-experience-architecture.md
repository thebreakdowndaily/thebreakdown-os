# Narrative Experience Architecture

**Version:** 1.0

**Status:** Ratified

**Date:** 28 July 2026

**Authority:** Narrative Architecture Council

**Scope:** Design philosophy for the narrative experience layer — reader psychology, emotional mapping, tension resolution, success metrics, and minimal design extensions.

**Relation to Higher Authority:** This document operates under the Editorial Constitution (Level 1) and AGENTS.md (Level 2). Where this document conflicts with the Editorial Constitution on editorial matters, the Editorial Constitution takes precedence.

**Relation to Peer Documents:** This document is a peer to NOS Volume III (Website Experience Constitution). NOS Vol III provides the constitutional breadth — navigation, search, learning, annotation, accessibility, anti-patterns, certification. This document provides the design depth — reader psychology, emotional arc mapping, tension callouts, and non-engagement metrics — that the constitutional breadth requires for grounded implementation. Where the two documents address the same principle, the more specific provision governs.

**Provenance:** This document originated as a Chapter 2 design philosophy brief. It was ratified as a governance document by the Narrative Architecture Council on 28 July 2026.

---

# The Breakdown — Narrative Experience Architecture
### From Knowledge Platform to Narrative Intelligence Platform

*A design philosophy document. No code, no components, no implementation specs — per the brief.*

---

## How to Read This Document

Chapter 1 is treated as frozen and correct throughout: the Claim Registry, the Evidence Registry, the seven-level evidence hierarchy, the five confidence scores, the three-layer claim structure (Documented Fact / Historical Interpretation / Editorial Synthesis), and the Explorer/Scholar/Researcher reading modes are never redesigned below — they're the material the narrative layer works *with*.

Where a narrative-design idea creates real tension with the evidence-first mission — and a few genuinely do — I've flagged it inline as **⚠ Tension** rather than smoothing it over. A creative director who only says yes isn't protecting the thing that makes this platform worth building in the first place. These flags are short by design; none of them are reasons not to proceed, they're reasons to proceed carefully.

---

## 1. Narrative Philosophy

The core move is this: **stop organizing the platform around content types (Stories, Topics, Fixes) and start organizing it around the reader's question.** Content types don't disappear — they become the *materials* a narrative arc is built from, the way a documentary is built from footage, interviews, and archival material without the audience ever thinking in those categories.

The one-sentence philosophy: **The Breakdown doesn't publish answers. It stages an investigation the reader completes themselves, using real evidence, and the platform's job is to make that investigation feel inevitable rather than effortful.**

This is compatible with — not opposed to — the evidence-first mission, on one condition: **narrative momentum must always be earned by evidence arriving, never manufactured by withholding it.** A documentary that cuts away from the expert interview to build suspense is doing legitimate craft. A platform that delays showing a reader the confidence score on a claim in order to keep them scrolling is doing something the Editorial Constitution already prohibits in spirit ("transparency over certainty," "context over virality"). Every principle below is built to produce the first kind of momentum, not the second.

**⚠ Tension:** "The reader journey should feel inevitable" (from the source prompt) is a beautiful design goal and a risky one to take literally. Inevitability is exactly what curiosity-gap-driven engagement design (autoplay, infinite scroll, algorithmic feeds) also produces — and this platform's own Editorial Constitution explicitly rejects optimizing for anything but understanding. The resolution: inevitability should come from the *logic of the evidence* (this claim raises an unresolved question, which the next claim happens to address), not from UI mechanics that make leaving feel effortful. If a reader can't close the tab easily, that's a dark pattern regardless of how good the writing is.

---

## 2. Reader Psychology Model

Three bodies of research should govern this layer, alongside the cognitive-load and curiosity-gap research already used to justify Chapter 1's structure:

**Narrative transportation** (Green & Brock): readers who become "transported" into a story process it with *less* critical resistance to the claims embedded in it — this is well-documented, and it's exactly why narrative is persuasive. For a news outlet, that's a feature. **For an evidence-first institution, that's a risk that has to be designed around, not just enjoyed.** The practical implication: every narrative arc needs at least one deliberate *friction beat* — a moment that explicitly invites skepticism ("Here's the strongest argument against what you just read") — placed at or near peak transportation, not after it's worn off. The existing Counterarguments and "Historians ask..." sections in Chapter 1 are already this beat; the narrative layer's job is to make sure they land at the emotionally right moment, not just the structurally correct one.

**Flow** (Csikszentmihalyi): flow requires a match between challenge and skill, and breaks the moment either outpaces the other. This is the strongest research grounding for keeping the Explorer/Scholar/Researcher reading-mode toggle central and prominent — it's a skill-selector, and the narrative layer should read a reader's chosen mode as a contract about how much friction and depth they've opted into, not just a formatting preference.

**Curiosity as an information gap, not a mystery box** (Loewenstein, already implicit in Chapter 1's design): the difference matters more here than anywhere else in this document. A mystery box withholds the answer to create anxiety; an information gap poses a real, specific, answerable question. Every "hook" in this narrative system must be the latter — a chapter should never open with rhetorical vagueness ("What really happened in 1947?") when it can open with the specific, falsifiable question the chapter actually investigates ("Was Partition avoidable, or did the Cabinet Mission Plan's collapse make it inevitable?").

---

## 3. Experience Principles

1. **Every narrative beat is anchored to a real canonical object.** A "discovery" moment in the story arc is a reader encountering an actual Claim card with its actual confidence score — not a narrator's assertion dressed up as a reveal. If a beat in the arc can't point to a Claim ID, Evidence entry, or Document, it doesn't belong on an evidence-first platform, however good it would feel dramatically.
2. **Curiosity is resolved by evidence, never by authority.** The payoff for "why did Partition happen" is the six-school comparison and the reader's own weighing of it — never a single confident sentence that closes the question. This is already how Chapter 1 works; the narrative layer's job is to make that structure feel like a satisfying answer rather than a homework assignment.
3. **No dead ends, but no manufactured momentum.** Every chapter already ends with Reflection and Continue Learning. The narrative work is to make the *reason* for the next step visible — surfaced from the reader's own unresolved question, not a generic "you might also like."
4. **The reader is addressed as an investigator, not sold to as a customer.** Second-person orientation copy ("You're investigating why Partition happened") is fine and good; manufactured urgency, fake scarcity, or engagement-bait phrasing is not, and would contradict the Editorial Constitution's ban on false certainty and virality-optimization.
5. **Depth is chosen, never assumed.** The Explorer/Scholar/Researcher toggle is the contract for how much narrative scaffolding a given reader wants; Explorer mode carries more narrative framing per unit of evidence, Researcher mode carries less framing and more direct evidence density. This is the cleanest way to satisfy both "make it feel like a documentary" and "don't patronize a specialist" at once.

---

## 4. Emotional Journey Mapping

The proposed arc — Curiosity → Confusion → Discovery → Understanding → Reflection → Hope → Action — is a genuinely good template for **one entire family of content: policy and current-issue chapters** (EV Paradox, Electoral Bonds, Income Inequality). It is the wrong template, unmodified, for **historical-trauma chapters** (Partition, Kashmir), and forcing it there would be a real editorial mistake.

**⚠ Tension:** An arc that mandates "Hope" and "Action" beats after a chapter on Partition's death toll and gendered violence would be tone-deaf at best, and would read as manufactured uplift bolted onto atrocity at worst — exactly the kind of thing a serious reader (or a hostile reviewer) would flag immediately. Mass-violence and trauma content should never be pushed toward a resolution the evidence doesn't support.

**Recommendation: two arc templates, not one universal shape.**

- **Investigation Arc** (for unresolved historical/social questions — Partition, Kashmir, the India–China border): Curiosity → Confusion → Discovery → Understanding → **Reflection → Open Questions**. It ends in honest uncertainty, which is itself the correct emotional resting point for content the historiography section already tells us remains contested.
- **Policy Arc** (for The Fix content — EV charging infrastructure, electoral finance reform): Curiosity → Confusion → Discovery → Understanding → Reflection → **Hope → Action**, because these chapters genuinely do end in "here's what's being tried, here's what a reader can look for next" — the Hope/Action beats are earned by the content type, not imposed on it.

Every chapter should declare which arc template it uses as a piece of metadata (a thin authoring choice, not a new canonical object) so the narrative layer never applies the wrong emotional shape to the wrong subject matter.

---

## 5. Complete Information Architecture

The existing top-level objects — Stories, Topics, Investigations, Countries, Organizations, The Fix, Data, Graph — are not replaced. A new, thin layer sits above them: the **Journey** — an ordered sequence of references to existing objects, with narrative framing text bridging each step. A Journey is a *playlist*, not a new canonical content type: it points at existing Stories/Chapters/Fixes, it doesn't duplicate or fork them, and it can be built by editorial curation rather than a new production pipeline.

Example Journey: *"Why is Kashmir still contested?"* → Story (Partition, hook) → Chapter (Kashmir: The First Test) → Topic (India–Pakistan relations) → Reflection → next Journey suggestion ("What did the 1962 war change?").

This respects the "no new canonical objects, no parallel schemas" constraint literally: a Journey's data model is just an ordered array of existing object references plus editorial connective copy — closer to a curated reading list than to a new architectural layer.

**Global navigation** should demote page-type labels ("Stories," "Topics") from primary nav language and promote question-first entry points, while keeping the underlying routes and URLs completely intact for people who arrive via search wanting a specific page directly (search/SEO traffic should never be forced through a narrative on-ramp they didn't ask for — see §9, Search).

---

## 6. Homepage Experience

Replace "Latest Stories / Trending / Topics" framing with a single, honest question: **"What do you want to understand today?"** — followed by 4–6 curated open Journeys (not an algorithmic feed; editorially chosen, exactly as the existing homepage's "Understand Right Now" concept already implies). Each Journey card states its real, specific opening question, not a headline optimized for clicks.

Beneath that: a **"Continue your investigation"** zone for returning readers (pulls from their own reading history, not from what's popular) — this is the one place personalization belongs, because it serves the reader's own stated interest rather than an engagement algorithm's guess.

**⚠ Tension:** the source prompt's line "Present multiple journeys instead of multiple posts" is right in spirit but needs a guardrail: a homepage with only curated Journeys and no plain, sortable list of every published Chapter would make the platform worse for a returning researcher who knows exactly what they want. Keep a secondary, unglamorous "Browse the Library" link visible at all times — narrative framing is for discovery, not for gatekeeping access to the underlying reference material.

---

## 7. Story Experience ("Chapter One" of the reader's arc)

The existing chapter openings are already close to right — the Partition chapter opens with the human scale of the crisis before any interpretation. The narrative layer's job here is sequencing, not rewriting: **move the specific, falsifiable question to the very top, above the Learning Objectives list**, so curiosity is recruited before methodology. Learning Objectives and prerequisites remain — just demoted to "available on request" (a collapsed, one-click-away block) rather than the first thing a curiosity-driven reader has to scroll past.

The Story beat should end at a genuine cliffhanger that is also a true statement of the actual next open question in the evidence — e.g., closing Part I of the Partition chapter on "why did the Cabinet Mission Plan really collapse" is both good narrative craft and an accurate description of where the historiography actually goes next (Part II).

---

## 8. Problem Experience ("Chapter Two")

This maps directly onto material Chapter 1 already contains but doesn't yet foreground as its own beat: the "Why Partition Happened — Competing Explanations" section, the historiography, and the "State of the Evidence" block. The Problem beat's job is to answer *"what is actually happening, mechanically, underneath the story"* — for Partition, that's the six-school causal analysis; for EV Paradox, that would be the supply-chain and infrastructure mechanics behind the battery-import statistic.

The instruction "do not repeat the Story, expand it" is the right test for whether a Problem beat is doing its job: if a reader who skipped the Story beat entirely can still follow the Problem beat and come away understanding the mechanism, it's expanding, not repeating.

---

## 9. Fix Experience ("Chapter Three")

The Fix is structurally just a **Claim about a policy intervention**, which means it should carry the exact same apparatus as every other claim: a confidence score, an evidence hierarchy, named proponents, and — critically — a **counterargument that is a real objection from people who'd be affected or who disagree**, not a token "some critics say." The prompt's own checklist (who proposed it, why, where it's worked, where it's failed, who benefits, who loses, what's uncertain) is essentially a restatement of the existing Claim/Counterargument/Historical-Interpretation structure applied to policy instead of history. Nothing new needs to be invented here — The Fix chapters should simply be held to the identical evidentiary bar as historical chapters, which is not yet obviously the case sitewide.

---

## 10. Comparison Experience ("Chapter Four")

Comparison should be built as a **claim-driven table, not an editorial ranking**: rows are dimensions (evidence, cost, impact, risk, political feasibility, uncertainty), columns are the options being compared, and every cell links to the Claim or Evidence entry that supports it. This is a direct, disciplined application of the Editorial Constitution's own language rules ("no false certainty," "the evidence shows... never the truth is...") to a comparative format that most competitors (FT, Economist, Reuters) don't attempt with this level of claim-level traceability. The platform should never render a "winner" badge, a star rating, or a single aggregate score — the reader assembles the verdict; the platform assembles the evidence.

---

## 11. Reflection System

Chapter 1 already contains the right raw material for this beat — the Kashmir chapter's "Key Questions" and "Common Misconceptions" sections are, functionally, a working Reflection system; they just aren't yet labeled or positioned as a universal, expected closing ritual across every chapter. Formalize it as a mandatory final beat with four fixed prompts: *What did we learn? What surprised the historiography? Which assumptions does the evidence complicate? What remains genuinely uncertain?* — answered in the institution's own editorial voice, never as generic "related articles."

---

## 12. Recommendation Engine Philosophy

**⚠ Tension, stated plainly:** most "recommendation engines" are built to maximize the next click, and that goal is explicitly incompatible with everything else in this document and with the platform's own founding mission ("optimize for understanding... not engagement"). The recommendation logic here should be built from exactly three signals, in this priority order:

1. **The current chapter's own stated Open Questions** — if a chapter ends by naming an unresolved question, the most relevant next Journey is the one that speaks to that specific question.
2. **Shared entities/claims in the Knowledge Graph** — a reader who just read about the Cabinet Mission Plan is well-served by a Journey touching the same claim or entity from a different angle, not by whatever is currently trending.
3. **The reader's own declared learning path**, if they've chosen one — never a black-box collaborative-filtering model trained on aggregate click behavior, which is precisely the mechanism that produces engagement-optimized feeds by default even when nobody intends it to.

---

## 13. Visual Storytelling System

The existing visual apparatus — evidence letter grades (A/B/C/D), full provenance captions, the three-layer color coding — is already unusually disciplined (confirmed in the prior audit of this platform) and should remain the *only* visual language for evidence. The narrative layer adds exactly one new visual element: a slim, persistent **"You are here" arc indicator** (Curiosity → Problem → Evidence → Fix/Reflection) that shows position in the current Journey without competing with or duplicating the evidence-grade system. Two visual languages that both claim to signal "trust" or "importance" would confuse readers faster than either one working alone — this is worth guarding against explicitly during design.

---

## 14. Motion Design Language

Apply the same test used for visuals platform-wide: **every animation must teach something, or it doesn't ship.** A migration-flow map that animates population movement over time is teaching; a parallax hero image that shifts on scroll is not. Motion should be reserved for: (a) sequence and change over time (timelines, migration flows, territorial changes), (b) revealing a relationship (a network diagram resolving from a tangle into a readable structure), and (c) confirming a state change the reader caused (expanding a claim card). It should never be used purely to signal "premium" or "cinematic" — that instinct is exactly how motion becomes decoration, which the platform's own visual-asset policy ("if it does not teach something, it is not included") already prohibits for static images and should apply equally to motion.

---

## 15. Mobile Narrative Experience

**⚠ Tension:** "cinematic transitions" and "parallax" are both real risks on mobile specifically — the prior performance audit of this platform already flagged that its content-dense chapter pages carry real Core Web Vitals risk before any additional motion is layered on. On mobile, the narrative feel should come from **typography, pacing, and copy sequencing** (short paragraphs, one idea per screen, a visible arc-position indicator) rather than from heavy scroll-driven animation, which costs battery and performance disproportionately on the devices most readers will actually use. A documentary feeling is achievable through pacing alone — most great long-form print journalism proves this without any motion at all.

---

## 16. Accessibility Considerations

Scroll-driven storytelling and cinematic transitions are, historically, one of the most reliable ways to accidentally break keyboard navigation, screen-reader landmark structure, and reduced-motion support — this is a well-documented failure pattern in scrollytelling-heavy news sites generally. Every scroll-triggered reveal needs a static, fully-navigable equivalent: a reader using a screen reader or `prefers-reduced-motion` should be able to move through the exact same arc — Curiosity, Problem, Evidence, Reflection — as a plain, linearly-readable document with normal heading structure, with nothing gated behind an animation actually playing.

---

## 17. AI Interaction Philosophy

The proposed conversational layer ("explain this simply," "compare with another country," "challenge this conclusion") is a genuinely good fit for this platform's mission **if, and only if, it is hard-constrained to the existing Claim Registry** — the AI should be able to explain, rephrase, and cross-reference claims that already exist, and should never be able to assert a new fact that isn't already a registered Claim with its own evidence and confidence score. This is a direct extension of the Methodology's existing AI-usage rule ("AI tools assist... but are never the final author... every AI-assisted output is reviewed by a human") into the conversational surface: a chat response that states an unregistered fact is, functionally, unreviewed AI authorship reaching the reader directly, which the platform has already committed not to allow. "Challenge this conclusion" is the most valuable of the proposed AI interactions precisely because it can be built entirely from material that already exists (the Counterargument objects) rather than requiring the model to generate a new argument from scratch.

---

## 18. Design System Extensions

Two additions, both intentionally minimal: the **arc-position indicator** (§13) and a **Journey transition component** (the connective narrative text between two existing chapters/objects in a Journey). Everything else — claim cards, evidence grading, confidence badges, the three-layer color system — stays exactly as governed by Chapter 1. The temptation to build a second, more "cinematic" visual system specifically for narrative chrome should be resisted; the existing design language is already good (per the prior audit) and a second parallel system is how platforms end up with the "visual clutter" and "inconsistent visual rhythm" problems flagged there.

---

## 19. User Journey Maps

**Map A — Curious newcomer, historical question.** Arrives via search ("why is Kashmir disputed") → Story beat (Kashmir chapter hook, falsifiable question up top) → Problem beat (partition-framework mechanics, competing explanations) → *no Fix beat — this is an Investigation Arc* → Reflection (Open Questions) → next Journey suggested from a shared entity in the graph (the Partition chapter, or "India–Pakistan Relations" topic).

**Map B — Policy-curious reader.** Arrives at the EV Paradox story → Problem beat (battery-import dependency mechanics) → Fix beat (charging-infrastructure policy proposals, PLI scheme, named proponents and critics) → Comparison beat (vs. China/Norway EV policy, claim-driven table) → Reflection (Hope/Action, per the Policy Arc) → Action (policy-tracker follow link).

**Map C — Returning specialist in Researcher mode.** Skips the homepage entirely via a bookmarked deep link → lands directly on a Claim inside a chapter → reads at full evidence density with minimal narrative framing (Researcher mode suppresses most of the arc scaffolding per §2/§3) → uses the AI layer to cross-reference a claim against the Knowledge Graph → leaves without ever seeing a "Journey" at all. **This path must remain fully intact and unobstructed** — the narrative layer is additive for readers who want it, never mandatory scaffolding imposed on readers who don't.

---

## 20. Success Metrics

None of these should be engagement metrics (time-on-site, pages-per-session, DAU) — that would quietly reintroduce exactly the optimization target the Editorial Constitution rejects. Proposed metrics instead:

- **Reflection-completion rate**: the proportion of chapter reads that reach the Reflection beat, as a proxy for genuine comprehension rather than scroll depth.
- **Counterargument engagement rate**: whether readers who reach a Counterargument section actually expand/read it — a direct signal of whether the friction beat from §2 is working.
- **Cross-Journey return rate**: readers who come back specifically for a *related* Journey (via the graph-driven recommendation in §12), which signals genuine extended curiosity rather than generic stickiness.
- **Correction/feedback submission rate**: already tracked via the existing "Report a correction" affordance — a healthy, rising rate here is a trust signal, not a quality failure, exactly as the Methodology page already argues.
- **Reading-mode distribution**: the split between Explorer/Scholar/Researcher over time — a maturing, trusted platform should see this distribution shift toward deeper modes as its audience becomes more engaged with the *material*, not just the interface.
- **Self-reported understanding delta**: a single optional micro-question at the Reflection beat ("Do you understand this topic better than when you started?") — the most direct available proxy for the platform's actual stated goal, and the one metric that most honestly answers whether "understanding is the product."

---

## Closing Note

The source prompt's ambition is sound, and most of it is achievable using material this platform already has — the biggest risk isn't the vision, it's the gap between "narrative" as a structuring device (good, and mostly already half-built into Chapter 1) and "narrative" as a persuasion technique (which is precisely what an evidence-first institution can't afford to become, even by accident). Every recommendation above is built to get the documentary feeling from sequencing, pacing, and honest curiosity — not from the mechanics that make engagement-first media addictive. If a future design pass ever has to choose between "this would feel more cinematic" and "this would make the evidence chain more visible," the second answer should win every time; that's the whole bet this platform is making, and it's a good one.
