'use server';

import { db } from '@/db';
import { documents, type Document } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Server-side utility functions for websites

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
