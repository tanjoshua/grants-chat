import { ChatWidgetContainer } from '@/components/widget/chat-widget-container'

export default async function WidgetPage({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  // Check if this is being loaded as an embed
  const isEmbed = (await searchParams).embed === 'true';
  
  if (isEmbed) {
    // Just render the chat widget without any containers for embedding
    // The ChatWidgetContainer component will detect it's in an iframe
    // The button exists in the parent window via the embed script
    return <ChatWidgetContainer />
  }
  
  // Otherwise render the full demo page with explanations
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Chat Widget Demo</h1>
        <p className="mb-6 text-muted-foreground">
          This page demonstrates the chat widget that can be embedded into any website. 
          Click the chat button in the bottom right corner to start a conversation.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">How to Embed</h2>
        <p className="mb-4 text-muted-foreground">
          Add the following script tag to your HTML to embed this chat widget on any website:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
          {`<script src="${process.env.VERCEL_URL || ''}/api/embed-script"></script>`}
        </pre>
      </div>
      <ChatWidgetContainer />
    </div>
  )
}
