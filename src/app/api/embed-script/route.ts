export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Get the origin from the request to ensure correct iframe URL
  const url = new URL(req.url);
  const origin = url.origin;

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
})();
  `;

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}
