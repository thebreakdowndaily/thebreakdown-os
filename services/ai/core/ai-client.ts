import { PromptMessage } from './prompt-builder';

export interface AIClient {
  /**
   * Generate a streaming response from the AI provider.
   */
  generateStream(messages: PromptMessage[]): ReadableStream;
  
  /**
   * Generate a blocking response from the AI provider.
   */
  generate(messages: PromptMessage[]): Promise<string>;
}
