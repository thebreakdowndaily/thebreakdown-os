'use client';

import type { TBSStory } from '@/types/canonical';
import { TBSRenderer } from './TBSRenderer';
import { validateStory, storyToBlocks } from '@/lib/story/tbs-converter';
import { StoryInspector } from './StoryInspector';

interface StoryPreviewProps {
  story: TBSStory;
  device?: 'desktop' | 'tablet' | 'mobile';
}

const deviceWidths: Record<string, string> = {
  desktop: 'max-w-4xl mx-auto',
  tablet: 'max-w-2xl mx-auto',
  mobile: 'max-w-lg mx-auto px-2',
};

export function StoryPreview({ story, device = 'desktop' }: StoryPreviewProps) {
  const validation = validateStory(story);
  const blocks = storyToBlocks(story);

  return (
    <div
      className={`${deviceWidths[device]} border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#0A0A0A]`}
      role="region"
      aria-label={`Story preview (${device})`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2A2A] bg-[#111111]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
          Preview — {device}
        </span>
        <div className="flex items-center gap-2">
          {validation.errors.length === 0 && validation.warnings.length === 0 && (
            <span className="text-xs font-semibold text-[#22C55E]">✓ Ready</span>
          )}
          {validation.warnings.length > 0 && (
            <span className="text-xs font-semibold text-[#F59E0B]">{validation.warnings.length} warning(s)</span>
          )}
          {validation.errors.length > 0 && (
            <span className="text-xs font-semibold text-[#EF4444]">{validation.errors.length} error(s)</span>
          )}
        </div>
      </div>

      <TBSRenderer story={story} blocks={blocks} validation={validation} />

      <StoryInspector story={story} />
    </div>
  );
}