/**
 * @jest-environment jsdom
 */

import Concierge from '../src/concierge';

describe('Concierge', () => {
  /** @type {import('../src/concierge').IConcierge} */
  let concierge;
  /** @type {jest.Mock} */
  let mockFetch;

  beforeEach(async () => {
    // Clear the DOM
    document.body.innerHTML = '';

    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = /** @type {any} */ (mockFetch);

    // Mock successful server validation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ isConciergeServer: true })
    });

    // Initialize concierge with server URL first, then create concierge with config
    concierge = await Concierge.validateServer('http://test-server.com')
      .then(builder => builder.new({
        name: 'Test Bot',
        systemPrompt: 'You are a helpful assistant.',
        categories: [],
        sources: []
      }));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should create chat interface elements when loaded', () => {
      concierge.load();
      expect(document.querySelector('.concierge-container')).toBeTruthy();
      expect(document.querySelector('.concierge-overlay')).toBeTruthy();
      expect(document.querySelector('.concierge-input')).toBeTruthy();
      expect(document.querySelector('.concierge-submit-btn')).toBeTruthy();
    });

    test('should show initial greeting message', () => {
      concierge.load();
      const messages = document.querySelectorAll('.concierge-ai-message');
      expect(messages.length).toBe(1);
      expect(messages[0].textContent?.trim()).toBe('Hi! How can I help you today?');
    });
  });

  describe('UI Interactions', () => {
    beforeEach(() => {
      concierge.load();
    });

    test('should show chat interface when loaded', () => {
      /** @type {HTMLDivElement} */ 
      const container = document.querySelector('.concierge-container');
      expect(container.style.display).toBe('flex');
    });

    test('should hide chat when close button is clicked', () => {
      jest.useFakeTimers();
      
      /** @type {HTMLButtonElement} */
      const closeBtn = document.querySelector('.concierge-close-btn');
      closeBtn.click();

      // Wait for animation
      jest.advanceTimersByTime(500);
      
      /** @type {HTMLDivElement} */
      const container = document.querySelector('.concierge-container');
      expect(container.style.display).toBe('none');

      jest.useRealTimers();
    });

    test('should handle message submission', async () => {
      // Mock successful API response
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            text: 'Test response'
          })
        })
      );

      /** @type {HTMLFormElement} */
      const form = document.querySelector('.concierge-input-form');
      /** @type {HTMLInputElement} */
      const input = document.querySelector('.concierge-input');
      
      // Simulate user input
      input.value = 'Test message';
      
      // Submit the form
      const submitEvent = new Event('submit');
      Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
      form.dispatchEvent(submitEvent);

      // Wait for all pending promises
      await Promise.resolve();

      // Verify API call
      expect(mockFetch).toHaveBeenCalledTimes(2); // Including initial server validation
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://test-server.com/completion',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Test message')
        })
      );

      // Wait for response to be processed
      await Promise.resolve();

      // Verify messages were added
      const messages = document.querySelectorAll('.concierge-message');
      expect(messages.length).toBe(3); // Initial greeting + user message + response
      expect(messages[1].textContent?.trim()).toBe('Test message');
      expect(messages[2].textContent?.trim()).toBe('Test response');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      concierge.load();
    });

    test('should handle server errors gracefully', async () => {
      // Mock failed API response
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            error: { message: 'Server error' }
          })
        })
      );

      /** @type {HTMLFormElement} */
      const form = document.querySelector('.concierge-input-form');
      /** @type {HTMLInputElement} */
      const input = document.querySelector('.concierge-input');
      
      input.value = 'Test message';
      
      const submitEvent = new Event('submit');
      Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
      form.dispatchEvent(submitEvent);

      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();

      const messages = document.querySelectorAll('.concierge-ai-message');
      expect(messages[messages.length - 1].textContent?.trim())
        .toBe('Sorry, I encountered an error processing your request.');
    });
  });
}); 