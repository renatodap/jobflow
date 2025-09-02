import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingResponse } from '../types.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseUrl: string;
  private chatModel: string;
  private embeddingModel: string;

  constructor(baseUrl = 'http://localhost:11434', chatModel = 'llama3.1:8b', embeddingModel = 'nomic-embed-text') {
    this.baseUrl = baseUrl;
    this.chatModel = chatModel;
    this.embeddingModel = embeddingModel;
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.chatModel,
        messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.message?.content || '',
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
      model: data.model,
    };
  }

  async embed(texts: string[]): Promise<EmbeddingResponse> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.embeddingModel,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama embedding request failed: ${response.statusText}`);
      }

      const data = await response.json();
      embeddings.push(data.embedding);
    }

    return {
      embeddings,
      usage: {
        promptTokens: texts.reduce((sum, text) => sum + text.length / 4, 0), // Rough estimate
        totalTokens: texts.reduce((sum, text) => sum + text.length / 4, 0),
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const models = data.models || [];
      
      // Check if required models are available
      const hasChat = models.some((m: any) => m.name.includes(this.chatModel.split(':')[0]));
      const hasEmbedding = models.some((m: any) => m.name.includes(this.embeddingModel.split(':')[0]));
      
      return hasChat || hasEmbedding; // At least one model available
    } catch (error) {
      console.warn('Ollama not available:', error);
      return false;
    }
  }

  getCost(tokens: number, type: 'input' | 'output' | 'embedding'): number {
    // Local Ollama is free
    return 0;
  }

  async pullModel(model: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model ${model}: ${response.statusText}`);
    }

    // Stream the response to monitor download progress
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status) {
              console.log(`Pulling ${model}: ${data.status}`);
            }
          } catch (e) {
            // Ignore malformed JSON
          }
        }
      }
    }
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return (data.models || []).map((m: any) => m.name);
  }
}