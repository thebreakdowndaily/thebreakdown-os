export class StreamService {
  /**
   * Helper to pipe a readable stream to a WritableStream or Next.js Response.
   * This abstracts away the streaming logic so the skills don't need to
   * handle reader/writer boilerplate directly.
   */
  createStreamResponse(stream: ReadableStream): Response {
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
