import { ProcessingStrategyFactory } from '@/lib/services/processingStrategyFactory';
import { ProcessingResult, FileProcessingOptions } from '@/lib/services/types';

export class FileProcessingService {
  static async processFile(options: FileProcessingOptions): Promise<ProcessingResult> {
    const strategy = ProcessingStrategyFactory.getStrategy(options.file);
    return strategy.process(options);
  }

  static async processFolder(
    files: File[], 
    source: string, 
    author: string, 
    dominationField: string, 
    abortSignal: AbortSignal
  ): Promise<ProcessingResult> {
    try {
      let totalUploaded = 0;
      const errors: string[] = [];
      let totalProgress = 0;

      for (const file of files) {
        if (abortSignal.aborted) {
          throw new Error('Upload cancelled');
        }

        const result = await this.processFile({
          file,
          source,
          author,
          dominationField,
          abortSignal,
          onProgress: (progress) => {
            totalProgress = (totalUploaded * 100 + progress.overall) / files.length;
            console.log(`Total folder upload progress: ${totalProgress.toFixed(2)}%`);
          }
        });

        if (result.success) {
          totalUploaded++;
        } else {
          errors.push(`Failed to upload ${file.name}: ${result.error}`);
        }
      }

      return {
        success: true,
        message: `Uploaded ${totalUploaded} files successfully. ${errors.length} files failed.`,
        reminder: errors.length > 0 ? `Failed files: ${errors.join(', ')}` : undefined,
      };
    } catch (error) {
      console.error('Folder processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async readFileContent(file: File): Promise<string> {
    const strategy = ProcessingStrategyFactory.getStrategy(file);
    return strategy.getFileContent(file);
  }
}

// export type { ProcessedDocument }; 