interface ProcessingOptions {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export class MessageProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessingOptions = {
    chunkSize: 4000,
    maxRetries: 3,
    retryDelay: 1000
  };

  static async processLongMessage(
    content: string,
    options: ProcessingOptions = {}
  ): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const chunks: string[] = [];
    let processedLength = 0;

    // Process in chunks with progress tracking
    for (let i = 0; i < content.length; i += opts.chunkSize!) {
      const chunk = content.slice(i, i + opts.chunkSize!);
      chunks.push(chunk);
      
      processedLength += chunk.length;
      if (opts.onProgress) {
        opts.onProgress(Math.min(100, (processedLength / content.length) * 100));
      }

      // Prevent UI blocking with occasional yields
      if (i % (opts.chunkSize! * 5) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return chunks.join('');
  }

  static async storeMessageChunks(
    messageId: string,
    chunks: string[],
    options: ProcessingOptions = {}
  ): Promise<void> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let stored = 0;

    for (let i = 0; i < chunks.length; i++) {
      await this.storeChunkWithRetry(
        messageId,
        chunks[i],
        i,
        opts.maxRetries!,
        opts.retryDelay!
      );

      stored++;
      if (opts.onProgress) {
        opts.onProgress((stored / chunks.length) * 100);
      }
    }
  }

  private static async storeChunkWithRetry(
    messageId: string,
    chunk: string,
    index: number,
    maxRetries: number,
    retryDelay: number
  ): Promise<void> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        // TODO: Implement actual storage logic here
        return;
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
} 