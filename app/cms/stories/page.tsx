import { bootstrapServices } from '@/services/bootstrap';
import CMSShell from '@/components/cms/CMSShell';
import StoryListClient from './StoryListClient';

export const dynamic = 'force-dynamic';

export default async function CMSStoryListPage() {
  const services = await bootstrapServices();
  const allStoriesRes = await services.stories.getStories({ pageSize: 100 });
  const stories = allStoriesRes.data;

  return (
    <CMSShell stories={stories}>
      <StoryListClient initialStories={stories} />
    </CMSShell>
  );
}
