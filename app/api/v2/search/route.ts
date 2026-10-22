import type { NextRequest } from 'next/server';
import { db, list, serverError } from '@/lib/api-v2';

type SearchRow = {
  ref_id: string;
  ref_type: string;
  ref_slug: string;
  score: number | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const pageRaw = parseInt(searchParams.get('page') || '1', 10);
    const pageSizeRaw = parseInt(searchParams.get('pageSize') || '20', 10);
    const page = Number.isSafeInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const pageSize = Number.isSafeInteger(pageSizeRaw) && pageSizeRaw > 0
      ? Math.min(pageSizeRaw, 100)
      : 20;

    if (!q.trim()) {
      return list([], 0, page, pageSize);
    }

    // Resolve the public story set under the caller's RLS scope. A search index
    // can outlive a publication transition, so never trust an indexed story hit
    // without rechecking its current canonical row.
    const now = new Date().toISOString();
    const { data: publicStories, error: publicStoriesError } = await db()
      .from('stories')
      .select('id, slug')
      .eq('status', 'published')
      .eq('is_test_artifact', false)
      .lte('published_at', now)
      .range(0, 999);
    if (publicStoriesError) throw publicStoriesError;

    const publicStorySlugs = [...new Set(
      (publicStories || [])
        .filter((story) => typeof story.slug === 'string' && story.slug.length > 0)
        .map((story) => story.slug),
    )];

    const tsq = q.split(/\s+/).filter(Boolean).join(' & ');
    const endExclusive = Math.min(page * pageSize, 1000);
    const end = Math.max(0, endExclusive - 1);

    const buildTextQuery = () => {
      let query = db().from('index_entries').select('*', { count: 'exact' });
      if (tsq) {
        query = query.textSearch('idx_search_entries_fts', tsq, { config: 'english' });
      } else {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }
      return query;
    };

    let nonStoryRows: SearchRow[] = [];
    let nonStoryCount = 0;
    let storyRows: SearchRow[] = [];
    let storyCount = 0;

    // Query non-story results independently from stories. For the story branch,
    // constrain ref_slug at the database query itself so private titles/content
    // never reach the response and cannot inflate the public result count.
    if (type !== 'story') {
      let query = buildTextQuery();
      query = type ? query.eq('ref_type', type) : query.neq('ref_type', 'story');
      const { data, count, error } = await query
        .order('score', { ascending: false })
        .range(0, end);
      if (error) throw error;
      nonStoryRows = (data || []) as SearchRow[];
      nonStoryCount = count || 0;
    }

    if ((!type || type === 'story') && publicStorySlugs.length > 0) {
      const { data, count, error } = await buildTextQuery()
        .eq('ref_type', 'story')
        .in('ref_slug', publicStorySlugs)
        .order('score', { ascending: false })
        .range(0, end);
      if (error) throw error;
      storyRows = (data || []) as SearchRow[];
      storyCount = count || 0;
    }

    const total = nonStoryCount + storyCount;
    const start = (page - 1) * pageSize;
    const merged = [...nonStoryRows, ...storyRows].sort(
      (left, right) => (right.score || 0) - (left.score || 0),
    );
    return list(merged.slice(start, start + pageSize), total, page, pageSize);
  } catch (e) {
    return serverError(e);
  }
}
