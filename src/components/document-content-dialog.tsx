'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { getDocumentContent } from '@/app/actions/documents';
import { useToast } from '@/hooks/use-toast';

interface DocumentContentDialogProps {
  documentId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentName?: string | null;
}

export function DocumentContentDialog({
  documentId,
  isOpen,
  onOpenChange,
  documentName: initialDocumentName,
}: DocumentContentDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(initialDocumentName || null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch content when dialog opens and documentId is available
  const fetchContent = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const result = await getDocumentContent(documentId);
      
      if (result.success) {
        setContent(result.content);
        setDocumentName(result.name);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch document content',
          variant: 'destructive',
        });
        onOpenChange(false);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [documentId, toast, onOpenChange]);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setContent(null);
      setDocumentName(initialDocumentName || null);
    }
    onOpenChange(open);
  };

  // Update documentName when initialDocumentName changes
  useEffect(() => {
    if (initialDocumentName) {
      setDocumentName(initialDocumentName);
    }
  }, [initialDocumentName]);

  // Fetch content when documentId or isOpen changes
  useEffect(() => {
    if (isOpen && documentId) {
      fetchContent();
    }
  }, [isOpen, documentId, fetchContent]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{documentName || 'Document Content'}</DialogTitle>
          <DialogDescription>
            Content of the selected document
          </DialogDescription>
        </DialogHeader>
        
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="flex-1 rounded-md border p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap ">
                {content || 'No content available'}
              </pre>
            </ScrollArea>
          )}
      </DialogContent>
    </Dialog>
  );
}
