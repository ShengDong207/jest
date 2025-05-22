/**
 * Async Testing Example for Jest
 * 
 * This example demonstrates various approaches to testing asynchronous code with Jest:
 * 1. Using Promises
 * 2. Using async/await
 * 3. Testing with callbacks
 * 4. Handling timeouts
 * 5. Testing with mock timers
 */

// Mock API function that returns a Promise
function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: 'Mock API response' });
    }, 1000);
  });
}

// Mock API function that uses a callback
function fetchDataWithCallback(callback) {
  setTimeout(() => {
    callback({ success: true, data: 'Mock API response' });
  }, 1000);
}

// Example component/function that we want to test
class AsyncService {
  async getData() {
    const response = await fetchData();
    return response.data;
  }
  
  processDataWithCallback(callback) {
    fetchDataWithCallback((result) => {
      callback(result.data.toUpperCase());
    });
  }
}

// ----- TESTS -----

describe('Async Testing Examples', () => {
  // Example 1: Testing Promises with .then()
  test('fetchData returns successful response (using promises)', () => {
    return fetchData().then(response => {
      expect(response.success).toBe(true);
      expect(response.data).toBe('Mock API response');
    });
  });

  // Example 2: Testing with async/await
  test('AsyncService.getData returns data (using async/await)', async () => {
    const service = new AsyncService();
    const result = await service.getData();
    expect(result).toBe('Mock API response');
  });

  // Example 3: Testing callbacks with done
  test('processDataWithCallback processes data correctly', (done) => {
    const service = new AsyncService();
    service.processDataWithCallback((result) => {
      try {
        expect(result).toBe('MOCK API RESPONSE');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  // Example 4: Testing rejections
  test('handles rejected promises', async () => {
    // Create a function that returns a rejected promise
    const failingFunction = () => Promise.reject(new Error('Something went wrong'));
    
    // Method 1: Using .rejects
    await expect(failingFunction()).rejects.toThrow('Something went wrong');
    
    // Method 2: Using try/catch
    try {
      await failingFunction();
      // If we get here, the test should fail
      expect('Promise should have rejected').toBe(false);
    } catch (error) {
      expect(error.message).toBe('Something went wrong');
    }
  });

  // Example 5: Testing with timeouts
  test('fetchData resolves within 1.5 seconds', async () => {
    // This test will fail if fetchData takes longer than 1500ms to resolve
    await expect(fetchData()).resolves.toHaveProperty('success', true);
  }, 1500); // timeout of 1.5 seconds

  // Example 6: Using fake timers
  test('fetchData using fake timers', () => {
    jest.useFakeTimers();
    
    const promise = fetchData().then(data => {
      expect(data.success).toBe(true);
    });
    
    // Fast-forward time
    jest.runAllTimers();
    
    // Return the promise for Jest to wait for it
    return promise;
  });
});

// Example 7: Testing multiple async operations
describe('Multiple async operations', () => {
  test('testing multiple async calls', async () => {
    // Execute multiple promises in parallel
    const results = await Promise.all([
      fetchData(),
      fetchData(),
      fetchData()
    ]);
    
    // Check results
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});

// Example 8: Mocking API calls for isolation
describe('Mocking external dependencies', () => {
  beforeEach(() => {
    // Mock the fetchData function
    global.fetchData = jest.fn().mockResolvedValue({
      success: true,
      data: 'Mocked data'
    });
  });
  
  test('AsyncService uses the mocked fetchData', async () => {
    const service = new AsyncService();
    const result = await service.getData();
    
    // Verify the mock was called
    expect(fetchData).toHaveBeenCalledTimes(1);
    
    // Verify the result
    expect(result).toBe('Mocked data');
  });
});