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
    const { storyId, slug } = body;
    
    if (!storyId) {
      return NextResponse.json({ error: 'Missing storyId' }, { status: 400 });
    }
    
    // Fetch the story
    const services = getServices();
    const story = await services.stories.getStoryBySlug(slug);
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
