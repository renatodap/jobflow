import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingResponse, AIConfig } from './types.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { OllamaProvider } from './providers/ollama.js';

export class AIRouter implements AIProvider {
  name = 'router';
  private providers: Map<string, AIProvider> = new Map();
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    
    // Initialize providers based on available environment variables
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      this.providers.set('openrouter', new OpenRouterProvider(openRouterKey, config.dailyBudget));
    }

    // Always initialize Ollama as fallback
    this.providers.set('ollama', new OllamaProvider());
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    // Try primary provider first
    const primary = this.providers.get(this.config.primaryProvider);
    if (primary && await primary.isAvailable()) {
      try {
        return await primary.chat(messages, {
          ...options,
          model: options.model || this.config.models.chat,
        });
      } catch (error) {
        console.warn(`Primary provider ${this.config.primaryProvider} failed:`, error);
      }
    }

    // Try fallback provider
    if (this.config.fallbackProvider) {
      const fallback = this.providers.get(this.config.fallbackProvider);
      if (fallback && await fallback.isAvailable()) {
        try {
          return await fallback.chat(messages, options);
        } catch (error) {
          console.warn(`Fallback provider ${this.config.fallbackProvider} failed:`, error);
        }
      }
    }

    // Try any available provider
    for (const [name, provider] of this.providers) {
      if (name !== this.config.primaryProvider && name !== this.config.fallbackProvider) {
        if (await provider.isAvailable()) {
          try {
            return await provider.chat(messages, options);
          } catch (error) {
            console.warn(`Provider ${name} failed:`, error);
          }
        }
      }
    }

    throw new Error('No AI providers available');
  }

  async embed(texts: string[]): Promise<EmbeddingResponse> {
    // Try primary provider first
    const primary = this.providers.get(this.config.primaryProvider);
    if (primary && await primary.isAvailable()) {
      try {
        return await primary.embed(texts);
      } catch (error) {
        console.warn(`Primary provider ${this.config.primaryProvider} failed for embeddings:`, error);
      }
    }

    // Try fallback provider
    if (this.config.fallbackProvider) {
      const fallback = this.providers.get(this.config.fallbackProvider);
      if (fallback && await fallback.isAvailable()) {
        try {
          return await fallback.embed(texts);
        } catch (error) {
          console.warn(`Fallback provider ${this.config.fallbackProvider} failed for embeddings:`, error);
        }
      }
    }

    // Try any available provider
    for (const [name, provider] of this.providers) {
      if (name !== this.config.primaryProvider && name !== this.config.fallbackProvider) {
        if (await provider.isAvailable()) {
          try {
            return await provider.embed(texts);
          } catch (error) {
            console.warn(`Provider ${name} failed for embeddings:`, error);
          }
        }
      }
    }

    throw new Error('No AI providers available for embeddings');
  }

  async isAvailable(): Promise<boolean> {
    // Check if any provider is available
    for (const provider of this.providers.values()) {
      if (await provider.isAvailable()) {
        return true;
      }
    }
    return false;
  }

  getCost(tokens: number, type: 'input' | 'output' | 'embedding'): number {
    const primary = this.providers.get(this.config.primaryProvider);
    return primary?.getCost(tokens, type) || 0;
  }

  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];
    for (const [name, provider] of this.providers) {
      if (await provider.isAvailable()) {
        available.push(name);
      }
    }
    return available;
  }

  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }
}