import { fetchWithRetry } from '@/lib/utils/fetchWithRetry';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export class EmbeddingService {
  private static readonly BATCH_SIZE = 10;
  private static readonly EMBEDDING_DIMENSION = 1024;
  private static readonly API_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ollama`;
  private static readonly MODEL = "mxbai-embed-large:latest";

  static async getEmbeddings(contents: string[]): Promise<number[][]> {
    try {
      if (!contents.length) {
        throw new Error('No content provided for embedding');
      }

      const embeddings: number[][] = [];

      for (let i = 0; i < contents.length; i += this.BATCH_SIZE) {
        const batch = contents.slice(i, i + this.BATCH_SIZE);
        const batchEmbeddings = await Promise.all(
          batch.map(content => this.getSingleEmbedding(content))
        );

        embeddings.push(...batchEmbeddings);
      }

      return embeddings;
    } catch (error) {
      console.error('Error in getEmbeddings:', error);
      throw error;
    }
  }

  static async getSingleEmbedding(content: string): Promise<number[]> {
    const response = await fetchWithRetry(this.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: this.MODEL,
        prompt: content 
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
    }

    const { embedding } = await response.json();
    
    if (!this.validateEmbedding(embedding)) {
      throw new Error('Invalid embedding format received');
    }

    return embedding;
  }

  static async performHybridSearch(query: string, dominationField: string) {
    const embedding = await this.getSingleEmbedding(query);
    const { data: pageSections, error } = await supabase.rpc('hybrid_search', {
      query_text: query,
      query_embedding: embedding,
      match_count: 50,
      full_text_weight: 1.0,
      semantic_weight: 1.0,
      in_domination_field: dominationField
    });

    if (error) {
      console.error('Error in hybrid_search:', error);
      if (error.message === 'tsquery stack too small') {
        throw new Error('The search query is too complex. Falling back to default prompt.');
      }
      throw error;
    }

    return pageSections;
  }

  static validateEmbedding(embedding: number[]): boolean {
    return Array.isArray(embedding) && 
           embedding.length === this.EMBEDDING_DIMENSION &&
           embedding.every(n => typeof n === 'number');
  }
} 