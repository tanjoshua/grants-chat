'use client';

import { Button } from "@/components/ui/button";
import type { SuggestedQuestion } from "@/db/schema";

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <Button
            key={q.id}
            variant="outline"
            className="text-sm"
            onClick={() => onSelectQuestion(q.question)}
          >
            {q.question}
          </Button>
        ))}
      </div>
    </div>
  );
}
