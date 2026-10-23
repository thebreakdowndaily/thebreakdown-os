import { bootstrapServices } from '@/services/bootstrap';
import { redirect } from 'next/navigation';
import CMSShell from '@/components/cms/CMSShell';
import StoryEditorWrapper from './StoryEditorWrapper';
import type { CMSStory, Block } from '@/utils/cms-data';
import { withCMSHeroBlock } from '@/lib/editorial/cms-hero-image';

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
    const createdAt = new Date().toISOString();
    const newStory = {
      id: `story-new-${Date.now()}`,
      title: 'Untitled Story',
      slug: 'untitled-story',
      status: 'draft' as const,
      createdAt,
      updatedAt: createdAt,
    };
    cmsStory = {
      ...newStory,
      blocks: withCMSHeroBlock([], newStory),
    };
  } else {
    const canonical = story!;
    cmsStory = {
      ...canonical,
      blocks: withCMSHeroBlock((canonical.blocks || []) as unknown as Block[], {
        id: canonical.id,
        title: canonical.title,
        headline: canonical.headline,
        summary: canonical.summary,
        heroImage: canonical.heroImage,
        heroImageAlt: canonical.heroImageAlt,
        heroImageIsDecorative: canonical.heroImageIsDecorative,
        category: canonical.category,
        author: canonical.author,
        publishedAt: canonical.publishedAt,
      }),
    } as unknown as CMSStory;
  }

  return (
    <CMSShell selectedId={id} stories={stories}>
      <StoryEditorWrapper initialStory={cmsStory} />
    </CMSShell>
  );
}
