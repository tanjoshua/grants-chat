import { DocumentUpload } from '@/components/document-upload';

export default function DocumentsPage() {
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
            <DocumentUpload />
          </div>

          {/* TODO: Document List Section */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
            <p className="text-muted-foreground">
              Document list coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
