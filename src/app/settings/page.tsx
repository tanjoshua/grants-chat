import { DocumentUpload } from '@/components/document-upload';
import { DocumentList } from '@/components/document-list';
import { desc, eq } from 'drizzle-orm';

async function deleteDocument(id: string) {
  'use server';
  
  try {
    const { db } = await import('@/db');
    const { documents, embeddings } = await import('@/db/schema');

    // Delete associated embeddings first (due to foreign key constraint)
    await db
      .delete(embeddings)
      .where(eq(embeddings.documentId, id));

    // Delete the document
    await db
      .delete(documents)
      .where(eq(documents.id, id));

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false };
  }
}

async function getDocuments() {
  try {
    const { db } = await import('@/db');
    const { documents } = await import('@/db/schema');

    return await db
      .select({
        id: documents.id,
        filename: documents.filename,
        status: documents.status,
        metadata: documents.metadata,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .orderBy(desc(documents.createdAt));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic'; // Disable static page generation

async function getSystemMessage() {
  const { getSystemMessage } = await import('@/app/actions/settings');
  return getSystemMessage();
}

import { SystemMessageForm } from '@/components/system-message-form';
import { updateSystemMessage } from '@/app/actions/settings';

export default async function DocumentsPage() {
  const docs = await getDocuments();
  const systemMessage = await getSystemMessage();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your documents and customize your AI assistant.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add documents to enhance chat responses with relevant information.
            </p>
            <DocumentUpload />
          </div>

          {/* Document List Section */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-2">Your Documents</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your uploaded documents.
            </p>
            <DocumentList 
              documents={docs} 
              deleteDocument={deleteDocument}
            />
          </div>
        </div>

        {/* System Message Form */}
        <SystemMessageForm 
          initialMessage={systemMessage}
          onSave={updateSystemMessage}
        />
      </div>
    </div>
  );
}
