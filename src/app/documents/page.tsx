import { DocumentUpload } from '@/components/document-upload';
import { DocumentList } from '@/components/document-list';
import { db } from '@/db';
import { documents, embeddings } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

async function deleteDocument(id: string) {
  'use server';
  
  try {
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

export default async function DocumentsPage() {
  const docs = await getDocuments();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your documents for RAG-enhanced chat responses.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
            <DocumentUpload />
          </div>

          {/* Document List Section */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
            <DocumentList 
              documents={docs} 
              deleteDocument={deleteDocument}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
