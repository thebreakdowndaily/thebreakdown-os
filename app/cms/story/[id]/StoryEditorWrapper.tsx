'use client';

import StoryEditor from '@/components/cms/StoryEditor';
import type { CMSStory } from '@/utils/cms-data';
import { saveStoryAction } from '../../actions';

export default function StoryEditorWrapper({ initialStory }: { initialStory: CMSStory }) {
  const handleSave = async (updated: CMSStory) => {
    const result = await saveStoryAction(updated);
    if (!result.success) {
      throw new Error(result.error || 'Story save was rejected.');
    }
  };

  return <StoryEditor story={initialStory} onSave={handleSave} />;
}
