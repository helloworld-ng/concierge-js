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
  tone: 'friendly',                  // Conversation tone
  color: {
    chatBg: '#011B33',              // Chat background color
    userBg: '#2563eb',              // User message background
    text: '#f3f4f6'                 // Text color
  },
  sources: [                         // External knowledge sources
    {
      type: 'web', // or 'json'
      source: 'https://your-docs.com',
      dataPrompt: 'Use this documentation to answer questions'
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

Concierge can load external knowledge sources to provide context-aware responses:

```javascript
concierge.init({
  sources: [
    // Load web pages
    {
      type: 'web',
      source: 'https://your-website.com/docs',
      dataPrompt: 'Use this documentation to answer questions'
    },
    // Load JSON data
    {
      type: 'json',
      source: '/api/data.json',
      dataPrompt: 'Use this product data to answer questions'
    }
  ]
});
```

## Styling

The chat interface can be fully customized using the color configuration:

```javascript
concierge.init({
  color: {
    chatBg: '#011B33',    // Chat background
    userBg: '#2563eb',    // User message background
    text: '#f3f4f6'       // Text color
  }
});
```
