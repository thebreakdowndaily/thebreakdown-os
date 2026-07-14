# Story Experience

> **RXS v1.0 (Frozen)** — Part of the Reader Experience System. Do not modify outside the governance process defined in `README.md`.

## Goal

Design the reading surface where a reader moves from entry to understanding for any single narrative knowledge object — Story, Chapter, Investigation, or Monograph. This is the canonical screen. Every other surface derives from it. If this screen is correct, 80% of the platform is solved.

## Reader Intent

**Understand.** The reader wants to grasp what happened, why it matters, and what the key takeaways are. They may or may not read every word.

**Verify.** The reader encounters a claim and wants to confirm it against the source before accepting it. Trust is not granted by default.

**Learn.** The reader wants to retain knowledge. They expect learning objectives, glossary terms, review questions, and a path to deeper study.

**Research.** The reader wants to extract claims with full source trails for independent use. They navigate by following evidence, not by reading linearly.

**Continue learning.** The reader returns after a previous session and expects to resume exactly where they left off, with all context preserved.

## Story Lifecycle

**Landing.** The reader arrives from a link, search result, or library index. Before they commit, they need to know what this is, why it matters, how long it takes, and whether it is trustworthy. The landing state must answer these in the first few seconds.

**Orientation.** The reader chooses to engage. They are shown the Six Questions, the learning objectives, the estimated reading time for their mode, and the chapter's position within the volume and collection. They know where they are before they begin.

**Reading.** The reader progresses through the narrative. This is the longest phase. The narrative is linear and sectioned. At any point the reader can open evidence, view a source, jump to a thinker, or switch reading mode. The reading phase supports depth on demand without breaking flow.

**Verification.** The reader pauses the narrative to verify a claim. They open the evidence panel, examine the source, check the confidence score, and optionally view counterarguments. Verification is a sub-phase within reading — it does not require leaving the story. The reader returns to the narrative at the same position.

**Exploration.** The reader follows a cross-link to a related entity, thinker, document, or chapter. Exploration leaves the current story and enters the knowledge graph. The reader can return to the story with a single action. Exploration is the phase where the platform proves it is a knowledge system, not a page archive.

**Completion.** The reader reaches the final learning section. They have answered the Six Questions. They are offered the next logical story, a summary of what they learned, and an invitation to provide feedback. Completion is not the end — it is a branching point to the next journey.

## Screen Regions

**Header.** Contains the story's position in the knowledge graph: library, collection, volume, breadcrumb. Also contains the version badge, last-verified date, and the mode selector. The header exists to orient the reader before they read a single word.

**Hero.** A single primary image or visual asset that establishes the topic's significance. The hero is pedagogical — it teaches something about the subject. It exists to signal the story's thematic weight and to provide a memorable visual anchor.

**Reader Context.** Contains the executive summary, Six Questions, learning objectives, estimated reading time, and difficulty level. This region exists to answer "Should I read this?" and "What will I learn?" before the reader commits to the narrative.

**Navigation.** Contains the table of contents, section progress indicator, and chapter-sequence controls (previous, next). This region exists so the reader always knows where they are and can move freely within the story and between adjacent stories.

**Primary Content.** The narrative itself. Sections of prose with embedded claims, evidence links, thinker mentions, documents, timelines, and maps. This region exists to deliver the evidence spine in a readable, linear form while providing depth on demand at every point.

**Knowledge Sidebar.** Contextual information that changes as the reader scrolls: the current thinker's mini-profile, the active section's glossary terms, the relevant timeline snippet. This region exists to provide parallel context without interrupting the narrative flow.

**Learning Layer.** Learning objectives restated with outcomes, section-by-section takeaways, glossary, review questions, and further reading. This region exists to confirm and extend understanding after the narrative is complete.

**Footer.** Sources cited, version history link, feedback invitation, corrections policy link, and the story's place in the broader publication roadmap. This region exists to anchor the story in the institution's transparency framework.

## Information Priority

1. **Title.** The reader must know what they are reading. Title is the first piece of information on every story surface.

2. **Executive summary.** Before the reader commits, they need to know what this story covers and why it matters. Three to five paragraphs that answer the Six Questions at surface level.

3. **Six Questions.** The explicit framework the story answers. Visible before the narrative begins. The reader knows what answers to expect.

4. **Learning objectives.** What the reader will be able to do after reading. "By the end of this story, you will be able to..." These are specific and testable.

5. **Estimated reading time and difficulty.** The reader needs to decide whether they have time now. Shown by reading mode since Explorer and Researcher times differ significantly.

6. **Version and last-verified date.** Trust before content. The reader must know whether this story is current before they invest attention.

7. **Section structure.** The outline of the narrative. The reader needs to know what ground the story covers before they begin reading.

8. **Narrative body.** The primary content. Sections of prose in a defined order. Each section addresses one phase of the Six Questions.

9. **Claims within narrative.** Every factual assertion rendered with inline confidence signal. Claims are not separate from the narrative — they are the narrative's evidentiary skeleton.

10. **Evidence behind claims.** One action from each claim. Not visible by default but always reachable. Evidence summaries, source links, confidence details.

11. **Counterarguments.** One action from each claim that has scholarly disagreement. The reader encounters the claim, sees the confidence score, and can immediately open the counterargument.

12. **Thinker profiles.** Accessible from any thinker mention. Not rendered inline by default but reachable in one action from the narrative.

13. **Primary sources and documents.** One action from each source citation. The full document or facsimile for independent verification.

14. **Timeline.** Chronological context accessible from any event mention. Aggregates across stories.

15. **Maps.** Spatial context for geographic references. Accessible from narrative mentions.

16. **Key takeaways.** End of each major section. Two to four sentences summarising what the section established. Mental checkpoints.

17. **Glossary.** Collected terms with definitions. Inline definitions on first appearance. Full glossary at the learning layer.

18. **Review questions.** End of story. Five to ten comprehension questions. Not recall — understanding.

19. **Further reading.** Curated sources for deeper exploration. Each with a one-sentence explanation of why.

20. **Sources cited.** Complete list of every source referenced. Links to canonical source objects.

21. **Feedback and corrections.** End of story. Invitation to report errors, challenge interpretations, or suggest improvements.

## Knowledge Flow

**Context before narrative.** The reader must understand where this story sits in time, space, and the broader knowledge graph before they can understand the narrative. Historical context, prerequisite knowledge, and connections to prior stories are established first.

**Narrative before claims.** The reader must experience the story before they interrogate its evidence. Claims are embedded in the narrative but never interrupt it. The narrative is the primary surface.

**Claims before evidence.** The reader must know what is being asserted before they can evaluate the evidence for it. Every claim is established in the narrative before its evidence panel is available.

**Evidence before synthesis.** The reader must see the raw evidence before they accept the editorial synthesis. Evidence panels open within the narrative. Synthesis and editorial judgment come after the evidentiary foundation is visible.

**Synthesis before reflection.** The chapter closes with editorial judgment — what the balance of evidence suggests, what remains contested, and why it matters. Only after this does the reader enter the learning and reflection phase.

This ordering is immutable. Reversing any pair erodes trust. Presenting synthesis before evidence asks the reader to accept before understanding. Presenting evidence before claims asks the reader to evaluate without context.

## Reader Decisions

**Continue reading.** The default action. The reader moves forward through the narrative section by section. No decision required — the path is linear.

**Open evidence.** The reader chooses to verify a specific claim. They pause the narrative to examine the supporting evidence. The decision signals that the reader wants to trust but needs confirmation.

**Switch reading mode.** The reader changes depth: Explorer to Scholar for more evidence, Scholar to Researcher for full source trails. The decision signals that the reader's intent has changed mid-story.

**Jump to thinker.** The reader encounters a thinker and wants their full profile. They leave the narrative temporarily and return.

**Open timeline.** The reader wants chronological context for an event. The timeline expands inline or opens as a parallel view.

**Open source.** The reader wants the full document behind a citation. They leave the narrative temporarily to verify independently.

**Follow cross-link.** The reader follows a connection to a related entity, chapter, or document. They leave the current story and enter the knowledge graph. The story remains accessible via a single back action.

**Bookmark.** The reader marks their position for later return. The decision signals that the story is worth continuing but the session is ending.

**Highlight.** The reader selects a passage for personal reference. The decision signals that this passage matters to the reader's own learning or research.

**Take notes.** The reader writes a personal annotation attached to a specific passage, claim, or section. The decision signals that the reader is processing knowledge for their own use.

**Continue learning.** The reader completes the story and chooses the next one. The decision signals that the reader trusts the platform enough to stay.

**Report feedback.** The reader reports an error, challenges an interpretation, or suggests an improvement. The decision signals that the reader cares about the institution's accuracy.

Each decision is optional. The default path — continue reading — is always the most obvious action. No decision is ever required to continue.

## Completion

**Explorer.** Has read the executive summary, the narrative body, and the learning section. Can answer the Six Questions at surface level. Has seen at least one confidence badge. Leaves with the ability to explain what happened and why it matters.

**Scholar.** Has read the full narrative with evidence panels opened for major claims. Has examined at least one counterargument and one primary source. Can articulate both the dominant interpretation and the challenges to it. Leaves with verified confidence in the story's claims.

**Researcher.** Has extracted one or more verified claims with complete source trails. Has independently verified at least one claim against the primary document. Can cite sources with full provenance. Leaves with material they can use in their own work.

## Success Metrics

**1. Completion rate by mode.** Percentage of readers who reach the final learning section, segmented by Explorer, Scholar, Researcher.

**2. Evidence open rate.** Percentage of readers who open at least one evidence panel. Measures verification behaviour.

**3. Source open rate.** Percentage of readers who open at least one source card or primary document. Measures depth of verification.

**4. Counterargument view rate.** Percentage of readers who open at least one counterargument. Measures engagement with scholarly disagreement.

**5. Thinker profile view rate.** Percentage of readers who view at least one thinker profile from within the story.

**6. Timeline interaction rate.** Percentage of readers who expand or interact with the timeline.

**7. Map interaction rate.** Percentage of readers who expand or interact with a map.

**8. Continue-learning click rate.** Percentage of readers who click a "next" or "related" link on the completion screen.

**9. Return reader rate (7-day).** Percentage of readers who return to the platform within seven days.

**10. Mode switch rate.** Percentage of readers who change reading mode mid-story. Measures whether the initial mode selection was correct.

**11. Claim-to-evidence conversion.** Ratio of claims with visible evidence panels to claims that are read without evidence. Measures trust-by-default behaviour.

**12. Bookmark rate.** Percentage of readers who bookmark a position within the story.

**13. Highlight rate.** Percentage of readers who highlight at least one passage.

**14. Note rate.** Percentage of readers who take at least one note.

**15. Feedback submission rate.** Percentage of readers who submit feedback, report an error, or challenge an interpretation.

## Anti-patterns

**1. Infinite scrolling.** A story that never ends. The reader cannot find the bottom. No natural completion signal.

**2. Hidden evidence.** Claims presented without visible evidence links. The reader must search for verification.

**3. Orphan claims.** Claims that link to no evidence, no source, no confidence score. The reader cannot verify.

**4. No orientation.** The story starts with narrative. No title context. No summary. No learning objectives. The reader does not know whether to commit.

**5. Dead-end pages.** The story ends with nothing. No next chapter. No related content. No feedback invitation. The reader's journey stops.

**6. Footnotes as evidence.** Evidence relegated to the bottom of the page. The reader must scroll away from the claim to verify.

**7. Conclusions before evidence.** The story states its editorial judgment before establishing the evidentiary foundation. The reader is asked to accept before understanding.

**8. False certainty.** Contested claims presented as settled fact. No confidence score. No counterargument. The reader leaves with unwarranted certainty.

**9. Jargon without definition.** Specialised terms appear without inline explanation. The reader encounters unfamiliar vocabulary without recourse.

**10. Missing timeline.** Events discussed without chronological context. The reader cannot place the narrative in time.

**11. No progress indicator.** The reader cannot tell how much remains. Long stories feel endless.

**12. Mode-locked content.** Depth that is only available in Researcher mode. The Explorer who wants to verify a claim cannot.

**13. Social sharing as primary call to action.** The story ends with "Share this" instead of "What do you want to learn next?"

**14. Personalised recommendations based on engagement.** Suggested stories driven by page views rather than knowledge graph proximity.

**15. Auto-playing media.** Video or audio that starts without reader action. The reader's attention is stolen before it is earned.

**16. Paywalled evidence.** Evidence that requires authentication to access. The reader cannot verify without creating an account.

**17. Stale content without notice.** A story last verified two years ago shown without freshness indication. The reader trusts outdated material.

**18. Silent correction.** A corrected passage with no indication that it was changed. The reader encounters no version history.

**19. Unlinked entity mentions.** A thinker, country, or organisation named in the narrative with no link to their knowledge object. The reader cannot explore.

**20. Completion without understanding.** The reader finishes the story but cannot answer the Six Questions. The experience failed.
