'use client'

import { useChat } from '@ai-sdk/react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn, copyToClipboard } from "@/lib/utils";
import { useEffect, useRef, useState } from 'react';
import { Loader2, X, Send, MessageSquare, Copy, Check } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { widgetComponents, reactMarkdownRemarkDirective } from '../markdown';
import directive from "remark-directive";

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Using shared utility functions from utils.ts

  // Scroll to bottom when new messages are added or updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto first to get accurate scrollHeight measurement
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [input]);

  // Check if AI is currently responding
  const isThinking = isLoading && (!messages.length || messages[messages.length - 1].role === 'user');

  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-full w-full flex flex-col" >
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-950 dark:border-gray-800 shrink-0">
        <p className="text-sm font-medium">askHugh.ai</p>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </header>
      
      {/* Chat container - Takes all available space between header and footer */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <div className="flex flex-col h-full">
          <div className="p-3 space-y-3 flex-1">
            {messages.length === 0 ? (
              <div className="bg-muted rounded-lg p-4 text-xs">
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
            ) : (
              messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isMessageStreaming = isLoading && isLastMessage;
                
                // Get all text content for copy functionality
                const textContent = message.parts
                  .filter(part => part.type === 'text')
                  .map(part => (part.type === 'text' ? part.text : ''))
                  .join('');
                
                return (
                  <div
                    key={message.id}
                    ref={isLastMessage ? lastMessageRef : null}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[85%] shadow-sm relative group",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-8 rounded-tr-none'
                          : 'bg-muted/70 mr-8 rounded-tl-none'
                      )}
                    >
                      {message.role === 'assistant' && !isMessageStreaming && (
                        <button
                          onClick={() => copyToClipboard(textContent, message.id, setCopiedMessageId)}
                          className="absolute right-1 top-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-muted/80 hover:bg-muted/90"
                          aria-label="Copy message"
                          title={copiedMessageId === message.id ? "Copied!" : "Copy to clipboard"}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <div className="text-xs">
                        {/* Message rendering based on role */}
                        {message.role === 'user' ? (
                          <div>{textContent}</div>
                        ) : (
                          <>
                            {message.parts.map((part, partIndex) => {
                              if (part.type === 'text') {
                                return (
                                  <ReactMarkdown
                                    key={`${message.id}-part-${partIndex}`}
                                    remarkPlugins={[directive, reactMarkdownRemarkDirective]}
                                    components={widgetComponents}
                                  >
                                    {part.text}
                                  </ReactMarkdown>
                                );
                              } else if (part.type === 'tool-invocation') {
                                const toolCall = part.toolInvocation;
                                
                                // Only show tool call UI when it's in progress
                                if (toolCall.state === 'call' || toolCall.state === 'partial-call') {
                                  if (toolCall.toolName === 'getInformation') {
                                    const args = toolCall.args as { question: string };
                                    return (
                                      <div 
                                        key={`${message.id}-tool-${partIndex}`}
                                        className="bg-muted/60 rounded p-2 my-1 border border-muted"
                                      >
                                        <div className="flex items-center gap-1 mb-1">
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          <span className="text-xs font-medium">Searching knowledge base</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground pl-4">
                                          Looking for information about: {args?.question}
                                        </p>
                                      </div>
                                    );
                                  }
                                }
                                // Don't render completed tool calls
                                return null;
                              }
                              
                              return null;
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 max-w-[85%] shadow-sm bg-muted/70 mr-8 rounded-tl-none flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            {/* This invisible div helps with scrolling to the bottom */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form - Always at the bottom */}
      <footer className="border-t bg-gray-50 dark:bg-gray-950 dark:border-gray-800 p-2 shrink-0">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-1 items-end">
            <Textarea
              ref={textareaRef}
              name="prompt"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && input.trim()) {
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }
              }}
              placeholder="Type your message..."
              className="min-h-[32px] max-h-[80px] resize-none py-1.5 text-xs flex-1 bg-background focus-visible:ring-offset-0 focus-visible:ring-1"
              disabled={isLoading}
              autoComplete="off"
              rows={1}
            />
            <Button type="submit" disabled={isLoading} size="icon" className="h-8 w-8">
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}

export function ChatWidgetTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
      aria-label="Chat with AI"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}
