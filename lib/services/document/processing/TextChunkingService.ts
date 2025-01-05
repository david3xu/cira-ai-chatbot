interface ChunkingOptions {
  maxChunkSize: number;
  overlap: number;
}

export class TextChunkingService {
  static chunkText(text: string, options: ChunkingOptions): string[] {
    const { maxChunkSize, overlap } = options;
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const chunk = text.slice(startIndex, startIndex + maxChunkSize);
      chunks.push(chunk);
      startIndex += maxChunkSize - overlap;
    }

    return chunks;
  }
} 