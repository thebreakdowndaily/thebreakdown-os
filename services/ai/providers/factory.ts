import { AIClient } from '../core/ai-client';
import { MockProvider } from './mock';
import { GeminiProvider, GeminiProviderConfig } from './gemini';

export type AIProviderType = 'mock' | 'gemini';

export interface ProviderFactoryOptions {
  providerType?: AIProviderType;
  geminiConfig?: GeminiProviderConfig;
  injectedClient?: any;
}

/**
 * Resolves the configured AI provider.
 * Keeps Gemini optional and disabled by default.
 * Falls back safely to MockProvider unless explicitly configured.
 */
export function getAIProvider(options?: ProviderFactoryOptions): AIClient {
  const providerType = (
    options?.providerType ||
    process.env.AI_PROVIDER ||
    'mock'
  ).toLowerCase().trim();

  if (providerType === 'gemini') {
    return new GeminiProvider(options?.geminiConfig, options?.injectedClient);
  }

  return new MockProvider();
}
