import { supabase } from './supabase';
import { EmbeddingService } from './services/embeddingService';
import { TextChunkingService } from './services/textChunkingService';

export async function searchSimilarDocuments(
  query: string,
  dominationField: string,
  limit: number = 5
) {
  try {
    // Preprocess query using the same chunking service
    const chunks = TextChunkingService.getChunks(query, {
      preserveFormatting: true,
      maxChunks: 1 // We only need one chunk for the query
    });
    
    const queryText = chunks[0] || query; // Fallback to original query if chunking fails
    const queryEmbeddings = await EmbeddingService.getEmbeddings([queryText]);
    const embedding = queryEmbeddings[0];

    if (!embedding) {
      throw new Error('Failed to generate embedding for query');
    }

    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      in_domination_field: dominationField
    });

    if (error) throw error;

    return documents;
  } catch (error) {
    console.error('Error in searchSimilarDocuments:', error);
    throw error;
  }
} 