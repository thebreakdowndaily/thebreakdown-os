import { NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
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
    const { storyId, slug } = body ?? {};

    if (
      (typeof storyId !== 'string' || !storyId.trim()) &&
      (typeof slug !== 'string' || !slug.trim())
    ) {
      return NextResponse.json({ error: 'Provide a valid storyId or slug' }, { status: 400 });
    }

    // Resolve by the identifier the caller supplied; IDs and slugs are not interchangeable.
    const services = getServices();
    const story = typeof storyId === 'string' && storyId.trim()
      ? await services.stories.getStory(storyId.trim())
      : await services.stories.getStoryBySlug(slug.trim());
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    // Resolve the image using the canonical story record and shared service container.
    const mediaItem = await services.intelligence.resolveImageForStory(story);
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Could not resolve or generate an image.' }, { status: 500 });
    }
    
    const response = NextResponse.json({ data: mediaItem });
    rateLimiter.applyHeaders(response.headers, rate);
    return response;
  } catch (error: unknown) {
    console.error('Image Intelligence Error:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Image resolution failed' }, { status: 500 });
  }
}
