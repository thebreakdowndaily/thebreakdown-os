import { NextResponse } from 'next/server';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { EntityBuilder } from '@/services/stories/pipeline/entities';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { TimelineBuilder } from '@/services/stories/pipeline/timeline';
import { QualityBuilder } from '@/services/stories/pipeline/quality';

export async function POST(req: Request) {
  try {
    const rawStory = await req.json();

    const pipeline = new KnowledgeStoryPipeline()
      .add(new EntityBuilder())
      .add(new VisualIntelligenceBuilder())
      .add(new TimelineBuilder())
      .add(new QualityBuilder());

    const processed = await pipeline.execute(rawStory);

    return NextResponse.json(processed.qualityScore);
  } catch (error) {
    console.error('Failed to evaluate story:', error);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
