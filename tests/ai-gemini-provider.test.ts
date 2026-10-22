/**
 * THE BREAKDOWN OS — Gemini API Provider Test Suite
 *
 * Verifies:
 * 1. Provider configuration, validation, and missing API keys.
 * 2. Successful responses using mocked provider calls.
 * 3. Request lifecycle: AbortSignal propagation, deterministic timeouts, consumer cancellation, and timer cleanup.
 * 4. API errors, timeouts, and empty responses.
 * 5. Preservation of existing provider behavior.
 * 6. Secret-safe error handling and sanitization (Gitleaks-safe test fixtures).
 * 7. Server-side entry point & route handler integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GeminiProvider, sanitizeErrorMessage } from '@/services/ai/providers/gemini';
import { getAIProvider } from '@/services/ai/providers/factory';
import { MockProvider } from '@/services/ai/providers/mock';
import { KnowledgeCopilot } from '@/services/ai/copilot';
import { PromptMessage } from '@/services/ai/core/prompt-builder';
import type { EntityCopilotContext } from '@/types/canonical';

// Dynamically construct fake API key fixtures at runtime to prevent static scanner (Gitleaks) false positives
const FAKE_KEY_1 = ['AIza', 'Sy', 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q'].join('');
const FAKE_KEY_2 = ['AIza', 'Sy', 'BNM1234567890abcdefghijklmnopqrst'].join('');
const FAKE_KEY_3 = ['AIza', 'Sy', 'TESTSECRETKEYFORVERIFICATION12345'].join('');
const FAKE_KEY_4 = ['AIza', 'Sy', 'TESTSECRETSTREAMKEYVERIFICATION99'].join('');

describe('Gemini AI Provider Integration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.AI_PROVIDER;
    delete process.env.GEMINI_TIMEOUT_MS;
    delete process.env.GEMINI_MAX_OUTPUT_TOKENS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('1. Provider configuration, validation & missing API keys', () => {
    it('defaults model to gemini-3.8-flash when GEMINI_MODEL is unset', () => {
      const provider = new GeminiProvider();
      expect(provider.model).toBe('gemini-3.8-flash');
    });

    it('respects GEMINI_MODEL environment variable', () => {
      process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite';
      const provider = new GeminiProvider();
      expect(provider.model).toBe('gemini-3.5-flash-lite');
    });

    it('respects explicit constructor configuration overrides', () => {
      const provider = new GeminiProvider({
        apiKey: 'custom-test-key',
        model: 'gemini-4-argon',
        timeoutMs: 15000,
        maxOutputTokens: 1024,
        temperature: 0.7,
      });

      expect(provider.apiKey).toBe('custom-test-key');
      expect(provider.model).toBe('gemini-4-argon');
      expect(provider.timeoutMs).toBe(15000);
      expect(provider.maxOutputTokens).toBe(1024);
      expect(provider.temperature).toBe(0.7);
    });

    it('rejects invalid, non-positive or non-finite timeoutMs values in config', () => {
      expect(() => new GeminiProvider({ timeoutMs: 0 })).toThrow(
        /Invalid Gemini configuration: timeoutMs must be a positive finite number/
      );
      expect(() => new GeminiProvider({ timeoutMs: -1000 })).toThrow(
        /Invalid Gemini configuration: timeoutMs must be a positive finite number/
      );
      expect(() => new GeminiProvider({ timeoutMs: NaN })).toThrow(
        /Invalid Gemini configuration: timeoutMs must be a positive finite number/
      );
      expect(() => new GeminiProvider({ timeoutMs: 'invalid' as any })).toThrow(
        /Invalid Gemini configuration: timeoutMs must be a positive finite number/
      );
    });

    it('rejects invalid GEMINI_TIMEOUT_MS in environment', () => {
      process.env.GEMINI_TIMEOUT_MS = '-500';
      expect(() => new GeminiProvider()).toThrow(
        /Invalid Gemini configuration: GEMINI_TIMEOUT_MS must be a positive finite number/
      );

      process.env.GEMINI_TIMEOUT_MS = 'not-a-number';
      expect(() => new GeminiProvider()).toThrow(
        /Invalid Gemini configuration: GEMINI_TIMEOUT_MS must be a positive finite number/
      );
    });

    it('rejects invalid, non-positive or non-integer maxOutputTokens values in config', () => {
      expect(() => new GeminiProvider({ maxOutputTokens: 0 })).toThrow(
        /Invalid Gemini configuration: maxOutputTokens must be a positive integer/
      );
      expect(() => new GeminiProvider({ maxOutputTokens: -50 })).toThrow(
        /Invalid Gemini configuration: maxOutputTokens must be a positive integer/
      );
      expect(() => new GeminiProvider({ maxOutputTokens: 100.5 })).toThrow(
        /Invalid Gemini configuration: maxOutputTokens must be a positive integer/
      );
      expect(() => new GeminiProvider({ maxOutputTokens: 'invalid' as any })).toThrow(
        /Invalid Gemini configuration: maxOutputTokens must be a positive integer/
      );
    });

    it('rejects invalid GEMINI_MAX_OUTPUT_TOKENS in environment', () => {
      process.env.GEMINI_MAX_OUTPUT_TOKENS = '0';
      expect(() => new GeminiProvider()).toThrow(
        /Invalid Gemini configuration: GEMINI_MAX_OUTPUT_TOKENS must be a positive integer/
      );

      process.env.GEMINI_MAX_OUTPUT_TOKENS = '45.8';
      expect(() => new GeminiProvider()).toThrow(
        /Invalid Gemini configuration: GEMINI_MAX_OUTPUT_TOKENS must be a positive integer/
      );
    });

    it('rejects invalid temperature outside 0..2 bounds', () => {
      expect(() => new GeminiProvider({ temperature: -0.1 })).toThrow(
        /Invalid Gemini configuration: temperature must be a finite number between 0 and 2/
      );
      expect(() => new GeminiProvider({ temperature: 2.1 })).toThrow(
        /Invalid Gemini configuration: temperature must be a finite number between 0 and 2/
      );
    });

    it('fails closed when generate() is called without an API key', async () => {
      const provider = new GeminiProvider();
      await expect(
        provider.generate([{ role: 'user', content: 'Hello' }])
      ).rejects.toThrow(/Gemini API key is not configured/);
    });

    it('fails closed when generateStream() is called without an API key', async () => {
      const provider = new GeminiProvider();
      const stream = provider.generateStream([{ role: 'user', content: 'Hello' }]);
      const reader = stream.getReader();

      await expect(reader.read()).rejects.toThrow(/Gemini API key is not configured/);
    });

    it('getAIProvider() returns MockProvider by default when AI_PROVIDER is unset', () => {
      const provider = getAIProvider();
      expect(provider).toBeInstanceOf(MockProvider);
    });

    it('getAIProvider() returns GeminiProvider when AI_PROVIDER is gemini', () => {
      process.env.AI_PROVIDER = 'gemini';
      const provider = getAIProvider();
      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('getAIProvider() supports explicit override parameter', () => {
      const provider = getAIProvider({ providerType: 'gemini' });
      expect(provider).toBeInstanceOf(GeminiProvider);
    });
  });

  describe('2. Successful responses & message formatting', () => {
    it('translates messages into system instruction and contents properly', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
      const messages: PromptMessage[] = [
        { role: 'system', content: 'You are an investigative assistant.' },
        { role: 'system', content: 'Adhere to editorial boundaries.' },
        { role: 'user', content: 'Explain the Plassey contract.' },
        { role: 'assistant', content: 'Here is the summary.' },
        { role: 'user', content: 'Provide the evidence.' },
      ];

      const formatted = provider.formatMessages(messages);

      expect(formatted.systemInstruction).toBe(
        'You are an investigative assistant.\n\nAdhere to editorial boundaries.'
      );
      expect(formatted.contents).toEqual([
        { role: 'user', parts: [{ text: 'Explain the Plassey contract.' }] },
        { role: 'model', parts: [{ text: 'Here is the summary.' }] },
        { role: 'user', parts: [{ text: 'Provide the evidence.' }] },
      ]);
    });

    it('successfully calls generate() and returns model output text', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: 'Detailed report on trade monopolies.',
          }),
        },
      };

      const provider = new GeminiProvider(
        { apiKey: 'test-key', model: 'gemini-3.8-flash' },
        mockClient
      );

      const result = await provider.generate([{ role: 'user', content: 'Summarize monopoly.' }]);

      expect(result).toBe('Detailed report on trade monopolies.');
      expect(mockClient.models.generateContent).toHaveBeenCalledWith({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: 'Summarize monopoly.' }] }],
        config: {
          abortSignal: expect.any(AbortSignal),
          systemInstruction: undefined,
          maxOutputTokens: 2048,
          temperature: 0.3,
        },
      });
    });

    it('successfully streams chunks via generateStream() as a ReadableStream', async () => {
      async function* mockStreamGenerator() {
        yield { text: 'First chunk. ' };
        yield { text: 'Second chunk.' };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockResolvedValue(mockStreamGenerator()),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const stream = provider.generateStream([{ role: 'user', content: 'Stream test' }]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          accumulated += decoder.decode(value);
        }
      }

      expect(accumulated).toBe('First chunk. Second chunk.');
    });

    it('integrates seamlessly with KnowledgeCopilot and EntitySkill', async () => {
      async function* mockStreamGenerator() {
        yield { text: 'Analysis for Clive: high British leverage.' };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockResolvedValue(mockStreamGenerator()),
        },
      };

      const geminiProvider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const copilotInstance = new KnowledgeCopilot(geminiProvider);

      const mockContext: EntityCopilotContext = {
        id: 'entity-robert-clive',
        name: 'Robert Clive',
        relationships: [],
        timeline: [],
        claims: [],
      };

      const stream = copilotInstance.entity.execute(mockContext, 'Assess risk');
      const response = copilotInstance.createStreamResponse(stream);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let output = '';
      let done = false;
      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) output += decoder.decode(value);
      }

      expect(output).toBe('Analysis for Clive: high British leverage.');
    });
  });

  describe('3. Request lifecycle, AbortSignal propagation & timer cleanup', () => {
    it('passes an active AbortSignal to the SDK in generate()', async () => {
      let capturedSignal: AbortSignal | undefined;
      const mockClient = {
        models: {
          generateContent: vi.fn().mockImplementation((args: any) => {
            capturedSignal = args?.config?.abortSignal;
            return Promise.resolve({ text: 'Success response' });
          }),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      await provider.generate([{ role: 'user', content: 'Hello' }]);

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal).toBeInstanceOf(AbortSignal);
      expect(capturedSignal?.aborted).toBe(false);
    });

    it('passes an active AbortSignal to the SDK in generateStream()', async () => {
      let capturedSignal: AbortSignal | undefined;
      async function* mockStream() {
        yield { text: 'Chunk 1' };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockImplementation((args: any) => {
            capturedSignal = args?.config?.abortSignal;
            return Promise.resolve(mockStream());
          }),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const stream = provider.generateStream([{ role: 'user', content: 'Stream test' }]);
      const reader = stream.getReader();
      await reader.read();

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal).toBeInstanceOf(AbortSignal);
      expect(capturedSignal?.aborted).toBe(false);
    });

    it('clears timeout timer in finally block on successful generate()', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: 'Response text' }),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key', timeoutMs: 10000 }, mockClient);
      await provider.generate([{ role: 'user', content: 'Test prompt' }]);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('clears timeout timer in finally block on failed generate()', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const mockClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('Internal Server Error (500)')),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key', timeoutMs: 10000 }, mockClient);

      await expect(
        provider.generate([{ role: 'user', content: 'Test prompt' }])
      ).rejects.toThrow(/Internal Server Error/);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('aborts the SDK AbortSignal when generate() times out and clears timer', async () => {
      let capturedSignal: AbortSignal | undefined;
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const mockClient = {
        models: {
          generateContent: vi.fn().mockImplementation((args: any) => {
            capturedSignal = args?.config?.abortSignal;
            return new Promise((resolve) => setTimeout(resolve, 500));
          }),
        },
      };

      const provider = new GeminiProvider(
        { apiKey: 'test-key', timeoutMs: 30 },
        mockClient
      );

      await expect(
        provider.generate([{ role: 'user', content: 'Timeout prompt' }])
      ).rejects.toThrow(/Gemini request timed out after 30ms/);

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(true);
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('aborts the SDK AbortSignal when generateStream() times out and clears timer', async () => {
      let capturedSignal: AbortSignal | undefined;
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      async function* slowStream(signal?: AbortSignal) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 500);
          signal?.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Aborted'));
          });
        });
        yield { text: 'Delayed' };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockImplementation((args: any) => {
            capturedSignal = args?.config?.abortSignal;
            return Promise.resolve(slowStream(capturedSignal));
          }),
        },
      };

      const provider = new GeminiProvider(
        { apiKey: 'test-key', timeoutMs: 30 },
        mockClient
      );

      const stream = provider.generateStream([{ role: 'user', content: 'Stream timeout' }]);
      const reader = stream.getReader();

      await expect(reader.read()).rejects.toThrow(/Gemini request timed out after 30ms/);

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(true);
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('aborts SDK signal and clears timer when consumer cancels the stream', async () => {
      let capturedSignal: AbortSignal | undefined;
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      async function* endlessStream() {
        let i = 0;
        while (true) {
          yield { text: `Chunk ${i++}` };
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockImplementation((args: any) => {
            capturedSignal = args?.config?.abortSignal;
            return Promise.resolve(endlessStream());
          }),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key', timeoutMs: 10000 }, mockClient);
      const stream = provider.generateStream([{ role: 'user', content: 'Consumer cancellation' }]);
      const reader = stream.getReader();

      const firstChunk = await reader.read();
      expect(firstChunk.done).toBe(false);

      // Consumer cancels the stream
      await reader.cancel('Consumer stopped listening');

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(true);
      expect(capturedSignal?.reason).toBe('Consumer stopped listening');
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('4. API errors and empty responses', () => {
    it('handles upstream API rejection in generate()', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('Quota exceeded (429)')),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      await expect(
        provider.generate([{ role: 'user', content: 'Test prompt' }])
      ).rejects.toThrow(/Quota exceeded/);
    });

    it('handles upstream API rejection in generateStream()', async () => {
      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockRejectedValue(new Error('Internal Server Error (500)')),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const stream = provider.generateStream([{ role: 'user', content: 'Test prompt' }]);
      const reader = stream.getReader();

      await expect(reader.read()).rejects.toThrow(/Internal Server Error/);
    });

    it('handles empty response in generate() without crashing', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: null }),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const result = await provider.generate([{ role: 'user', content: 'Empty response' }]);
      expect(result).toBe('');
    });

    it('handles empty stream chunks in generateStream() without crashing', async () => {
      async function* emptyStream() {
        yield { text: '' };
        yield { text: undefined };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockResolvedValue(emptyStream()),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const stream = provider.generateStream([{ role: 'user', content: 'Empty stream' }]);
      const reader = stream.getReader();

      const { value, done } = await reader.read();
      expect(value).toBeUndefined();
      expect(done).toBe(true);
    });
  });

  describe('5. Preservation of existing provider behavior', () => {
    it('preserves MockProvider default responses in KnowledgeCopilot', async () => {
      const defaultCopilot = new KnowledgeCopilot();
      expect(defaultCopilot.getProvider()).toBeInstanceOf(MockProvider);

      const mockContext: EntityCopilotContext = {
        id: 'entity-test-preservation',
        name: 'Preservation Entity',
        relationships: [],
        timeline: [],
        claims: [],
      };

      const stream = defaultCopilot.entity.execute(mockContext, 'General question');
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let done = false;
      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) text += decoder.decode(value);
      }

      expect(text.length).toBeGreaterThan(0);
      expect(text).toContain('simulated AI response evaluating your query: "General question"');
    });

    it('preserves question generation on MockProvider without alterations', () => {
      const defaultCopilot = new KnowledgeCopilot();
      const mockContext: EntityCopilotContext = {
        id: 'entity-test-q',
        name: 'Questions Entity',
        relationships: [],
        timeline: [],
        claims: [],
      };

      const questions = defaultCopilot.entity.generateSuggestedQuestions(mockContext);
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThanOrEqual(2);
      expect(questions).toContain('Explain recent developments for Questions Entity');
      expect(questions).toContain('What are the biggest risks based on the coverage?');
    });
  });

  describe('6. Secret-safe error handling and sanitization (Gitleaks-safe)', () => {
    it('sanitizes explicit configured API key from error messages', () => {
      const secret = FAKE_KEY_1;
      const rawError = `Request failed: https://generativelanguage.googleapis.com/v1beta/models?key=${secret}`;
      const sanitized = sanitizeErrorMessage(rawError, secret);

      expect(sanitized).not.toContain(secret);
      expect(sanitized).toContain('[REDACTED_API_KEY]');
    });

    it('sanitizes standard Google API key patterns even when apiKey is not explicitly passed', () => {
      const secretPattern = FAKE_KEY_2;
      const rawError = `Invalid API key ${secretPattern} provided in header.`;
      const sanitized = sanitizeErrorMessage(rawError);

      expect(sanitized).not.toContain(secretPattern);
      expect(sanitized).toBe('Invalid API key [REDACTED_API_KEY] provided in header.');
    });

    it('redacts URL query key parameters', () => {
      const rawError = 'Network failure connecting to https://api.google.com/test?key=mySecretToken123&format=json';
      const sanitized = sanitizeErrorMessage(rawError);

      expect(sanitized).not.toContain('mySecretToken123');
      expect(sanitized).toContain('key=[REDACTED_API_KEY]');
    });

    it('ensures GeminiProvider.generate() does not leak API keys in thrown errors', async () => {
      const secretKey = FAKE_KEY_3;
      const mockClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue(
            new Error(`Failed to authenticate with key ${secretKey} at server`)
          ),
        },
      };

      const provider = new GeminiProvider({ apiKey: secretKey }, mockClient);

      try {
        await provider.generate([{ role: 'user', content: 'Hello' }]);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.message).not.toContain(secretKey);
        expect(err.message).toContain('[REDACTED_API_KEY]');
      }
    });

    it('ensures GeminiProvider.generateStream() does not leak API keys in stream errors', async () => {
      const secretKey = FAKE_KEY_4;
      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockRejectedValue(
            new Error(`Stream error on credentials: key=${secretKey}`)
          ),
        },
      };

      const provider = new GeminiProvider({ apiKey: secretKey }, mockClient);
      const stream = provider.generateStream([{ role: 'user', content: 'Hello' }]);
      const reader = stream.getReader();

      try {
        await reader.read();
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.message).not.toContain(secretKey);
        expect(err.message).toContain('[REDACTED_API_KEY]');
      }
    });
  });

  describe('7. Server-side entry point & route handler integration', () => {
    it('verifies route runtime is configured for nodejs', async () => {
      const route = await import('@/app/api/ai/copilot/route');
      expect(route.runtime).toBe('nodejs');
    });

    it('rejects invalid request payloads with 400 status', async () => {
      const { POST } = await import('@/app/api/ai/copilot/route');
      const req = new NextRequest('http://localhost:3000/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Hello', skill: 'wrong-skill' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid request');
    });

    it('rejects oversized prompts (>4000 chars) with 413 status', async () => {
      const { POST } = await import('@/app/api/ai/copilot/route');
      const req = new NextRequest('http://localhost:3000/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: { id: 'test' },
          prompt: 'a'.repeat(4001),
          skill: 'entity',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error).toBe('Payload Too Large');
    });

    it('successfully processes valid entity copilot request via POST handler', async () => {
      const { POST } = await import('@/app/api/ai/copilot/route');
      const req = new NextRequest('http://localhost:3000/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            id: 'entity-1',
            name: 'State Bank of India',
            relationships: [],
            timeline: [],
            claims: [],
          },
          prompt: 'What are the main risks?',
          skill: 'entity',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/event-stream');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) text += decoder.decode(value);
      }

      expect(text.length).toBeGreaterThan(0);
      expect(text).toContain('risk');
    });
  });
});
