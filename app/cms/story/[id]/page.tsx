'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CMSShell from '@/components/cms/CMSShell';
import StoryEditor from '@/components/cms/StoryEditor';
import { mockCMSStories, createNewStory, type CMSStory } from '@/utils/cms-data';

export default function StoryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [story, setStory] = useState<CMSStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Simulate async fetch
    setTimeout(() => {
      const found = mockCMSStories.find((s) => s.id === id);
      if (found) {
        setStory(found);
      } else {
        // Story not found — redirect to CMS home
        router.replace('/cms');
      }
      setLoading(false);
    }, 100);
  }, [id, router]);

  const handleSave = (updated: CMSStory) => {
    console.log('Saving story:', updated.id, updated.title);
    // In production, this would call an API
    // For mock, update in memory
    const idx = mockCMSStories.findIndex((s) => s.id === updated.id);
    if (idx >= 0) {
      mockCMSStories[idx] = updated;
    }
  };

  if (loading) {
    return (
      <CMSShell selectedId={id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--color-text-tertiary)',
            fontSize: '14px',
          }}
        >
          Loading story...
        </div>
      </CMSShell>
    );
  }

  if (!story) {
    return (
      <CMSShell selectedId={id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--color-text-tertiary)',
            fontSize: '14px',
          }}
        >
          Story not found
        </div>
      </CMSShell>
    );
  }

  return (
    <CMSShell selectedId={id}>
      <StoryEditor
        key={story.id + story.updatedAt}
        story={story}
        onSave={handleSave}
      />
    </CMSShell>
  );
}
