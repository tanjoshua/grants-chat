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
import { useToast } from '@/hooks/use-toast';
import { getWebsiteContent } from '@/app/actions/websites';

interface WebsiteContentDialogProps {
  websiteId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  websiteName?: string | null;
}

export function WebsiteContentDialog({
  websiteId,
  isOpen,
  onOpenChange,
  websiteName: initialWebsiteName,
}: WebsiteContentDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [websiteName, setWebsiteName] = useState<string | null>(initialWebsiteName || null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch content when dialog opens and websiteId is available
  const fetchContent = useCallback(async () => {
    if (!websiteId) return;
    
    setLoading(true);
    try {
      const result = await getWebsiteContent(websiteId);
      
      if (result.success) {
        setContent(result.content);
        setWebsiteName(result.name);
        setWebsiteUrl(result.url);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch website content',
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
  }, [websiteId, toast, onOpenChange]);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setContent(null);
      setWebsiteName(initialWebsiteName || null);
      setWebsiteUrl(null);
    }
    onOpenChange(open);
  };

  // Update websiteName when initialWebsiteName changes
  useEffect(() => {
    if (initialWebsiteName) {
      setWebsiteName(initialWebsiteName);
    }
  }, [initialWebsiteName]);

  // Fetch content when websiteId or isOpen changes
  useEffect(() => {
    if (isOpen && websiteId) {
      fetchContent();
    }
  }, [isOpen, websiteId, fetchContent]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{websiteName || 'Website Content'}</DialogTitle>
          <DialogDescription>
            {websiteUrl ? (
              <>
                Content from <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80"
                >
                  {websiteUrl}
                </a>
              </>
            ) : (
              'Content of the selected website'
            )}
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
