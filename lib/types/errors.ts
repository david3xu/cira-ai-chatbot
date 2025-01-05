export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public metadata?: unknown
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export const ErrorCodes = {
  DB_ERROR: 'DB_ERROR',
  STREAM_ERROR: 'STREAM_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ABORT_ERROR: 'ABORT_ERROR',
  FETCH_ERROR: 'FETCH_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]; 