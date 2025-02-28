import { EMBEDDING_MODEL } from '@/config/ai';
import { embed } from 'ai';
import { cosineDistance, sql, gt, desc } from 'drizzle-orm';


export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll('\\n', ' ');
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: input,
    });
    return embedding;
  };
  
  
  export const findRelevantContent = async (userQuery: string) => {
    const { db } = await import('@/db');
    const { embeddings } = await import('@/db/schema');
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.6)) // Increased threshold for better precision
      .orderBy(t => desc(t.similarity))
      .limit(3); // Reduced from 4 to 3 for token efficiency
    return similarGuides;
  };
