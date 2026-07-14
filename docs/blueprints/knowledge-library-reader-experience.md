---
title: Knowledge Library — Reader Experience Blueprint
status: draft
owner: product
last_updated: 2026-07-12
---

# Knowledge Library — Reader Experience Blueprint

## 1. Reading Depth Model

Every chapter renders at three depths. The reader toggles between them via a control in the chapter header. The current depth is persisted in the URL as `?depth=explorer|scholar|researcher`.

### 1.1 Explorer

| Element | Behaviour |
|---------|-----------|
| **Reading time** | 5–10 minutes |
| **Content** | Full narrative at summary level. All major sections rendered. Marginalia hidden. |
| **Citations** | Numbered brackets visible. Full sources at bottom. Evidence cards hidden. |
| **Key Questions** | Always shown at top of chapter. |
| **Common Misconceptions** | Shown as expandable sections (default collapsed). |
| **Timeline Context** | Shown as a simple table. |
| **Thinkers** | Hidden (summary-only at chapter end). |
| **Learning Section** | Summary only. |
| **Interactive maps** | Embedded as static maps with alt text. |
| **JS dependency** | None. Pure HTML/CSS. |
| **Progress** | Scroll-based progress bar. |

### 1.2 Scholar

| Element | Behaviour |
|---------|-----------|
| **Reading time** | 20–30 minutes |
| **Content** | Full narrative with evidence excerpts inline. Marginalia visible. |
| **Citations** | Hover-to-preview evidence cards on each citation number. Full sources at bottom. |
| **Key Questions** | Shown at top. Answered inline with source citations. |
| **Common Misconceptions** | Expanded by default. |
| **Timeline Context** | Interactive timeline with region filters. |
| **Thinkers** | Inline perspective blocks in relevant sections. "View all thinkers" link at bottom. |
| **Learning Section** | Full: summary, key concepts, quiz, flashcards. |
| **Interactive maps** | Pan/zoom with layer toggles. |
| **JS dependency** | Progressive enhancement. Works without JS but richer with it. |

### 1.3 Researcher

| Element | Behaviour |
|---------|-----------|
| **Reading time** | 2–4 hours |
| **Content** | Full narrative + every claim annotated with evidence source. Evidence type labels shown. |
| **Citations** | Full side panel with sources. Each citation shows excerpt, source tier, and archive link. |
| **Key Questions** | Shown with all supporting sources and alternative interpretations. |
| **Common Misconceptions** | Expanded with full academic references. |
| **Timeline Context** | Full interactive timeline with event details, sources, and document links. |
| **Thinkers** | Full thinker debates with arguments, counterarguments, and criticism. |
| **Learning Section** | Full + discussion questions + additional reading with difficulty ratings. |
| **Interactive maps** | Full GIS-style: layer control, data download, source data access. |
| **JS dependency** | Heavy interactivity expected. Maps, timelines, data explorer. |

## 2. Chapter Header

Every chapter page includes:

```
[Collection] → [Volume] → [Chapter]        [Depth: ○ Explorer ● Scholar ○ Researcher]

← Previous Chapter    |    Chapter 4 of 12    |    Next Chapter →
```

- Reading depth is a `<fieldset role="radiogroup">` with ARIA labels
- Keyboard: Left/Right arrows navigate between chapters. Up/Down switch depth.
- Chapter header also displays:

```
Difficulty: ★★★★☆
Prerequisites: Cold War, UN System, IR Theory

Evidence Strength: 98% · 18 Primary · 42 Academic · 3 Contradictory
Last Verified: 12 July 2026
```

## 3. Learning Section

### 3.1 Summary
- 3–5 paragraph synopsis of the chapter
- Written so that an Explorer reader can skip the full narrative if they only want the gist

### 3.2 Key Concepts
- Term + definition table
- Each term links to the entity page if available
- Expandable hover card with full context

### 3.3 Quiz
- 5–10 multiple-choice questions per chapter
- Answers with explanations and source references
- Score tracked cumulatively per volume (localStorage)
- No login required

### 3.4 Flashcards
- Front: question or term. Back: answer or definition.
- Spaced repetition algorithm (localStorage-based)
- Exportable to Anki (APKG generation)

### 3.5 Related Chapters

| Relationship | Display |
|-------------|---------|
| Prerequisite | "Read this first" |
| Follow-up | "Read this next" |
| Parallel | "Happening simultaneously" |
| Alternative perspective | "A different view" |

### 3.6 Reading Paths

Pre-built learning journeys:

| Path | Audience | Chapters | Time |
|------|----------|----------|------|
| The Foundations Path | Beginner | Vol I selected chapters | 2 hours |
| The Crisis Path | Intermediate | War chapters across volumes | 4 hours |
| The Economics Path | Advanced | Trade, aid, sanctions chapters | 6 hours |
| The Thinkers Path | Scholar | Chapters with thinker content | 3 hours |

### 3.7 Discussion Questions
- 3–5 open-ended questions per chapter
- Designed for classroom or self-guided reflection
- No right/wrong answers — prompts for critical thinking

## 4. Interactive Components

### 4.1 Treaty Explorer
- Interactive table of all treaties
- Filter by: year, country, type (defence, trade, cultural)
- Each treaty card: signatories, date, summary, full text link, map of signatories
- Timeline view: treaties arranged chronologically with context markers

### 4.2 UN Vote Explorer
- Search and filter India's UN votes by: year, resolution topic, voting bloc
- Visualise alignment with US, USSR/Russia, China, NAM, G77
- Heatmap of voting similarity over time

### 4.3 Defence Procurement Explorer
- Interactive timeline of major defence purchases
- Country of origin, value, category (air, sea, land)
- Shift over time from USSR to diversified sourcing

### 4.4 Trade Explorer
- Bilateral trade data over time with key partners
- Import/export composition by decade
- Annotated with major trade agreements

### 4.5 Sanctions Timeline
- Global sanctions imposed on India (1965, 1971, 1974, 1998)
- Global sanctions India voted for or supported
- Effect on Indian economy and policy

### 4.6 Diplomatic Visits
- Timeline of heads of state/government visits
- India ← → Country (bilateral)
- Summit participation (NAM, CHOGM, SAARC, SCO, G20, BRICS)

### 4.7 Decision Simulator

- Interactive branching scenario: "You are Indira Gandhi / Nehru / Vajpayee..."
- Reader chooses between realistic policy options at key decision points
- Platform reveals actual outcome, alternatives, and consequences
- Each decision linked to source evidence
- Scenarios available at Scholar and Researcher depths
- Explorer depth shows the decision matrix as a static table

### 4.8 Comparative Timeline

- Multi-region timeline: India, USA, China, USSR/Russia, Pakistan, UN
- Events rendered as synchronised horizontal bands
- Click any event for details, sources, and document links
- Filter by region category (diplomatic, military, economic)
- Available at Explorer depth as a static table
- Interactive at Scholar and Researcher depths

### 4.9 Primary Document Reader

- Treaty texts, UN records, speeches, declassified cables rendered with:
  - Original PDF/scan image
  - OCR text layer (selectable, searchable)
  - Annotations on key clauses (editorial explainers)
  - Sidebar with: related chapters, timeline, entities, thinkers, stories
  - Download as PDF or text
- Available at Researcher depth by default
- Scholar depth sees annotated excerpts inline
- Explorer depth sees key clauses in the narrative

### 4.10 Alliance Network
- Interactive force-directed graph of India's alliances and partnerships
- Node size = alliance depth, edge weight = duration
- Filter by decade, region, type (defence, economic, strategic)

## 5. Research Workspace

### 5.1 Bookmarks
- Bookmark any chapter or section with a custom label
- Bookmarks persisted in localStorage (anonymous) or account (authenticated)
- Sortable and searchable bookmark list

### 5.2 Highlights
- Select text to highlight in four colours: yellow (key claim), green (evidence), blue (definition), pink (question)
- Highlights visible when re-reading the chapter
- Export highlighted passages as a compiled document

### 5.3 Annotations
- Private notes attached to specific passages
- Visible in a sidebar when re-reading
- Exportable alongside highlights

### 5.4 Reader Collections
- Create custom reading lists across chapters and volumes
- Share collections via URL (read-only)
- Track completion progress per collection

### 5.5 Citation Export
- One-click citation generation in MLA, APA, Chicago
- Export entire chapter citations or selection
- Copy to clipboard or download as .bib / .ris / .csv

### 5.6 Progress Tracking
- Reading progress per chapter (scroll-based)
- Quiz scores per volume
- Flashcards reviewed count
- Overall completion percentage per reading path

## 6. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Full chapter navigation via keyboard. Skip-to-content link. |
| Screen readers | ARIA landmarks for chapter structure. Reading depth as radiogroup. |
| Focus management | Chapter title receives focus on navigation. Deep links to sections. |
| Colour contrast | WCAG AA minimum. AAA for body text. |
| Reduced motion | Respect `prefers-reduced-motion`. Maps use static fallback. |
| Text resize | All layouts work at 200% browser zoom without horizontal scroll. |
| Print | Print stylesheet available. All three depths printable. |

## 7. Mobile Experience

| Component | Mobile Behaviour |
|-----------|------------------|
| Navigation | Bottom sheet / slide-out drawer for volume/chapter nav |
| Reading depth | Segmented control at top (horizontal scroll if needed) |
| Tables | Horizontal scroll within table container |
| Maps | Full-screen mode on tap. Pinch zoom. |
| Quiz | Full-screen question view on small screens |
| Flashcards | Swipeable card deck |

## 8. The Learning Lifecycle

```
Chapter Published
  ↓
Freshness Check (90 days)
  ↓
Still accurate? → Re-verify and update freshness date
Needs update?   → Edit, publish with "Updated" badge and changelog entry
Superseded?     → Archive with link to replacement chapter
  ↓
Repeat every 90 days
```

---

*This blueprint describes the target experience. Build iteratively: Explorer first, Scholar second, Researcher third.*
