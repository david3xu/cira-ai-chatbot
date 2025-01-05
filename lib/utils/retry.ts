interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  shouldRetry?: (error: Error) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000,    // 10 seconds
  factor: 2,          // Exponential factor
  shouldRetry: (error: Error) => {
    // Don't retry on user abort or validation errors
    if (error.name === 'AbortError') return false;
    if (error.name === 'ValidationError') return false;
    
    // Retry on network errors and 5xx server errors
    if (error.name === 'NetworkError') return true;
    if (error instanceof Response && error.status >= 500) return true;
    
    return true;
  }
};

/**
 * Retry a function with exponential backoff
 * 
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise with the function result
 */
export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const options = { ...defaultOptions, ...opts };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === options.maxAttempts || !options.shouldRetry(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        options.initialDelay * Math.pow(options.factor, attempt - 1),
        options.maxDelay
      );

      // Add some jitter to prevent thundering herd
      const jitter = Math.random() * 100;
      
      console.warn(
        `Attempt ${attempt} failed, retrying in ${delay + jitter}ms:`, 
        error
      );

      await sleep(delay + jitter);
    }
  }

  throw lastError;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to retry with custom error handling
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error, attempt: number) => void,
  options?: RetryOptions
): Promise<T> {
  return retryWithBackoff(
    async (attempt) => {
      try {
        return await fn();
      } catch (error) {
        errorHandler?.(error as Error, attempt);
        throw error;
      }
    },
    options
  );
} 