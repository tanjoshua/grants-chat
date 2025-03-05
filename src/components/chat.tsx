'use client'

import { useChat } from '@ai-sdk/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Fragment, useEffect, useRef, } from 'react';
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { SuggestedQuestions } from '@/components/suggested-questions';
import type { SuggestedQuestion } from '@/db/schema';

interface ChatProps {
  initialQuestions: SuggestedQuestion[];
}

export function Chat({ initialQuestions }: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/chat",
  });

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages are added or updated
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto first to get accurate scrollHeight measurement
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Check if AI is currently responding (has a message but it's empty)
  const isThinking = isLoading && (!messages.length || messages[messages.length - 1].role === 'user');

  return (
    <div className="flex-1 flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1">
          <div className="space-y-6 max-w-3xl mx-auto p-4">
            {messages.map((message, index) => {
              if (message.content) {

              return <div
                key={message.id}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 max-w-[85%] shadow-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  )}
                >
                  <div className="text-sm">
                    {message.role === 'user' ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        h4: ({children}) => <h4 className="text-base font-bold mb-2">{children}</h4>,
                        h5: ({children}) => <h5 className="text-sm font-bold mb-1">{children}</h5>,
                        h6: ({children}) => <h6 className="text-sm font-bold mb-1">{children}</h6>,
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 last:mb-0">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 last:mb-0">{children}</ol>,
                        li: ({children}) => <li className="mb-1 last:mb-0">{children}</li>,
                        a: ({href, children}) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            {children}
                          </a>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                  </div>
                </div>
              </div>
              }

              return <Fragment key={message.id}>
                {message.parts?.map((part, index) => {
                  switch (part.type) {
                    case 'text': 
                    return <p key={index}>{part.text}</p>
                    case 'tool-invocation': 
                    const toolCall = part.toolInvocation;
                    switch (toolCall.toolName) {
                      case 'getInformation': {
                        const args = toolCall.args as { question: string };
                        return (
                          <div className="flex justify-start" key={index}>
                            <div className="rounded-lg px-4 py-3 max-w-[85%] shadow-sm bg-muted mr-12">
                              <div className="flex items-center gap-2 mb-1">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm font-medium">Searching knowledge base</span>
                              </div>
                              <p className="text-sm text-muted-foreground pl-6">
                                Looking for information about: {args?.question}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      
                    }
                  }
                })}
              </Fragment>
            }
            )}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3 max-w-[85%] shadow-sm bg-muted mr-12 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Compiling suitable grants for you…</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>


      {/* Suggestions and Input Form */}
      <div className="px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm">
              <h3 className="font-medium mb-2">Welcome to askHugh.ai</h3>
              <p className="mb-2">This bot provides information on Singapore government grants like PSG, MRA, and Startup Founder grants etc. It can help you determine:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Eligibility requirements</li>
                <li>Grant amounts and funding details</li>
                <li>Application processes and deadlines</li>
                <li>Suitable grants for your specific business needs</li>
              </ul>
              <p>Ask a question to get started!</p>
            </div>
            <SuggestedQuestions
              questions={initialQuestions}
              onSelectQuestion={(question) => {
                append({
                  role: 'user',
                  content: question,
                });
              }}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            ref={textareaRef}
            name="prompt"
            value={input}
            onChange={(e) => {
              handleInputChange(e);
              // Auto-resize already handled by useEffect
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && input.trim()) {
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }
            }}
            placeholder="Tell me your business type and grant needs, e.g., I'm a startup seeking grants for HRMS equipment."
            className="flex-1 min-h-[40px] max-h-[150px] resize-none py-2"
            disabled={isLoading}
            autoComplete="off"
            rows={1}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </form>
        <div className="text-xs text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
          Disclaimer: AI-generated results may contain inaccuracies. Please review and use at your discretion. Last Updated 5 Mar 2025.
        </div>
      </div>
    </div>
  );
}
