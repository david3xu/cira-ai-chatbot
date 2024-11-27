import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createErrorResponse } from '../utils/apiUtils';

export const withValidation = <T>(
  schema: z.Schema<T>,
  handler: (validatedData: T, req: NextRequest) => Promise<Response>
) => {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return await handler(validatedData, req);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse({ error: 'Validation error', details: error.errors }, 400);
      }
      return createErrorResponse(error);
    }
  };
}; 