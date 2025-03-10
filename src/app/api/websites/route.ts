import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MINI_MODEL } from '@/config/ai';
import { generateChunks, processChunksInBatches } from '@/lib/ai/embedding';

export const maxDuration = 60;

/**
 * Fetches content from a website URL and extracts the text content
 * @param url The URL to fetch content from
 * @returns The text content extracted from the website
 */
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    // Make sure the URL has a protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch the website content
    const response = await fetch(normalizedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Extract text content from HTML
    // Remove scripts, styles, and HTML tags
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const { text } = await generateText({
      model: MINI_MODEL,
      prompt: `Format the following data to be readable. Do not remove or add any information: ${textContent}`,
    });
    
    return text;
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw error;
  }
}

/**
 * API route handler for adding websites
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const name = formData.get('name') as string;
    
    if (!url || !name) {
      return NextResponse.json(
        { error: 'URL and name are required' },
        { status: 400 }
      );
    }

    // First, create the document with processing status
    const [document] = await db.insert(documents).values({
      name,
      content: '', // Initially empty, will be populated after scraping
      url,
      sourceType: 'website',
      status: 'processing',
      metadata: { description: name }
    }).returning();

    try {
      // Fetch website content
      const content = await fetchWebsiteContent(url);
      console.log(`Fetched content from ${url}, length: ${content.length} characters`);
      
      // Update document with the fetched content
      await db.update(documents)
        .set({ 
          content,
          updatedAt: new Date()
        })
        .where(eq(documents.id, document.id));
      
      try {
        // Generate chunks and embeddings
        const chunks = generateChunks(content);
        console.log(`Website content chunked into ${chunks.length} chunks`);
        
        // Process chunks in batches to generate embeddings
        await processChunksInBatches(document.id, chunks);
        
        // Update document status to ready
        await db.update(documents)
          .set({ 
            status: 'ready',
            updatedAt: new Date() 
          })
          .where(eq(documents.id, document.id));
        
        return NextResponse.json({
          message: 'Website added and processed successfully',
          document: {
            id: document.id,
            name: document.name,
            status: 'ready',
            url: document.url
          }
        });
      } catch (embeddingError) {
        console.error('Error processing website content chunks:', embeddingError);
        
        // Update document status on error
        await db.update(documents)
          .set({ 
            status: 'error',
            updatedAt: new Date() 
          })
          .where(eq(documents.id, document.id));
        
        throw embeddingError;
      }
    } catch (error) {
      console.error('Error processing website content:', error);
      
      // Update document status on error
      await db.update(documents)
        .set({ 
          status: 'error',
          updatedAt: new Date() 
        })
        .where(eq(documents.id, document.id));
      
      return NextResponse.json(
        { error: 'Failed to process website content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding website:', error);
    return NextResponse.json(
      { error: 'Failed to add website' },
      { status: 500 }
    );
  }
}
