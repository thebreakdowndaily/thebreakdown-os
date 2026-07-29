import { TBSRenderer } from '@/components/story/TBSRenderer';
import { storyToBlocks, validateStory } from '@/lib/story/tbs-converter';
import storyData from '@/lib/story/tspe-stories/rbi-monetary-policy';

export const dynamicParams = true;

export default function RBIMonetaryPolicyPage() {
  const blocks = storyToBlocks(storyData);
  const validation = validateStory(storyData);

  return <TBSRenderer story={storyData} blocks={blocks} validation={validation} />;
}