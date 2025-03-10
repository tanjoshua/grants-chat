'use server';

import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDocumentContent(id: string): Promise<{ 
  content: string | null; 
  name: string | null;
  success: boolean;
  error?: string;
}> {
  try {
    const result = await db.query.documents.findFirst({
      where: eq(documents.id, id),
      columns: {
        content: true,
        name: true
      }
    });

    if (!result) {
      return {
        content: null,
        name: null,
        success: false,
        error: 'Document not found'
      };
    }

    return {
      content: result.content,
      name: result.name,
      success: true
    };
  } catch (error) {
    console.error('Error fetching document content:', error);
    return {
      content: null,
      name: null,
      success: false,
      error: 'Failed to fetch document content'
    };
  }
}
