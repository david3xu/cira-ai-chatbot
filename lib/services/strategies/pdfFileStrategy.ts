import { TextChunkingService } from '../textChunkingService';
import { PdfService } from '../pdfService';
import { BaseProcessingStrategy } from './baseStrategy';
import { FileProcessingOptions, ProcessingResult } from '../types';

export class PDFFileStrategy extends BaseProcessingStrategy {
  protected async processFile(options: FileProcessingOptions): Promise<ProcessingResult> {
    try {
      const { file, source, author, dominationField, abortSignal } = options;
      
      // Convert PDF to text
      this.updateProgress(options, { stage: 'Converting PDF' });
      const content = await PdfService.convertToText(file, {
        preserveFormatting: true,
        debug: process.env.NODE_ENV === 'development'
      });
      
      if (!content.trim()) {
        return {
          success: false,
          error: 'PDF conversion resulted in empty content'
        };
      }
      
      // Generate hash
      const hash = await this.generateHash(content);
      
      // Split into chunks with PDF-specific settings
      const chunks = TextChunkingService.getChunks(content, {
        preserveFormatting: true
      });
      
      let processedChunks = 0;
      const totalChunks = Math.ceil(chunks.length / this.EMBEDDINGS_BATCH_SIZE);
      
      // Process chunks in batches
      for (let i = 0; i < chunks.length; i += this.EMBEDDINGS_BATCH_SIZE) {
        this.checkAborted(abortSignal);
        
        const batchChunks = chunks.slice(i, i + this.EMBEDDINGS_BATCH_SIZE);
        const embeddings = await this.getEmbeddingsForChunks(batchChunks);
        
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
        
        processedChunks++;
        const progress = Math.min(20 + ((processedChunks / totalChunks) * 80), 100);
        this.updateProgress(options, {
          fileProgress: progress,
          stage: `Processing PDF chunk ${processedChunks}/${totalChunks}`
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF processing failed'
      };
    }
  }
} 