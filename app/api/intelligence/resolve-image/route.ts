import { NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { bootstrapServices } from '@/lib/bootstrap';
import { rateLimiter } from '@/features/rate-limiting/limiter';
import { REMEDIATED_STORIES_MAP } from '@/lib/editorial/drafts/remediated-stories';

export async function POST(req: Request) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rate = await rateLimiter.checkLimit({
    key: `intel:${clientIp}`,
    tier: 'intelligence',
    endpoint: '/api/intelligence/resolve-image',
    ip: clientIp,
  });

  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  try {
    // Ensure services are initialized
    bootstrapServices();
    
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const { storyId, slug } = body || {};
    
    // Identifier contract: accept storyId, slug, or both
    if (!storyId && !slug) {
      return NextResponse.json({ error: 'Missing story identifier (provide storyId or slug)' }, { status: 400 });
    }
    
    // Fetch the story using slug or storyId
    const services = getServices();
    let story: any = undefined;
    try {
      story = slug ? await services.stories.getStoryBySlug(slug) : undefined;
      if (!story && storyId) {
        story = await services.stories.getStory(storyId);
        if (!story) {
          // Fallback: check if storyId was passed as a slug
          story = await services.stories.getStoryBySlug(storyId);
        }
      }
    } catch (e) {
      console.warn('[resolve-image] Database lookup failed, checking in-memory drafts', e);
    }

    // Fallback to remediated in-memory drafts if not found in database
    if (!story && slug && REMEDIATED_STORIES_MAP[slug]) {
      story = REMEDIATED_STORIES_MAP[slug];
    }
    if (!story && storyId) {
      story = Object.values(REMEDIATED_STORIES_MAP).find((s) => s.id === storyId || s.slug === storyId);
    }

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const knowledgeStory = await (new KnowledgeStoryPipeline().add(new VisualIntelligenceBuilder()).execute(story));
    
    // Resolve the image using the hierarchy
    const mediaItem = await getServices().intelligence.resolveImageForStory(knowledgeStory?.raw || story);
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Could not resolve or generate an image.' }, { status: 500 });
    }
    
    const payload = {
      ...mediaItem,
      url: mediaItem.src,
      resolvedVia: mediaItem.id?.startsWith('manifest-') ? 'manifest' : 'fallback',
    };

    const response = NextResponse.json({ success: true, data: payload, image: payload });
    rateLimiter.applyHeaders(response.headers, rate);
    return response;
  } catch (error: any) {
    console.error('Image Intelligence Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
