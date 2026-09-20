import { NextRequest, NextResponse } from 'next/server';
import { copilot } from '@/services/ai/copilot';
import { EntityCopilotContext } from '@/types/canonical';
import { rateLimiter } from '@/features/rate-limiting/limiter';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rate = await rateLimiter.checkLimit({
    key: `ai:${clientIp}`,
    tier: 'ai',
    endpoint: '/api/ai/copilot',
    ip: clientIp,
  });

  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

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

    // Guard against prompt bomb / oversized LLM inputs
    if (typeof prompt !== 'string' || prompt.length > 4000) {
      return NextResponse.json({ error: 'Payload Too Large', message: 'Prompt exceeds maximum length of 4000 characters' }, { status: 413 });
    }

    const typedContext = context as EntityCopilotContext;
    
    // Execute the entity skill, which returns a ReadableStream
    const stream = copilot.entity.execute(typedContext, prompt);
    
    // Pipe the stream to the client
    const response = copilot.createStreamResponse(stream);
    rateLimiter.applyHeaders(response.headers, rate);
    return response;

  } catch (error: any) {
    console.error('Copilot Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
