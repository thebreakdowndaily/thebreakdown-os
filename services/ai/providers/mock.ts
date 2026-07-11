import { AIClient } from '../core/ai-client';
import { PromptMessage } from '../core/prompt-builder';

export class MockProvider implements AIClient {
  generateStream(messages: PromptMessage[]): ReadableStream {
    const encoder = new TextEncoder();
    
    // Determine context based on what user asked to provide realistic mock answers
    const question = messages.find(m => m.role === 'user')?.content || '';
    
    let mockResponse = `This is a simulated AI response evaluating your query: "${question}".\n\n`;
    
    if (question.toLowerCase().includes('risk')) {
      mockResponse += `Based on the provided pipeline data, the primary risk involves the pending antitrust case [Story 12]. Negative coverage has increased by 14%, and evidence suggests a moderate correlation with recent executive departures [Evidence 4].`;
    } else if (question.toLowerCase().includes('timeline') || question.toLowerCase().includes('developments')) {
      mockResponse += `Recent developments highlight a strategic shift. On October 12th, they acquired X [Story 7], which solidified their market position. Evidence from [Document 3] confirms the integration is underway.`;
    } else {
      mockResponse += `According to the canonical data, this entity has 82 related stories and a 98% confidence score. [Story 1] and [Evidence 2] provide the strongest support for these claims.`;
    }

    const words = mockResponse.split(' ');
    
    return new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '));
          // Simulate network latency (20ms per word)
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        controller.close();
      }
    });
  }

  async generate(messages: PromptMessage[]): Promise<string> {
    const question = messages.find(m => m.role === 'user')?.content || '';
    return `Simulated blocking response to: ${question}`;
  }
}
