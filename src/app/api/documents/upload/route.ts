import { NextResponse } from 'next/server';
import { embedMany } from 'ai';
import { eq } from 'drizzle-orm';
import { EMBEDDING_MODEL } from '@/config/ai';
import { db } from '@/db';
import { documents, embeddings } from '@/db/schema';

export const maxDuration = 60;

const generateChunks = (input: string, chunkSize: number = 1500, overlap: number = 250): string[] => {
  try {
    // Safety check for input
    if (!input || typeof input !== 'string') {
      console.warn('Invalid input provided to generateChunks, returning empty array');
      return [];
    }

    // Clean and normalize the input text
    const text = input.trim().replace(/\s+/g, ' ');
    console.log("Text length", text.length);
    
    // If text is shorter than chunk size, return it as a single chunk
    if (text.length <= chunkSize) {
      return [text];
    }
    
    const chunks: string[] = [];
    let startIndex = 0;
    
    // Safety mechanism to prevent infinite loops
    let iterationCount = 0;
    const maxIterations = Math.ceil(text.length / (chunkSize - overlap)) * 10; // Increased safety factor to 10x
    console.log(`Calculated maxIterations: ${maxIterations} based on text length ${text.length}, chunkSize ${chunkSize}, overlap ${overlap}`);
    
    // Variables to track progress
    let totalAdvancement = 0;
    let lastReportedPercentage = 0;
    let consecutiveZeroAdvancements = 0; // Track consecutive zero advancements
    
    while (startIndex < text.length && iterationCount < maxIterations) {
      iterationCount++;
      
      // Calculate end index for this chunk, ensuring it doesn't exceed text length
      let endIndex = Math.min(startIndex + chunkSize, text.length);
      const originalEndIndex = endIndex; // Store for progress tracking
      
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
            const newEndIndex = Math.min(text.length, searchStart + sentenceEndMatch.index + 2);
            
            // Only use sentence boundary if it doesn't result in too small of a chunk
            // AND it advances beyond our current position
            if (newEndIndex - startIndex >= chunkSize * 0.5 && newEndIndex > startIndex) {
              endIndex = newEndIndex;
            } else {
              console.log(`Ignoring sentence boundary at position ${newEndIndex} as it would make chunk too small or cause no advancement`);
            }
          }
        } catch (error) {
          console.warn('Error finding sentence boundary, using default chunk size', error);
        }
      }
      
      // Validate indices before substring operation
      if (startIndex >= 0 && endIndex > startIndex && endIndex <= text.length) {
        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
          chunks.push(chunk);
        }
        
        // Track how much we advanced
        const previousStartIndex = startIndex;
        startIndex = Math.max(0, endIndex - overlap);
        const advancement = startIndex - previousStartIndex;
        totalAdvancement += advancement;
        
        // Track consecutive zero advancements and force progress if needed
        if (advancement <= 0) {
          consecutiveZeroAdvancements++;
          if (consecutiveZeroAdvancements >= 3) {
            console.warn(`Detected ${consecutiveZeroAdvancements} consecutive zero advancements. Forcing progress...`);
            startIndex = Math.min(text.length, previousStartIndex + Math.max(300, chunkSize / 4));
            consecutiveZeroAdvancements = 0;
          }
        } else {
          consecutiveZeroAdvancements = 0;
        }
        
        // Report progress every 10%
        const progressPercentage = Math.floor((totalAdvancement / text.length) * 100);
        if (progressPercentage >= lastReportedPercentage + 10) {
          console.log(`Chunking progress: ${progressPercentage}% (${totalAdvancement}/${text.length} chars)`);
          lastReportedPercentage = progressPercentage;
        }
        
        // Debug logging if we're advancing very little
        if (advancement < 300 && iterationCount % 100 === 0) {
          console.log(`Slow advancement detected: only advanced ${advancement} chars in this iteration`);
        }
      } else {
        console.warn(`Invalid index values: startIndex=${startIndex}, endIndex=${endIndex}, textLength=${text.length}`);
        // Force advancement to avoid getting stuck
        startIndex = Math.min(text.length, startIndex + chunkSize / 2);
      }
      
      // Prevent infinite loop if we couldn't advance
      if (startIndex >= endIndex) {
        console.warn(`Breaking loop because startIndex (${startIndex}) >= endIndex (${endIndex}). Forcing advancement.`);
        // Force advancement to the next chunk - ensure we actually advance
        startIndex = Math.min(text.length, originalEndIndex);
        
        // If we're still not advancing, move forward by a fixed amount
        if (startIndex <= endIndex) {
          startIndex = Math.min(text.length, startIndex + 300);
        }
      }
      
      // Ensure we advance at least some minimum amount
      if (iterationCount > 1 && totalAdvancement < iterationCount * 30) {
        console.warn(`Forcing advancement to avoid stalling. Current startIndex: ${startIndex}`);
        startIndex = Math.min(text.length, startIndex + chunkSize / 2);
      }
    }
    
    // Special handling to ensure we process the entire document
    if (startIndex < text.length) {
      console.log(`Adding final chunk to process remaining ${text.length - startIndex} characters`);
      const finalChunk = text.substring(startIndex).trim();
      if (finalChunk.length > 0) {
        chunks.push(finalChunk);
        
        // Update the advancement counter to include this final chunk
        const remainingChars = text.length - startIndex;
        totalAdvancement += remainingChars;
        console.log(`Updated total advancement to include final chunk: ${totalAdvancement}/${text.length} characters (${Math.floor((totalAdvancement/text.length)*100)}%)`);
      }
    }
    
    if (iterationCount >= maxIterations) {
      console.warn(`Reached maximum iterations (${maxIterations}) in generateChunks. Processed ${totalAdvancement}/${text.length} characters (${Math.floor((totalAdvancement/text.length)*100)}%).`);
      
      // If we didn't process the entire document, log a special warning
      if (startIndex < text.length && totalAdvancement < text.length) {
        console.warn(`WARNING: Some characters at the end of the document may not have been processed optimally.`);
      }
    }
    
    console.log(`Chunking completed: ${chunks.length} chunks created. Iterations used: ${iterationCount}/${maxIterations}`);
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
