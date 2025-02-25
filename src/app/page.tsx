"use client"

import { useChat } from '@ai-sdk/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from 'react';
import { Loader2 } from "lucide-react";

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, isLoading} = useChat({
    api: "/api/chat",
  });

  // const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added or updated
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check if AI is currently responding (has a message but it's empty)
  const isThinking = isLoading && (!messages.length || messages[messages.length - 1].role === 'user');

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold">AI Chat</h1>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 max-w-3xl mx-auto p-4">
            {messages.map((message, index) => {
              if (message.content) {
                console.log('returning message content', message.content)

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
                    {message.content}
                  </div>
                </div>
              </div>
              }

              return <div key={message.id}>
                {message.parts?.map((part, index) => {
                  switch (part.type) {
                    case 'text': 
                    return <p key={index}>{part.text}</p>
                    case 'tool-invocation': 
                    const toolCall = part.toolInvocation;
                    switch (toolCall.toolName) {
                      case 'getInformation': {
                        return (
                          <div className="flex justify-start" key={index}>
                            <div className="rounded-lg px-4 py-3 max-w-[85%] shadow-sm bg-muted mr-12 flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Searching documents...</span>
                            </div>
                          </div>
                        );
                      }
                      
                    }
                  }
                })}
              </div>
            }
            )}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3 max-w-[85%] shadow-sm bg-muted mr-12 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="px-4 py-4">
          <form 
            onSubmit={handleSubmit} 
            className="flex gap-2 max-w-3xl mx-auto">
            <Input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </form>
        </div>
    </div>
  );
}