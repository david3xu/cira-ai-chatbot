import { openai } from '../config/openai';
import { retryWithBackoff } from './retry';
import { EmbeddingService } from '@/lib/features/ai/services/embeddingService';

interface SearchResult {
  content: string;
  score: number;
}

export async function getEmbedding(text: string | null): Promise<number[]> {
  if (!text) {
    throw new Error('Text is required for embedding');
  }

  const response = await retryWithBackoff(async () => {
    const result = await EmbeddingService.createEmbedding(
      text,
      process.env.NEXT_PUBLIC_EMBEDDING_MODEL as string
    );
    return result.embeddings[0];
  });

  return response;
}

export async function performHybridSearch(
  query: string | null,
  dominationField: string
): Promise<SearchResult[]> {
  if (!query) {
    throw new Error('Query is required for hybrid search');
  }

  try {
    const queryEmbedding = await getEmbedding(query);
    
    // Here you would typically:
    // 1. Get embeddings from your vector database
    // 2. Perform similarity search
    // 3. Return the most relevant results
    
    return [{
      content: `Search result for query "${query}" in domain "${dominationField}"`,
      score: 0.95
    }];
  } catch (error) {
    console.error('Error in hybrid search:', error);
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
} 