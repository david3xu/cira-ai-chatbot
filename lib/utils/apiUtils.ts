import { NextResponse } from 'next/server';
import { ApiResponse } from '../types/api';

export const createStreamResponse = (stream: ReadableStream) => {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};

export const createSuccessResponse = <T>(data: T): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({ 
    success: true, 
    data 
  }, { 
    status: 200 
  });
};

export const createErrorResponse = (error: unknown, status = 500): NextResponse<ApiResponse> => {
  console.error('API Error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return NextResponse.json({ 
    success: false, 
    error: errorMessage 
  }, { 
    status 
  });
};

export const validateImageFormat = (imageFile: string): boolean => {
  return imageFile.startsWith('data:image/') || imageFile.startsWith('http');
}; 