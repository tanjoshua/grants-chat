'use server';

import { db } from '@/db';
import { documents, type Document } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';



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
    
    return textContent;
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw error;
  }
}

/**
 * Add a website to the database and fetches its content
 * @param formData Form data containing url and name
 * @returns Result object indicating success or error
 */
export async function addWebsite(formData: FormData) {
  const url = formData.get('url') as string;
  const name = formData.get('name') as string;
  
  if (!url || !name) {
    return { error: 'URL and name are required' };
  }

  try {
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
          status: 'ready',
          updatedAt: new Date()
        })
        .where(eq(documents.id, document.id));
      
      revalidatePath('/settings');
      return { success: true };
    } catch (error) {
      console.error('Error processing website content:', error);
      
      // Update document status on error
      await db.update(documents)
        .set({ 
          status: 'error',
          updatedAt: new Date() 
        })
        .where(eq(documents.id, document.id));
      
      return { error: 'Failed to process website content' };
    }
  } catch (error) {
    console.error('Error adding website:', error);
    return { error: 'Failed to add website' };
  }
}

export async function getWebsites(): Promise<Document[]> {
  try {
    return await db.select({
      id: documents.id,
      url: documents.url,
      name: documents.name,
      content: documents.content,
      sourceType: documents.sourceType,
      status: documents.status,
      metadata: documents.metadata,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt // updatedAt is used to track when a website was last scraped
    })
    .from(documents)
    .where(eq(documents.sourceType, 'website'))
    .orderBy(documents.createdAt);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return [];
  }
}

export async function deleteWebsite(id: string) {
  try {
    // Check if this is a website-type document
    const website = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, id),
        eq(documents.sourceType, 'website')
      )
    });

    if (!website) {
      return { error: 'Website not found' };
    }

    // Delete the document
    await db.delete(documents).where(eq(documents.id, id));
    
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting website:', error);
    return { error: 'Failed to delete website' };
  }
}

export async function updateWebsiteStatus(id: string, status: string) {
  try {
    await db.update(documents)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(and(
        eq(documents.id, id),
        eq(documents.sourceType, 'website')
      ));
    
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating website status:', error);
    return { error: 'Failed to update website status' };
  }
}

/**
 * Fetches content of a website by ID
 * @param id The website document ID
 * @returns Object containing content, name, url, and success status
 */
export async function getWebsiteContent(id: string): Promise<{ 
  content: string | null; 
  name: string | null;
  url: string | null;
  success: boolean;
  error?: string;
}> {
  try {
    const result = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, id),
        eq(documents.sourceType, 'website')
      ),
      columns: {
        content: true,
        name: true,
        url: true
      }
    });

    if (!result) {
      return {
        content: null,
        name: null,
        url: null,
        success: false,
        error: 'Website not found'
      };
    }

    return {
      content: result.content,
      name: result.name,
      url: result.url,
      success: true
    };
  } catch (error) {
    console.error('Error fetching website content:', error);
    return {
      content: null,
      name: null,
      url: null,
      success: false,
      error: 'Failed to fetch website content'
    };
  }
}
