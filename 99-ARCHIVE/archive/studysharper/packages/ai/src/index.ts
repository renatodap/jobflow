export * from './types.js';
export * from './router.js';
export * from './providers/openrouter.js';
export * from './providers/ollama.js';
export * from './vector-store.js';
export * from './content-processor.js';
export * from './rag-pipeline.js';
export * from './study-planner.js';

import { AIRouter } from './router.js';
import { AIConfig } from './types.js';

// Default configuration
const defaultConfig: AIConfig = {
  primaryProvider: 'openrouter',
  fallbackProvider: 'ollama',
  dailyBudget: 5.00,
  models: {
    chat: 'anthropic/claude-3-haiku',
    embedding: 'text-embedding-3-small',
  },
};

// Global router instance
let globalRouter: AIRouter | null = null;

export function createAIRouter(config: Partial<AIConfig> = {}): AIRouter {
  const fullConfig = { ...defaultConfig, ...config };
  return new AIRouter(fullConfig);
}

export function getAIRouter(): AIRouter {
  if (!globalRouter) {
    globalRouter = createAIRouter();
  }
  return globalRouter;
}

export function setGlobalAIRouter(router: AIRouter): void {
  globalRouter = router;
}