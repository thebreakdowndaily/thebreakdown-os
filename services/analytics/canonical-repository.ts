import type { AnalyticsEvent, DashboardStats } from '@/types/canonical';
import { db } from '@/lib/api-v2';

export class CanonicalAnalyticsService {
  async track(event: AnalyticsEvent): Promise<void> {
    await db().from('activity_log').insert({
      event_type: event.type,
      entity_type: event.storyId ? 'story' : event.entityId ? 'entity' : event.topicId ? 'topic' : 'unknown',
      entity_id: event.storyId || event.entityId || event.topicId || '',
      user_id: event.userId || null,
      metadata: event.metadata || null,
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [storiesRes, topicsRes, entitiesRes, timelinesRes, fixesRes, activityRes] = await Promise.all([
      db().from('stories').select('id, status', { count: 'exact' }),
      db().from('topics').select('id', { count: 'exact' }),
      db().from('entities').select('id', { count: 'exact' }),
      db().from('timelines').select('id', { count: 'exact' }),
      db().from('fixes').select('id', { count: 'exact' }),
      db().from('activity_log').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    const stories = (storiesRes.data || []) as { id: string; status: string }[];
    const activity = (activityRes.data || []) as {
      id: string;
      event_type: string;
      entity_slug?: string;
      entity_id?: string;
      created_at: string;
      user_id?: string;
    }[];

    return {
      totalStories: storiesRes.count || 0,
      totalTopics: topicsRes.count || 0,
      totalEntities: entitiesRes.count || 0,
      totalTimelines: timelinesRes.count || 0,
      totalFixes: fixesRes.count || 0,
      totalMedia: 0,
      totalDatasets: 0,
      drafts: stories.filter(s => s.status === 'draft').length,
      review: stories.filter(s => s.status === 'review').length,
      scheduled: stories.filter(s => s.status === 'scheduled').length,
      published: stories.filter(s => s.status === 'published').length,
      recentActivity: activity.map(e => ({
        id: e.id,
        type: e.event_type,
        label: `${e.event_type}: ${e.entity_slug || e.entity_id}`,
        timestamp: e.created_at,
        userId: e.user_id,
      })),
      topStories: [],
      topTopics: [],
      searchQueries: [],
    };
  }
}
