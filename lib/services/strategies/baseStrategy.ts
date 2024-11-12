import { PdfService } from '../pdfService';
import { DocumentStorageService } from '../documentStorageService';
import { ProcessingProgress, ProcessingResult, FileProcessingOptions } from '@/lib/services/types';
import { createHash } from '@/lib/utils/crypto';
import { getEmbedding } from '@/actions/ai/utils/embedding';

export abstract class BaseProcessingStrategy {
  protected readonly EMBEDDINGS_BATCH_SIZE = 10;

  public async getFileContent(file: File): Promise<string> {
    return file.type === 'application/pdf'
      ? await PdfService.convertToText(file, {
          preserveFormatting: true,
          debug: process.env.NODE_ENV === 'development'
        })
      : await file.text();
  }

  protected async insertDocument(params: {
    source: string;
    hash: string;
    index: number;
    content: string;
    fileName: string;
    author: string;
    dominationField: string;
    embedding: number[];
  }) {
    await DocumentStorageService.insertDocument(params);
  }

  protected async generateHash(content: string): Promise<string> {
    return await createHash(content);
  }

  protected async getEmbeddingsForChunks(chunks: string[]): Promise<number[][]> {
    return Promise.all(chunks.map(chunk => getEmbedding(chunk)));
  }

  protected updateProgress(
    options: FileProcessingOptions,
    progress: Partial<ProcessingProgress>
  ) {
    if (options.onProgress) {
      options.onProgress({
        overall: 0,
        fileProgress: 0,
        stage: 'Processing',
        ...progress
      });
    }
  }

  protected checkAborted(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new Error('Processing cancelled');
    }
  }

  protected async checkDuplicate(fileName: string, dominationField: string): Promise<boolean> {
    return DocumentStorageService.checkDocumentExists(fileName, dominationField);
  }

  public async process(options: FileProcessingOptions): Promise<ProcessingResult> {
    try {
      // Check for duplicate before processing
      const isDuplicate = await this.checkDuplicate(options.file.name, options.dominationField);
      if (isDuplicate) {
        return {
          success: false,
          error: `File "${options.file.name}" already exists in the ${options.dominationField} domain.`
        };
      }
      
      // Continue with existing processing logic...
      return this.processFile(options);
    } catch (error) {
      console.error('Processing error:', error);
      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Database error occurred - please contact administrator'
      };
    }
  }

  protected abstract processFile(options: FileProcessingOptions): Promise<ProcessingResult>;
} 