import { BaseProcessingStrategy } from '@/lib/services/strategies/baseStrategy';
import { StandardFileStrategy } from '@/lib/services/strategies/standardStrategy';
import { LargeFileStrategy } from '@/lib/services/strategies/largeFileStrategy';
import { PDFFileStrategy } from '@/lib/services/strategies/pdfFileStrategy';

export const SIZE_THRESHOLD = 100 * 1024; // 100KB

export class ProcessingStrategyFactory {
  static getStrategy(file: File): BaseProcessingStrategy {
    // First check file type for PDF
    if (file.type === 'application/pdf') {
      return new PDFFileStrategy();
    }
    
    // Then check size for other files
    return file.size > SIZE_THRESHOLD
      ? new LargeFileStrategy()
      : new StandardFileStrategy();
  }
} 