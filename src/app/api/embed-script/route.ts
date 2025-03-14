export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Get the origin from the request to ensure correct iframe URL
  const url = new URL(req.url);
  const origin = url.origin;
  
  // Check if we should use the link version or button version
  const mode = url.searchParams.get('mode') || 'button';

  // Button mode script - the original implementation
  if (mode === 'button') {
    const script = `
(function() {
  // Check if the widget already exists to prevent duplicates
  if (document.getElementById('ai-chat-widget')) {
    console.log('Chat widget already exists, skipping initialization');
    return;
  }

  // Styles for the widget
  const styleTag = document.createElement('style');
  styleTag.innerHTML = \`
    #ai-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
    }
    #ai-chat-widget-button {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background-color: #000000;
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    #ai-chat-widget-button:hover {
      transform: scale(1.05);
    }
    #ai-chat-widget-button:focus {
      outline: none;
    }
    #ai-chat-widget-frame {
      display: none;
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 500px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    /* Make sure content fills the iframe completely */
    #ai-chat-widget-frame html,
    #ai-chat-widget-frame body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  \`;
  document.head.appendChild(styleTag);

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'ai-chat-widget';
  document.body.appendChild(widgetContainer);

  // Create the button
  const button = document.createElement('button');
  button.id = 'ai-chat-widget-button';
  button.innerHTML = \`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  \`;
  widgetContainer.appendChild(button);

  // Create the iframe with a special parameter to indicate it's embedded
  const iframe = document.createElement('iframe');
  iframe.id = 'ai-chat-widget-frame';
  iframe.src = '${origin}/widget?embed=true';
  widgetContainer.appendChild(iframe);

  // Toggle chat visibility
  button.addEventListener('click', function() {
    const frameVisible = iframe.style.display === 'block';
    iframe.style.display = frameVisible ? 'none' : 'block';
  });

  // Listen for close messages from the iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CHAT_WIDGET_CLOSE') {
      iframe.style.display = 'none';
    }
  });
})();
    `;

    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
  
  // Link mode script - inject a dialog-based implementation
  if (mode === 'link') {
    const linkText = url.searchParams.get('text') || 'Chat with AI';
    const linkClass = url.searchParams.get('class') || '';
    
    const script = `
(function() {
  // Check if the widget already exists to prevent duplicates
  if (document.getElementById('ai-chat-link-widget')) {
    console.log('Chat link widget already exists, skipping initialization');
    return;
  }

  // Insert dialog styles
  const styleTag = document.createElement('style');
  styleTag.innerHTML = \`
    .ai-chat-dialog-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 99999;
      animation: fadeIn 0.2s ease;
      display: none;
    }
    
    .ai-chat-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      height: 600px;
      background: white;
      border-radius: 12px;
      z-index: 100000;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      position: relative;
    }
    
    .ai-chat-dialog-close:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    .ai-chat-dialog-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .ai-chat-dialog-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .ai-chat-link {
      color: #0066cc;
      text-decoration: none;
      cursor: pointer;
    }
    
    .ai-chat-link:hover {
      text-decoration: underline;
    }
    
    @media (prefers-color-scheme: dark) {
      .ai-chat-dialog {
        background-color: #1a1a1a;
      }
      
      .ai-chat-dialog-close {
        background-color: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }
      
      .ai-chat-dialog-close:hover {
        background-color: rgba(255, 255, 255, 0.4);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  \`;
  document.head.appendChild(styleTag);

  // Find all elements with the data-ai-chat-link attribute
  const placeholderElements = document.querySelectorAll('[data-ai-chat-link]');
  
  if (placeholderElements.length > 0) {
    // Transform each placeholder into a trigger
    placeholderElements.forEach(placeholder => {
      // If the placeholder already has content, keep it; otherwise use the default text
      const displayText = placeholder.textContent?.trim() || '${linkText}';
      
      // Preserve existing classes and add ours
      const existingClasses = placeholder.className || '';
      
      // Create a proper link
      const link = document.createElement('a');
      link.href = '#';
      link.className = \`ai-chat-link \${existingClasses} ${linkClass}\`;
      link.textContent = displayText;
      link.dataset.aiChatLinkTrigger = 'true';
      
      // Replace the placeholder with our enhanced link
      const parent = placeholder.parentNode;
      if (parent) {
        parent.replaceChild(link, placeholder);
      }
    });
  } else {
    // If no placeholders found, just append to body
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'ai-chat-link ${linkClass}';
    link.textContent = '${linkText}';
    link.dataset.aiChatLinkTrigger = 'true';
    document.body.appendChild(link);
  }
  
  // Create the dialog elements
  const overlay = document.createElement('div');
  overlay.className = 'ai-chat-dialog-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'ai-chat-dialog';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'ai-chat-dialog-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close dialog');
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.zIndex = '10';
  closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  closeButton.style.color = '#ffffff';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '50%';
  closeButton.style.width = '32px';
  closeButton.style.height = '32px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.fontSize = '20px';
  closeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  
  const content = document.createElement('div');
  content.className = 'ai-chat-dialog-content';
  content.style.height = '100%';
  
  const iframe = document.createElement('iframe');
  iframe.className = 'ai-chat-dialog-iframe';
  iframe.src = '${origin}/widget?embed=true&noheader=true&height=600px';
  
  // Assemble the dialog
  content.appendChild(iframe);
  dialog.appendChild(closeButton);
  dialog.appendChild(content);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Add click event to links
  document.addEventListener('click', function(event) {
    // Find if the clicked element or any of its parents have our trigger attribute
    let target = event.target;
    let isOurLink = false;
    
    // Check if the click target or any of its parents has our data attribute
    while (target && target !== document) {
      if (target.dataset && target.dataset.aiChatLinkTrigger === 'true') {
        isOurLink = true;
        break;
      }
      target = target.parentNode;
    }
    
    if (isOurLink) {
      event.preventDefault();
      overlay.style.display = 'block';
    }
  });
  
  // Close dialog when clicking close button
  closeButton.addEventListener('click', function() {
    overlay.style.display = 'none';
    // Send message to iframe to reset chat if needed
    try {
      iframe.contentWindow.postMessage({ type: 'CHAT_WIDGET_CLOSE' }, '*');
    } catch (error) {
      console.error('Failed to communicate with chat iframe:', error);
    }
  });
  
  // Close dialog when clicking outside
  overlay.addEventListener('click', function(event) {
    if (event.target === overlay) {
      overlay.style.display = 'none';
      try {
        iframe.contentWindow.postMessage({ type: 'CHAT_WIDGET_CLOSE' }, '*');
      } catch (error) {
        console.error('Failed to communicate with chat iframe:', error);
      }
    }
  });
  
  // Listen for escape key to close dialog
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && overlay.style.display === 'block') {
      overlay.style.display = 'none';
      try {
        iframe.contentWindow.postMessage({ type: 'CHAT_WIDGET_CLOSE' }, '*');
      } catch (error) {
        console.error('Failed to communicate with chat iframe:', error);
      }
    }
  });
})();
    `;
    
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
  
  // If invalid mode, return an error
  return new Response(JSON.stringify({ error: 'Invalid mode parameter. Use "button" or "link".' }), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
