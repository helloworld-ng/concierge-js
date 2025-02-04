# concierge-js

An open-source JavaScript library for easily adding AI chat assistants to your website.

## Features

- 🎯 Simple integration
- 🎨 Customizable UI
- 🤖 OpenAI integration out of the box
- 📚 Support for loading external knowledge sources

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
  name: 'AI Assistant',
  keys: {
    openai: 'your-openai-key'
  }
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
  strict: true,                      // Enforce strict responses based on provided data
  isFullScreen: true,               // Whether to show in full screen
  color: {
    chatBg: '#011B33',              // Chat background color
    userBg: '#2563eb',              // User message background
    text: '#f3f4f6',                // Text color
    inputBg: '#1f2937',             // Input field background
    buttonBg: '#2563eb',            // Submit button background
  },
  sources: [                         // External knowledge sources
    {
      type: 'web',
      url: 'https://your-docs.com',
      pages: ['/about', '/docs', '/api'] // Optional pages to load
    },
    {
      type: 'json',
      url: 'https://your-docs.com/data.json'
    }
  ],
  systemPrompt: 'Custom prompt...',  // System prompt for the AI
  model: 'gpt-4',                    // AI model to use
  keys: {
    openai: 'your-openai-key'       // Your OpenAI API key
  }
});
```

## Loading External Sources

Concierge can load external knowledge sources to provide context-aware responses. It supports two types of sources:

### Web Pages

```javascript
concierge.init({
  sources: [
    {
      type: 'web',
      url: 'https://your-website.com',
      pages: ['/about', '/docs', '/contact'] // Optional pages to load
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
      url: '/api/data.json'
    }
  ]
});
```

## Strict Mode

Enable strict mode to ensure the AI only responds with information from the provided sources:

```javascript
concierge.init({
  strict: true,  // Default is true
  sources: [...]
});
```

In strict mode:

- The AI will only use information from the provided sources
- If asked about something not in the sources, it will politely decline to answer
- Prevents the AI from making assumptions or guessing

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
