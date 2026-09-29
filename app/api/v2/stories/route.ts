import { NextResponse, type NextRequest } from 'next/server';
import { db, ok, list, created, serverError } from '@/lib/api-v2';
import { requireApiPermission } from '@/features/auth/require-role';
import { can } from '@/features/auth/policy';
import { evaluatePublicationContract, executePostPublicationEffects } from '@/lib/editorial/canonical-publication';
import type { Story } from '@/types/canonical';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let query = db().from('stories').select('*', { count: 'exact' });

    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, count, error } = await query
      .order('published_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return list(data || [], count || 0, page, pageSize);
  } catch (e) { return serverError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiPermission('story.create', request);
    if ('response' in auth) {
      return auth.response;
    }
    const principal = auth.principal;

    const body = await request.json();

    if (body.status === 'published') {
      if (!can(principal, 'story.publish')) {
        return NextResponse.json(
          { error: `Forbidden: Principal with role '${principal.role}' cannot publish stories. Editor role or higher required.` },
          { status: 403 }
        );
      }

      const storyCandidate: Story = {
        id: body.id || crypto.randomUUID(),
        title: body.title || '',
        slug: body.slug || '',
        headline: body.headline || body.title || '',
        summary: body.summary || '',
        heroImage: body.hero_image || body.heroImage || '',
        author: body.author || principal.name,
        category: body.category || '',
        status: 'published',
        storyType: body.story_type || body.storyType || 'standard',
        evidenceScore: body.evidence_score || body.evidenceScore || 0,
        readingTime: body.reading_time || body.readingTime || 0,
        publishedAt: body.published_at || body.publishedAt || new Date().toISOString(),
        createdAt: body.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: body.tags || [],
        blocks: body.blocks || [],
        sources: body.sources || [],
        claims: body.claims || [],
        timeline: body.timeline || [],
        faq: body.faq || [],
        charts: body.charts || [],
        relatedStoryIds: body.related_story_ids || body.relatedStoryIds || [],
        relatedEntityIds: body.related_entity_ids || body.relatedEntityIds || [],
        relatedTopicIds: body.related_topic_ids || body.relatedTopicIds || [],
        notes: body.notes,
        updatedBy: principal.userId,
      };

      const decision = evaluatePublicationContract(undefined, storyCandidate, principal);
      if (!decision.allowed) {
        return NextResponse.json(
          { error: decision.error, details: decision.gateResult },
          { status: decision.httpStatus }
        );
      }

      const { data, error } = await db()
        .from('stories')
        .insert({
          ...body,
          status: 'published',
          published_at: decision.updatedStory?.publishedAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as import('@/supabase/schema').Database['public']['Tables']['stories']['Insert'])
        .select()
        .single();

      if (error) throw error;
      executePostPublicationEffects(decision.updatedStory!, principal, decision.gateResult);
      return created(data);
    }

    const { data, error } = await db()
      .from('stories')
      .insert({
        ...body,
        status: body.status || 'draft',
      } as import('@/supabase/schema').Database['public']['Tables']['stories']['Insert'])
      .select()
      .single();

    if (error) throw error;
    return created(data);
  } catch (e) { return serverError(e); }
}
