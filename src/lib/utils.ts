import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copies text to clipboard after stripping markdown
 * @param text - The text to copy
 * @param messageId - The ID of the message being copied
 * @param setCopiedMessageId - State setter function for tracking copied message
 * @returns Promise that resolves when copy is complete
 */
export function copyToClipboard(
  text: string, 
  messageId: string, 
  setCopiedMessageId: (id: string | null) => void
): Promise<void> {
  const plainText = stripMarkdown(text);
  return navigator.clipboard.writeText(plainText)
    .then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}

/**
 * Strips markdown and directive formatting from text
 * Handles colon-based formats, markdown syntax, and custom directives
 */
export function stripMarkdown(text: string): string {
  // Comprehensive handling of any colon-based format (3+ colons)
  let cleanedText = text;
  
  // Step 1: Handle all markdown block content with any number of colons (3 or more)
  // Extract content between colon blocks, regardless of what comes after the colons
  cleanedText = cleanedText.replace(/:{3,}[^\n]*\n([\s\S]*?)(?=:{3,}|$)/g, '$1');
  
  // Step 2: Remove any remaining triple+ colons at beginning of lines
  cleanedText = cleanedText.replace(/^:{3,}.*?(?=\n|$)/gm, '');
  
  // Step 3: Remove any inline triple+ colons
  cleanedText = cleanedText.replace(/:{3,}[^\n]*?/g, '');
  
  // Step 4: Remove any trailing triple+ colons, possibly with periods
  cleanedText = cleanedText.replace(/:{3,}\.?(?:\s*\n)?/g, '');
  
  // Step 5: Clean up specific known formats if any still remain
  cleanedText = cleanedText
    .replace(/AccordionTrigger|AccordionContent|Accordion(?:Item)?(?:\{.*?\})?/g, '')
    .replace(/value=[\w-]+/g, '');
  
  // Remove markdown directives (::name[content]{attrs} format)
  cleanedText = cleanedText.replace(/::(\w+)\[(.*?)\](\{.*?\})?/g, '$2');
  
  // Remove common markdown syntax
  return cleanedText
    .replace(/#+\s+(.*)/g, '$1') // headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/`{3}[\s\S]*?`{3}/g, '') // code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/!\[(.*?)\]\((.*?)\)/g, '') // images
    .replace(/- (.*)/g, '$1') // list items
    .replace(/\d+\. (.*)/g, '$1') // numbered list items
    .replace(/\n{2,}/g, '\n\n'); // excessive newlines
}
