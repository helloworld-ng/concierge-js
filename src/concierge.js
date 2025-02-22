class Concierge {
  constructor(config) {
    // Default configuration
    this.config = {
      name: 'AI Assistant',
      avatar: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="white"/>
      </svg>`,
      isFullScreen: true,
      color: {
        chatBg: '#011B33',
        userBg: '#2563eb',
        text: '#f3f4f6',
        inputBg: '#1f2937',
        buttonBg: '#2563eb',
      },
      server: {
        baseUrl: "https://concierge.opemipo.com",
        apiKey: "qwerty123221qwerty234567890",
      },
      categories: [],
      sources: [],
      systemPrompt: null,
      model: 'gpt-4o',
      ...config
    };
    
    this.chatInterface = null;
    this.messages = [];
    this.isLoading = false;
    this.input = '';
  }
  
  createStyles() {
    const style = document.createElement('style');
    const { color, isFullScreen } = this.config;
    
    style.textContent = `
      .concierge-container svg {
        display: block;
        vertical-align: middle;
        width: 20px;
        height: 20px;
      }

      .concierge-agent-icon svg {
        width: 28px;
        height: 28px;
      }

      /* Overlay should be at the top level */
      .concierge-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity 0.5s ease;
        pointer-events: none;
        z-index: 9998;
      }

      .concierge-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }

      .concierge-container {
        position: fixed;
        inset: ${isFullScreen ? '0' : 'auto 0 0 0'};
        display: flex;
        flex-direction: column;
        color: ${color.text};
        transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
        background: ${color.chatBg};
        transform: translateY(100%);
        height: ${isFullScreen ? '100vh' : '95vh'};
        max-height: ${isFullScreen ? '100vh' : 'calc(100vh - 24px)'};
        border-top-left-radius: ${isFullScreen ? '0' : '1rem'};
        border-top-right-radius: ${isFullScreen ? '0' : '1rem'};
        box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1);
        z-index: 9999;
        box-sizing: border-box;
      }

      .concierge-container *,
      .concierge-container *::before,
      .concierge-container *::after {
        box-sizing: border-box !important;
      }

      .concierge-container.open {
        transform: translateY(0);
      }

      .concierge-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to bottom, ${color.chatBg} 20%, ${color.chatBg} 80%, transparent 100%);
        padding-bottom: 1.5rem;
        padding-top: 1rem;
      }

      .concierge-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
      }

      .concierge-close-btn {
        border: none;
        color: #f3f4f6;
        cursor: pointer;
        background: none;
        padding: 0.5rem;
      }

      .concierge-close-btn:hover {
        color: #d1d5db;
      }

      .concierge-chat-container {
        flex: 1;
        overflow-y: auto;
        scroll-behavior: smooth;
        scrollbar-width: thin;
        scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        margin-top: 4rem;
      }

      .concierge-chat-container::-webkit-scrollbar {
        width: 6px;
      }

      .concierge-chat-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .concierge-chat-container::-webkit-scrollbar-thumb {
        background-color: rgba(155, 155, 155, 0.5);
        border-radius: 20px;
        border: transparent;
      }

      .chat-messages {
        padding: 1rem 1rem;
        margin-bottom: 10rem;
      }

      .chat-messages > * + * {
        margin-top: 1rem;
      }

      .concierge-agent {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .concierge-agent-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .concierge-agent-icon.active {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      .concierge-user {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .concierge-user-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: #374151;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .concierge-message {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin: 1rem 0;
      }

      .concierge-message-content {
        padding: 0.5rem;
        border-radius: 1rem;
        max-width: 100%;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
      }

      .concierge-message-content::-webkit-scrollbar {
        height: 4px;
      }

      .concierge-message-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .concierge-message-content::-webkit-scrollbar-thumb {
        background-color: rgba(155, 155, 155, 0.5);
        border-radius: 20px;
        border: transparent;
      }

      .concierge-human-message {
        flex-direction: row-reverse;
        justify-content: flex-start;
      }

      .concierge-human-message .concierge-message-content {
        background-color: ${color.userBg};
        border-radius: 1rem;
        padding: 0.5rem 1rem;
        max-width: 80%;
        overflow-x: auto;
        color: white;
      }

      .concierge-footer {
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to bottom, ${color.chatBg} 20%, ${color.chatBg} 80%, transparent 100%);
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
      }

      .concierge-input-form {
        padding: 1rem;
        display: flex;
        gap: 0.5rem;
      }

      .concierge-input {
        flex: 1;
        height: 36px;
        font-size: 14px;
        line-height: 20px;
        padding: 6px 12px;
        border-radius: 1rem;
        background: ${color.inputBg};
        border: none;
        outline: none;
        color: ${color.text};
      }

      .concierge-input::placeholder {
        color: #9ca3af;
      }

      .concierge-submit-btn {
        padding: 0.5rem 1rem;
        height: 36px;
        font-size: 14px;
        line-height: 20px;
        border-radius: 1rem;
        background: ${color.buttonBg};
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
      }
        
      .concierge-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        cursor: not-allowed;
      }

      .concierge-loading-container {
          padding: 1rem; /* px-4 */
      }

      .concierge-loading-flex {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
      }

      .concierge-loading-text {
          color: #f3f4f6;
      }

      .concierge-dot-typing {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 24px; /* Adjust width to space out the dots */
      }

      .concierge-dot-typing div {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ffffff; /* Change this to a visible color */
          animation: concierge-dot-blink 1.5s infinite ease-in-out both;
      }

      .concierge-dot-typing div:nth-child(1) {
          animation-delay: 0s;
      }

      .concierge-dot-typing div:nth-child(2) {
          animation-delay: 0.3s;
      }

      .concierge-dot-typing div:nth-child(3) {
          animation-delay: 0.6s;
      }

      @keyframes concierge-dot-blink {
          0%, 80%, 100% {
              transform: scale(0);
          }
          40% {
              transform: scale(1);
          }
      }
    `;
    document.head.appendChild(style);
  }

  createChatInterface() {
    if (this.chatInterface) return;

    this.createStyles();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'concierge-overlay';
    // Add click handler to close when clicking overlay
    overlay.addEventListener('click', () => this.hideChat());
    document.body.appendChild(overlay);

    // Process avatar content
    let avatarContent = this.config.avatar.trim();
    if (!avatarContent.startsWith('<svg')) {
      avatarContent = `<img src="${avatarContent}" alt="Avatar" style="width: 20px; height: 20px;">`;
    }

    this.chatInterface = document.createElement("div");
    this.chatInterface.className = "concierge-container";
    this.chatInterface.style.display = "none";

    this.chatInterface.innerHTML = `
      <div class="concierge-header">
        <div class="concierge-header-content">
          <div class="concierge-agent">
            <div class="concierge-agent-icon">
              ${avatarContent}
            </div>
          </div>
          <button class="concierge-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="concierge-chat-container" id="chat-container">
        <div id="chat-messages" class="chat-messages"></div>
      </div>

      <div class="concierge-footer">
        <form class="concierge-input-form" id="chat-form">
          <input 
            type="text" 
            class="concierge-input" 
            placeholder="Type your message..."
            id="chat-input"
          >
          <button 
            type="submit" 
            class="concierge-submit-btn"
            id="chat-submit"
            disabled
          >
            Send
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(this.chatInterface);

    // Add event listeners
    this.chatInterface.querySelector('.concierge-close-btn').addEventListener('click', () => this.hideChat());
    this.chatInterface.querySelector('#chat-form').addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Add input event listener to enable/disable submit button
    const input = this.chatInterface.querySelector('#chat-input');
    const submitBtn = this.chatInterface.querySelector('#chat-submit');
    input.addEventListener('input', (e) => {
      submitBtn.disabled = !e.target.value.trim();
    });

    // Initialize with system message
    this.addMessage({
      type: 'ai',
      content: `Hi! How can I help you today?`
    });
  }

  addMessage(message) {
    const messagesContainer = this.chatInterface.querySelector('#chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `concierge-message concierge-${message.type}-message`;

    const contentHtml = `
      <div class="concierge-message-content">
        ${message.content}
      </div>
    `;

    messageElement.innerHTML =  contentHtml;
    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const input = this.chatInterface.querySelector('#chat-input');
    const submitBtn = this.chatInterface.querySelector('#chat-submit');
    
    if (!input.value.trim() || this.isLoading) return;

    const userMessage = input.value;
    
    this.addMessage({
      type: 'human',
      content: userMessage
    });

    this.isLoading = true;
    submitBtn.disabled = true;
    this.showLoadingIndicator();
    this.setAgentActive(true);

    try {
      if (this.config.server.baseUrl) {
        const response = await fetch(`${this.config.server.baseUrl}/completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Token': `${this.config.server.apiKey}`
          },
          body: JSON.stringify({
            assistantName: this.config.name,
            categories: this.config.categories,
            sources: this.config.sources,
            systemPrompt: this.config.systemPrompt,
            userMessage: userMessage,
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        this.addMessage({
          type: 'ai',
          content: data.text
        });
      } 
      else {
        // Demo mode - echo back after delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.addMessage({
          type: 'ai',
          content: `You said: ${userMessage}`
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage({
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request.'
      });
    } finally {
      this.isLoading = false;
      this.hideLoadingIndicator();
      this.setAgentActive(false);
      input.value = '';
      submitBtn.disabled = true;
    }
  }

  showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'loading-bubble';
    loader.className = 'concierge-loading-container';
    loader.innerHTML = `
      <div class="concierge-loading-flex">
        <div class="concierge-loading-text">
          <div class="concierge-dot-typing">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    `;
    this.chatInterface.querySelector('#chat-messages').appendChild(loader);
    this.scrollToBottom();
  }

  hideLoadingIndicator() {
    const loader = this.chatInterface.querySelector('#loading-bubble');
    if (loader) loader.remove();
  }

  scrollToBottom() {
    const chatContainer = this.chatInterface.querySelector('#chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  load() {
    // If interface doesn't exist, create everything
    if (!this.chatInterface) {
      this.createChatInterface();
    }
    
    let overlay = document.querySelector('.concierge-overlay');
    this.chatInterface.style.display = "flex";
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      this.chatInterface.classList.add('open');
    });
  }

  hideChat() {
    if (this.chatInterface) {
      const overlay = document.querySelector('.concierge-overlay');
      overlay.classList.remove('open');
      this.chatInterface.classList.remove('open');
      
      // Wait for animation to complete before hiding
      setTimeout(() => {
          this.chatInterface.style.display = "none";
      }, 500);
    }
  }

  setAgentActive(active) {
    const agentIcon = this.chatInterface.querySelector('.concierge-agent-icon');
    if (active) {
      agentIcon.classList.add('active');
    } else {
      agentIcon.classList.remove('active');
    }
  }
}

const concierge = {
  init: (config) => new Concierge(config)
};