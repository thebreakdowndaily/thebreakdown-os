import { NextResponse } from 'next/server';
import { db, serverError } from '@/lib/api-v2';

interface AnalyticsStory {
  id: string;
  status: string;
  category: string;
  published_at: string | null;
  slug: string;
  title: string;
}

interface AnalyticsEntity {
  id: string;
  type: string;
}

export async function GET() {
  try {
    const [storiesRes, topicsRes, entitiesRes, timelinesRes, fixesRes] = await Promise.all([
      db().from('stories').select('id, status, category, published_at, slug, title', { count: 'exact' }),
      db().from('topics').select('id', { count: 'exact' }),
      db().from('entities').select('id, type', { count: 'exact' }),
      db().from('timelines').select('id', { count: 'exact' }),
      db().from('fixes').select('id', { count: 'exact' }),
    ]);

    const stories = (storiesRes.data || []) as AnalyticsStory[];
    const entities = (entitiesRes.data || []) as AnalyticsEntity[];

    const drafts = stories.filter(s => s.status === 'draft').length;
    const review = stories.filter(s => s.status === 'review').length;
    const factCheck = stories.filter(s => s.status === 'fact_check').length;
    const scheduled = stories.filter(s => s.status === 'scheduled').length;
    const published = stories.filter(s => s.status === 'published').length;

    const storiesByCategory: Record<string, number> = {};
    for (const s of stories) {
      if (s.category) storiesByCategory[s.category] = (storiesByCategory[s.category] || 0) + 1;
    }

    const entitiesByType: Record<string, number> = {};
    for (const e of entities) {
      if (e.type) entitiesByType[e.type] = (entitiesByType[e.type] || 0) + 1;
    }

    return NextResponse.json({
      data: {
        totals: {
          stories: storiesRes.count || 0,
          topics: topicsRes.count || 0,
          entities: entitiesRes.count || 0,
          timelines: timelinesRes.count || 0,
          fixes: fixesRes.count || 0,
        },
        storyStatus: {
          drafts,
          review,
          factCheck,
          scheduled,
          published,
        },
        storiesByCategory,
        entitiesByType,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
