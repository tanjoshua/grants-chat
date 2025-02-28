import { streamText, tool } from 'ai';
import { z } from 'zod';
import { AI_MODEL } from '@/config/ai';
import { getSystemMessage } from '@/app/actions/settings';
import { findRelevantContent } from '@/lib/ai/embedding';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  let systemMessage = await getSystemMessage();
  // Add tool usage instructions to system message
  systemMessage = `${systemMessage}\n\nTo provide accurate information, follow these guidelines:
  
1. For new questions, use the getInformation tool to search the knowledge base.
2. For follow-up questions, prioritize information already retrieved in previous responses before making new searches.
3. Be precise with your search queries to get the most relevant information.
4. When information is not available in the knowledge base, clearly state this limitation.`;

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