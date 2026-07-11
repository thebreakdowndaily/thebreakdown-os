import React from 'react';
import TableOfContents from '@/components/story/TableOfContents';
import ReadingProgress from '@/components/story/ReadingProgress';
import { BlockRenderer } from '@/components/story/blocks/registry';
import type { Story, TOCItem, StoryBlock } from '@/types/canonical';

interface StoryLayoutProps {
  children: React.ReactNode;
  story: Story;
  tableOfContents: TOCItem[];
  sidebarBlocks?: StoryBlock[];
}

function SidebarBlocksRenderer({ blocks }: { blocks?: StoryBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => <BlockRenderer key={block.id} block={block as any} />)}
    </div>
  );
}

const StoryLayout: React.FC<StoryLayoutProps> = ({ children, story, tableOfContents, sidebarBlocks }) => (
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
              <SidebarBlocksRenderer blocks={sidebarBlocks} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  </>
);

export default StoryLayout;