import { NextResponse, type NextRequest } from 'next/server';
import { db, ok, notFound, serverError } from '@/lib/api-v2';
import { requireApiPermission } from '@/features/auth/require-role';
import { can } from '@/features/auth/policy';
import { evaluatePublicationContract, executePostPublicationEffects } from '@/lib/editorial/canonical-publication';
import type { Story, StoryStatus } from '@/types/canonical';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { data, error } = await db().from('stories').select('*').eq('slug', slug).single();
    if (error) throw error;
    if (!data) return notFound('Story');
    return ok(data);
  } catch (e) { return serverError(e); }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireApiPermission('story.update', request);
    if ('response' in auth) {
      return auth.response;
    }
    const principal = auth.principal;

    const { slug } = await context.params;
    const { data: existing, error: fetchErr } = await db().from('stories').select('*').eq('slug', slug).single();
    if (fetchErr || !existing) return notFound('Story');

    const body = await request.json();

    if (body.status === 'published') {
      if (!can(principal, 'story.publish')) {
        return NextResponse.json(
          { error: `Forbidden: Principal with role '${principal.role}' cannot publish stories. Editor role or higher required.` },
          { status: 403 }
        );
      }

      const existingStory: Story = {
        id: existing.id,
        title: existing.title || '',
        slug: existing.slug,
        headline: existing.headline || existing.title || '',
        summary: existing.summary || '',
        heroImage: existing.hero_image || '',
        author: existing.author || '',
        category: existing.category || '',
        status: (existing.status as StoryStatus) || 'draft',
        storyType: ((existing as any).story_type as Story['storyType']) || 'standard',
        evidenceScore: existing.evidence_score || 0,
        readingTime: existing.reading_time || 0,
        publishedAt: existing.published_at || '',
        createdAt: existing.created_at || new Date().toISOString(),
        updatedAt: existing.updated_at || new Date().toISOString(),
        tags: existing.tags || [],
        blocks: (Array.isArray(existing.blocks) ? existing.blocks : []) as any,
        sources: (Array.isArray(existing.sources) ? existing.sources : []) as any,
        claims: (Array.isArray(existing.claims) ? existing.claims : []) as any,
        timeline: (Array.isArray(existing.timeline) ? existing.timeline : []) as any,
        faq: (Array.isArray(existing.faq) ? existing.faq : []) as any,
        charts: (Array.isArray(existing.charts) ? existing.charts : []) as any,
        relatedStoryIds: existing.related_story_ids || [],
        relatedEntityIds: existing.related_entity_ids || [],
        relatedTopicIds: existing.related_topic_ids || [],
        notes: existing.notes || undefined,
        updatedBy: existing.updated_by || undefined,
      };

      const targetStory: Story = {
        ...existingStory,
        ...body,
        id: existingStory.id,
        slug: existingStory.slug,
        status: 'published',
        updatedAt: new Date().toISOString(),
        updatedBy: principal.userId,
      };

      const { evaluatePublicationContractAsync } = await import('@/lib/editorial/canonical-publication');
      const { RepositoryFactory } = await import('@/services/factory/repository');

      const decision = await evaluatePublicationContractAsync(existingStory, targetStory, principal);
      if (!decision.allowed) {
        return NextResponse.json(
          { error: decision.error, details: decision.gateResult },
          { status: decision.httpStatus }
        );
      }

      const repo = RepositoryFactory.getStoryRepository();
      const saved = await repo.saveStory(decision.updatedStory!, { publicationToken: decision.publicationToken });
      executePostPublicationEffects(decision.updatedStory!, principal, decision.gateResult);
      return ok(saved as any);
    }

    const { data, error } = await db()
      .from('stories')
      .update(body as import('@/supabase/schema').Database['public']['Tables']['stories']['Update'])
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;
    if (!data) return notFound('Story');
    return ok(data);
  } catch (e) { return serverError(e); }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireApiPermission('story.delete', request);
    if ('response' in auth) {
      return auth.response;
    }

    const { slug } = await context.params;
    const { error } = await db().from('stories').delete().eq('slug', slug);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (e) { return serverError(e); }
}
