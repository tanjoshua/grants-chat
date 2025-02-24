import { EMBEDDING_MODEL } from '@/config/ai';
import { db } from '@/db';
import { embeddings } from '@/db/schema';
import { embed} from 'ai';
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
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.5))
      .orderBy(t => desc(t.similarity))
      .limit(4);
    return similarGuides;
  };
