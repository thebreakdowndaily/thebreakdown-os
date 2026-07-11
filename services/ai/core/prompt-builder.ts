export interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class PromptBuilder {
  private messages: PromptMessage[] = [];

  withSystemPrompt(prompt: string): this {
    this.messages.push({ role: 'system', content: prompt });
    return this;
  }

  withContext(context: Record<string, any>): this {
    this.messages.push({
      role: 'system',
      content: `CONTEXT DATA:\n${JSON.stringify(context, null, 2)}\n\nDo not invent facts outside this context. Always cite your claims using [Entity X] or [Story Y] format if applicable.`,
    });
    return this;
  }

  withQuestion(question: string): this {
    this.messages.push({ role: 'user', content: question });
    return this;
  }

  build(): PromptMessage[] {
    return this.messages;
  }
}
