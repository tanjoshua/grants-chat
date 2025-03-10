'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export function WebsiteForm({ onComplete }: { onComplete?: () => Promise<void> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      const response = await fetch('/api/websites', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add website',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Website added successfully',
        });
        
        // Reset the form
        (event.target as HTMLFormElement).reset();
        
        // Call onComplete to refetch websites
        if (onComplete) {
          await onComplete();
        } else {
          // Fallback to router refresh if no callback provided
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error adding website:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      // Call onComplete to refetch websites even when there's an error
      if (onComplete) {
        await onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Website</CardTitle>
        <CardDescription>
          Add a website to be scraped for data. Static HTML websites work best, as dynamically rendered content (JavaScript-based) cannot be properly scraped.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Website Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="My Website" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input 
              id="url" 
              name="url" 
              placeholder="https://example.com" 
              type="url"
              required 
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Adding...' : 'Add Website'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
