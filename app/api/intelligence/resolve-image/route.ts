import { NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { bootstrapServices } from '@/lib/bootstrap';

export async function POST(req: Request) {
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
    
    return NextResponse.json({ data: mediaItem });
  } catch (error: any) {
    console.error('Image Intelligence Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
