import { sleep } from "openai/core.mjs";

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit & RetryOptions = {}
) {
  const { 
    maxRetries = 3, 
    baseDelay = 1000, 
    maxDelay = 10000,
    timeout = 5000,
    ...fetchOptions 
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const currentTimeout = timeout * Math.pow(2, attempt);
      const id = setTimeout(() => controller.abort(), currentTimeout);
      
      const response = await fetch(url, { 
        ...fetchOptions, 
        signal: controller.signal 
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn(`Request timeout after ${timeout * Math.pow(2, attempt)}ms`);
      }
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await sleep(delay);
        continue;
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
}
