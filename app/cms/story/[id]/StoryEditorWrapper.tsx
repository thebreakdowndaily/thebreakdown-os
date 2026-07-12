'use client';

import { useState } from 'react';
import StoryEditor from '@/components/cms/StoryEditor';
import type { CMSStory } from '@/utils/cms-data';
import { saveStoryAction } from '../../actions';

export default function StoryEditorWrapper({ initialStory }: { initialStory: CMSStory }) {
  const [story, setStory] = useState(initialStory);

  const handleSave = async (updated: CMSStory) => {
    setStory(updated);
    try {
      await saveStoryAction(updated);
    } catch (e) {
      console.error('Failed to save story', e);
    }
  };

  return (
    <StoryEditor
      key={story.id + story.updatedAt}
      story={story}
      onSave={handleSave}
    />
  );
}
