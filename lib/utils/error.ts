import { SetStateAction } from 'react';
import { AI_CONSTANTS } from '@/lib/features/ai/config/constants';

/**
 * Error Handling Utilities
 * 
 * Provides error management with:
 * - Custom error types
 * - Error handling functions
 * - Context tracking
 * - Model errors
 * 
 * Features:
 * - Error classes
 * - Handler creation
 * - Context support
 * - Stream errors
 */

export type ErrorHandlerFunction = (value: SetStateAction<string | null>) => void;

interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export class ErrorHandler {
  static handle(error: unknown, setError: ErrorHandlerFunction) {
    console.error('Error:', error);
    
    if (error instanceof AppError) {
      setError(error.message);
      if (error.details) {
        console.error('Error details:', error.details);
      }
      return error;
    } else if (error instanceof Error) {
      const appError = new AppError(error.message, 'GENERAL_ERROR');
      setError(error.message);
      return appError;
    } else if (typeof error === 'string') {
      const appError = new AppError(error, 'STRING_ERROR');
      setError(error);
      return appError;
    } else {
      const message = 'An unexpected error occurred';
      const appError = new AppError(message, 'UNKNOWN_ERROR');
      setError(message);
      return appError;
    }
  }

  static createHandler(setError: (error: string | null) => void) {
    return (error: unknown, context?: string) => {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    };
  }

  static async handleModelError(error: unknown) {
    if (error instanceof Error && error.message.includes('model not found')) {
      return {
        success: false,
        error: 'Selected model is not available. Please choose another model.',
      };
    }
  }

  static async handleStreamError(error: unknown, setError: ErrorHandlerFunction, context?: string) {
    console.error(`Stream error${context ? ` in ${context}` : ''}:`, error);
    const appError = this.handle(error, setError);
    return appError;
  }

  static handleChatError(error: unknown, context: string, setError?: (error: string) => void) {
    console.error(`Chat error in ${context}:`, error);
    if (setError) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
    throw error;
  }
}

// Export commonly used functions directly
export const handleError = (error: unknown, setError?: ErrorHandlerFunction) => {
  if (setError) {
    return ErrorHandler.handle(error, setError);
  }
  return new AppError(error instanceof Error ? error.message : 'An unexpected error occurred');
};
export const createErrorHandler = ErrorHandler.createHandler;
export const handleStreamError = ErrorHandler.handleStreamError;
export const handleChatError = ErrorHandler.handleChatError;
export const handleModelError = ErrorHandler.handleModelError; 
