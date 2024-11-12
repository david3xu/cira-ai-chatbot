import { supabase } from '@/lib/supabase';
import { PdfService } from '@/lib/services/pdfService';
import { TextChunkingService } from '@/lib/services/textChunkingService';
import { EmbeddingService } from '@/lib/services/embeddingService';

const EMBEDDINGS_BATCH_SIZE = 128;

export async function uploadLargeFileToSupabase(
  file: File, 
  source: string, 
  author: string, 
  fileName: string, 
  hash: string, 
  dominationField: string, 
  abortSignal: AbortSignal,
  onProgress?: (progress: number) => void
) {
  try {
    let fileContent: string;

    if (file.type === 'application/pdf') {
      fileContent = await PdfService.convertToText(file, {
        preserveFormatting: true,
        debug: process.env.NODE_ENV === 'development'
      });
    } else {
      fileContent = await file.text();
    }
    onProgress?.(20);

    const chunks = TextChunkingService.getChunks(fileContent, {
      preserveFormatting: true
    });
    
    let processedChunks = 0;
    const totalChunks = Math.ceil(chunks.length / EMBEDDINGS_BATCH_SIZE);
    
    for (let i = 0; i < chunks.length; i += EMBEDDINGS_BATCH_SIZE) {
      if (abortSignal.aborted) {
        throw new Error('Upload cancelled');
      }

      const batchChunks = chunks.slice(i, i + EMBEDDINGS_BATCH_SIZE);
      const embeddings = await EmbeddingService.getEmbeddings(batchChunks);

      // Upload chunks
      for (let j = 0; j < batchChunks.length; j++) {
        if (!embeddings[j]) continue;

        const { error } = await supabase
          .from('documents')
          .insert({
            source,
            source_id: `${hash}-${i + j}`,
            content: batchChunks[j],
            document_id: `${fileName}-part${i + j + 1}`,
            author,
            url: fileName,
            embedding: embeddings[j],
            domination_field: dominationField,
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

