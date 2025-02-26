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

2. Initialize Concierge:

```javascript
const concierge = await Concierge.validateServer('https://your-server.com')
  .then(builder => builder.new({
    name: 'AI Assistant'
  }));

// Call load() to show the chat interface
concierge.load();
```

## Configuration Options

```javascript
const concierge = await Concierge.validateServer('https://your-server.com')
  .then(builder => builder.new({
    // Optional configuration
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
    categories: ['documentation', 'api'],  // Categories to filter knowledge by
    sources: [                            // Array of knowledge sources
      {
        type: 'web',                      // Type can be 'web' or 'json'
        url: 'https://your-docs.com/docs',
        categories: ['documentation']      // Optional categories for this source
      },
      {
        type: 'json',
        url: 'https://your-docs.com/api.json',
        categories: ['api']
      }
    ],
    systemPrompt: 'Custom prompt...',     // System prompt for the AI                      // AI
  }));
```

## Loading External Sources with Categories

Concierge supports categorizing knowledge sources to help the AI provide more accurate and specific responses. Each source can have its own type and categories:

```javascript
const concierge = await Concierge.validateServer('https://your-server.com')
  .then(builder => builder.new({
    name: 'AI Assistant',
    // Global categories (optional)
    categories: [
      'company-info',
      'technical-docs',
      'api-reference'
    ],
    // Knowledge sources with their own categories
    sources: [
      {
        type: 'web',
        url: 'https://your-website.com/about',
        categories: ['company-info']
      },
      {
        type: 'web',
        url: 'https://your-website.com/docs',
        categories: ['technical-docs']
      },
      {
        type: 'json',
        url: 'https://your-website.com/api.json',
        categories: ['api-reference']
      }
    ]
  }));
```

## Custom Backend Configuration

Concierge requires a backend server to process chat messages. The server URL is specified during initialization:

```javascript
const concierge = await Concierge.validateServer('https://your-server.com')
  .then(builder => builder.new({
    name: 'AI Assistant',
    systemPrompt: 'Custom system prompt...',
    // Optional configuration
    sources: [
      {
        type: 'web',
        url: 'https://your-docs.com/docs',
        categories: ['documentation']
      }
    ]
  }));
```

### API Endpoint Requirements

Your backend server must implement the following endpoint:

- `GET /isConcierge` - Used during initialization to validate the server
- `POST /completion` - Processes chat messages

The completion endpoint accepts POST requests with the following structure:

Request body:

```json
{
  "assistantName": "AI Assistant",
  "sources": [                // Array of source objects
    {
      "type": "web",         // 'web' or 'json'
      "url": "...",
      "categories": [...]    // Optional categories for this source
    }
  ],
  "systemPrompt": "...",     // System prompt if configured
  "userMessage": "...",      // The user's message
  "categories": [...]        // Global categories to use for this request
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
  const concierge = await Concierge.validateServer('https://your-server.com')
  .then(builder => builder.new({
    color: {
      chatBg: '#011B33',        // Chat background
      userBg: '#2563eb',        // User message background
      text: '#f3f4f6',          // Text color
      inputBg: '#1f2937',       // Input field background
      buttonBg: '#2563eb',      // Submit button background
    }
  }));
```

## Customization

You can customize the chat interface by extending the Concierge class and overriding the necessary methods.
