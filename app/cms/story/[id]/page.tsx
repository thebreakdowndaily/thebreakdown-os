import { bootstrapServices } from '@/services/bootstrap';
import { redirect } from 'next/navigation';
import CMSShell from '@/components/cms/CMSShell';
import StoryEditorWrapper from './StoryEditorWrapper';
import type { CMSStory } from '@/utils/cms-data';

export const dynamic = 'force-dynamic';

export default async function StoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const services = await bootstrapServices();
  const story = await services.stories.getStory(id);
  
  if (!story && id !== 'new') {
    redirect('/cms/stories');
  }

  const allStoriesRes = await services.stories.getStories({ pageSize: 100 });
  const stories = allStoriesRes.data;

  // For a new story, we'll let the wrapper/editor handle the default structure, 
  // or we could construct it here. For simplicity, we just pass what we found.
  let cmsStory: CMSStory;

  if (!story && id === 'new') {
    cmsStory = {
      id: `story-new-${Date.now()}`,
      title: 'Untitled Story',
      slug: 'untitled-story',
      status: 'draft',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    cmsStory = {
      ...story,
      blocks: story!.blocks || [],
    } as any;
  }

  return (
    <CMSShell selectedId={id} stories={stories}>
      <StoryEditorWrapper initialStory={cmsStory} />
    </CMSShell>
  );
}
