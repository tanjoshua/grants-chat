import { DocumentUpload } from '@/components/document-upload';
import { revalidatePath } from 'next/cache';
import { DocumentList } from '@/components/document-list';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { documents, embeddings } from '@/db/schema';
import { SystemMessageForm } from '@/components/system-message-form';
import { SuggestedQuestionsForm } from '@/components/suggested-questions-form';
import { getSystemMessage, updateSystemMessage } from '@/app/actions/settings';
import { getSuggestedQuestions, deleteSuggestedQuestion } from '@/app/actions/suggested-questions';

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

async function deleteDocument(id: string) {
  'use server';
  
  // Delete associated embeddings first (due to foreign key constraint)
  await db
    .delete(embeddings)
    .where(eq(embeddings.documentId, id));

  // Delete the document
  await db
    .delete(documents)
    .where(eq(documents.id, id));

  return { success: true };
}



// Function to revalidate data and refetch documents
async function refetchDocuments() {
  'use server';
  // Force a full revalidation of the settings page
  revalidatePath('/settings', 'page');
}

export default async function SettingsPage() {
  const [docs, systemMessage, questions] = await Promise.all([
    getDocuments(),
    getSystemMessage(),
    getSuggestedQuestions()
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your documents and customize the knowledge base of the bot.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add documents to enhance chat responses with relevant information.
            </p>
            <DocumentUpload onUploadComplete={refetchDocuments} />
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

        {/* Settings Forms */}
        <div className="space-y-6">
          <SystemMessageForm 
            initialMessage={systemMessage}
            onSave={updateSystemMessage}
          />
          <SuggestedQuestionsForm 
            questions={questions}
            onDelete={deleteSuggestedQuestion}
          />
        </div>
      </div>
    </div>
  );
}
