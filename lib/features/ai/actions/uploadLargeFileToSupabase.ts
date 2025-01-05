/**
 * Large File Upload Service
 * 
 * Handles large file processing and storage with:
 * - Text chunking
 * - Embedding generation
 * - Progress tracking
 * - Supabase integration
 * 
 * Features:
 * - Batch processing
 * - Cancellation support
 * - Progress reporting
 * - Error handling
 * - Efficient chunking
 */

import { supabase } from '@/lib/supabase/client';
import { TextChunkingService } from '@/lib/services/document/processing/TextChunkingService';
import { EmbeddingService } from '@/lib/services/document/embedding/EmbeddingService';

const EMBEDDINGS_BATCH_SIZE = 128;

export async function uploadLargeFileToSupabase(
  fileContent: string,
  source: string,
  author: string,
  fileName: string,
  hash: string,
  dominationField: string,
  abortSignal: AbortSignal,
  onProgress?: (progress: number) => void
) {
  try {
    onProgress?.(20);

    const chunks = TextChunkingService.chunkText(fileContent, {
      maxChunkSize: 1000,
      overlap: 200
    });
    
    let processedChunks = 0;
    const totalChunks = Math.ceil(chunks.length / EMBEDDINGS_BATCH_SIZE);
    
    for (let i = 0; i < chunks.length; i += EMBEDDINGS_BATCH_SIZE) {
      if (abortSignal.aborted) {
        throw new Error('Upload cancelled');
      }

      const batchChunks = chunks.slice(i, i + EMBEDDINGS_BATCH_SIZE);
      const embeddings = await EmbeddingService.createEmbeddings(batchChunks);

      // Upload chunks with their embeddings
      for (let j = 0; j < batchChunks.length; j++) {
        if (!embeddings) continue;

        const { error } = await supabase
          .from('documents')
          .insert({
            author,
            content: batchChunks[j],
            document_id: `${fileName}-part${i + j + 1}`,
            domination_field: dominationField,
            url: fileName,
            embedding: JSON.stringify(embeddings[j]),
            metadata: { source, source_id: `${hash}-${i + j}` }
          });

        if (error) throw error;
      }

      processedChunks++;
      const progress = Math.min(20 + ((processedChunks / totalChunks) * 80), 100);
      onProgress?.(progress);
    }

    return { 
      success: true,
      message: 'File processed and uploaded successfully',
      reminder: `Processed ${chunks.length} chunks from ${fileName}`
    };
  } catch (error) {
    console.error('Error in uploadLargeFileToSupabase:', error);
    throw error;
  }
} 