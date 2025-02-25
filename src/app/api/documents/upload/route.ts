import { NextResponse } from 'next/server';
import { EMBEDDING_MODEL } from '@/config/ai';
import { embedMany } from 'ai';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

export async function POST(request: Request) {
  try {
    const { db } = await import('@/db');
    const { documents, embeddings } = await import('@/db/schema');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    // Read and clean file content
    let content = await file.text();
    
    // Remove null bytes and invalid UTF-8 characters
    content = content
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[^\x20-\x7E\x0A\x0D]/g, ' '); // Keep only printable ASCII, newlines and carriage returns

    // Create document record
    const [document] = await db.insert(documents).values({
      filename: file.name,
      content,
      status: 'processing',
      metadata: {
        fileType: file.type,
        size: file.size
      }
    }).returning();

    try {
      // Generate embedding
      const chunks = generateChunks(content);

      const { embeddings: embeddingsResult } = await embedMany({
        model: EMBEDDING_MODEL,
        values: chunks,
      });

      // Store embedding
    await db.insert(embeddings).values(
      embeddingsResult.map((embedding, embeddingIndex) => ({
        documentId: document.id,
        content: chunks[embeddingIndex],
        embedding: embedding
      })),
    );

      // Update document status
      await db
        .update(documents)
        .set({ status: 'ready' })
        .where(eq(documents.id, document.id));

      return NextResponse.json({
        message: 'Document uploaded and processed successfully',
        document: {
          id: document.id,
          filename: document.filename,
          status: 'ready',
          metadata: document.metadata
        }
      });

    } catch (error) {
      // Update document status on error
      await db
        .update(documents)
        .set({ status: 'error' })
        .where(eq(documents.id, document.id));

      throw error;
    }

  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
