// Increase timeout for all tests
jest.setTimeout(10000);

// Mock fetch globally
global.fetch = jest.fn();

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fetch mock
  if (global.fetch) {
    global.fetch.mockClear();
  }
  
  // Clean up DOM
  document.body.innerHTML = '';
}); 