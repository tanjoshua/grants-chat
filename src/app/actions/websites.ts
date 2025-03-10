'use server';

import { db } from '@/db';
import { documents, type Document } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addWebsite(formData: FormData) {
  const url = formData.get('url') as string;
  const name = formData.get('name') as string;
  
  if (!url || !name) {
    return { error: 'URL and name are required' };
  }

  try {
    await db.insert(documents).values({
      name, // Store the name directly
      content: '', // Initially empty, will be populated after scraping
      url,
      sourceType: 'website',
      status: 'pending',
      metadata: { description: name }
    });

    revalidatePath('/settings');
    return { success: true };
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
