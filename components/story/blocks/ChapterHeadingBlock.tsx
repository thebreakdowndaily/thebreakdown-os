import type { ChapterHeadingData } from './types';

export default function ChapterHeadingBlock({ title, anchorId }: ChapterHeadingData) {
  return (
    <h2 
      id={anchorId} 
      className="text-2xl font-bold text-[#F5F5F5] pt-10 mt-10 border-t border-[#2A2A2A] scroll-mt-24"
    >
      {title}
    </h2>
  );
}
