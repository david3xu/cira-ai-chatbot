import { useCallback } from "react";

// Error types
export enum ChatErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorMetadata {
  timestamp: number;
  context: string;
  retryCount: number;
  originalError?: unknown;
}

export class ChatError extends Error {
  constructor(
    message: string,
    public code: ChatErrorCode,
    public metadata: ErrorMetadata,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

// Error handling service
export class ErrorHandlingService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  static async handleError(
    error: unknown,
    context: string,
    retryOperation?: () => Promise<void>
  ): Promise<void> {
    const errorMetadata: ErrorMetadata = {
      timestamp: Date.now(),
      context,
      retryCount: 0
    };

    const chatError = this.normalizeError(error, errorMetadata);
    this.logError(chatError);

    if (chatError.recoverable && retryOperation) {
      await this.retryWithBackoff(retryOperation, errorMetadata);
    } else {
      this.notifyUser(chatError);
    }
  }

  private static normalizeError(error: unknown, metadata: ErrorMetadata): ChatError {
    if (error instanceof ChatError) {
      return error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new ChatError(
        'Network connection failed',
        ChatErrorCode.NETWORK_ERROR,
        { ...metadata, originalError: error },
        true
      );
    }

    // Add more error type normalizations here

    return new ChatError(
      'An unexpected error occurred',
      ChatErrorCode.UNKNOWN_ERROR,
      { ...metadata, originalError: error },
      false
    );
  }

  private static async retryWithBackoff(
    operation: () => Promise<void>,
    metadata: ErrorMetadata
  ): Promise<void> {
    while (metadata.retryCount < this.MAX_RETRIES) {
      try {
        const delay = this.RETRY_DELAYS[metadata.retryCount];
        await new Promise(resolve => setTimeout(resolve, delay));
        await operation();
        return;
      } catch (error) {
        metadata.retryCount++;
        if (metadata.retryCount === this.MAX_RETRIES) {
          throw this.normalizeError(error, metadata);
        }
      }
    }
  }

  private static logError(error: ChatError): void {
    console.error('Chat Error:', {
      code: error.code,
      message: error.message,
      metadata: error.metadata,
      recoverable: error.recoverable
    });

    // Add your error logging service here
  }

  private static notifyUser(error: ChatError): void {
    // Add your user notification system here
    // This could be a toast notification, alert, or other UI feedback
  }
}

// Usage in components
export const useChatError = () => {
  const handleChatError = useCallback(async (
    error: unknown,
    context: string,
    retryFn?: () => Promise<void>
  ) => {
    try {
      await ErrorHandlingService.handleError(error, context, retryFn);
    } catch (finalError) {
      // Handle unrecoverable errors
      console.error('Unrecoverable error:', finalError);
    }
  }, []);

  return { handleChatError };
}; 