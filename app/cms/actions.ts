'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { bootstrapServices } from '@/services/bootstrap';
import type { CMSStory } from '@/utils/cms-data';
import type { Story, StoryBlock } from '@/types/canonical';

export async function saveStoryAction(cmsStory: CMSStory) {
  const services = await bootstrapServices();
  
  // Fetch existing story to preserve fields that the CMS editor doesn't touch right now
  let existing = await services.stories.getStory(cmsStory.id);
  
  const updatedStory: Story = {
    ...existing,
    storyType: existing?.storyType || 'standard',
    id: cmsStory.id,
    title: cmsStory.title,
    slug: cmsStory.slug,
    status: cmsStory.status as any,
    blocks: cmsStory.blocks as StoryBlock[],
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    
    // Default fallback for missing fields if this is a new story
    headline: cmsStory.title,
    summary: '',
    heroImage: '',
    author: '',
    category: '',
    evidenceScore: 0,
    readingTime: 0,
    publishedAt: '',
    tags: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: []
  };

  await services.stories.saveStory(updatedStory);

  revalidateTag('stories');
  revalidatePath('/');
  revalidatePath('/stories');
  revalidatePath(`/story/${updatedStory.slug}`);

  return { success: true, storyId: updatedStory.id };
}
