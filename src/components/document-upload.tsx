'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import * as z from 'zod';

const formSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file to upload' })
});

type FormValues = z.infer<typeof formSchema>;

const ACCEPTED_FILE_TYPES = [
  { ext: '.txt', type: 'text/plain', name: 'Text' },
  { ext: '.csv', type: 'text/csv', name: 'CSV' },
  { ext: '.pdf', type: 'application/pdf', name: 'PDF' },
  { ext: '.doc', type: 'application/msword', name: 'Word Doc' },
  { ext: '.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Word Docx' },
];

export function DocumentUpload({ onUploadComplete }: { onUploadComplete?: () => Promise<void> }) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', data.file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Reset form and file input
      form.reset();
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      toast({
        title: 'Success',
        description: `${data.file.name} uploaded successfully`,
      });
      
      // Call onUploadComplete to refetch documents
      if (onUploadComplete) {
        await onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      form.setError('file', { 
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to upload document'
      });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
      });
      
      // Call onUploadComplete to refetch documents even when upload fails
      if (onUploadComplete) {
        await onUploadComplete();
      }
    } finally {
      setIsUploading(false);
    }
  }

  const acceptString = ACCEPTED_FILE_TYPES.map(type => `${type.type},${type.ext}`).join(',');

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={acceptString}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    Supported formats: {ACCEPTED_FILE_TYPES.map(type => type.name).join(', ')}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </Form>
    </div>
  );
}
