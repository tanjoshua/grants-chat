'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DocumentContentDialog } from '@/components/document-content-dialog';
import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ready':
      return 'bg-green-500';
    case 'processing':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function DocumentList({ 
  documents,
  deleteDocument 
}: { 
  documents: Document[],
  deleteDocument: (id: string) => Promise<{ success: boolean }>
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteDocument(id);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  }

  function handleViewContent(id: string) {
    setSelectedDocumentId(id);
    setIsContentDialogOpen(true);
  }

  if (!documents?.length) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No documents uploaded yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <DocumentContentDialog 
        documentId={selectedDocumentId}
        isOpen={isContentDialogOpen}
        onOpenChange={setIsContentDialogOpen}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow 
              key={doc.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewContent(doc.id)}
            >
              <TableCell className="font-medium">{doc.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(doc.status)}>
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell>
                {doc.metadata?.size ? formatFileSize(doc.metadata.size as number) : 'N/A'}
              </TableCell>
              <TableCell>
                {doc.createdAt ? formatDistanceToNow(doc.createdAt, { addSuffix: true }) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
