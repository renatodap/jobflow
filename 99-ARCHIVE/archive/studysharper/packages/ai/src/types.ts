export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  name: string;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  embed(texts: string[]): Promise<EmbeddingResponse>;
  isAvailable(): Promise<boolean>;
  getCost(tokens: number, type: 'input' | 'output' | 'embedding'): number;
}

export interface AIConfig {
  primaryProvider: string;
  fallbackProvider?: string;
  dailyBudget?: number;
  models: {
    chat: string;
    embedding: string;
  };
}