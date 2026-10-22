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
 * Validates that a numeric configuration value is a positive finite number.
 */
function parsePositiveNumber(value: unknown, name: string): number {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Invalid Gemini configuration: ${name} is required.`);
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid Gemini configuration: ${name} must be a positive finite number.`);
  }
  return parsed;
}

/**
 * Validates that a numeric configuration value is a positive integer.
 */
function parsePositiveInteger(value: unknown, name: string): number {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Invalid Gemini configuration: ${name} is required.`);
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    throw new Error(`Invalid Gemini configuration: ${name} must be a positive integer.`);
  }
  return parsed;
}

/**
 * Validates that temperature is a finite number between 0 and 2.
 */
function parseTemperature(value: unknown, name: string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 2) {
    throw new Error(`Invalid Gemini configuration: ${name} must be a finite number between 0 and 2.`);
  }
  return parsed;
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
 *
 * NOTE ON CANCELLATION & BILLING:
 * Client-side AbortSignal cancellation terminates local HTTP network streams and frees
 * system resources. However, as documented by Google's Gen AI SDK, client-side aborts
 * do not guarantee that Google's backend will cancel processing in time to avoid charges
 * for tokens already evaluated.
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

    // Validate timeoutMs: must be positive finite number
    if (config?.timeoutMs !== undefined) {
      this.timeoutMs = parsePositiveNumber(config.timeoutMs, 'timeoutMs');
    } else if (process.env.GEMINI_TIMEOUT_MS) {
      this.timeoutMs = parsePositiveNumber(process.env.GEMINI_TIMEOUT_MS, 'GEMINI_TIMEOUT_MS');
    } else {
      this.timeoutMs = 30000;
    }

    // Validate maxOutputTokens: must be positive integer
    if (config?.maxOutputTokens !== undefined) {
      this.maxOutputTokens = parsePositiveInteger(config.maxOutputTokens, 'maxOutputTokens');
    } else if (process.env.GEMINI_MAX_OUTPUT_TOKENS) {
      this.maxOutputTokens = parsePositiveInteger(process.env.GEMINI_MAX_OUTPUT_TOKENS, 'GEMINI_MAX_OUTPUT_TOKENS');
    } else {
      this.maxOutputTokens = 2048;
    }

    // Validate temperature
    if (config?.temperature !== undefined) {
      this.temperature = parseTemperature(config.temperature, 'temperature');
    } else {
      this.temperature = 0.3;
    }

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
   *
   * Note on cancellation:
   * Client-side cancellation or timeout aborts the local SDK network stream and clears timers,
   * but does not guarantee that Google's backend will avoid billing for work already processed.
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

    const abortController = new AbortController();
    let timer: NodeJS.Timeout | undefined;
    let isClosedOrErrored = false;
    let isTimedOut = false;

    return new ReadableStream({
      async start(controller) {
        function safeError(error: Error) {
          if (!isClosedOrErrored) {
            isClosedOrErrored = true;
            try {
              controller.error(error);
            } catch {
              // Ignore if already terminated
            }
          }
        }

        function safeClose() {
          if (!isClosedOrErrored) {
            isClosedOrErrored = true;
            try {
              controller.close();
            } catch {
              // Ignore if already terminated
            }
          }
        }

        if (!apiKey && !client) {
          safeError(
            new Error(
              'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.'
            )
          );
          return;
        }

        timer = setTimeout(() => {
          isTimedOut = true;
          abortController.abort();
          safeError(new Error(`Gemini request timed out after ${timeoutMs}ms.`));
          if (timer) {
            clearTimeout(timer);
            timer = undefined;
          }
        }, timeoutMs);

        try {
          const genAIClient = client || new GoogleGenAI({ apiKey });
          const { systemInstruction, contents } = formatMessages(messages);

          const responseStream = await genAIClient.models.generateContentStream({
            model,
            contents,
            config: {
              abortSignal: abortController.signal,
              systemInstruction: systemInstruction || undefined,
              maxOutputTokens,
              temperature,
            },
          });

          for await (const chunk of responseStream) {
            if (isClosedOrErrored || abortController.signal.aborted) {
              break;
            }
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          if (!isClosedOrErrored && !abortController.signal.aborted) {
            safeClose();
          }
        } catch (err: any) {
          if (isTimedOut || abortController.signal.aborted) {
            safeError(new Error(`Gemini request timed out after ${timeoutMs}ms.`));
          } else {
            const rawMessage = err?.message || String(err);
            const sanitized = sanitizeErrorMessage(rawMessage, apiKey);
            safeError(new Error(sanitized));
          }
        } finally {
          if (timer) {
            clearTimeout(timer);
          }
        }
      },
      cancel(reason) {
        if (timer) {
          clearTimeout(timer);
        }
        isClosedOrErrored = true;
        abortController.abort(reason);
      },
    });
  }

  /**
   * Generates a blocking string response from the Gemini model.
   *
   * Note on cancellation:
   * Client-side AbortSignal termination halts the local SDK operation, but does not
   * guarantee that Google's backend will avoid billing or processing already received tokens.
   */
  async generate(messages: PromptMessage[]): Promise<string> {
    if (!this.apiKey && !this.client) {
      throw new Error(
        'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.'
      );
    }

    const { systemInstruction, contents } = this.formatMessages(messages);
    const genAIClient = this.client || new GoogleGenAI({ apiKey: this.apiKey });

    const abortController = new AbortController();
    let isTimedOut = false;
    let timer: NodeJS.Timeout | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          isTimedOut = true;
          abortController.abort();
          reject(new Error(`Gemini request timed out after ${this.timeoutMs}ms.`));
          if (timer) {
            clearTimeout(timer);
            timer = undefined;
          }
        }, this.timeoutMs);
      });

      const apiPromise = genAIClient.models.generateContent({
        model: this.model,
        contents,
        config: {
          abortSignal: abortController.signal,
          systemInstruction: systemInstruction || undefined,
          maxOutputTokens: this.maxOutputTokens,
          temperature: this.temperature,
        },
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.text || '';
    } catch (err: any) {
      if (isTimedOut || err?.name === 'AbortError' || abortController.signal.aborted) {
        throw new Error(`Gemini request timed out after ${this.timeoutMs}ms.`);
      }
      const rawMessage = err?.message || String(err);
      const sanitized = sanitizeErrorMessage(rawMessage, this.apiKey);
      throw new Error(sanitized);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
}
