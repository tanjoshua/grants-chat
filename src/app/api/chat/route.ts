import { streamText, tool } from 'ai';

export const dynamic = 'force-dynamic';
import { AI_MODEL, GRANTS_SYSTEM_PROMPT } from '@/config/ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: AI_MODEL,
    system: GRANTS_SYSTEM_PROMPT,
    messages,
    tools: {
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
    toolCallStreaming: true,
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}