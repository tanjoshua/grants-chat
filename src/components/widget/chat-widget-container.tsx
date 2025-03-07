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
    } catch (e) {
      // If we can't access window.top due to cross-origin issues, we're in an iframe
      setIsIframe(true)
    }
  }, [])

  // When in an iframe, always show the chat interface since the button is in the parent window
  // For non-iframe usage, we'll still need the open/close functionality
  const handleClose = () => {
    if (!isIframe) {
      setIsOpen(false)
    }
  }

  return (
    <div className="w-full overflow-hidden h-[500px]">
      <ChatWidget isOpen={isOpen || isIframe} onClose={handleClose} />
    </div>
  )
}
