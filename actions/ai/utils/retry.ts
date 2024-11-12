import { MAX_RETRIES, INITIAL_BACKOFF } from '@/actions/ai/config/constants';

export async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 0): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, INITIAL_BACKOFF * Math.pow(2, retries)));
    return retryWithBackoff(fn, retries + 1);
  }
}
