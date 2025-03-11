"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SystemMessageFormProps {
  initialMessage: string;
  onSave: (message: string) => Promise<{ success: boolean }>;
}

export function SystemMessageForm({ initialMessage, onSave }: SystemMessageFormProps) {
  const [message, setMessage] = useState(initialMessage);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await onSave(message);
      if (result.success) {
        toast({
          title: 'System message updated',
          description: 'The AI will use this message for all future conversations.',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to update system message',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">AI System Message</h2>
          <p className="text-sm text-muted-foreground">
            Customize how the AI assistant behaves in conversations.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter instructions for the AI assistant..."
            className="min-h-[500px] resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              This message will be used as context for all chat conversations.
            </p>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
