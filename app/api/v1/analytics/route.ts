import { NextResponse } from 'next/server';
import { SupabaseStoryRepository } from '@/services/stories/repository';
import { SupabaseTopicRepository } from '@/services/topics/repository';
import { SupabaseEntityRepository } from '@/services/entities/repository';
import { SupabaseFixRepository } from '@/services/fixes/repository';
import { SupabaseMediaRepository } from '@/services/media/repository';

export async function GET() {
  const storiesRepo = new SupabaseStoryRepository();
  const topicsRepo = new SupabaseTopicRepository();
  const entitiesRepo = new SupabaseEntityRepository();
  const fixesRepo = new SupabaseFixRepository();
  const mediaRepo = new SupabaseMediaRepository();

  const [storyCount, topicCount, entityCount, fixCount, mediaCount] = await Promise.all([
    storiesRepo.count(),
    topicsRepo.count(),
    entitiesRepo.count(),
    fixesRepo.count(),
    mediaRepo.count(),
  ]);

  return NextResponse.json({
    stats: {
      totalStories: storyCount,
      totalTopics: topicCount,
      totalEntities: entityCount,
      totalFixes: fixCount,
      totalMedia: mediaCount,
    },
  });
}