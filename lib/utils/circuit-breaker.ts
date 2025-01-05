import { ChatError } from "../types/errors";

interface CircuitBreakerOptions {
  timeout: number;
  resetTimeout: number;
  errorThreshold: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: number;
  private isOpen = false;

  constructor(
    private fn: Function,
    private options: CircuitBreakerOptions
  ) {}

  async execute(...args: any[]): Promise<any> {
    if (this.isOpen) {
      if (Date.now() - (this.lastFailureTime || 0) > this.options.resetTimeout) {
        this.reset();
      } else {
        throw new ChatError(
          'Circuit breaker is open',
          'CIRCUIT_OPEN',
          { lastFailure: this.lastFailureTime }
        );
      }
    }

    try {
      const result = await Promise.race([
        this.fn(...args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.options.timeout)
        )
      ]);

      this.failures = 0;
      return result;

    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.options.errorThreshold) {
        this.isOpen = true;
      }

      throw error;
    }
  }

  private reset() {
    this.failures = 0;
    this.isOpen = false;
    this.lastFailureTime = undefined;
  }
} 