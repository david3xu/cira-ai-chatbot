import { Document, DocumentError, DocumentMetadata, DocumentStatus } from '@/lib/types/document';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getTextChunks, getEmbeddings } from '../utils/textProcessing';
import type { Database } from '@/supabase/types/database.types';

export interface ProcessDocumentOptions {
  contentType: 'pdf' | 'markdown';
  metadata: DocumentMetadata;
}

/**
 * Process Document Action
 * 
 * Handles document processing with:
 * - Content type detection
 * - Metadata extraction
 * - Processing pipeline
 * - Database storage
 */
export async function processDocument(
  file: File,
  options: ProcessDocumentOptions
): Promise<Document> {
  const supabase = getSupabaseClient();
  try {
    console.log('🔄 Processing document:', {
      name: file.name,
      type: file.type,
      size: file.size,
      contentType: options.contentType
    });

    // Read file content
    const content = await file.text();
    
    // Generate text chunks and embeddings if needed
    const chunks = await getTextChunks(file);
    console.log(`Generated ${chunks.length} chunks`);
    
    const embeddings = await getEmbeddings(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);
    
    if (embeddings.length !== chunks.length) {
      console.error('Mismatch between chunks and embeddings count:', {
        chunks: chunks.length,
        embeddings: embeddings.length
      });
      throw new DocumentError(
        'Embeddings generation failed',
        'EMBEDDING_GENERATION_FAILED',
        500
      );
    }

    // Create document record
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        content: content,
        url: options.metadata.url,
        source: options.metadata.source,
        author: options.metadata.author,
        domination_field: options.metadata.dominationField,
        metadata: {
          ...options.metadata,
          chunks: chunks.length,
          embeddings: embeddings.length
        },
        status: 'completed',
        content_type: options.contentType
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving document:', insertError);
      throw new DocumentError(
        'Failed to save document to database',
        'DB_INSERT_FAILED',
        500
      );
    }

    // If we have chunks, save them as separate entries
    if (chunks.length > 0) {
      const chunkInserts = chunks.map((chunk, index) => {
        // Format embedding as Postgres vector string
        const embedding = embeddings[index];
        const vectorString = embedding ? `[${embedding.join(',')}]` : null;
        
        if (!embedding) {
          console.error(`Missing embedding for chunk ${index}`);
        }
        
        // Validate and ensure required metadata fields are present
        if (!options.metadata.author || !options.metadata.source || !options.metadata.dominationField) {
          throw new DocumentError(
            'Missing required metadata fields',
            'INVALID_METADATA',
            400
          );
        }
        
        // After validation, we can safely assert these fields are strings
        const metadata = {
          author: options.metadata.author as string,
          source: options.metadata.source as string,
          dominationField: options.metadata.dominationField as string,
          url: options.metadata.url || undefined
        } as const;
        
        // Create metadata that matches DocumentMetadata interface
        const chunkMetadata: DocumentMetadata = {
          type: options.contentType,
          size: file.size,
          author: metadata.author,
          source: metadata.source,
          dominationField: metadata.dominationField,
          processedAt: new Date().toISOString(),
          url: metadata.url,
          path: file.name,
        };
        
        // Additional metadata for chunks
        const extendedMetadata = {
          ...chunkMetadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          fileName: file.name
        };
        
        // Match the database Insert types with validated fields
        return {
          content: chunk,
          content_vector: vectorString,
          document_id: document.id,
          source: metadata.source,
          author: metadata.author,
          url: metadata.url,
          domination_field: metadata.dominationField,
          metadata: extendedMetadata
        } satisfies Database['public']['Tables']['document_chunks']['Insert'];
      });

      const { error: chunksError } = await supabase
        .from('document_chunks')
        .insert(chunkInserts);

      if (chunksError) {
        console.error('Error saving chunks:', chunksError);
        // Don't fail the whole process if chunks fail
      }
    }

    return {
      id: document.id,
      title: document.title || file.name,
      content: document.content || '',
      url: document.url || '',
      metadata: options.metadata,
      createdAt: document.created_at || new Date().toISOString(),
      updatedAt: document.updated_at || new Date().toISOString(),
      status: (document.status || 'completed') as DocumentStatus,
      contentType: document.content_type || options.contentType
    };
  } catch (error) {
    console.error('Error processing document:', error);
    if (error instanceof DocumentError) {
      throw error;
    }
    throw new DocumentError(
      'Failed to process document',
      'PROCESSING_FAILED',
      500
    );
  }
}