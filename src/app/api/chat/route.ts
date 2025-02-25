import { streamText, tool } from 'ai';
import { z } from 'zod';
import { AI_MODEL } from '@/config/ai';

export const dynamic = 'force-dynamic';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const [{ getSystemMessage }, { findRelevantContent }] = await Promise.all([
    import('@/app/actions/settings'),
    import('@/lib/ai/embedding')
  ]);

  const systemMessage = await getSystemMessage();

  const result = streamText({
    model: AI_MODEL,
    system: systemMessage,
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
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}