import { useCallback } from "react";

interface PerformanceOptions {
  chunkSize: number;
  batchSize: number;
  processingDelay: number;
  maxConcurrent: number;
}

export class PerformanceOptimizer {
  private static readonly DEFAULT_OPTIONS: PerformanceOptions = {
    chunkSize: 4000,
    batchSize: 5,
    processingDelay: 16, // ~1 frame at 60fps
    maxConcurrent: 3
  };

  private static activeProcesses = 0;
  private static processQueue: Array<() => Promise<void>> = [];

  static async processLargeContent(
    content: string,
    options: Partial<PerformanceOptions> = {}
  ): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const chunks = this.splitIntoChunks(content, opts.chunkSize);
    const processedChunks: string[] = [];

    for (let i = 0; i < chunks.length; i += opts.batchSize) {
      const batch = chunks.slice(i, i + opts.batchSize);
      await this.processBatch(batch, processedChunks, opts);
      
      // Yield to main thread periodically
      if (i % (opts.batchSize * 2) === 0) {
        await this.yieldToMain();
      }
    }

    return processedChunks.join('');
  }

  private static splitIntoChunks(content: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private static async processBatch(
    batch: string[],
    results: string[],
    options: PerformanceOptions
  ): Promise<void> {
    const batchPromises = batch.map(chunk => 
      this.queueProcess(() => this.processChunk(chunk))
    );

    const processedBatch = await Promise.all(batchPromises);
    results.push(...processedBatch);
  }

  private static async queueProcess<T>(
    process: () => Promise<T>
  ): Promise<T> {
    while (this.activeProcesses >= this.DEFAULT_OPTIONS.maxConcurrent) {
      await this.yieldToMain();
    }

    this.activeProcesses++;
    try {
      return await process();
    } finally {
      this.activeProcesses--;
      this.processNextInQueue();
    }
  }

  private static async processChunk(chunk: string): Promise<string> {
    // Add your chunk processing logic here
    return chunk;
  }

  private static yieldToMain(): Promise<void> {
    return new Promise(resolve => 
      setTimeout(resolve, this.DEFAULT_OPTIONS.processingDelay)
    );
  }

  private static processNextInQueue(): void {
    const nextProcess = this.processQueue.shift();
    if (nextProcess) {
      nextProcess();
    }
  }
}

// Usage in components
export const usePerformanceOptimizer = () => {
  const processContent = useCallback(async (content: string) => {
    try {
      return await PerformanceOptimizer.processLargeContent(content, {
        chunkSize: 2000, // Smaller chunks for more frequent yields
        batchSize: 3     // Smaller batches for smoother processing
      });
    } catch (error) {
      console.error('Content processing error:', error);
      throw error;
    }
  }, []);

  return { processContent };
}; 