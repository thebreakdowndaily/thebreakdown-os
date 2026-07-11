import { NextRequest, NextResponse } from 'next/server';
import { copilot } from '@/services/ai/copilot';
import { EntityCopilotContext } from '@/types/canonical';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, prompt, skill } = body as {
      context: any;
      prompt: string;
      skill: string;
    };

    if (!context || !prompt || skill !== 'entity') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const typedContext = context as EntityCopilotContext;
    
    // Execute the entity skill, which returns a ReadableStream
    const stream = copilot.entity.execute(typedContext, prompt);
    
    // Pipe the stream to the client
    return copilot.createStreamResponse(stream);

  } catch (error: any) {
    console.error('Copilot Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
