import { supabase } from '@/lib/supabase';
import { EmbeddingService } from './embeddingService';
import { TextChunkingService } from './textChunkingService';

export interface SearchResult {
  content: string;
  similarity: number;
  document_id: string;
  url: string;
  author: string;
}

export class SearchService {
  static async searchDocuments(
    query: string,
    dominationField: string,
    options: {
      limit?: number;
      minSimilarity?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 5,
      minSimilarity = 0.7,
      includeMetadata = true
    } = options;

    try {
      // Preprocess query using standard chunking
      const chunks = TextChunkingService.getChunks(query, {
        preserveFormatting: true,
        maxChunks: 1
      });
      
      const queryText = chunks[0] || query;
      const [embedding] = await EmbeddingService.getEmbeddings([queryText]);

      if (!EmbeddingService.validateEmbedding(embedding)) {
        throw new Error('Invalid embedding generated for query');
      }

      const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: minSimilarity,
        match_count: limit,
        in_domination_field: dominationField
      });

      if (error) throw error;

      return documents.map((doc: {
        content: string;
        similarity: number;
        document_id: string;
        url: string;
        author: string;
        created_at?: string;
        domination_field?: string;
      }) => ({
        content: doc.content,
        similarity: doc.similarity,
        document_id: doc.document_id,
        url: doc.url,
        author: doc.author,
        ...(includeMetadata ? {
          created_at: doc.created_at,
          domination_field: doc.domination_field
        } : {})
      }));
    } catch (error) {
      console.error('Error in searchDocuments:', error);
      throw error;
    }
  }
} 