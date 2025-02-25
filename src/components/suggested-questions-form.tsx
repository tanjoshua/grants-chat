'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SuggestedQuestion } from '@/db/schema';
import { addSuggestedQuestion } from '@/app/actions/suggested-questions';

interface SuggestedQuestionsFormProps {
  questions: SuggestedQuestion[];
  onDelete: (id: string) => Promise<{ success: boolean }>;
}

export function SuggestedQuestionsForm({ questions, onDelete }: SuggestedQuestionsFormProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsAdding(true);
    try {
      await addSuggestedQuestion(newQuestion.trim());
      setNewQuestion('');
      toast({
        title: 'Question added',
        description: 'The suggested question has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to add question',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await onDelete(id);
      toast({
        title: 'Question deleted',
        description: 'The suggested question has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete question',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Suggested Questions</h2>
          <p className="text-sm text-muted-foreground">
            Add questions that will be suggested to users when they start a new chat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter a suggested question..."
            className="flex-1"
            disabled={isAdding}
          />
          <Button type="submit" disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
        </form>

        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-3"
            >
              <span className="text-sm">{q.question}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(q.id)}
                disabled={isDeleting === q.id}
              >
                {isDeleting === q.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
