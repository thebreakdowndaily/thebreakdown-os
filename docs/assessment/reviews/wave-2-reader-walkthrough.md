# Reader Walkthrough Report

## Arrival

### Observations
- The hero is clear and institutional. "Evidence-first Knowledge Platform" badge does work.
- "Begin with Volume I" is the only primary CTA — no ambiguity about where to click.
- Trust metrics (3 chapters, 18 claims, 8 primary sources) appear immediately.
- Four trust-document links (Methodology, Editorial Constitution, Corrections, Trust Dashboard) are present but small and secondary.
- "The Canonical Learning Path" section reinforces the starting point visually.
- "What you will learn" cards (Historical Foundations, Foreign Policy Origins, Critical Turning Points) are helpful previews.
- TrustBar (Editorially Reviewed · Evidence-based Research · etc.) reads as institutional but the content is static.
- Scroll feels guided: Start Here → Continue Learning → Active Research → Further Reading → Explore Knowledge.

### Confusions
- The tagline "India Explained" next to the logo does not obviously match the global-scope content (US-Iran, WHO Cancer Report, UK relations).
- "3 Reviewed Chapters" is a low number that cuts against the volume of content visible (30+ stories, 15 investigations). A reader might wonder: "Only 3 chapters are reviewed? What about all these other articles?"
- "18 Evidence-backed Claims" seems low given the evidentiary density of the content displayed.
- The "Active Research" section labels look like data but appear to be static values — unsure if I should interpret them as live metrics.

### Friction
- The top navigation bar has 9 items (Stories, Topics, Investigations, Countries, Organizations, The Fix, Data, Graph, Search) — it is crowded and I did not know which to click first. Each label implies a different mental model: stories vs. investigations vs. the fix. As a first-time reader, I cannot distinguish these.
- The "Subscribe" button in the nav is prominent for someone who has not yet read anything.

### Positive surprises
- "Begin with Volume I" is exactly the right CTA — no decision fatigue.
- The learning preview cards ("What you will learn") are a genuine innovation. They answer "why should I spend time here?" before I click.
- Trust-document links in the hero are a strong institutional signal.
- The "Continue Your Learning" section correctly subordinates secondary content without hiding it.

---

## Reading

### Observations
- The Volume page (The Nehruvian Era) clearly shows 3 chapters with status indicators (Verified, Draft, Draft).
- Chapter 1 is clearly marked as "verified" with version number "v1.0.0" — strong trust signal.
- Reading modes (Explorer, Scholar, Researcher) are visible and interesting — but not explained.
- Learning Objectives at the top of the chapter are thorough (10 objectives).
- The "On this page" sidebar with 58 sections is comprehensive but intimidating.
- Source citations are in-line and specific (Source 1, Source 11, etc.).
- Visual assets (maps, diagrams, photographs) are well-integrated with the narrative.
- The "State of the Evidence" section is unique to this platform and builds credibility.
- The historiographical treatment (6 explanations, key scholars) is a genuine differentiator.
- Content quality is very high — the writing is clear, measured, and appropriately qualified.

### Confusions
- Why are Chapter 2 and Chapter 3 listed as "Draft" on a published platform? A first-time reader may think the platform is incomplete.
- The "On this page" sidebar with 58 collapsed sections is overwhelming. I do not know which sections are main narrative vs. supplementary vs. reference.
- Reading modes (Explorer 5-10 min, Scholar 20-30 min, Researcher 2-4 hrs) are labelled but not explained. What changes between them? Are these different views or just time estimates?
- The relationship between "Stories" (in nav) and "Chapters" (in Volume) is unclear. Are stories chapters? Are chapters stories?
- In-line citations use "Source 1, Source 11" numbering but there is no obvious way to see the source list without scrolling to the bottom of a very long page.

### Friction
- The page is extraordinarily long. Even the "Explorer" 5-10 min mode implies significant density.
- "Image Pending Licensing" placeholder (Margaret Bourke-White photograph) is a notable break in trust. If I see a placeholder in a flagship chapter, I wonder what else is missing.
- The "AI-generated diagram" labels on otherwise well-designed explanatory graphics create an odd tension — the diagrams are useful, but the label makes me question accuracy.
- The source citation system (@thebreakdown.in#source-1) is not clickable or navigable from the reading view — I would need to search the DOM or scroll.
- The "On this page" sidebar shows collapsed subsections under Part I but I cannot easily see which section I am currently reading.

### Positive surprises
- Learning Objectives are genuinely useful — they frame what I should take away.
- The "Historiography: How Scholars Debate Partition" section is something no news site would include. It is the platform's strongest differentiator.
- The Decision Matrix and Comparative Timeline are excellent knowledge design.
- Maps with dashed boundaries and explanatory notes ("Per Book of Record #0003") signal transparent cartographic standards.
- The chapter feels like a book, not a blog post — the depth signals authority.

---

## Investigation

### Observations
- Investigations page lists one major investigation (Namami Gange) with 15 chapters.
- Each chapter has clear metadata (read time, date, confidence score).
- The investigation landing page is clean and well-structured.

### Confusions
- How does "Investigation" differ from "Story" differ from "Chapter"? The Namami Gange investigation calls its sub-units "chapters" — same term as Volume I uses. This creates naming collision.
- The investigations page lists only one investigation. A reader might wonder: "Is this all?"
- The Namami Gange summary mentions "15 chapters" but the top of the investigation shows only 2 chapters listed (the rest require clicking into the full list).

### Friction
- No obvious connection between the Namami Gange investigation and the site's stated focus on "India and the World" / foreign policy. It feels like a different editorial initiative.
- The investigation uses `/story/` URLs for its chapters, creating confusion with the `/series/` URL pattern used by Volume I. Two different URL schemes for "chapters."

### Positive surprises
- "Follow the Money: Budget Sanctioned, Released, and Actually Spent" — the subtitle promises precise, transparent financial tracking.
- Each chapter has clear evidence claims and confidence scores visible from the listing.

---

## Visual Experience

### Observations
- Maps are well-designed with clear cartographic standards (dashed boundaries, evidence levels).
- The British India 1939 map is an excellent reference visual.
- The Partition migration flow map communicates the scale of displacement effectively.
- Charts (death toll estimates, military balance 1947) are clean and annotation-rich.
- AI-generated diagrams (actors network, decision tree) are useful conceptual tools despite being AI-labelled.
- Visuals are placed at relevant narrative points, not clustered.

### Confusions
- The "Cabinet Mission Plan — organisational structure" diagram is AI-generated and the visual style is inconsistent with the maps and charts. The hierarchy diagram format is helpful, but the aesthetic mismatch is noticeable.
- The "Image Pending Licensing" placeholder for a historically significant photograph (Great Calcutta Killing) is an editorial gap.

### Friction
- Some images reference "View at source ↗" external links — I may not want to leave the page to verify a source.
- The "Related Claims" tags below images are not clickable/expandable from what I can see — they appear to be labels rather than interactive links.
- No alt-text verification possible in this mode, but the captions are substantive.

### Positive surprises
- Maps carry explicit evidence levels (A, B, C) and archival provenance. This is unusual and builds trust.
- The "Dashed lines mark disputed borders. Per Book of Record #0003" annotation on boundary maps is exactly the right level of transparency.
- The flow map of Partition migrations (with proportional arrows) is genuinely illuminating — better than any static paragraph could be.

---

## Knowledge Exploration

### Observations
- Topics page lists 15 topics with story counts and entity counts — solid directory.
- Entity page (United Nations) is surprisingly comprehensive: coverage heatmap, statistics, relationship neighborhood, evidence timeline, verified claims.
- The entity page has "Live Signals" (Latest Mention, Trending, Coverage Change, Entity Rank) that suggest real-time monitoring.
- Navigation is consistent across all pages (same top bar, same footer).
- Footer Knowledge Library duplicates some nav items but adds Founding Edition link.

### Confusions
- **Search returns a 500 error.** This is a critical issue. A reader who tries to search will see an error page. I tried searching "Kashmir" and got a server error.
- **Knowledge Graph page says "Loading..."** and appears to be a client-side app that did not render content. A reader cannot explore the knowledge graph.
- Search page with no query shows empty filter UI but no guidance on how to search.
- The "Knowledge Library" nav link goes to `/founding-edition` — but "Knowledge Library" also appears in the footer linking to the same. The naming is inconsistent with "Knowledge Terminal" (/entities) and "Knowledge Graph" (/graph).
- The entity page shows "Evidence: 0", "Sources: 18" but also "Evidence: 0 docs" for each timeline event — unclear what "evidence" means vs. "sources."

### Friction
- The top navigation bar has 9 items, the footer has 4 "Sections" links (Investigations, Data Stories, Policy Tracker, The Fix) plus 4 "Topics" links plus 5 "Knowledge Library" links plus 4 "Governance" links. The navigation model is not consistent between top bar and footer. I am not sure if I have seen everything.
- The `/stories` page lists everything as "stories" including the Namami Gange investigation chapters — but "Investigations" is a separate nav item. The taxonomy is unclear.
- The `/countries` and `/organizations` nav items appear to link to entity category filters but there is no `/entities` page directly accessible from the nav — only via entity profiles.

### Positive surprises
- The entity coverage heatmap (2023-2026) is a genuinely useful visual signal — I can see at a glance how coverage intensity changes over time.
- "Relationship Neighborhood" on the entity page is a strong knowledge graph affordance.
- The confidence score on entity profiles (98%) is clearly stated with an audit trail.

---

## Overall

### The three moments where I most nearly stopped reading

1. **Encountering the "Image Pending Licensing" placeholder** in the flagship Chapter 1 — a Margaret Bourke-White photograph that is described in detail but cannot be seen. The caption describes what the image shows, but seeing a placeholder in the canonical chapter made me wonder: "If the flagship chapter has missing assets, how complete is the rest of the platform?"

2. **Realizing Search is broken (500 error).** After exploring the homepage and starting Chapter 1, I wanted to search for "Kashmir 1947" to see how the platform connected topics. The 500 error was a sharp trust break — the site claims to be a knowledge platform, but a core knowledge discovery tool is down. This would be the moment many readers leave.

3. **The "On this page" sidebar with 58 sections.** When I opened Chapter 1, the sidebar listed every subsection — Part I, Part II, decision matrix, timeline, 8 scholar profiles, evidence sections, glossary, FAQ, etc. The density is admirable but the cognitive load is real. As a reader, I did not know which sections were the main narrative and which were reference. I felt I was supposed to read everything.

### The three moments that most increased my trust

1. **"Historiography: How Scholars Debate Partition"** — This section explicitly presents six competing explanations for why Partition happened, naming the scholars and schools associated with each. No news site, textbook, or Wikipedia article handles scholarly disagreement with this level of structure and transparency. It is the single strongest trust signal on the platform.

2. **The dash-lined boundary maps with "Book of Record #0003" annotations** — Seeing a map that explicitly refuses to present disputed borders as settled fact, with a reference to institutional record-keeping, communicates a level of editorial discipline that is rare in any medium. I trusted the maps more than I trust most news graphics.

3. **The "State of the Evidence" section structure** — A dedicated block that summarizes primary sources, secondary literature, and openly states where the record is "thin, classified, or silent." The willingness to acknowledge gaps is more trustworthy than any claim of completeness.

### The three moments that made me want to continue

1. **The "What You Will Learn" cards on the homepage** — Before I committed to anything, I could see exactly what knowledge I would gain (Historical Foundations, Foreign Policy Origins, Critical Turning Points). This is the right way to invite reading.

2. **The reading mode selector (Explorer, Scholar, Researcher)** — Even though it is not explained, the existence of different entry points for different depths signals that the platform respects my time. I can choose 5 minutes or 4 hours. This is respectful design.

3. **The "Why It Matters Today" / "Open Questions" / "Counterfactual" sections at the end of the chapter** — The chapter does not just end. It tells me why I should care, what is still unknown, and what might have been different. This is the structure of knowledge, not the structure of content. I want to see more chapters built this way.
