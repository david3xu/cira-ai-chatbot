import GPT3Tokenizer from 'gpt3-tokenizer';

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

// Constants for chunking configuration
export const CHUNK_CONFIG = {
  TOKEN_LIMIT: 200,
  MIN_CHARS: 350,
  MIN_LENGTH: 5,
  BATCH_SIZE: 128,
  MAX_CHUNKS: 4000,
  PARTITION_SIZE: 4000
} as const;

export interface ChunkingOptions {
  preserveFormatting?: boolean;
  maxChunks?: number;
  minChunkSize?: number;
}

export class TextChunkingService {
  static getChunks(text: string, options: ChunkingOptions = {}): string[] {
    if (!text?.trim()) return [];

    const textParts = [];
    for (let i = 0; i < text.length; i += CHUNK_CONFIG.PARTITION_SIZE) {
      textParts.push(text.slice(i, i + CHUNK_CONFIG.PARTITION_SIZE));
    }

    const chunks: string[] = [];
    let numChunks = 0;
    const maxChunks = options.maxChunks || CHUNK_CONFIG.MAX_CHUNKS;

    for (const part of textParts) {
      let tokens;
      try {
        tokens = tokenizer.encode(part);
      } catch (error) {
        console.warn('Token encoding failed for text part:', error);
        continue;
      }

      while (tokens.bpe.length > 0 && numChunks < maxChunks) {
        const chunk = tokens.bpe.slice(0, CHUNK_CONFIG.TOKEN_LIMIT);
        let chunkText = tokenizer.decode(chunk);

        if (!chunkText?.trim()) {
          tokens.bpe = tokens.bpe.slice(chunk.length);
          continue;
        }

        const lastPunctuation = Math.max(
          chunkText.lastIndexOf('.'),
          chunkText.lastIndexOf('?'),
          chunkText.lastIndexOf('!'),
          chunkText.lastIndexOf('\n')
        );

        if (lastPunctuation !== -1 && lastPunctuation > CHUNK_CONFIG.MIN_CHARS) {
          chunkText = chunkText.slice(0, lastPunctuation + 1);
        }

        const processedChunk = options.preserveFormatting 
          ? chunkText.trim()
          : chunkText.replace(/\n/g, ' ').trim();

        if (processedChunk.length > (options.minChunkSize || CHUNK_CONFIG.MIN_LENGTH)) {
          chunks.push(processedChunk);
        }

        tokens.bpe = tokens.bpe.slice(tokenizer.encode(chunkText).bpe.length);
        numChunks++;
      }

      if (tokens?.bpe.length > 0) {
        const remainingText = tokenizer.decode(tokens.bpe);
        const processedRemaining = options.preserveFormatting 
          ? remainingText.trim()
          : remainingText.replace(/\n/g, ' ').trim();

        if (processedRemaining.length > (options.minChunkSize || CHUNK_CONFIG.MIN_LENGTH)) {
          chunks.push(processedRemaining);
        }
      }
    }

    return chunks;
  }
} 