# concierge-js

An open-source JavaScript library for easily adding AI chat assistants to your website.

## Features

- 🎯 Simple integration
- 🎨 Customizable UI
- 🤖 OpenAI integration out of the box
- 📚 Support for loading external knowledge sources
- 🔄 Custom backend support
- 🏷️ Source categorization

## Quick Start

1. Include the script in your HTML:

```html
<script src="https://dev.helloworld.ng/concierge.js"></script>
```

2. Add a trigger element:

```html
<button id="chat-trigger">Chat with AI</button>
```

3. Initialize Concierge:

```javascript
const chat = concierge.init({
  triggerSelector: '#chat-trigger',
  name: 'AI Assistant'
});
```

## Configuration Options

```javascript
concierge.init({
  // Required
  triggerSelector: '#chat-trigger',  // CSS selector for trigger element
  
  // Optional
  name: 'AI Assistant',              // Name of your chat assistant
  avatar: '<svg>...</svg>',          // SVG string or image URL
  isFullScreen: true,               // Whether to show in full screen
  color: {
    chatBg: '#011B33',              // Chat background color
    userBg: '#2563eb',              // User message background
    text: '#f3f4f6',                // Text color
    inputBg: '#1f2937',             // Input field background
    buttonBg: '#2563eb',            // Submit button background
  },
  sources: [                         // External knowledge sources with categories
    {
      type: 'web',
      url: 'https://your-docs.com',
      category: ['documentation' ]     // Optional category for this source
    },
    {
      type: 'json',
      url: 'https://your-docs.com/data.json',
      category: ['api-reference'  ]    // Optional category for this source
    }
  ],
  systemPrompt: 'Custom prompt...',  // System prompt for the AI
  model: 'gpt-4',                    // AI model to use
  server: {                          // Optional server configuration
    baseUrl: 'https://your-api.com', // Your API base URL
    apiKey: 'your-api-key'          // Your API key
  }
});
```

## Loading External Sources with Categories

Concierge supports categorizing knowledge sources to help the AI provide more accurate and specific responses. Each source can have its own category:

### Web Pages

```javascript
concierge.init({
  sources: [
    {
      type: 'web',
      url: 'https://your-website.com',
      category: ['company-info']       // Categorize this source
    },
    {
      type: 'web',
      url: 'https://your-website.com',
      category: ['technical-docs']     // Different category for API docs
    }
  ]
});
```

### JSON Data

```javascript
concierge.init({
  sources: [
    {
      type: 'json',
      url: '/api/products.json',
      category: ['product-catalog']
    },
    {
      type: 'json',
      url: '/api/pricing.json',
      category: ['pricing-info']
    }
  ]
});
```

## Custom Backend Configuration

Concierge can be configured to work with your own backend server instead of using the default implementation. This gives you full control over how the chat messages are processed and responded to.

### Server Configuration

```javascript
concierge.init({
  server: {
    baseUrl: 'https://your-api.com',  // Your API endpoint
    apiKey: 'your-secret-key'         // Your authentication key
  }
});
```

### API Endpoint Requirements

Your backend API should implement a completion endpoint that accepts POST requests at `${baseUrl}/completion` with the following structure:

Request headers:
```
Content-Type: application/json
X-Authorization-Token: your-api-key
```

Request body:
```json
{
  "assistantName": "AI Assistant",
  "sources": [...],           // Array of configured sources
  "systemPrompt": "...",      // System prompt if configured
  "userMessage": "..."        // The user's message
  "categories": [...],         // Array of categories to use for this request
}
```

Expected response:
```json
{
  "text": "AI response text"  // The AI's response
}
```

Error response:
```json
{
  "error": {
    "message": "Error description"
  }
}
```

## Styling

The chat interface can be fully customized using the color configuration:

```javascript
concierge.init({
  color: {
    chatBg: '#011B33',        // Chat background
    userBg: '#2563eb',        // User message background
    text: '#f3f4f6',          // Text color
    inputBg: '#1f2937',       // Input field background
    buttonBg: '#2563eb',      // Submit button background
  }
});
```
