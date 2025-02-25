"use client";

import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "How to apply PSG grant - chosen HRMS vendor?",
  "PSG grant eligibility & claim steps?",
  "Recommend grants for my business needs?",
];

export function SuggestedQuestions({
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <Button
            key={question}
            variant="outline"
            className="text-sm"
            onClick={() => onSelectQuestion(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
