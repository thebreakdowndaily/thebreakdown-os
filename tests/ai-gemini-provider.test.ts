/**
 * THE BREAKDOWN OS — Gemini API Provider Test Suite
 *
 * Verifies:
 * 1. Provider configuration and missing API keys.
 * 2. Successful responses using mocked provider calls.
 * 3. API errors, timeouts, and empty responses.
 * 4. Preservation of existing provider behavior.
 * 5. Secret-safe error handling and logging.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GeminiProvider, sanitizeErrorMessage } from '@/services/ai/providers/gemini';
import { getAIProvider } from '@/services/ai/providers/factory';
import { MockProvider } from '@/services/ai/providers/mock';
import { KnowledgeCopilot } from '@/services/ai/copilot';
import { PromptMessage } from '@/services/ai/core/prompt-builder';
import type { EntityCopilotContext } from '@/types/canonical';

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

  describe('1. Provider configuration & missing API keys', () => {
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

  describe('2. Successful responses with mocked provider calls', () => {
    it('translates messages into system instruction and contents properly', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
      const messages: PromptMessage[] = [
        { role: 'system', content: 'You are an investigative assistant.' },
        { role: 'system', content: 'Follow strict factual standards.' },
        { role: 'user', content: 'What happened at Plassey?' },
      ];

      const { systemInstruction, contents } = provider.formatMessages(messages);
      expect(systemInstruction).toBe(
        'You are an investigative assistant.\n\nFollow strict factual standards.'
      );
      expect(contents).toHaveLength(1);
      expect(contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'What happened at Plassey?' }],
      });
    });

    it('translates assistant role to model role for Gemini compatibility', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
      const messages: PromptMessage[] = [
        { role: 'user', content: 'Question 1' },
        { role: 'assistant', content: 'Answer 1' },
        { role: 'user', content: 'Follow-up' },
      ];

      const { contents } = provider.formatMessages(messages);
      expect(contents).toHaveLength(3);
      expect(contents[0].role).toBe('user');
      expect(contents[1].role).toBe('model');
      expect(contents[2].role).toBe('user');
    });

    it('successfully executes generate() with mocked client', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'The Battle of Plassey took place in 1757.',
      });

      const mockClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const result = await provider.generate([
        { role: 'system', content: 'Be concise.' },
        { role: 'user', content: 'When was Plassey?' },
      ]);

      expect(result).toBe('The Battle of Plassey took place in 1757.');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3.8-flash',
          contents: expect.arrayContaining([
            { role: 'user', parts: [{ text: 'When was Plassey?' }] },
          ]),
          config: expect.objectContaining({
            systemInstruction: 'Be concise.',
            maxOutputTokens: 2048,
            temperature: 0.3,
          }),
        })
      );
    });

    it('successfully streams tokens through generateStream()', async () => {
      async function* mockStreamGenerator() {
        yield { text: 'Plassey ' };
        yield { text: 'occurred ' };
        yield { text: 'in 1757.' };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockResolvedValue(mockStreamGenerator()),
        },
      };

      const provider = new GeminiProvider({ apiKey: 'test-key' }, mockClient);
      const stream = provider.generateStream([
        { role: 'user', content: 'Explain Plassey' },
      ]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          fullText += decoder.decode(value);
        }
      }

      expect(fullText).toBe('Plassey occurred in 1757.');
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

  describe('3. API errors, timeouts, and empty responses', () => {
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

    it('handles timeout in generate() gracefully', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 500))
          ),
        },
      };

      const provider = new GeminiProvider(
        { apiKey: 'test-key', timeoutMs: 50 },
        mockClient
      );

      await expect(
        provider.generate([{ role: 'user', content: 'Long question' }])
      ).rejects.toThrow(/Gemini request timed out after 50ms/);
    });

    it('handles timeout in generateStream() gracefully', async () => {
      async function* infiniteSlowStream() {
        await new Promise((resolve) => setTimeout(resolve, 500));
        yield { text: 'Late chunk' };
      }

      const mockClient = {
        models: {
          generateContentStream: vi.fn().mockResolvedValue(infiniteSlowStream()),
        },
      };

      const provider = new GeminiProvider(
        { apiKey: 'test-key', timeoutMs: 50 },
        mockClient
      );

      const stream = provider.generateStream([{ role: 'user', content: 'Long stream' }]);
      const reader = stream.getReader();

      await expect(reader.read()).rejects.toThrow(/Gemini request timed out after 50ms/);
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

  describe('4. Preservation of existing provider behavior', () => {
    it('preserves MockProvider default responses in KnowledgeCopilot', async () => {
      const defaultCopilot = new KnowledgeCopilot();
      expect(defaultCopilot.getProvider()).toBeInstanceOf(MockProvider);

      const mockContext: EntityCopilotContext = {
        id: 'test-entity',
        name: 'Test Entity',
        relationships: [],
        timeline: [],
        claims: [],
      };

      const stream = defaultCopilot.entity.execute(mockContext, 'What are the risks?');
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) result += decoder.decode(value);
      }

      expect(result).toContain('Based on the provided pipeline data, the primary risk');
    });

    it('preserves MockProvider generate() blocking behavior', async () => {
      const mock = new MockProvider();
      const response = await mock.generate([{ role: 'user', content: 'Direct query' }]);
      expect(response).toBe('Simulated blocking response to: Direct query');
    });

    it('preserves generateSuggestedQuestions behavior on EntitySkill', () => {
      const defaultCopilot = new KnowledgeCopilot();
      const mockContext: EntityCopilotContext = {
        id: 'test-entity',
        name: 'Reserve Bank of India',
        relationships: [{ targetId: 'finmin', targetName: 'Ministry of Finance' }],
        timeline: [{ date: '2026-03-01', event: 'Policy Review' }],
        claims: [{ claim: 'Forex reserves increased to 640B', status: 'verified', confidence: 0.95 }],
      };

      const questions = defaultCopilot.entity.generateSuggestedQuestions(mockContext);
      expect(questions).toContain('Explain recent developments for Reserve Bank of India');
      expect(questions).toContain('Why are they connected to Ministry of Finance?');
      expect(questions).toContain('Summarize the timeline events from 2026');
      expect(questions.some((q) => q.includes('Forex reserves'))).toBe(true);
      expect(questions).toContain('What are the biggest risks based on the coverage?');
    });
  });

  describe('5. Secret-safe error handling and sanitization', () => {
    it('sanitizes explicit configured API key from error messages', () => {
      const secret = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q';
      const rawError = `Request failed: https://generativelanguage.googleapis.com/v1beta/models?key=${secret}`;
      const sanitized = sanitizeErrorMessage(rawError, secret);

      expect(sanitized).not.toContain(secret);
      expect(sanitized).toContain('[REDACTED_API_KEY]');
    });

    it('sanitizes standard Google API key patterns even when apiKey is not explicitly passed', () => {
      const secretPattern = 'AIzaSyBNM1234567890abcdefghijklmnopqrst';
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
      const secretKey = 'AIzaSyTESTSECRETKEYFORVERIFICATION12345';
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
      const secretKey = 'AIzaSyTESTSECRETSTREAMKEYVERIFICATION99';
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

  describe('6. Server-side entry point & route handler integration', () => {
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
