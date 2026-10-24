import { NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { bootstrapServices } from '@/lib/bootstrap';
import { rateLimiter } from '@/features/rate-limiting/limiter';

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
    
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 });
    }
    const { storyId, slug } = body as { storyId?: unknown; slug?: unknown };
    if (storyId !== undefined && (typeof storyId !== 'string' || !storyId.trim())) {
      return NextResponse.json({ error: 'storyId must be a non-empty string' }, { status: 400 });
    }
    if (slug !== undefined && (typeof slug !== 'string' || !slug.trim())) {
      return NextResponse.json({ error: 'slug must be a non-empty string' }, { status: 400 });
    }
    if (!storyId && !slug) {
      return NextResponse.json({ error: 'Provide storyId or slug' }, { status: 400 });
    }

    // Explicitly resolve by the identifier supplied; never validate one field and silently query another.
    const services = getServices();
    const story = storyId
      ? await services.stories.getStory(storyId)
      : await services.stories.getStoryBySlug(slug as string);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    const knowledgeStory = await (new KnowledgeStoryPipeline().add(new VisualIntelligenceBuilder()).execute(story));
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Resolve the image using the hierarchy
    const mediaItem = await getServices().intelligence.resolveImageForStory(story);
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Could not resolve or generate an image.' }, { status: 500 });
    }
    
    const response = NextResponse.json({ data: mediaItem });
    rateLimiter.applyHeaders(response.headers, rate);
    return response;
  } catch (error: any) {
    console.error('Image Intelligence Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
