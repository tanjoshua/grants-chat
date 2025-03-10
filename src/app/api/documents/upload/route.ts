import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { documents } from '@/db/schema';
import mammoth from 'mammoth';
import { generateChunks, processChunksInBatches } from '@/lib/ai/embedding';

export const maxDuration = 60;


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

    // Read file content based on file type
    let content = '';
    
    // Get file extension from the file name
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'docx' || fileExtension === 'doc') {
      // Handle Word documents using mammoth
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Fix: use the correct API format for mammoth
        const result = await mammoth.extractRawText({
          buffer: Buffer.from(arrayBuffer)
        });
        content = result.value;
        
        // Log a sample of the extracted text for debugging/verification
        console.log('===== DOCX CONTENT PREVIEW =====');
        console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
        console.log(`Total extracted text length: ${content.length} characters`);
        console.log('================================');
        
        // Log any warnings
        if (result.messages.length > 0) {
          console.log('Mammoth warnings:', result.messages);
        }
      } catch (error) {
        console.error('Error parsing Word document:', error);
        throw new Error('Failed to extract text from Word document');
      }
    } else {
      // Handle other file types as text
      content = await file.text();
    }
    
    // Clean the text content
    content = content
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters but keep newlines (\x0A) and carriage returns (\x0D)

    // Create document record
    const [document] = await db.insert(documents).values({
      name: file.name,
      content,
      sourceType: 'upload',
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
          name: document.name,
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
