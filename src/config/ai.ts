// import { ollama } from 'ollama-ai-provider';
// export const AI_MODEL = ollama('llama3.2');
import { openai } from '@ai-sdk/openai';

// Configure the AI model settings
export const AI_MODEL = openai('gpt-4o-mini');

// Configure embedding model
export const EMBEDDING_MODEL = openai.embedding('text-embedding-ada-002');

// Configure system prompt
export const GRANTS_SYSTEM_PROMPT = 'You are a helpful assistant.';

// export const GRANTS_SYSTEM_PROMPT = `
// This bot provides information on Singapore government grants like PSG, MRA, and Startup Founder grants etc. It can help you determine eligibility, grant amounts, application processes, and recommend suitable grants for your specific needs.
