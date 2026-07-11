import { NextResponse } from 'next/server';
import { getServices } from '@/services/registry';
import { bootstrapCore } from '@/lib/bootstrap';

export async function POST(req: Request) {
  try {
    // Ensure services are initialized
    bootstrapCore();
    
    const body = await req.json();
    const { storyId } = body;
    
    if (!storyId) {
      return NextResponse.json({ error: 'Missing storyId' }, { status: 400 });
    }
    
    // Fetch the story
    const storyResponse = getServices().stories.getStory(storyId);
    if (!storyResponse || !storyResponse.data) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    const story = storyResponse.data;
    
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
