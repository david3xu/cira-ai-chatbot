interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
}

export class TextChunkingService {
  static chunkText(text: string, options: ChunkOptions = {}): string[] {
    const {
      maxChunkSize = 1000,
      overlap = 200
    } = options;

    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
        
        if (overlap > 0) {
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(overlap / 10));
          currentChunk = overlapWords.join(' ');
        }
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
} 