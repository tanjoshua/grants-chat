import { streamText, tool } from 'ai';
import { z } from 'zod';
import { AI_MODEL } from '@/config/ai';
import { getSystemMessage } from '@/app/actions/settings';
import { findRelevantContent } from '@/lib/ai/embedding';

export const dynamic = 'force-dynamic';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  let systemMessage = await getSystemMessage();
  // Add tool usage instructions to system message
  systemMessage = `${systemMessage}\n\nTo provide accurate information, use the getInformation tool to search the knowledge base.`;

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