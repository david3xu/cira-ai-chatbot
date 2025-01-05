import { supabase } from '@/lib/supabase/client';
import { ChatError, ErrorCodes } from '@/lib/types/errors';
import { Document } from '@/lib/types';

interface ContextOptions {
  domainField?: string;
  limit?: number;
  minScore?: number;
  includeSources?: boolean;
  useCache?: boolean;
}

interface RelevantDocument {
  content: string;
  score: number;
  source?: {
    title: string;
    url?: string;
  };
}

interface ScoringOptions extends ContextOptions {
  similarityWeight?: number;
  recencyWeight?: number;
  popularityWeight?: number;
}

export async function getRelevantContext(
  query: string,
  options: ScoringOptions = {}
): Promise<string> {
  const {
    domainField = 'general',
    limit = 3,
    minScore = 0.5,
    includeSources = true,
    useCache = true,
    similarityWeight,
    recencyWeight,
    popularityWeight
  } = options;

  try {
    // Update scoring config if weights provided
    if (similarityWeight || recencyWeight || popularityWeight) {
      await supabase.rpc('update_scoring_config' as any, {
        p_domain_field: domainField,
        p_similarity_weight: similarityWeight,
        p_recency_weight: recencyWeight,
        p_popularity_weight: popularityWeight
      });
    }

    // Get relevant documents with scores
    const { data: documents, error } = await supabase.rpc(
      'match_documents_with_relevance' as any,
      {
        p_query: query,
        p_domain_field: domainField,
        p_match_limit: limit,
        p_min_similarity: minScore
      }
    );

    if (error) {
      throw new ChatError(
        'Failed to retrieve context',
        ErrorCodes.DB_ERROR,
        { query, domainField }
      );
    }

    if (!documents?.length) {
      return '';
    }

    // Format documents into context string with scores
    const relevantDocs = documents.map((doc: RelevantDocument & {
      relevance_score: number;
      similarity_score: number;
    }) => {
      let context = doc.content;
      
      if (includeSources) {
        context += `\nSource: ${doc.source?.title || 'Unknown'}`;
        if (doc.source?.url) {
          context += ` (${doc.source.url})`;
        }
        context += `\nRelevance: ${Math.round(doc.relevance_score * 100)}%`;
      }
      
      return context;
    });

    return relevantDocs.join('\n\n');

  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }
    throw new ChatError(
      'Context retrieval failed',
      ErrorCodes.DB_ERROR,
      { query, domainField }
    );
  }
}

// Helper function to index new documents
export async function indexDocument(
  document: Document,
  options: { 
    domainField: string;
    useCache?: boolean;
  }
): Promise<void> {
  try {
    const { error } = await supabase.rpc(
      options.useCache ? 'index_document_cached' as any : 'index_document' as any,
      {
        p_content: document.content,
        p_metadata: {
          title: document.title,
          url: document.metadata?.url,
          domain_field: options.domainField
        }
      }
    );

    if (error) {
      throw new ChatError(
        'Failed to index document',
        ErrorCodes.DB_ERROR,
        { documentId: document.id }
      );
    }
  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }
    throw new ChatError(
      'Document indexing failed',
      ErrorCodes.DB_ERROR,
      { documentId: document.id }
    );
  }
} 