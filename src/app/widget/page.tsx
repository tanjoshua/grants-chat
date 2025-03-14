import { ChatWidgetContainer } from '@/components/widget/chat-widget-container'
import Link from 'next/link'

export default async function WidgetPage({ searchParams }: { searchParams: Promise<{ embed?: string, noheader?: string, height?: string }> }) {
  // Get search parameters
  const params = await searchParams;
  const isEmbed = params.embed === 'true';
  const hideHeader = params.noheader === 'true';
  const height = params.height || '500px';
  
  if (isEmbed) {
    // Just render the chat widget without any containers for embedding
    // The ChatWidgetContainer component will detect it's in an iframe
    // The button exists in the parent window via the embed script
    return <ChatWidgetContainer hideHeader={hideHeader} height={height} />
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
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Embedding Options</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Option 1: Floating Button</h3>
            <p className="mb-4 text-muted-foreground">
              Add a floating chat button in the corner of your website (default option):
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
              {`<script src="${process.env.VERCEL_URL || ''}/api/embed-script"></script>`}
            </pre>
            <p className="mt-2 text-muted-foreground">See the button in the bottom right of this page for an example.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Option 2: Link or Button</h3>
            <p className="mb-4 text-muted-foreground">
              Add a clickable link or button that opens the chat in a dialog:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
              {`<script src="${process.env.VERCEL_URL || ''}/api/embed-script?mode=link&text=Chat with us"></script>`}
            </pre>
            <p className="mt-2 text-muted-foreground">
              Then place a <code className="text-xs">data-ai-chat-link</code> element where you want the link to appear:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm mt-2">
              {`<span data-ai-chat-link></span>`}
            </pre>
            <p className="mt-2 text-muted-foreground">
              <Link href="/chat-widget-demo.html" className="text-primary hover:underline" target="_blank">
                View the comprehensive demo page
              </Link>
            </p>
          </div>
        </div>
      </div>
      <ChatWidgetContainer />
    </div>
  )
}
