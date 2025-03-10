import { DocumentUpload } from '@/components/document-upload';
import { revalidatePath } from 'next/cache';
import { DocumentList } from '@/components/document-list';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { documents, embeddings} from '@/db/schema';
import { SystemMessageForm } from '@/components/system-message-form';
import { SuggestedQuestionsForm } from '@/components/suggested-questions-form';
import { getSystemMessage, updateSystemMessage } from '@/app/actions/settings';
import { getSuggestedQuestions, deleteSuggestedQuestion } from '@/app/actions/suggested-questions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebsiteForm } from '@/components/website-form';
import { WebsiteList } from '@/components/website-list';
import { getWebsites } from '@/app/actions/websites';

async function getDocuments() {
  try {
    return await db
      .select({
        id: documents.id,
        name: documents.name,
        status: documents.status,
        metadata: documents.metadata,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.sourceType, 'upload'))
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
  const [docs, systemMessage, questions, websites] = await Promise.all([
    getDocuments(),
    getSystemMessage(),
    getSuggestedQuestions(),
    getWebsites()
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

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 justify-start">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
          </TabsList>
          
          {/* General Tab Content */}
          <TabsContent value="general" className="space-y-6">
            <SystemMessageForm 
              initialMessage={systemMessage}
              onSave={updateSystemMessage}
            />
            <SuggestedQuestionsForm 
              questions={questions}
              onDelete={deleteSuggestedQuestion}
            />
          </TabsContent>
          
          {/* Documents Tab Content */}
          <TabsContent value="documents">
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
          </TabsContent>
          
          {/* Websites Tab Content */}
          <TabsContent value="websites">
            <div className="grid gap-6 md:grid-cols-2">
              <WebsiteForm onComplete={refetchDocuments} />

              {/* Website List Section */}
              <div className="rounded-lg border p-4">
                <h2 className="text-lg font-semibold mb-2">Your Websites</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage websites to be scraped for data. These websites will be processed
                  similarly to uploaded documents, with their content chunked and embedded for AI responses.
                </p>
                <WebsiteList websites={websites} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Ensure this page is always server-rendered and not cached
export const dynamic = 'force-dynamic';
