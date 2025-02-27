import { NextResponse } from 'next/server';
import { embedMany } from 'ai';
import { eq } from 'drizzle-orm';
import { EMBEDDING_MODEL } from '@/config/ai';
import { db } from '@/db';
import { documents, embeddings } from '@/db/schema';

const generateChunks = (input: string, chunkSize: number = 500, overlap: number = 100): string[] => {
  try {
    // Safety check for input
    if (!input || typeof input !== 'string') {
      console.warn('Invalid input provided to generateChunks, returning empty array');
      return [];
    }

    // Ensure reasonable values for chunkSize and overlap
    chunkSize = Math.max(100, Math.min(chunkSize, 2000)); // Between 100 and 2000
    overlap = Math.max(0, Math.min(overlap, chunkSize / 2)); // Between 0 and half of chunkSize

    // Clean and normalize the input text
    const text = input.trim().replace(/\s+/g, ' ');
    
    // If text is shorter than chunk size, return it as a single chunk
    if (text.length <= chunkSize) {
      return [text];
    }
    
    const chunks: string[] = [];
    let startIndex = 0;
    
    // Safety mechanism to prevent infinite loops
    let iterationCount = 0;
    const maxIterations = Math.ceil(text.length / (chunkSize - overlap)) * 2;
    
    while (startIndex < text.length && iterationCount < maxIterations) {
      iterationCount++;
      
      // Calculate end index for this chunk, ensuring it doesn't exceed text length
      let endIndex = Math.min(startIndex + chunkSize, text.length);
      
      // If we're not at the end of the text, try to find a sentence boundary
      if (endIndex < text.length) {
        try {
          // Calculate safe boundaries for searching
          const searchStart = Math.max(0, endIndex - 50);
          const searchEnd = Math.min(text.length, endIndex + 50);
          
          // Look for a period, question mark, or exclamation point followed by a space
          const searchText = text.substring(searchStart, searchEnd);
          const sentenceEndMatch = searchText.match(/[.!?]\s/);
          
          if (sentenceEndMatch && sentenceEndMatch.index !== undefined) {
            // Adjust endIndex to end at a sentence boundary
            endIndex = Math.min(text.length, searchStart + sentenceEndMatch.index + 2); // +2 to include the period and space
          }
        } catch (error) {
          console.warn('Error finding sentence boundary, using default chunk size', error);
          // If there's an error finding sentence boundary, just use the default endIndex
        }
      }
      
      // Validate indices before substring operation
      if (startIndex >= 0 && endIndex > startIndex && endIndex <= text.length) {
        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
          chunks.push(chunk);
        }
      } else {
        console.warn(`Invalid index values: startIndex=${startIndex}, endIndex=${endIndex}, textLength=${text.length}`);
      }
      
      // Move to next chunk with overlap, ensuring startIndex is never negative
      startIndex = Math.max(0, endIndex - overlap);
      
      // Prevent infinite loop if we couldn't advance
      if (startIndex >= endIndex) {
        console.warn('Breaking loop because startIndex >= endIndex');
        break;
      }
    }
    
    if (iterationCount >= maxIterations) {
      console.warn(`Reached maximum iterations (${maxIterations}) in generateChunks`);
    }
    
    return chunks;
  } catch (error) {
    console.error('Error in generateChunks:', error);
    return [input.substring(0, Math.min(input.length, 1000))]; // Return a safe chunk as fallback
  }
};

// Process chunks in batches to avoid payload size limits
async function processChunksInBatches(documentId: string, chunks: string[], batchSize: number = 20) {
  console.log(`Processing ${chunks.length} chunks in batches of ${batchSize}`);
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}, chunks ${i+1}-${Math.min(i+batchSize, chunks.length)}`);
    
    // Generate embeddings for this batch
    const { embeddings: embeddingsResult } = await embedMany({
      model: EMBEDDING_MODEL,
      values: batchChunks,
    });
    
    // Insert embeddings for this batch
    await db.insert(embeddings).values(
      embeddingsResult.map((embedding, embeddingIndex) => ({
        documentId,
        content: batchChunks[embeddingIndex],
        embedding
      })),
    );
  }
}

export async function POST(request: Request) {
  try {
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
      console.log(`Document chunked into ${chunks.length} chunks`);

      // Process chunks in batches to avoid payload size limits
      await processChunksInBatches(document.id, chunks);

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
