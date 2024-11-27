import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  status: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export const handleApiError = (error: unknown): ApiErrorResponse => {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return {
      error: 'Validation error',
      details: error.errors,
      status: 400
    };
  }

  if (error instanceof Error) {
    if (error.message.includes('Connection error')) {
      return {
        error: 'Unable to connect to the AI server',
        status: 503
      };
    }
    return {
      error: error.message,
      status: 500
    };
  }

  return {
    error: 'Unknown error occurred',
    status: 500
  };
};

export const createApiResponse = <T>(
  data: T,
  status = 200
): NextResponse<ApiSuccessResponse<T>> => {
  return NextResponse.json({ success: true, data }, { status });
};

export const createApiErrorResponse = (
  error: unknown
): NextResponse<ApiErrorResponse> => {
  const errorResponse = handleApiError(error);
  return NextResponse.json(errorResponse, { status: errorResponse.status });
};
  