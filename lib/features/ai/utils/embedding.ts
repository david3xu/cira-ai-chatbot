/**
 * Embedding Utilities
 * 
 * Handles text embedding operations:
 * - Vector generation
 * - Similarity search
 * - Cosine similarity calculation
 * 
 * Features:
 * - Hybrid search support
 * - Error handling
 * - Vector similarity calculations
 * - Retry capabilities
 */

import { openai } from '../config/openai';
import { retryWithBackoff } from './retry';
import { EmbeddingService } from '@/lib/features/ai/services/embeddingService';
import { supabase } from '@/lib/supabase/client';

interface SearchResult {
  content: string;
  score: number;
}

interface Document {
  content: string | null;
  similarity?: number;
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
  dominationField: string,
  matchCount: number = 5,
  fullTextWeight: number = 1.0,
  semanticWeight: number = 1.0,
  rrfK: number = 50
): Promise<SearchResult[]> {
  if (!query) {
    throw new Error('Query is required for hybrid search');
  }

  try {
    const queryEmbedding = await getEmbedding(query);
    
    const { data: documents, error } = await supabase.rpc('hybrid_search', {
      query_text: query,
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_count: matchCount,
      full_text_weight: fullTextWeight,
      semantic_weight: semanticWeight,
      rrf_k: rrfK,
      in_domination_field: dominationField
    });

    if (error) {
      console.error('Error in hybrid search:', error);
      throw error;
    }

    if (!documents || documents.length === 0) {
      return [];
    }

    return documents.map((doc: Document) => ({
      content: doc.content || '',
      score: doc.similarity || 0
    }));
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