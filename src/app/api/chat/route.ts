import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getModelById, createModel, DEFAULT_MODEL_ID } from '@/config/ai';
import { getSystemMessage } from '@/app/actions/settings';
import { findRelevantContent } from '@/lib/ai/embedding';

export const dynamic = 'force-dynamic';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, modelId = DEFAULT_MODEL_ID } = await req.json();
    
    let systemMessage = await getSystemMessage();
    // Add tool usage instructions to system message
    systemMessage = `${systemMessage}\n\nTo provide accurate information, use the getInformation tool to search the knowledge base.`;

    // Get the selected model option and create the model instance
    const selectedModelOption = getModelById(modelId);
    const model = createModel(selectedModelOption);

    // Use the same configuration with tools for both models
    const result = streamText({
      model,
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
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}