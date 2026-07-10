import React from 'react';
import TableOfContents from '@/components/story/TableOfContents';
import ReadingProgress from '@/components/story/ReadingProgress';
import StorySnapshot from '@/components/story/StorySnapshot';
import type { Story, TOCItem } from '@/types/canonical';

interface StoryLayoutProps {
  children: React.ReactNode;
  story: Story;
  tableOfContents: TOCItem[];
}

const StoryLayout: React.FC<StoryLayoutProps> = ({ children, story, tableOfContents }) => (
  <>
    <ReadingProgress />
    <main className="flex-1 w-full" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr_240px] lg:gap-10 xl:gap-12 relative">
          {/* Left: TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tableOfContents} />
            </div>
          </aside>

          {/* Center: Article content */}
          <article className="min-w-0" aria-label="Article content">
            {children}
          </article>

          {/* Right: Snapshot rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <StorySnapshot
                status={story.status}
                category={story.category}
                location={story.location}
                stakeholderNames={story.stakeholderNames}
                impactLevel={story.impactLevel}
                legislation={story.legislation}
                costValue={story.costValue}
                updatedAt={story.updatedAt}
                evidenceScore={story.evidenceScore}
                sourceCount={story.sources?.length}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  </>
);

export default StoryLayout;