'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { bootstrapServices } from '@/services/bootstrap';
import { resolveCMSHeroImage } from '@/lib/editorial/cms-hero-image';
import type { CMSStory } from '@/utils/cms-data';
import type { Story, StoryBlock } from '@/types/canonical';
import { getCurrentPrincipal } from '@/features/auth/principal';
import { can } from '@/features/auth/policy';
import { evaluatePublicationContract, evaluatePublicationContractAsync, executePostPublicationEffects } from '@/lib/editorial/canonical-publication';

export async function saveStoryAction(cmsStory: CMSStory) {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    return { success: false, error: 'Unauthorized: Authentication required to edit stories.' };
  }

  const services = await bootstrapServices();
  
  // Fetch existing story to preserve fields that the CMS editor doesn't touch right now
  const existing = await services.stories.getStory(cmsStory.id);

  // The public story reader renders Story.heroImage, not the nested CMS hero block.
  // Keep the canonical field in sync; a blank value in an existing hero block clears it,
  // while legacy stories without a hero block preserve their already-saved image.
  const heroImage = resolveCMSHeroImage(cmsStory.blocks, existing?.heroImage || '');

  const updatedStory: Story = {
    ...existing,
    storyType: existing?.storyType || 'standard',
    id: cmsStory.id,
    title: cmsStory.title,
    slug: cmsStory.slug,
    status: cmsStory.status as any,
    // Hero metadata lives on Story.heroImage; do not persist the CMS-only hero block into narrative content.
    blocks: cmsStory.blocks.filter((block) => block.type !== 'hero') as unknown as StoryBlock[],
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    
    // Default fallback for missing fields if this is a new story
    headline: cmsStory.title,
    summary: existing?.summary || '',
    heroImage,
    author: existing?.author || principal.name,
    category: existing?.category || '',
    evidenceScore: existing?.evidenceScore || 0,
    readingTime: existing?.readingTime || 0,
    publishedAt: existing?.publishedAt || '',
    tags: existing?.tags || [],
    sources: existing?.sources || [],
    claims: existing?.claims || [],
    timeline: existing?.timeline || [],
    faq: existing?.faq || [],
    charts: existing?.charts || [],
    relatedStoryIds: existing?.relatedStoryIds || [],
    relatedEntityIds: existing?.relatedEntityIds || [],
    relatedTopicIds: existing?.relatedTopicIds || [],
    updatedBy: principal.userId,
  };

  if (cmsStory.status === 'published') {
    if (!can(principal, 'story.publish')) {
      return {
        success: false,
        error: `Forbidden: Principal with role '${principal.role}' cannot publish stories. Editor role or higher required.`,
      };
    }

    const decision = await evaluatePublicationContractAsync(existing, updatedStory, principal);
    if (!decision.allowed) {
      return {
        success: false,
        error: decision.error,
        details: decision.gateResult,
      };
    }

    await services.stories.saveStory(decision.updatedStory!, { publicationToken: decision.publicationToken });
    executePostPublicationEffects(decision.updatedStory!, principal, decision.gateResult);

    revalidateTag('stories');
    revalidatePath('/');
    revalidatePath('/stories');
    revalidatePath(`/story/${decision.updatedStory!.slug}`);

    return { success: true, storyId: decision.updatedStory!.id };
  }

  // Non-published updates
  if (!can(principal, 'story.create') && !can(principal, 'story.update')) {
    return { success: false, error: 'Forbidden: Insufficient privileges to edit stories.' };
  }

  await services.stories.saveStory(updatedStory);

  revalidateTag('stories');
  revalidatePath('/');
  revalidatePath('/stories');
  revalidatePath(`/story/${updatedStory.slug}`);

  return { success: true, storyId: updatedStory.id };
}
