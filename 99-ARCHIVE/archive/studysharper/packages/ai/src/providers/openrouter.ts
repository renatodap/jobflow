import OpenAI from 'openai';
import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingResponse } from '../types.js';

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  private client: OpenAI;
  private usageToday = 0;
  private dailyBudget: number;

  constructor(apiKey: string, dailyBudget = 5.00) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    });
    this.dailyBudget = dailyBudget;
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'anthropic/claude-3-haiku',
      messages: messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: false,
    });

    const usage = response.usage;
    if (usage) {
      const cost = this.calculateCost(usage.total_tokens, 'input');
      this.usageToday += cost;
    }

    return {
      content: response.choices[0]?.message?.content || '',
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      } : undefined,
      model: response.model,
    };
  }

  async embed(texts: string[]): Promise<EmbeddingResponse> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    const usage = response.usage;
    if (usage) {
      const cost = this.calculateCost(usage.total_tokens, 'embedding');
      this.usageToday += cost;
    }

    return {
      embeddings: response.data.map(d => d.embedding),
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        totalTokens: usage.total_tokens,
      } : undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if we're under budget
      if (this.usageToday >= this.dailyBudget) {
        return false;
      }

      // Test with a minimal request
      await this.client.chat.completions.create({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.warn('OpenRouter not available:', error);
      return false;
    }
  }

  getCost(tokens: number, type: 'input' | 'output' | 'embedding'): number {
    // Approximate costs per 1M tokens (as of Aug 2024)
    const rates = {
      input: 0.25,
      output: 1.25,
      embedding: 0.02,
    };
    return (tokens / 1_000_000) * rates[type];
  }

  private calculateCost(tokens: number, type: 'input' | 'output' | 'embedding'): number {
    return this.getCost(tokens, type);
  }

  resetDailyUsage(): void {
    this.usageToday = 0;
  }

  getCurrentUsage(): number {
    return this.usageToday;
  }
}