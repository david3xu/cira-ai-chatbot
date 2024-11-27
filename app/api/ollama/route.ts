import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { Ollama } from 'ollama';

const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

const ollama = new Ollama({
  host: OLLAMA_SERVER_URL
});

const ollamaRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().default('mxbai-embed-large:latest')
});

export const POST = withValidation(ollamaRequestSchema, async (validatedData) => {
  const embeddingResponse = await ollama.embeddings({
    model: validatedData.model || 'mxbai-embed-large:latest',
    prompt: validatedData.prompt
  });

  if (!embeddingResponse.embedding || !Array.isArray(embeddingResponse.embedding)) {
    throw new Error('Invalid embedding response from Ollama');
  }

  return createSuccessResponse({ embedding: embeddingResponse.embedding });
});
