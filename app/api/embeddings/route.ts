import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { EmbeddingService } from '@/lib/features/ai/services/embeddingService';

export async function POST(req: NextRequest) {
  try {
    const { input, model = 'mxbai-embed-large' } = await req.json();

    // Handle both single string and array of strings
    const inputs = Array.isArray(input) ? input : [input];

    const response = await EmbeddingService.createEmbedding(inputs, model);

    return createSuccessResponse({
      model,
      embeddings: response.embeddings,
      usage: response.usage
    });

  } catch (error) {
    console.error('Error generating embeddings:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to generate embeddings'
    );
  }
} 