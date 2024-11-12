import { BaseProcessingStrategy } from './baseStrategy';
import { FileProcessingOptions, ProcessingResult } from '../types';
import { TextChunkingService } from '../textChunkingService';

export class LargeFileStrategy extends BaseProcessingStrategy {
  protected async processFile(options: FileProcessingOptions): Promise<ProcessingResult> {
    try {
      const { file, source, author, dominationField, abortSignal } = options;
      
      // Get file content
      this.updateProgress(options, { stage: 'Reading file' });
      const content = await this.getFileContent(file);
      
      // Generate hash
      const hash = await this.generateHash(content);
      
      // Split into chunks
      const chunks = TextChunkingService.getChunks(content);
      let processedChunks = 0;
      
      // Process chunks in batches
      for (let i = 0; i < chunks.length; i += this.EMBEDDINGS_BATCH_SIZE) {
        this.checkAborted(abortSignal);
        
        const batchChunks = chunks.slice(i, i + this.EMBEDDINGS_BATCH_SIZE);
        const embeddings = await this.getEmbeddingsForChunks(batchChunks);
        
        // Store each chunk
        for (let j = 0; j < batchChunks.length; j++) {
          if (!embeddings[j]) continue;
          
          await this.insertDocument({
            source,
            hash,
            index: i + j,
            content: batchChunks[j],
            fileName: file.name,
            author,
            dominationField,
            embedding: embeddings[j]
          });
        }
        
        processedChunks += batchChunks.length;
        this.updateProgress(options, {
          fileProgress: (processedChunks / chunks.length) * 100,
          stage: `Processing chunk ${processedChunks}/${chunks.length}`
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 