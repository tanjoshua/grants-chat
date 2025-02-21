import { streamText } from 'ai';
import { AI_MODEL, SYSTEM_PROMPT } from '@/config/ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: AI_MODEL,
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toDataStreamResponse();
}