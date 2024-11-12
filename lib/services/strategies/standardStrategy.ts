import { BaseProcessingStrategy } from './baseStrategy';
import { FileProcessingOptions, ProcessingResult } from '../types';

export class StandardFileStrategy extends BaseProcessingStrategy {
  protected async processFile(options: FileProcessingOptions): Promise<ProcessingResult> {
    try {
      const { file, source, author, dominationField, abortSignal } = options;
      
      // Get file content
      this.updateProgress(options, { stage: 'Reading file' });
      const content = await this.getFileContent(file);
      
      // Generate hash
      const hash = await this.generateHash(content);
      
      // Get embeddings
      this.updateProgress(options, { stage: 'Generating embeddings' });
      const embeddings = await this.getEmbeddingsForChunks([content]);
      
      // Store document
      this.updateProgress(options, { stage: 'Storing document' });
      await this.insertDocument({
        source,
        hash,
        index: 0,
        content,
        fileName: file.name,
        author,
        dominationField,
        embedding: embeddings[0]
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 