/**
 * @jest-environment jsdom
 */

const concierge = require('../src/concierge');

describe('Concierge', () => {
  let instance;
  let mockFetch;

  beforeEach(() => {
    // Clear the DOM
    document.body.innerHTML = '';
    
    // Add trigger element
    const trigger = document.createElement('button');
    trigger.id = 'chat-trigger';
    document.body.appendChild(trigger);

    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Initialize concierge
    instance = concierge.init({
      triggerSelector: '#chat-trigger',
      name: 'Test Bot',
      keys: {
        openai: 'test-key'
      },
      sources: []
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default config values', () => {
      expect(instance.config.name).toBe('Test Bot');
      expect(instance.config.tone).toBe('friendly');
      expect(instance.messages).toEqual([]);
      expect(instance.isLoading).toBe(false);
    });

    test('should create chat interface elements', () => {
      expect(document.querySelector('.concierge-container')).toBeTruthy();
      expect(document.querySelector('.concierge-overlay')).toBeTruthy();
      expect(document.querySelector('.concierge-input')).toBeTruthy();
      expect(document.querySelector('.concierge-submit-btn')).toBeTruthy();
    });
  });

  describe('UI Interactions', () => {
    test('should show chat when trigger is clicked', () => {
      const trigger = document.querySelector('#chat-trigger');
      trigger.click();
      
      const container = document.querySelector('.concierge-container');
      expect(container.style.display).toBe('flex');
    });

    test('should hide chat when close button is clicked', () => {
      jest.useFakeTimers();
      // First show the chat
      const trigger = document.querySelector('#chat-trigger');
      trigger.click();

      const closeBtn = document.querySelector('.concierge-close-btn');
      closeBtn.click();

      // Wait for animation
      jest.advanceTimersByTime(500);
      
      const container = document.querySelector('.concierge-container');
      expect(container.style.display).toBe('none');
    });

    test('should add loading indicator when processing message', () => {
      instance.showLoadingIndicator();
      expect(document.querySelector('#loading-bubble')).toBeTruthy();
    });

    test('should remove loading indicator', () => {
      instance.showLoadingIndicator();
      instance.hideLoadingIndicator();
      expect(document.querySelector('#loading-bubble')).toBeFalsy();
    });
  });

  describe('Message Handling', () => {
    test('should add user message to chat', () => {
      instance.addMessage({
        type: 'human',
        content: 'Hello'
      });

      const messages = document.querySelectorAll('.concierge-human-message');
      expect(messages.length).toBe(1);
      expect(messages[0].textContent.trim()).toBe('Hello');
    });

    test('should add AI message to chat', () => {
      instance.addMessage({
        type: 'ai',
        content: 'Hi there!'
      });

      const messages = document.querySelectorAll('.concierge-ai-message');
      expect(messages.length).toBe(2); // Including initial greeting
      expect(messages[1].textContent.trim()).toBe('Hi there!');
    });

    test('should handle message submission', async () => {
      // Mock successful API response
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: { content: 'Test response' }
            }]
          })
        })
      );

      const form = document.querySelector('.concierge-input-form');
      const input = document.querySelector('.concierge-input');
      const submitBtn = document.querySelector('.concierge-submit-btn');

      // Simulate user input
      input.value = 'Test message';
      
      const submitEvent = new Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      // Submit the form
      form.dispatchEvent(submitEvent);

      // Wait for all pending promises
      await Promise.resolve();

      // Verify API call was made with correct parameters
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key'
          })
        })
      );
      
      // Wait for final state updates
      await Promise.resolve();
      
      // Verify final state
      expect(submitBtn.disabled).toBe(false);
      expect(instance.isLoading).toBe(false);
      expect(input.value).toBe('');
    }, 30000);
  });

  describe('Source Loading', () => {
    test('should load web sources', async () => {
      const webContent = 'Test web content';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(webContent)
      });

      const instance = concierge.init({
        triggerSelector: '#chat-trigger',
        sources: [{
          type: 'web',
          source: 'https://test.com',
          dataPrompt: 'Test prompt'
        }]
      });

      // Wait for loadSources to complete
      await Promise.resolve();
      await jest.runAllTimersAsync();

      expect(instance.sourceContents).toEqual([{
        dataPrompt: 'Test prompt',
        content: webContent.replace(/\n/g, ' ')
      }]);
    });

    test('should load JSON sources', async () => {
      const jsonContent = { test: 'data' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(jsonContent)
      });

      const instance = concierge.init({
        triggerSelector: '#chat-trigger',
        sources: [{
          type: 'json',
          source: 'https://test.com/data.json',
          dataPrompt: 'Test prompt'
        }]
      });

      // Wait for loadSources to complete
      await Promise.resolve();
      await jest.runAllTimersAsync();
      
      expect(instance.sourceContents).toEqual([{
        dataPrompt: 'Test prompt',
        content: jsonContent
      }]);
    });

    test('should handle source loading errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });
      
      const instance = concierge.init({
        triggerSelector: '#chat-trigger',
        sources: [{
          type: 'web',
          source: 'https://test.com',
          dataPrompt: 'Test prompt'
        }]
      });

      // Wait for loadSources to complete
      await Promise.resolve();
      await jest.runAllTimersAsync();
      
      expect(instance.sourceContents).toEqual([]);
    });
  });
}); 