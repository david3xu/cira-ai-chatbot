import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { openai } from '@/lib/features/ai/config/openai';

export async function GET() {
  try {
    const models = await openai.models.list();
    return createSuccessResponse({ models: models.data });
  } catch (error) {
    return createErrorResponse(error);
  }
} 