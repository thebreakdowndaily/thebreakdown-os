# Reader Workspace

> **RXS v1.0 (Frozen)** — Part of the Reader Experience System. Do not modify outside the governance process defined in `README.md`.

## Goal

Design the reader's personal relationship with the institution across sessions. The Reader Workspace is where highlights, notes, collections, bookmarks, reading history, saved searches, followed entities, and learning progress live. It is not a dashboard — it is a persistent context that makes every return faster and every session deeper than the last.

## Reader Intent

**Review highlights.** The reader wants to revisit passages they marked across different chapters and investigations. Highlights are the reader's own curated knowledge — the parts of the institution worth remembering.

**Access notes.** The reader took notes while reading — personal annotations, questions, connections to their own work. Notes are the reader's thinking attached to the institution's knowledge.

**Manage collections.** The reader groups chapters, investigations, documents, and thinkers into personal collections — "Cold War readings," "Sources for my paper," "Learning path: Federalism." Collections are the reader's own knowledge organisation.

**Resume bookmarks.** The reader saved specific positions in chapters and investigations. Bookmarks are precise — they mark a paragraph, a claim, an evidence block — not a page.

**Review reading history.** The reader wants to see what they read, in what order, and when. History is the reader's record of engagement with the institution.

**Revisit saved searches.** The reader saved a Knowledge Explorer query — a mode, signal, and filter combination — and wants to run it again to see new results.

**Check followed entities.** The reader follows topics, thinkers, countries, and organisations. Followed entities surface updates — new chapters, added evidence, revised findings.

**Track learning progress.** The reader wants to see their progress across volumes, collections, and learning paths. Progress is the reader's sense of advancement through the institution's knowledge.

**Export knowledge.** The reader wants to export highlights, notes, citations, or evidence blocks for use outside the platform. Export is the reader taking the institution's knowledge into their own workflow.

**Review reading statistics.** The reader wants to see how much they have read, across how many chapters, over what period. Statistics are the reader's sense of their own engagement.

## Workspace Lifecycle

**Arrival.** The reader enters the Workspace. They see their most recent activity first — last chapter read, last highlight added, last note taken. The Workspace assumes the reader returns to continue, not to browse. Recent activity is the primary signal.

**Orientation.** The reader sees the structure of their Workspace — highlights, notes, collections, bookmarks, history, saved searches, followed entities, progress. Each section is a dimension of the reader's relationship with the institution. The reader chooses where to focus.

**Review.** The reader opens a section — highlights, notes, history, progress — and reviews its contents. Review is the stage where the reader re-engages with knowledge they encountered before.

**Organise.** The reader creates a collection, adds items to it, reorders them, or removes them. Organisation is the reader constructing their own knowledge structure on top of the institution's.

**Export.** The reader selects items — highlights, notes, citations, evidence blocks — and exports them in a structured format. Export is the reader taking knowledge into their own workflow.

**Return to learning.** The reader opens a highlight, bookmark, or collection item and returns to the corresponding knowledge object. The Workspace is the bridge between past and future learning sessions.

**Maintain.** The reader updates followed entities, clears history, or exports a collection for archiving. Maintenance is the reader managing their relationship with the institution over time.

## Workspace Sections

**Recent Activity.** A chronological feed of the reader's last actions — chapter read, highlight added, note taken, bookmark saved. Exists so the reader can resume their most recent context without navigating through sections.

**Highlights.** Every passage the reader has highlighted across all knowledge objects. Each highlight shows: the passage text, the source chapter or investigation, the date highlighted, and the reader's note if any. Highlights are searchable and filterable by collection, volume, and date. Exists as the reader's personal evidence collection.

**Notes.** Every annotation the reader has written. Each note shows: the note text, the passage it annotates, the source object, and the date. Notes are searchable and exportable. Exists as the reader's thinking attached to institutional knowledge.

**Collections.** Reader-created groups of knowledge objects. A collection has a name, an optional description, and a list of items — chapters, investigations, documents, thinker profiles, evidence blocks. Items can be ordered, annotated with a personal note, and tagged. Collections are private by default with an optional share setting. Exists so the reader can organise knowledge for their own purposes.

**Bookmarks.** Precise positions saved across knowledge objects. Each bookmark shows: the surrounding passage, the source object, and the date saved. Bookmarks differ from highlights — they mark position, not content. Exists so the reader can return to an exact location.

**Reading History.** Every knowledge object the reader has opened, in reverse chronological order. Each entry shows: the object title, type, collection, date first opened, date last accessed, and time spent. History is filterable by type, collection, and date range. Exists as the reader's record of engagement.

**Saved Searches.** Every Knowledge Explorer query the reader has saved. Each saved search shows: the discovery mode, the signal, any active filters, the date last run, and a "Run again" action. Exists so the reader can re-run discovery sessions.

**Followed Entities.** Every topic, thinker, country, and organisation the reader follows. Each followed entity shows: the entity name, type, recent updates (new chapters, added evidence, revised findings), and an unfollow action. Exists as the reader's subscription to institutional knowledge.

**Learning Progress.** The reader's advancement through volumes, collections, and learning paths. Each volume shows: total chapters, chapters completed, progress percentage, and estimated remaining time. Each learning path shows: total items, items completed, and progress percentage. Exists as the reader's sense of accomplishment and direction.

**Export Center.** A unified interface for exporting workspace data. The reader selects items — specific highlights, notes, collections, or an entire export of all workspace data. Export formats include: plain text, Markdown, JSON, and citation formats (BibTeX, MLA, APA, Chicago). Exists so the reader can take their knowledge into any external workflow.

**Reading Statistics.** Aggregate data about the reader's engagement. Total chapters read, total highlights, total notes, total time spent, longest session, most active day, collections created, entities followed. Exists as the reader's sense of their own relationship with the institution.

## Reader Decisions

**Open a highlight.** The reader clicks a highlighted passage and returns to its position in the source chapter or investigation. The highlight is the entry point back to learning.

**Edit a note.** The reader updates a personal annotation. Notes are editable because thinking evolves.

**Create a collection.** The reader names and describes a new collection. They begin adding items from their history, bookmarks, or highlights.

**Add item to collection.** The reader selects an item from history, highlights, or bookmarks and adds it to an existing or new collection.

**Remove item from collection.** The reader removes an item. The item is not deleted from the reader's history or highlights — only from that collection.

**Delete a collection.** The reader deletes a collection. The items within are not deleted from the Workspace — only the collection structure is removed.

**Share a collection.** The reader generates a shareable link to a collection. The link opens a read-only view of the collection's items for external readers.

**Export highlights.** The reader exports all or selected highlights in a chosen format. The export includes the passage text, source citation, and date.

**Export notes.** The reader exports all or selected notes with their associated passage and source.

**Export citations.** The reader selects knowledge objects and exports their citations in a chosen format.

**Export collection.** The reader exports an entire collection — all items, their order, and any personal annotations — as a structured file.

**Run saved search.** The reader clicks a saved search and re-runs it in the Knowledge Explorer. Results may differ if new content has been added since the search was saved.

**Unfollow entity.** The reader stops following a topic, thinker, country, or organisation. Updates will no longer appear in the reader's feed.

**Clear reading history.** The reader clears their reading history. The action is reversible within a grace period.

**Download all workspace data.** The reader exports the complete contents of their Workspace — every highlight, note, collection, bookmark, saved search, and followed entity — as a single structured archive.

## Trust Signals

**Data ownership statement.** A persistent notice that the reader's workspace data — highlights, notes, collections — belongs to the reader and is exportable at any time. Exists because trust requires the reader to know their data is theirs.

**Sync status indicator.** Shows whether the workspace is up to date or syncing. Exists so the reader knows their data is preserved.

**Last synced timestamp.** Displays the date and time of the last successful sync. Exists as verification that the workspace is current.

**Export verification.** Every export operation shows a success confirmation with file size, format, and item count. Exists so the reader knows the export completed correctly.

**Collection share visibility label.** Shared collections display their visibility status — "Shared" or "Private" — on every collection card. Exists so the reader always knows who can see their collections.

**History retention notice.** A clear statement of how long reading history is retained and under what conditions it may be deleted. Exists so the reader can make informed decisions about what to save permanently.

**Correction notification for saved content.** If a chapter the reader has highlighted or bookmarked receives a correction, the reader is notified. The highlight or bookmark is preserved but flagged as "This content has been corrected since you saved it." Exists so the reader's personal knowledge does not become outdated.

## Failure Modes

1. **No recent activity.** The Workspace shows an empty feed. The returning reader sees nothing and must navigate to find their context.

2. **Highlights without source context.** A highlight shows the passage but not the chapter or collection it came from. The reader cannot return to the source.

3. **Notes detached from passages.** A note appears without the passage it annotates. The reader cannot recall what they were responding to.

4. **Collections without purpose.** Every collection looks the same. No description, no ordering, no way to distinguish a reading list from a research archive.

5. **Bookmarks without positioning context.** A bookmark shows the chapter title but not the section or passage. The reader must search within the chapter to find their position.

6. **History without filters.** Every opened object appears in a single chronological list. The reader cannot filter by type, collection, or date range.

7. **No export path.** The reader cannot export their highlights, notes, or collections. The Workspace is a data silo.

8. **Export without citation metadata.** An exported highlight includes the passage but not the source citation. The reader cannot reference it properly.

9. **Saved searches never updated.** A saved search returns the same results every time. New content added since the search was saved is not included.

10. **Followed entities without updates.** The reader follows a topic but sees no indication of new chapters or added evidence. The follow signal is ignored.

11. **Learning progress without context.** A progress bar shows 60% complete but does not indicate which chapters are completed and which remain. The reader cannot see their path forward.

12. **No search within workspace.** The reader has hundreds of highlights across dozens of chapters. There is no way to search them.

13. **Collection items not linked.** A collection item shows the title but is not a live link to the knowledge object. The reader must search for the item outside the collection.

14. **Sync anxiety.** The workspace shows no sync status. The reader does not know whether their latest highlight or note was saved.

15. **Correction silence.** A chapter the reader highlighted is corrected. The reader's highlight points to now-outdated content with no notification.

16. **No mobile workspace.** The Workspace is desktop-only. The reader who reads on mobile cannot review highlights or notes.

17. **Workspace and reading are disconnected.** The reader must leave the Workspace to read and leave the reader to find the Workspace. No cross-linking.

18. **Share without access control.** A shared collection is accessible by anyone with the link. No option to restrict sharing to specific readers.

19. **Export format incompleteness.** An export in Markdown loses highlights, notes lose their source links, citations lack full provenance. The export claims completeness but delivers partial data.

20. **No delete confirmation.** Deleting a collection, clearing history, or removing highlights happens immediately with no confirmation and no undo. The reader loses data permanently.

## Success Metrics

1. **Workspace return rate (7-day).** Percentage of workspace users who return within seven days. Measures whether the workspace earns repeated use.

2. **Highlight-to-return rate.** Percentage of highlights that lead the reader back to the source chapter within 30 days. Measures whether highlights function as re-engagement paths.

3. **Collection creation rate.** Number of collections created per active reader. Measures whether readers find value in organising knowledge.

4. **Collection item count.** Average number of items per collection. Measures whether collections are populated or abandoned.

5. **Export rate.** Percentage of workspace users who export any data. Measures whether the workspace is used as a research tool.

6. **Saved search reuse rate.** Percentage of saved searches that are re-run within 30 days. Measures whether the Knowledge Explorer integration works.

7. **Follow-to-update engagement.** Percentage of followed entities where the reader views an update within 7 days of the update being published. Measures whether follow notifications drive re-engagement.

8. **Learning path completion rate.** Percentage of readers who complete a learning path and have workspace tracking enabled. Measures whether progress tracking supports completion.

9. **Note density.** Average number of notes per chapter read. Measures whether the reader processes knowledge actively.

10. **Annotation re-read rate.** Percentage of highlights or notes that the reader views again after the initial session. Measures whether personal annotations retain value.

11. **Correction notification click rate.** Percentage of readers who click a correction notification for saved content. Measures whether readers care about the accuracy of their personal knowledge.

12. **Share-to-collaboration rate.** Percentage of shared collections that are viewed by at least one external reader. Measures whether collections serve as collaborative knowledge objects.

13. **Workspace search usage.** Percentage of workspace users who search within their own highlights, notes, or collections. Measures whether the workspace contains enough data to warrant search.

14. **Export format distribution.** Percentage of exports by format — Markdown, JSON, BibTeX, MLA, APA, Chicago. Measures which formats serve reader needs.

15. **Data portability completion rate.** Percentage of readers who successfully export all requested data on the first attempt. Measures whether the export system is reliable.

## Immutable Rules

1. The reader owns their workspace data. All highlights, notes, collections, bookmarks, and saved searches are exportable in full at any time.

2. Highlights and bookmarks are preserved even if the source content changes. The reader's passage is shown alongside a notice if the source has been corrected or updated.

3. Every highlight shows its source chapter, collection, and position. A highlight without source context is not a highlight — it is an orphaned passage.

4. Every note is attached to a specific passage. Standalone notes are not supported. Notes exist in context.

5. Collections are private by default. Sharing is opt-in with visible privacy status on every collection card.

6. Reading history is retained for a minimum of one year. Readers may clear their history at any time with a 30-day reversible grace period.

7. Saved searches re-run against the current knowledge graph. They reflect new content added since the search was saved.

8. Learning progress is computed from the canonical chapter registry. A chapter is marked complete when the reader reaches the final learning section.

9. The Workspace is accessible from every page on the platform. The reader never has to navigate to the homepage to find their workspace.

10. Workspace data syncs automatically. The sync status indicator is always visible. The reader never wonders whether their data was saved.

11. The Workspace has a unified search that covers highlights, notes, collections, and bookmarks. The reader can find anything they saved.

12. Collection items link directly to the canonical knowledge object. A collection is a navigable structure, not a static list.

13. Export includes full citation metadata in the selected format. An exported highlight includes the passage, source, collection, and a formatted citation.

14. Correction notifications for saved content are opt-out, not opt-in. The reader is notified by default and may disable notifications per chapter.

15. The Workspace is fully functional on mobile. Every section, export, and action available on desktop is available on mobile.
