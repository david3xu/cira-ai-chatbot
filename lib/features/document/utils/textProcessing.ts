import { TextChunkingService } from '@/lib/services/document/processing/TextChunkingService';
import { EmbeddingService } from '@/lib/features/ai/services/embeddingService';

export async function getTextChunks(file: File): Promise<string[]> {
  const content = await file.text();
  return TextChunkingService.chunkText(content, {
    maxChunkSize: 1000,
    overlap: 200
  });
}

export async function getEmbeddings(chunks: string[]): Promise<number[][]> {
  const response = await EmbeddingService.createEmbedding(chunks);
  return response.embeddings;
} 