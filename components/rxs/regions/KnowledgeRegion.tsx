// @rxs/implementation: screens/story.md — KnowledgeRegion (progress, knowledge profile, evidence coverage)
import { KnowledgeSidebar } from '@/components/rxs/KnowledgeSidebar';
import type { Chapter } from '@/types/canonical';

export function KnowledgeRegion({
  chapter,
  claimCount,
  evidenceCount,
  thinkerCount,
  documentCount,
}: {
  chapter: Chapter;
  claimCount: number;
  evidenceCount: number;
  thinkerCount: number;
  documentCount: number;
}) {
  return (
    <aside data-region="knowledge">
      <KnowledgeSidebar
        chapter={chapter}
        claimCount={claimCount}
        evidenceCount={evidenceCount}
        thinkerCount={thinkerCount}
        documentCount={documentCount}
      />
    </aside>
  );
}
