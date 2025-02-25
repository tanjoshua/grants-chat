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

  let systemMessage = await getSystemMessage();
  // Add tool usage instructions to system message
  systemMessage = `${systemMessage}\n\nTo provide accurate information about grants, always use the getInformation tool to search the knowledge base before answering questions. This ensures responses are based on the most up-to-date information.`;

  const result = streamText({
    model: AI_MODEL,
    system: systemMessage,
    messages,
    tools: {
      getInformation: tool({
        description: `Search the knowledge base for information about Singapore government grants, eligibility criteria, application processes, and requirements. Use this tool to ensure accurate and up-to-date information.`,
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