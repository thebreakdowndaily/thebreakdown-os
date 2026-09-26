import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/features/rate-limiting/limiter';
import {
  submitReaderCorrection,
  validateCorrectionSubmissionInput,
} from '@/services/editorial/corrections-service';
import type { ReaderCorrectionSubmissionInput } from '@/types/corrections';

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // 1. Enforce distributed rate limiting
  const rate = await rateLimiter.checkLimit({
    key: `corrections:${clientIp}`,
    tier: 'mutation',
    endpoint: '/api/corrections/submit',
    ip: clientIp,
  });

  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  // 2. Parse request body
  let body: Partial<ReaderCorrectionSubmissionInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  // 3. Validate input
  const validation = validateCorrectionSubmissionInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, errors: validation.errors },
      { status: 400 }
    );
  }

  // 4. Process intake
  try {
    const result = await submitReaderCorrection(
      body as ReaderCorrectionSubmissionInput,
      { clientIp }
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.message.includes('Rate limit') ? 429 : 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while recording your correction. Please try again.',
      },
      { status: 500 }
    );
  }
}
