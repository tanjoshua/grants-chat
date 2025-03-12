import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export type ModelProvider = 'openai' | 'anthropic';
export type ModelOption = { 
  id: string;
  name: string; 
  provider: ModelProvider;
  modelName: string;
};

// Define available models
export const MODELS: Record<string, ModelOption> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'ChatGPT-4o',
    provider: 'openai',
    modelName: 'gpt-4o'
  },
  'claude-3-7': {
    id: 'claude-3-7',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    modelName: 'claude-3-7-sonnet-20250219'
  }
};

// Default model
export const DEFAULT_MODEL_ID = 'gpt-4o';

// Helper to create a model instance based on provider and model name
export function createModel(modelOption: ModelOption) {
  switch (modelOption.provider) {
    case 'openai':
      return openai(modelOption.modelName);
    case 'anthropic':
      return anthropic(modelOption.modelName);
    default:
      return openai('gpt-4o'); // Fallback to default
  }
}

// Helper to get model by ID
export function getModelById(modelId: string = DEFAULT_MODEL_ID): ModelOption {
  return MODELS[modelId] || MODELS[DEFAULT_MODEL_ID];
}

// For backward compatibility
export const AI_MODEL = createModel(MODELS[DEFAULT_MODEL_ID]);
export const MINI_MODEL = openai('gpt-4o-mini');

// Configure embedding model
export const EMBEDDING_MODEL = openai.embedding('text-embedding-ada-002');
