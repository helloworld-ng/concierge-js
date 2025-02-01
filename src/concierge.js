class Concierge {
  constructor(config) {
    // Default configuration
    this.config = {
      name: 'AI Assistant',
      avatar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
      </svg>`,
      tone: 'friendly',
      color: {
        chatBg: '#011B33',
        userBg: '#2563eb',
        text: '#f3f4f6'
      },
      sources: [],
      systemPrompt: null,
      model: 'gpt-4o',
      keys: {
        openai: null,
        anthropic: null,
      },
      ...config
    };
    
    this.chatInterface = null;
    this.messages = [];
    this.isLoading = false;
    this.input = '';
    this.setupTrigger();
    this.sourceContents = [];
    this.loadSources(); // Load sources on initialization
  }

  setupTrigger() {
    const triggerElement = document.querySelector(this.config.triggerSelector);
    if (!triggerElement) {
      console.error("Trigger element not found");
      return;
    }

    triggerElement.addEventListener("click", () => this.showChat());
    this.createChatInterface();
  }

  // load HTML Source
  async readWebSource(source) { 
    const response = await fetch(source);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch the document from ${source}: ${response.statusText}`);
    }
    const htmlInput = await response.text();

    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");

    // Extract text content (without HTML tags)
    let content = doc.body?.textContent?.trim() || "";
    content = content.replace(/\n/g, ' ');
    return content;
  } 

  // load JSON Source
  async readJSONSource(source) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to load ${source}: ${response.statusText}`);
    }
    
    return await response.json();
  } 

  async loadSources() {
    if (!this.config.sources || this.config.sources.length === 0) return;
    for (const source of this.config.sources) {
      try {
        if (source.type === "json") {
          const fileContent = await this.readJSONSource(source.source)
          this.sourceContents = [...this.sourceContents, {
            dataPrompt: source.dataPrompt,
            content: fileContent,
          }];
        } else if (source.type === "web") {
          const content = await this.readWebSource(source.source)
          this.sourceContents = [...this.sourceContents, {
            dataPrompt: source.dataPrompt,
            content: content,
          }];
        }         
      } catch (error) {
        console.error(`Error loading source ${source}:`, error);
      }
    }
  }  

  createStyles() {
    const style = document.createElement('style');
    const { color } = this.config;
    
    style.textContent = `
      /* Overlay should be at the top level */
      .concierge-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity 0.5s ease;
        pointer-events: none;
        z-index: 9998; /* Just below the container */
      }

      .concierge-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }

      .concierge-container {
        position: fixed;
        inset: auto 0 0 0; /* Position from bottom */
        display: flex;
        flex-direction: column;
        color: ${color.text};
        transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
        background: ${color.chatBg};
        transform: translateY(100%);
        height: 95vh;
        max-height: calc(100vh - 24px);
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1);
        z-index: 9999;
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
        background: #1e40af;
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
        background: #1f2937;
        border: 1px solid #1f2937;
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
        background: #2563eb;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
      }

      .concierge-submit-btn:hover {
        background: #1d4ed8;
      }

      .concierge-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        cursor: not-allowed;
      }

      .loading-container {
          padding: 1rem; /* px-4 */
      }

      .loading-flex {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
      }

      .loading-text {
          color: #f3f4f6;
      }

      .dot-typing {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 24px; /* Adjust width to space out the dots */
      }

      .dot-typing div {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ffffff; /* Change this to a visible color */
          animation: dot-blink 1.5s infinite ease-in-out both;
      }

      .dot-typing div:nth-child(1) {
          animation-delay: 0s;
      }

      .dot-typing div:nth-child(2) {
          animation-delay: 0.3s;
      }

      .dot-typing div:nth-child(3) {
          animation-delay: 0.6s;
      }

      @keyframes dot-blink {
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
      // Prepare system message with context
      const context = JSON.stringify(this.sourceContents)
      let systemMessage = this.config.systemPrompt || `You are ${this.config.name}'s Assistant, speaking in a ${this.config.tone} tone. Try to answer questions about ${this.config.name} based on the information provided.`
      systemMessage = systemMessage + (this.sourceContents.length > 0 ? `
        Here is the information about ${this.config.name}: ${context}. 
        Use this information to answer questions about ${this.config.name} accurately. 
        If asked about something not in this data, politely state that you don't have that information.
      `: "");
      
      if (this.config.keys.openai) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.keys.openai}`
          },
          body: JSON.stringify({
            model: this.config.model || 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: systemMessage
              },
              {
                role: 'user',
                content: userMessage
              }
            ],
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        this.addMessage({
          type: 'ai',
          content: data.choices[0].message.content
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
      submitBtn.disabled = false;
      this.hideLoadingIndicator();
      this.setAgentActive(false);
      input.value = '';
    }
  }

  showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'loading-bubble';
    loader.className = 'loading-container';
    loader.innerHTML = `
      <div class="loading-flex">
        <div class="loading-text">
          <div class="dot-typing">
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

  showChat() {
    if (this.chatInterface) {
        const overlay = document.querySelector('.concierge-overlay');
        this.chatInterface.style.display = "flex";
        requestAnimationFrame(() => {
            overlay.classList.add('open');
            this.chatInterface.classList.add('open');
        });
    }
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

module.exports = concierge;