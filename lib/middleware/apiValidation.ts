import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiErrorResponse } from '../utils/apiErrorHandler';

export const validateRequest = async <T>(
  req: NextRequest,
  schema: z.Schema<T>
): Promise<T | Response> => {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    return createApiErrorResponse(error);
  }
};

export const withValidation = <T>(
  schema: z.Schema<T>,
  handler: (data: T, req: NextRequest) => Promise<Response>
) => {
  return async (req: NextRequest) => {
    const result = await validateRequest(req, schema);
    if (result instanceof Response) return result;
    return handler(result, req);
  };
}; 