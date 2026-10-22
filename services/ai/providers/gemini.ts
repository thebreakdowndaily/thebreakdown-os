import { GoogleGenAI } from '@google/genai';
import { AIClient } from '../core/ai-client';
import { PromptMessage } from '../core/prompt-builder';

export interface GeminiProviderConfig {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxOutputTokens?: number;
  temperature?: number;
}

/**
 * Sanitizes an error message by stripping API keys and sensitive tokens.
 */
export function sanitizeErrorMessage(message: string, apiKey?: string): string {
  if (!message) return 'An unknown Gemini error occurred.';
  let sanitized = message;

  // Redact explicit configured API key
  if (apiKey && apiKey.length > 5) {
    sanitized = sanitized.split(apiKey).join('[REDACTED_API_KEY]');
  }

  // Redact Google AI Studio API key format: AIzaSy...
  sanitized = sanitized.replace(/AIza[0-9A-Za-z\-_]{35}/g, '[REDACTED_API_KEY]');

  // Redact query parameter patterns key=...
  sanitized = sanitized.replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED_API_KEY]');

  return sanitized;
}

/**
 * GeminiProvider
 * Official Google Gemini API adapter implementing the platform's AIClient interface.
 */
export class GeminiProvider implements AIClient {
  private client?: GoogleGenAI;
  public readonly apiKey: string;
  public readonly model: string;
  public readonly timeoutMs: number;
  public readonly maxOutputTokens: number;
  public readonly temperature: number;

  constructor(config?: GeminiProviderConfig, injectedClient?: any) {
    this.apiKey = (config?.apiKey ?? process.env.GEMINI_API_KEY ?? '').trim();
    this.model = (config?.model ?? process.env.GEMINI_MODEL ?? 'gemini-3.8-flash').trim();
    this.timeoutMs = config?.timeoutMs ?? (process.env.GEMINI_TIMEOUT_MS ? parseInt(process.env.GEMINI_TIMEOUT_MS, 10) : 30000);
    this.maxOutputTokens = config?.maxOutputTokens ?? (process.env.GEMINI_MAX_OUTPUT_TOKENS ? parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 10) : 2048);
    this.temperature = config?.temperature ?? 0.3;

    if (injectedClient) {
      this.client = injectedClient;
    } else if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Translates platform PromptMessages into Gemini systemInstruction and contents format.
   */
  public formatMessages(messages: PromptMessage[]): {
    systemInstruction: string;
    contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  } {
    const systemParts: string[] = [];
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        if (msg.content) {
          systemParts.push(msg.content);
        }
      } else {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content || '' }],
        });
      }
    }

    // Ensure there is at least one content item for Gemini API
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: '' }],
      });
    }

    return {
      systemInstruction: systemParts.join('\n\n'),
      contents,
    };
  }

  /**
   * Generates a streaming response yielding encoded text chunks as a standard ReadableStream.
   */
  generateStream(messages: PromptMessage[]): ReadableStream {
    const encoder = new TextEncoder();
    const apiKey = this.apiKey;
    const model = this.model;
    const timeoutMs = this.timeoutMs;
    const maxOutputTokens = this.maxOutputTokens;
    const temperature = this.temperature;
    const client = this.client;
    const formatMessages = this.formatMessages.bind(this);

    return new ReadableStream({
      async start(controller) {
        if (!apiKey && !client) {
          controller.error(
            new Error(
              'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.'
            )
          );
          return;
        }

        let isTimedOut = false;
        const timer = setTimeout(() => {
          isTimedOut = true;
          controller.error(
            new Error(`Gemini request timed out after ${timeoutMs}ms.`)
          );
        }, timeoutMs);

        try {
          const genAIClient = client || new GoogleGenAI({ apiKey });
          const { systemInstruction, contents } = formatMessages(messages);

          const responseStream = await genAIClient.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction: systemInstruction || undefined,
              maxOutputTokens,
              temperature,
            },
          });

          for await (const chunk of responseStream) {
            if (isTimedOut) break;
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          clearTimeout(timer);
          if (!isTimedOut) {
            controller.close();
          }
        } catch (err: any) {
          clearTimeout(timer);
          if (!isTimedOut) {
            const rawMessage = err?.message || String(err);
            const sanitized = sanitizeErrorMessage(rawMessage, apiKey);
            controller.error(new Error(sanitized));
          }
        }
      },
    });
  }

  /**
   * Generates a blocking string response from the Gemini model.
   */
  async generate(messages: PromptMessage[]): Promise<string> {
    if (!this.apiKey && !this.client) {
      throw new Error(
        'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.'
      );
    }

    const { systemInstruction, contents } = this.formatMessages(messages);
    const genAIClient = this.client || new GoogleGenAI({ apiKey: this.apiKey });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Gemini request timed out after ${this.timeoutMs}ms.`));
      }, this.timeoutMs);
    });

    try {
      const apiPromise = genAIClient.models.generateContent({
        model: this.model,
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          maxOutputTokens: this.maxOutputTokens,
          temperature: this.temperature,
        },
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.text || '';
    } catch (err: any) {
      const rawMessage = err?.message || String(err);
      const sanitized = sanitizeErrorMessage(rawMessage, this.apiKey);
      throw new Error(sanitized);
    }
  }
}
