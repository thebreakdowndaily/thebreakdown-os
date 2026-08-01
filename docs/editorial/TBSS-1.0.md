# The Breakdown Story Standard v1.0 (TBSS-1.0)

**Status:** LOCKED
**Structure Version:** TBSS-1.0
**Effective Date:** 2026-07-29
**Governing Document:** docs/editorial/editorial-constitution.md; AGENTS.md
**Review Date:** After 100 Published Stories
---

This document is the human-readable editorial standard for all stories published on The Breakdown. It defines why each section exists, when it is mandatory or optional, the minimum quality bar, examples, anti-patterns, and acceptance criteria.

The machine-facing implementation of this standard lives in `prompts/editorial/story-engine.md`. That document is the AI implementation layer. This document is the editorial rationale layer. They must stay in sync — but they serve different audiences.

If TBSS-1.0 and the story-engine prompt conflict, this document takes precedence for editorial decisions; the prompt takes precedence for machine-rendering decisions.

---

## Governance

TBSS-1.0 is a locked standard. Changes require an Architecture Change Proposal (ACP). Review is scheduled only after 100 published stories under TBSS-1.0 — not before. The purpose of this review is to evaluate real editorial performance, not theoretical design.

| Change Level | What It Covers | Review Required |
|--------------|----------------|-----------------|
| A — Additive | New story types, optional sections | No |
| B — Compatible Evolution | Modifying optional/mandatory classifications, adding guidance | 1 reviewer |
| C — Breaking | Removing required sections, changing the story object schema | 2 reviewers + migration plan |

---

## Story Types

Every story must be classified into exactly one type before production begins. The type governs which sections are mandatory and which are optional.

### 1. Breaking News

**Why this exists:** Urgent events require rapid publication with core facts, not deep analysis. The structure must be fast to produce and fast to read.

**Mandatory sections:** Hero, Key Facts, Timeline (abbreviated), Story
**Optional sections:** Executive Summary, Why It Matters, Understanding the System, Background, Evidence, Stakeholders, Perspectives, Trade-offs, Future Outlook, FAQs, Sources

**Minimum quality standard:** All mandatory sections populated with verified evidence. Confidence must be at least `Medium` before publication.

**Example:** "Supreme Court issues ruling on electoral bonds case."

**Anti-pattern:** Using Breaking News for events that don't require immediate publication. If the event can wait 24 hours without losing public relevance, classify as Explainer or Policy Analysis instead.

**Acceptance criteria:**
- Story published within 4 hours of event trigger
- Key Facts section contains no unverified claims
- Timeline has at least 3 milestones
- Confidence rating is `Medium` or `High`

### 2. Explainer

**Why this exists:** Some topics are structurally complex and require the reader to understand how a system works before they can form a judgment. The Explainer exists to make systems legible.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Why It Matters, Understanding the System, Story, Background
**Optional sections:** Evidence, Stakeholders, Timeline, Perspectives, Trade-offs, Future Outlook, FAQs, Sources

**Minimum quality standard:** Understanding the System section must contain a custom diagram or flowchart. Every concept introduced must have a glossary entry or inline explanation. Confidence must be at least `Medium`.

**Example:** "How India's GST council works — and why it matters."

**Anti-pattern:** An Explainer that is just a long-form news article with no system diagram. If there is no flowchart, diagram, or process illustration, the story is probably an Explainer in name only.

**Acceptance criteria:**
- Understanding the System contains at least one original diagram or flowchart
- All technical terms are explained or linked to a glossary
- A non-expert reader can explain the system back in their own words after reading
- Confidence rating is `Medium` or `High`

### 3. Policy Analysis

**Why this exists:** Policy decisions involve trade-offs. The reader deserves to see competing options, their projected outcomes, and the evidence behind each — not a single recommended position.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Why It Matters, Evidence, Understanding the System, Story, Trade-offs, Stakeholders, Future Outlook
**Optional sections:** Background, Timeline, Perspectives, FAQs, Sources

**Minimum quality standard:** Trade-offs section must present at least two competing proposals with evidence for and against each. Future Outlook must include at least one projection with a stated methodology or data source. Confidence must be at least `Medium`.

**Example:** "Comparing India's three data protection frameworks — what each means for citizens."

**Anti-pattern:** Policy Analysis that presents a single policy as the obvious best choice without acknowledging alternatives or trade-offs. If the Trade-offs section is empty, the story is not a Policy Analysis.

**Acceptance criteria:**
- Trade-offs section contains at least two competing options with evidence
- Each option has a stated projected outcome
- Future Outlook includes a projection with a data source
- Confidence rating is `Medium` or `High`

### 4. Investigation

**Why this exists:** Some stories require deep sourcing, document verification, and a slow build of evidence. The Investigation pattern exists for work that would be misleading if published as a conventional news story.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Story, Evidence, Background
**Optional sections:** Why It Matters, Understanding the System, Stakeholders, Timeline, Perspectives, Trade-offs, Future Outlook, FAQs, Sources

**Minimum quality standard:** Evidence section must contain at least 5 primary source excerpts. At least 3 sources must be independent of each other (no single source accounts for more than 60% of evidence). Confidence must be `High` — Investigations do not publish at `Medium` or `Low` confidence.

**Example:** "How a regulatory loophole allowed $2 billion in unverified land transfers."

**Anti-pattern:** An Investigation that relies on a single source document or anonymous claims without corroboration. If the evidence base is not independently verifiable, classify as Opinion or Analysis, not Investigation.

**Acceptance criteria:**
- Evidence section contains 5+ primary source excerpts
- At least 3 independent sources
- Confidence rating is `High`
- Every claim links to a specific source document
- Verification Bureau sign-off obtained

### 5. Fact Check

**Why this exists:** Misinformation spreads faster than correction. The Fact Check pattern exists to isolate a specific claim, test it against evidence, and present the result transparently — including uncertainty.

**Mandatory sections:** Hero (statistic overlay), Key Facts, Evidence, Perspectives, Story
**Optional sections:** Executive Summary, Understanding the System, Stakeholders, Timeline, Trade-offs, Future Outlook, FAQs, Sources

**Minimum quality standard:** Every claim in the Key Facts section must have a verification block with source, confidence rating, verification date, and counter-evidence (if any). The Perspectives section must include the original claim being checked, even if it is false. Confidence rating applies per claim, not per story.

**Example:** "Did India's GDP growth rate exceed 7% in Q4 2024? A fact check."

**Anti-pattern:** A Fact Check that does not include the original claim being checked. The reader must see what is being fact-checked before seeing the result. Omitting the original claim is a form of editorial evasion.

**Acceptance criteria:**
- Every claim has its own verification block (source, confidence, date, counter-evidence)
- The original claim is reproduced verbatim in the Perspectives section
- Confidence is per-claim, not per-story
- Sources follow agency priority

### 6. Timeline

**Why this exists:** Some stories are best understood chronologically. The Timeline pattern makes temporal relationships the primary organizing principle rather than narrative or argument.

**Mandatory sections:** Hero, Timeline, Context (embedded in timeline nodes)
**Optional sections:** Executive Summary, Key Facts, Why It Matters, Evidence, Stakeholders, Perspectives, Future Outlook, FAQs, Sources

**Minimum quality standard:** Every timeline node must contain a date, event description, source citation, and significance statement (why this moment matters in the larger arc). Minimum 5 nodes. Confidence must be at least `Medium`.

**Example:** "The evolution of India's nuclear policy — a 75-year timeline."

**Anti-pattern:** A Timeline that is a list of dates without significance statements. A date alone is information; a date with context is understanding. If nodes lack significance, the timeline is decorative, not analytical.

**Acceptance criteria:**
- Minimum 5 timeline nodes
- Every node has date, event, source, and significance
- Timeline covers a coherent arc (not a random collection of milestones)
- Confidence rating is `Medium` or `High`

### 7. Data Story

**Why this exists:** Numbers alone are opaque. A Data Story makes data legible by building a narrative arc around charts, tables, and projections — guided by the reader through each visual.

**Mandatory sections:** Hero (statistic overlay), Key Facts, Evidence (charts and tables), Story (narrative connecting the data), Understanding the System, Future Outlook
**Optional sections:** Executive Summary, Why It Matters, Stakeholders, Timeline, Perspectives, Trade-offs, FAQs, Sources

**Minimum quality standard:** Every chart must have a descriptive title explaining what it shows and why it matters. The Story section must reference every chart by position ("as shown in Chart 1 above..."). Confidence must be `High` for all data cited.

**Example:** "How India's renewable energy capacity has grown — and what stands in the way."

**Anti-pattern:** A Data Story that presents charts without narrative guidance. If the reader has to figure out what story the data tells, the structure has failed. The Story section must explicitly connect data points to conclusions.

**Acceptance criteria:**
- Every chart has a descriptive title
- The Story section references every chart
- Confidence rating is `High` for all data
- At least 3 charts or tables
- No chart is decorative — every chart advances the narrative

### 8. Profile

**Why this exists:** Policy is made by and affects people. The Profile pattern humanises institutional actors and gives context to the individuals who shape governance.

**Mandatory sections:** Hero (portrait), Story, Stakeholders, Perspectives, Background
**Optional sections:** Executive Summary, Key Facts, Understanding the System, Evidence, Timeline, FAQs, Sources

**Minimum quality standard:** The Story section must contain at least 3 direct quotes from the subject or their close associates. The Stakeholders section must include at least 2 other stakeholders with their positions on the subject's work. Confidence must be `Medium` or `High`.

**Example:** "The judge who rewrote India's bankruptcy code — a profile."

**Anti-pattern:** A Profile that is a résumé biography ("Born in X, studied at Y, appointed to Z"). That is not a story — it is an encyclopedia entry. A Profile must show how the subject's decisions or actions affected outcomes beyond themselves.

**Acceptance criteria:**
- 3+ direct quotes from the subject or close associates
- 2+ other stakeholders with positions on the subject's work
- Story section explains impact beyond the subject's career
- Confidence rating is `Medium` or `High`

### 9. Election

**Why this exists:** Elections involve many stakeholders, competing data sources, and high public impact. The Election pattern combines Timeline, Data Story, and Stakeholder mapping into a single structured experience.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Timeline, Evidence (charts and data), Stakeholders, Future Outlook
**Optional sections:** Understanding the System, Story, Perspectives, Trade-offs, Background, FAQs, Sources

**Minimum quality standard:** Evidence section must contain at least 2 charts with data sources. Timeline must cover the full electoral arc (announcement through result). Stakeholders must include the winning party/candidate, the main opposition, and at least one independent observer. Confidence must be `High` for all factual claims.

**Example:** "2024 Lok Sabha elections — results, margins, and what changed."

**Anti-pattern:** An Election story that reports results without historical comparison or turnout data. Results alone are information; results with context are understanding. If the Evidence section is just a table of winners, the story is a wire report, not an Election pattern.

**Acceptance criteria:**
- 2+ charts with data sources
- Timeline covers the full electoral arc
- 3+ stakeholders represented
- All factual claims: High confidence
- Historical comparison data included

### 10. Budget

**Why this exists:** Government budgets are policy documents in numbers. The Budget pattern makes allocation data legible and connects spending figures to real-world impact.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Evidence (allocation tables and charts), Understanding the System, Trade-offs, Stakeholders
**Optional sections:** Timeline, Story, Perspectives, Future Outlook, Background, FAQs, Sources

**Minimum quality standard:** Evidence section must contain at least 3 allocation breakdowns (by sector, by ministry, or by year). Trade-offs must compare at least 2 years or 2 competing budget proposals. Confidence must be `High` for all financial data.

**Example:** "India's 2025-26 Union Budget — where the money went and what it means."

**Anti-pattern:** A Budget story that is just a table of numbers with no analysis of trade-offs. Numbers without context are not editorial content — they are accounting documents. If the Trade-offs section is empty, the story has failed this pattern.

**Acceptance criteria:**
- 3+ allocation breakdowns
- Trade-offs section present with comparison
- All financial data: High confidence
- At least 1 chart comparing current budget to previous year

### 11. Court Judgment

**Why this exists:** Legal decisions are primary sources that require careful explanation for a non-specialist audience. The Court Judgment pattern makes legal reasoning accessible without oversimplifying it.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Evidence (document excerpts and legal provisions), Understanding the System, Stakeholders, Story
**Optional sections:** Why It Matters, Timeline, Perspectives, Trade-offs, Future Outlook, FAQs, Sources

**Minimum quality standard:** Evidence section must contain at least 3 primary source excerpts from the judgment. At least 2 legal provisions cited must be explained in plain language. Confidence must be `High` for all legal citations.

**Example:** "The Supreme Court's ruling on privacy rights — what the judgment says and why it matters."

**Anti-pattern:** A Court Judgment that summarises the outcome ("the court ruled in favour of X") without explaining the reasoning. The legal reasoning is the story — the verdict is just the headline. If the Evidence section does not include document excerpts, the story has not fulfilled this pattern.

**Acceptance criteria:**
- 3+ primary source excerpts from the judgment
- 2+ legal provisions explained in plain language
- All legal citations: High confidence
- Reasoning explained, not just outcome reported

### 12. International Affairs

**Why this exists:** Governance doesn't happen in isolation. The International Affairs pattern contextualises events within the broader international system, including historical precedent, institutional relationships, and competing national interests.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Understanding the System, Evidence, Stakeholders, Story, Background (international context)
**Optional sections:** Timeline, Perspectives, Trade-offs, Future Outlook, FAQs, Sources

**Minimum quality standard:** Understanding the System must include a geopolitical context diagram or map. Evidence section must contain at least 2 sources from different institutional perspectives (e.g., one governmental, one independent). Confidence must be at least `Medium`.

**Example:** "Why the Red Sea shipping crisis matters for India's economy."

**Anti-pattern:** International Affairs reporting that treats a foreign event as happening in a vacuum — no historical context, no institutional mapping, no mention of how it affects domestic governance. If the Background section doesn't include international context, the story is local reporting misclassified as international affairs.

**Acceptance criteria:**
- Understanding the System includes a geopolitical diagram or map
- 2+ sources from different institutional perspectives
- Background section contains international context
- Confidence rating is `Medium` or `High`

### 13. Technology

**Why this exists:** Technology policy decisions involve complex technical systems that non-specialist readers need help understanding. The Technology pattern bridges the gap between technical detail and public impact.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Understanding the System (technical architecture), Evidence, Story, Future Outlook
**Optional sections:** Why It Matters, Stakeholders, Timeline, Perspectives, Trade-offs, Background, FAQs, Sources

**Minimum quality standard:** Understanding the System section must contain a system diagram or architecture illustration. Evidence section must contain at least 1 data visualisation (adoption rates, performance metrics, etc.). Future Outlook must include at least 1 scenario projection. Confidence must be at least `Medium`.

**Example:** "How India's new AI regulation works — and what it means for startups."

**Anti-pattern:** A Technology story that either oversimplifies to the point of inaccuracy or goes so deep into technical detail that non-specialists cannot follow. The Understanding the System section is the balancing mechanism — if it's missing or inadequate, the story is technically unbalanced.

**Acceptance criteria:**
- Understanding the System contains a technical diagram
- 1+ data visualisation present
- Future Outlook includes a scenario projection
- Confidence rating is `Medium` or `High`
- Technical accuracy verified by at least one domain expert

### 14. Science

**Why this exists:** Research findings carry uncertainty that is often lost in translation to public discourse. The Science pattern makes that uncertainty visible and distinguishes established findings from emerging evidence.

**Mandatory sections:** Hero, Executive Summary, Key Facts, Evidence, Understanding the System, Story, Future Outlook
**Optional sections:** Why It Matters, Stakeholders, Timeline, Perspectives, Trade-offs, Background, FAQs, Sources

**Minimum quality standard:** Evidence section must distinguish between established findings and emerging evidence. The Future Outlook section must include an uncertainty disclosure — what is known with confidence and what remains uncertain. Confidence rating must be explicitly assigned per claim, not per story.

**Example:** "What the latest climate models say about monsoon patterns — and what's still uncertain."

**Anti-pattern:** A Science story that presents research findings as settled fact without acknowledging limitations, sample sizes, or conflicting studies. If the Future Outlook doesn't include an uncertainty disclosure, the story has violated the core principle of the Science pattern.

**Acceptance criteria:**
- Evidence distinguishes established findings from emerging evidence
- Future Outlook includes uncertainty disclosure
- Confidence rating is per-claim, not per-story
- At least 2 sources cited (ideally from different research groups)
---

## Section-by-Section Standard

### Hero

**Why it exists:** The hero is the reader's first visual impression. It must establish the topic's significance and create a memorable anchor. A weak hero undermines trust before the reader reads a single word.

**When mandatory:** All story types.
**Minimum quality standard:** Hero must be an editorial photograph or original illustration. If no suitable editorial image exists, state "Editorial image unavailable." Do not substitute a stock photo. A statistic overlay must be included with a sourced number.
**Example:** Full-bleed photograph of a courtroom or parliamentary chamber, overlaid with a statistic like "2.4 billion people affected" — sourced and attributed.
**Anti-pattern:** Using a generic landscape photograph, a smiling crowd photo, or a "breaking news" graphic banner. These are decorative, not pedagogical.
**Acceptance criteria:**
- Hero is an editorial or original image (not stock)
- Statistic overlay is sourced and accurate
- Caption, alt text, and credit are present
- Aspect ratio, placement, and breakpoint behaviour are specified

### Executive Summary

**Why it exists:** Before committing to a long read, the reader needs to know what the story covers and why it matters. The executive summary answers the Six Questions at surface level — what happened, why it matters, and what the reader will learn.

**When mandatory:** All story types except Fact Check (where the claim itself serves as the summary) and Breaking News (where the Key Facts section serves as the executive summary).
**Minimum quality standard:** 3–5 paragraphs. Covers all Six Questions at surface level. No claims without source attribution.
**Example:** "What happened → why it matters → what the evidence shows → what remains uncertain → what the reader should take away."
**Anti-pattern:** An executive summary that is just a longer headline or a promotional teaser. It must genuinely summarize the substance of the story, not market it.
**Acceptance criteria:**
- 3–5 paragraphs
- Addresses all Six Questions at surface level
- All claims have source attribution
- Readable by someone who reads nothing else in the story

### Key Facts

**Why it exists:** The reader needs a structured, scannable reference of the most important facts before or after reading the narrative. Key Facts are the anchor points — they let the reader orient themselves without re-reading the full story.

**When mandatory:** All story types except Fact Check (where the verification blocks serve as key facts) and Data Story (where the Evidence section serves as key facts).
**Minimum quality standard:** 5–10 fact cards. Each fact must have a source. No fact should be an opinion or interpretation — only verifiable claims. Confidence rating per fact.
**Example:** "Total budget allocation: ₹45 trillion (Source: Union Budget 2025-26, p. 12). Confidence: High."
**Anti-pattern:** Key Facts that are actually opinions dressed as facts ("The policy is widely regarded as successful"). Key Facts must be verifiable claims with sources.
**Acceptance criteria:**
- 5–10 fact cards for standard stories
- Every fact has a source
- Every fact is a verifiable claim with a confidence rating
- No opinions or interpretations in the fact cards

### Why It Matters

**Why it exists:** After understanding what happened and how, the reader needs to understand why it matters to them and to society. This section connects the specific story to broader principles of governance, public policy, economics, law, or society.

**When mandatory:** Explainer, Policy Analysis, Investigation, Science, Technology. Optional for all other types.
**Minimum quality standard:** 2–4 paragraphs. Must explicitly connect the story's subject to a broader principle or consequence. Must not be a repetition of Key Facts.
**Example:** "Why this matters: When judicial independence is tested in one case, the precedent shapes every subsequent case in the same domain."
**Anti-pattern:** "Why It Matters" that is just a rephrased version of the Key Facts or Executive Summary. If it adds no new analytical layer, it should be removed or merged into the Executive Summary.
**Acceptance criteria:**
- 2–4 paragraphs (when mandatory)
- Connects the specific story to a broader principle
- Does not repeat Key Facts verbatim
- Passes the "so what?" test — the reader should understand why the topic matters beyond the event itself

### Story

**Why it exists:** The Story section is the narrative spine — where the evidence is woven into a readable, linear account. It is the core editorial work of transforming research into understanding.

**When mandatory:** All story types.
**Minimum quality standard:** Prose is clear, well-structured, and follows the Evidence Spine (Research Question → Evidence → Claim → Explanation → Counterargument → Editorial Judgment → Reader Takeaway). Every factual claim must link to evidence. No claim without source.
**Example:** A 1,500–3,000 word narrative structured around the Six Questions, with embedded evidence links.
**Anti-pattern:** A Story section that reads like a wire service report — just the facts, no narrative arc, no context, no explanation of why things happened the way they did. The Story is where understanding is built; it is not a chronology.
**Acceptance criteria:**
- Follows the Evidence Spine structure
- Every factual claim has source attribution
- Contains at least one counterargument or dissenting perspective
- Distinguishes fact from interpretation
- Readable by a non-specialist audience

### Background

**Why it exists:** Many policy and governance topics only make sense when the reader understands how they came to be. Background provides the historical and institutional context that makes the current moment legible.

**When mandatory:** All story types except Breaking News (background can be added in updates).
**Minimum quality standard:** 2–3 paragraphs covering the pre-history or institutional context. At least 2 sources. Must not be a full history lesson — it should cover only what is directly relevant to the story's subject.
**Example:** "India's data protection framework evolved through three legislative attempts between 2017 and 2023, each shaped by different political and technological conditions."
**Anti-pattern:** A Background section that is a comprehensive history of the topic (e.g., "The history of Indian data protection from 1970 to today"). Background must be scoped to what is directly relevant to the current story.
**Acceptance criteria:**
- 2–3 paragraphs
- Covers pre-history or institutional context
- 2+ sources
- Scoped to relevance — does not include extraneous history
- Distinguishes established fact from scholarly interpretation

### Evidence

**Why it exists:** The Evidence section is where the platform proves its commitment to transparency. Every claim in the Story links back to a documented source here. The Evidence section is the reader's toolkit for independent verification.

**When mandatory:** All story types except Profile (where direct quotes and stakeholder positions serve as evidence). Fact Check and Data Story require expanded Evidence sections.
**Minimum quality standard:** Every claim in the Story section must be traceable to a source in this section. For Fact Check stories, every claim has its own verification block. For Data Stories, every chart has a data source. For Investigations, a minimum of 5 primary source excerpts.
**Example:** A structured list of claims, each linked to a source document with confidence rating and verification status.
**Anti-pattern:** Evidence that is a generic reference list at the bottom with no linking to specific claims. Evidence is not a bibliography — it is a traceability map.
**Acceptance criteria:**
- Every claim in the Story is traceable to this section
- Sources follow agency priority (Reuters → AP → AFP → Getty → PTI → ANI → Official → Public domain)
- Confidence rating per source
- Counter-evidence or conflicting sources are acknowledged
- Investigation stories have 5+ primary source excerpts

### Understanding the System

**Why it exists:** Many governance, policy, and technology stories involve systems that are invisible to the general public. This section makes those systems legible — showing how decisions flow, how institutions interact, and where leverage points exist.

**When mandatory:** Explainer, Policy Analysis, International Affairs, Technology. Optional for all other types.
**Minimum quality standard:** Must contain a custom diagram, flowchart, or process illustration. No stock photos. The diagram must be original and designed for this specific story — not a generic representation.
**Example:** A flowchart showing how a budget allocation flows from the Union government through the Finance Ministry to departmental spend, with points of oversight and accountability.
**Anti-pattern:** Using a stock photo of a government building or a generic business meeting to "illustrate" a system. Systems cannot be shown with photographs of buildings — they must be diagrammed. If no original diagram exists, the section should be written out as plain-language process mapping.
**Acceptance criteria:**
- Contains a custom diagram, flowchart, or process illustration
- No stock photos
- Diagram is specific to this story's subject
- A non-specialist reader can understand the system after reading this section

### Timeline

**Why it exists:** Chronology is a fundamental way humans organise understanding. The Timeline section makes temporal relationships explicit, showing how events connect across time.

**When mandatory:** Timeline type stories. Optional for all other types (recommended for Breaking News and Election, helpful for Investigation).
**Minimum quality standard:** Minimum 5 nodes. Every node has a date, event description, source citation, and significance statement. Must be navigable with a visual graphic and a text alternative.
**Example:** A horizontal timeline with nodes for "1947: Partition and its legal framework" → "1950: Constitution adopted" → "1962: Sino-Indian War" etc.
**Anti-pattern:** A timeline of unrelated events that happen to be chronologically adjacent. Every node must be causally or thematically connected to the story's subject. A timeline that lists events because they exist, not because they matter, is a list, not an analysis.
**Acceptance criteria:**
- 5+ nodes
- Every node has date, event, source, and significance
- Nodes are causally or thematically connected
- Visual and text alternatives available

### Stakeholders

**Why it exists:** Governance is about competing interests and institutional relationships. The Stakeholders section maps who is involved, what they stand to gain or lose, and what their positions are — helping the reader understand the dynamics of power and interest.

**When mandatory:** Policy Analysis, Election, Budget, Court Judgment, International Affairs. Optional for all other types (recommended for Investigation and Technology).
**Minimum quality standard:** Minimum 3 stakeholders with name, type (government, institution, individual, community, private sector), position, and interest. For Election stories, include at least the winning party/candidate, main opposition, and one independent observer.
**Example:** "Ministry of Finance — position: supports the new taxation framework; interest: revenue generation and compliance simplification."
**Anti-pattern:** A Stakeholders section that is just a list of names without positions or interests. If you can't explain what a stakeholder's position is and what they stand to gain or lose, they probably don't belong in this section.
**Acceptance criteria:**
- 3+ stakeholders (5+ for mandatory story types)
- Each stakeholder has name, type, position, and interest
- At least one stakeholder is an individual (not just institutions)
- At least one stakeholder represents an opposing position

### Perspectives

**Why it exists:** Understanding is not achieved through a single narrative voice. The Perspectives section surfaces competing interpretations, dissenting views, and areas of scholarly or public disagreement — ensuring the reader sees the full landscape of thought, not just the editorial position.

**When mandatory:** Policy Analysis and Investigation. Recommended for all other types. Optional for Breaking News.
**Minimum quality standard:** At least 2 distinct perspectives, each with a named source or attributed voice. For contested claims, perspectives must include both the mainstream view and the dissenting or minority view. Quote cards used for direct quotations.
**Example:** "The mainstream view, represented by the finance minister: [quote] — Dissenting view, represented by three independent economists: [quote]."
**Anti-pattern:** False balance — presenting two equally weighted perspectives when the evidence strongly supports one. Perspectives must reflect the actual distribution of expert or public opinion, not manufacture equivalence.
**Acceptance criteria:**
- 2+ distinct perspectives for contested topics
- Each perspective is attributed to a named source
- Perspectives reflect the actual distribution of expert opinion (not false equivalence)
- Quote cards used for direct quotations
- No decorative imagery — text and portraits only

### Trade-offs

**Why it exists:** Policy decisions involve trade-offs — and failing to acknowledge them undermines both trust and understanding. The Trade-offs section makes competing considerations explicit, helping the reader evaluate options rather than accepting a single recommended position.

**When mandatory:** Policy Analysis and Budget. Optional for all other types (recommended for Election and Science).
**Minimum quality standard:** At least 2 competing options or approaches, each with stated benefits, risks, and evidence. A comparison infographic or split diagram is required. For Science stories, trade-offs must include acknowledged uncertainties.
**Example:** A split diagram showing "Option A: Centralised regulation" vs "Option B: Sectoral self-regulation" with benefits, risks, and evidence for each.
**Anti-pattern:** A Trade-offs section that presents one option and then lists minor objections to it — this is not trade-off analysis, it is persuasion with a courtesy concession. Genuine trade-off analysis presents genuinely competing options on roughly equal footing, with evidence for each.
**Acceptance criteria:**
- 2+ competing options presented on roughly equal footing
- Each option has stated benefits, risks, and evidence
- A comparison infographic or split diagram is present
- For Science stories, uncertainties are acknowledged

### Future Outlook

**Why it exists:** The reader doesn't just need to understand what happened — they need to understand what is likely to happen next and what choices remain. The Future Outlook section provides projection and scenario analysis grounded in evidence, not speculation.

**When mandatory:** Policy Analysis, Technology, Science, and Election. Optional for all other types (recommended for Budget and Timeline).
**Minimum quality standard:** At least 1 scenario projection with a stated methodology or data source. Must distinguish between projections (data-driven expectations) and speculation (ungrounded forecasts). Confidence level for each projection must be stated.
**Example:** "Projection (Medium confidence): Based on current regulatory trajectories, AI adoption in financial services is expected to increase by 40% within 2 years. Source: RBI 2025 Digital Economy Report, p. 34."
**Anti-pattern:** Future Outlook that is pure speculation dressed as a projection ("We can expect exciting developments in the years ahead"). Every projection must have a stated data source or methodology. If there is no source, it is not a projection — it is a forecast.
**Acceptance criteria:**
- At least 1 scenario projection per mandatory story type
- Each projection has a stated methodology or data source
- Projections and speculations are clearly distinguished
- Confidence level stated for each projection

### FAQs

**Why it exists:** Some readers arrive with specific questions and want quick answers without reading the full narrative. FAQs serve as a navigational aid — they help the reader find what they're looking for efficiently.

**When mandatory:** Only for Explainer and Court Judgment types (where public confusion about legal or technical procedures is common). Recommended for all others. Optional for Breaking News.
**Minimum quality standard:** 5–8 questions with direct, sourced answers. Questions should reflect real reader confusion — not manufactured FAQ items. Answers must link back to the relevant section of the narrative.
**Example:** "What is the difference between the GST council and the Parliament in setting tax rates?" — answered by referencing the Understanding the System section and linking to the relevant claim.
**Anti-pattern:** FAQs that are just marketing-style questions ("Why is this important?") or questions that don't reflect real reader confusion. If a question isn't something a reader would actually search for, it shouldn't be in the FAQ.
**Acceptance criteria:**
- 5–8 questions
- Each question reflects a real reader confusion point
- Answers are direct and sourced
- Each answer links back to the relevant narrative section
- No decorative imagery unless essential to understanding a technical concept

### Sources

**Why it exists:** The Sources section is the editorial foundation of transparency. It allows the reader to verify claims independently, trace the provenance of information, and assess the quality of the evidence base. Without it, the story is an assertion, not knowledge.

**When mandatory:** All story types.
**Minimum quality standard:** Every source cited in the story must appear here with a full attribution (author, title, date, URL or document reference). Government seals displayed where appropriate. No unrelated imagery. No decorative elements.
**Example:** "Government of India, Ministry of Finance, Union Budget 2025-26, https://unionbudget.gov.in/2025-26"
**Anti-pattern:** Sources listed as a bare URL list without context, or sources that were not actually cited in the narrative. If a source appears here but was not referenced in the story, it should be removed — it creates an unverifiable link between the story and the source.
**Acceptance criteria:**
- Every claim in the story links to a source here
- Sources follow agency priority for attribution
- Government seals displayed where appropriate (no unrelated imagery)
- No decorative elements

---

## Anti-Patterns (Cross-Cutting)

The following anti-patterns apply to all story types and all sections:

### 1. Sensationalism
Language that prioritises emotional reaction over understanding. Examples: "Shocking!", "Unbelievable!", "The truth will make you gasp." The Breakdown's motto is "Evidence before conclusions. Context before certainty." Sensationalism violates that motto.

### 2. False Certainty
Stating conclusions as definitively true when the evidence supports only a probabilistic or contested claim. The correct form is "The evidence suggests..." or "With high confidence, the data supports..." Never "This proves..." unless the evidence is conclusive and the confidence rating is High.

### 3. Editorial Voice Without Attribution
Presenting an opinion, interpretation, or judgment as if it were a fact. If a claim represents an editorial judgment or interpretive framing, it must be attributed as such — "The editorial judgment is..." or "The available evidence supports the interpretation that..."

### 4. Source Omission
Failing to cite a source for a claim. The standard is: every claim has a source, and every source follows the agency priority. If you can't find a source, the claim belongs in a "What remains uncertain" statement, not as a settled fact.

### 5. Single-Narrative Presentation
Presenting only one perspective on a contested topic without acknowledging disagreement. Even if one perspective has stronger evidence, the disagreement itself must be acknowledged. The standard is: if there is a scholarly or public debate, the story must present it.

### 6. Visual Decoration
Using images, charts, or illustrations that do not improve understanding. Every visual must pass the question: "Does this visual teach something the reader couldn't learn from text alone?" If the answer is no, the visual is decorative and should be removed or replaced.

---

## Acceptance Criteria

A story is ready for publication only when all of the following criteria are met:

1. **Story Type** — Assigned and appropriate for the content.
2. **Evidence Gate** — Evidence assessment completed; confidence is not `Insufficient`.
3. **Mandatory Sections** — All mandatory sections for the chosen story type are present and populated to the minimum quality standard.
4. **Optional Sections** — Where present, optional sections meet the minimum quality standard. Absence of optional sections is acceptable only if justified by the story type.
5. **Evidence Traceability** — Every factual claim in the Story section is traceable to a source in the Evidence section.
6. **Visual Completeness** — Every recommended visual in the mandatory sections has been addressed (image type, caption, alt text, credit, layout). "Editorial image unavailable" is an acceptable answer only if genuinely no editorial image exists.
7. **Accessibility** — All images have alt text (max 125 characters) and captions (max 30 words). WCAG AA contrast is maintained. No reliance on colour alone to convey meaning.
8. **Machine-Readable Metadata** — Metadata block is complete and accurate.
9. **Story Object** — Story Object is complete and schema-valid.
10. **Editorial Checklist** — All 13 checks pass, or failing items are explicitly documented with rationale.
11. **Anti-Pattern Check** — The story does not contain any of the 6 cross-cutting anti-patterns.
12. **Confidence Rating** — Per-claim confidence ratings are present and accurate. If any claim confidence is `Low`, the story must include a note explaining what additional evidence would raise it.
13. **Verification** — The story has been reviewed by the Verification Bureau (or equivalent independent review) before publication.

---

## Relationship to Other Documents

| Document | Relationship |
|----------|-------------|
| `prompts/editorial/story-engine.md` | Machine-facing implementation of this standard. Must stay in sync. |
| `docs/editorial/editorial-constitution.md` | Governs all editorial decisions. TBSS-1.0 must not contradict it. |
| `docs/editorial/story-patterns.md` | Defines narrative archetypes. TBSS-1.0 maps story types to the editorial architecture. |
| `docs/editorial/editorial-review-checklist.md` | The practical review tool for Gold Standard Review. TBSS-1.0 provides the structural standard reviewed by that checklist. |
| `AGENTS.md` | Engineering governance. Story Object schema and structure_version must align with the platform's canonical knowledge layer. |

---

## Review Schedule

TBSS-1.0 is locked. It will be reviewed only after the following trigger occurs:

**100 published stories** using TBSS-1.0 have been completed and published.

The review will evaluate:
- Which mandatory sections consistently add editorial value?
- Which optional sections are rarely used, and why?
- Which story types produce the highest reader engagement and trust scores?
- Does the story object schema need additional fields?
- What evidence debt exists in the standard's examples or guidance?

Any proposed changes will follow the ACP process at the appropriate change level.
