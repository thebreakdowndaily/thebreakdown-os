import type { NextRequest } from 'next/server';
import { db, list, serverError } from '@/lib/api-v2';

type SearchRow = {
  ref_id: string;
  ref_type: string;
  ref_slug: string;
  score: number | null;
};

const STORY_BATCH_SIZE = 1000;
const MAX_SEARCH_WINDOW = 10000;

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

    // Resolve the public story set under the caller's RLS scope.
    // Safely paginate through all published stories in batches so catalogs
    // with more than 1,000 stories are completely discovered.
    const now = new Date().toISOString();
    const publicStorySlugs: string[] = [];
    let storyBatchStart = 0;

    while (true) {
      const { data: batch, error: batchError } = await db()
        .from('stories')
        .select('slug')
        .eq('status', 'published')
        .eq('is_test_artifact', false)
        .lte('published_at', now)
        .range(storyBatchStart, storyBatchStart + STORY_BATCH_SIZE - 1);

      if (batchError) throw batchError;
      if (!batch || batch.length === 0) break;

      for (const story of batch) {
        if (typeof story.slug === 'string' && story.slug.length > 0) {
          publicStorySlugs.push(story.slug);
        }
      }

      if (batch.length < STORY_BATCH_SIZE) break;
      storyBatchStart += STORY_BATCH_SIZE;
    }

    const uniquePublicStorySlugs = [...new Set(publicStorySlugs)];

    const tsq = q.split(/\s+/).filter(Boolean).join(' & ');

    const buildTextQuery = () => {
      let query = db().from('index_entries').select('*', { count: 'exact' });
      if (tsq) {
        query = query.textSearch('idx_search_entries_fts', tsq, { config: 'english' });
      } else {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }
      return query;
    };

    const start = (page - 1) * pageSize;

    // Single-type optimization: when querying stories only, paginate directly in the database.
    if (type === 'story') {
      if (uniquePublicStorySlugs.length === 0) {
        return list([], 0, page, pageSize);
      }
      const { data, count, error } = await buildTextQuery()
        .eq('ref_type', 'story')
        .in('ref_slug', uniquePublicStorySlugs)
        .order('score', { ascending: false })
        .range(start, start + pageSize - 1);

      if (error) throw error;
      return list((data || []) as SearchRow[], count || 0, page, pageSize);
    }

    // Single-type optimization: when querying non-story types only, paginate directly in the database.
    if (type && type !== 'story') {
      const { data, count, error } = await buildTextQuery()
        .eq('ref_type', type)
        .order('score', { ascending: false })
        .range(start, start + pageSize - 1);

      if (error) throw error;
      return list((data || []) as SearchRow[], count || 0, page, pageSize);
    }

    // Mixed cross-type search: query candidate slices up to the requested window,
    // bounded by MAX_SEARCH_WINDOW to prevent memory exhaustion on extreme deep pages.
    const endExclusive = Math.min(page * pageSize, MAX_SEARCH_WINDOW);
    const end = Math.max(0, endExclusive - 1);

    let nonStoryRows: SearchRow[] = [];
    let nonStoryCount = 0;
    let storyRows: SearchRow[] = [];
    let storyCount = 0;

    const { data: nonStoryData, count: nonStoryExactCount, error: nonStoryError } = await buildTextQuery()
      .neq('ref_type', 'story')
      .order('score', { ascending: false })
      .range(0, end);
    if (nonStoryError) throw nonStoryError;
    nonStoryRows = (nonStoryData || []) as SearchRow[];
    nonStoryCount = nonStoryExactCount || 0;

    if (uniquePublicStorySlugs.length > 0) {
      const { data: storyData, count: storyExactCount, error: storyError } = await buildTextQuery()
        .eq('ref_type', 'story')
        .in('ref_slug', uniquePublicStorySlugs)
        .order('score', { ascending: false })
        .range(0, end);
      if (storyError) throw storyError;
      storyRows = (storyData || []) as SearchRow[];
      storyCount = storyExactCount || 0;
    }

    const total = nonStoryCount + storyCount;
    const isCapped = total > MAX_SEARCH_WINDOW && page * pageSize > MAX_SEARCH_WINDOW;

    const merged = [...nonStoryRows, ...storyRows].sort(
      (left, right) => (right.score || 0) - (left.score || 0),
    );

    const paginatedItems = merged.slice(start, start + pageSize);
    const response = list(paginatedItems, total, page, pageSize);

    if (isCapped) {
      response.headers.set('X-Search-Capped', 'true');
      response.headers.set('X-Search-Scan-Ceiling', String(MAX_SEARCH_WINDOW));
    }

    return response;
  } catch (e) {
    return serverError(e);
  }
}
