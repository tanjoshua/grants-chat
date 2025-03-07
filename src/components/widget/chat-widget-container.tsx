'use client'

import { useState, useEffect } from 'react'
import { ChatWidget } from './chat-widget'

export function ChatWidgetContainer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isIframe, setIsIframe] = useState(false)

  // Check if we're in an iframe
  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top)
    } catch {
      // If we can't access window.top due to cross-origin issues, we're in an iframe
      setIsIframe(true)
    }
  }, [])

  // When in an iframe, we need to communicate with the parent window
  // For non-iframe usage, we'll just use the local state
  const handleClose = () => {
    if (isIframe) {
      // Send a message to the parent window to hide the iframe
      try {
        window.parent.postMessage({ type: 'CHAT_WIDGET_CLOSE' }, '*');
      } catch (error) {
        console.error('Failed to communicate with parent window:', error);
      }
    } else {
      setIsOpen(false);
    }
  }

  return (
    <div className="w-full overflow-hidden h-[500px]">
      <ChatWidget isOpen={isOpen || isIframe} onClose={handleClose} />
    </div>
  )
}
