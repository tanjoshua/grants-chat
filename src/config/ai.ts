// import { ollama } from 'ollama-ai-provider';
// export const AI_MODEL = ollama('llama3.2');
import { openai } from '@ai-sdk/openai';

// Configure the AI model settings
export const AI_MODEL = openai('gpt-4o');

// Configure embedding model
export const EMBEDDING_MODEL = openai.embedding('text-embedding-ada-002');
