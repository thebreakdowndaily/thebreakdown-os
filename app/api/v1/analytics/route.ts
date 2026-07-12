import { NextResponse } from 'next/server';
import { RepositoryFactory } from '@/services/factory/repository';

export async function GET() {
  const storiesRepo = RepositoryFactory.getStoryRepository();

  const [storyCount] = await Promise.all([
    storiesRepo.count(),
  ]);

  return NextResponse.json({
    stats: {
      totalStories: storyCount,
    },
  });
}