import { NextResponse } from 'next/server';
import { db, serverError } from '@/lib/api-v2';

export async function GET() {
  try {
    const [storiesRes, topicsRes, entitiesRes, timelinesRes, fixesRes] = await Promise.all([
      db().from('stories').select('id, status, category, published_at, slug, title', { count: 'exact' }),
      db().from('topics').select('id', { count: 'exact' }),
      db().from('entities').select('id, type', { count: 'exact' }),
      db().from('timelines').select('id', { count: 'exact' }),
      db().from('fixes').select('id', { count: 'exact' }),
    ]);

    const stories = storiesRes.data || [];
    const entities = entitiesRes.data || [];

    const drafts = stories.filter(s => s.status === 'draft').length;
    const review = stories.filter(s => s.status === 'review').length;
    const factCheck = stories.filter(s => s.status === 'fact_check').length;
    const scheduled = stories.filter(s => s.status === 'scheduled').length;
    const published = stories.filter(s => s.status === 'published').length;

    const storiesByCategory: Record<string, number> = {};
    for (const s of stories) {
      if (s.category) storiesByCategory[s.category] = (storiesByCategory[s.category] || 0) + 1;
    }

    const avgEvidenceScore = 0; // Removed since evidence_score doesn't exist on stories

    const entitiesByType: Record<string, number> = {};
    for (const e of entities) {
      entitiesByType[e.type] = (entitiesByType[e.type] || 0) + 1;
    }

    const stats = {
      totalStories: storiesRes.count || 0,
      totalTopics: topicsRes.count || 0,
      totalEntities: entitiesRes.count || 0,
      totalTimelines: timelinesRes.count || 0,
      totalFixes: fixesRes.count || 0,
      drafts,
      review,
      factCheck,
      scheduled,
      published,
      storiesByCategory,
      entitiesByType,
      averageEvidenceScore: Math.round(avgEvidenceScore * 10) / 10,
    };

    return NextResponse.json({ data: stats });
  } catch (e) { return serverError(e); }
}
